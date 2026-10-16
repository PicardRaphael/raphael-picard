/**
 * Builds the whole video from a work folder outside the repo (see README.md):
 *   node scripts/video/render.mjs <workDir> [step…]
 * steps (default: all, in this order): capture, capture-portrait, sfx, voice, mix, remotion, encode, poster, vtt
 * Remotion and its own ffmpeg (with libx264) are installed in <workDir>/remotion, never in the repo's package.json.
 */
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const [workArg, ...stepArgs] = process.argv.slice(2);
if (!workArg) throw new Error('usage: node scripts/video/render.mjs <workDir> [steps…]');
const WORK = resolve(workArg);
const REPO = resolve(new URL('../..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'));
const HERE = join(REPO, 'scripts', 'video');
const OUT = join(REPO, 'public', 'video');
const RW = join(WORK, 'remotion');
const ALL = ['capture', 'capture-portrait', 'sfx', 'voice', 'mix', 'remotion', 'encode', 'poster', 'vtt'];
const steps = stepArgs.length ? stepArgs : ALL;

const REMOTION_FFMPEG = join(
	RW,
	'node_modules',
	'@remotion',
	`compositor-${process.platform}-x64${process.platform === 'win32' ? '-msvc' : ''}`,
	process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg',
);
const PYTHON = process.env.TTS_PYTHON ?? 'python';
const TTS_MODELS = process.env.TTS_MODELS ?? join(REPO, '..', 'voice-models');
const CHROME = process.env.REMOTION_BROWSER; // e.g. Playwright's chrome.exe, avoids a download

const run = (cmd, args, opts = {}) => execFileSync(cmd, args, { stdio: 'inherit', cwd: REPO, ...opts });
const node = (script, ...args) => run(process.execPath, [join(HERE, script), ...args]);
const remotion = (...args) =>
	run(
		process.execPath,
		[join(RW, 'node_modules', '@remotion', 'cli', 'remotion-cli.js'), ...args, ...(CHROME ? ['--browser-executable', CHROME] : [])],
		{ cwd: RW },
	);
const size = (f) => `${(statSync(f).size / 1024 / 1024).toFixed(2)} Mo`;

mkdirSync(WORK, { recursive: true });
mkdirSync(OUT, { recursive: true });

function setupRemotion() {
	mkdirSync(join(RW, 'src'), { recursive: true });
	if (!existsSync(join(RW, 'node_modules', 'remotion'))) {
		writeFileSync(join(RW, 'package.json'), JSON.stringify({ name: 'resume-30s-render', private: true, type: 'module' }));
		const v = '4.0.535';
		run(
			process.platform === 'win32' ? 'npm.cmd' : 'npm',
			['install', '--no-audit', '--no-fund', `remotion@${v}`, `@remotion/cli@${v}`, `@remotion/google-fonts@${v}`, 'react@19', 'react-dom@19'],
			{ cwd: RW, shell: true },
		);
	}
	for (const f of readdirSync(join(HERE, 'remotion'))) copyFileSync(join(HERE, 'remotion', f), join(RW, 'src', f));
	copyFileSync(join(HERE, 'cues.json'), join(RW, 'src', 'cues.json'));
}

for (const step of steps) {
	console.log(`\n=== ${step} ===`);
	if (step === 'capture') node('capture.mjs', join(WORK, 'pub', 'frames'));
	if (step === 'capture-portrait') node('capture.mjs', join(WORK, 'pub', 'frames-portrait'), '--portrait');
	if (step === 'sfx') node('sfx.mjs', join(WORK, 'sfx'));
	if (step === 'voice')
		run(PYTHON, ['-I', join(HERE, 'voice.py'), '--models', TTS_MODELS, '--out', join(WORK, 'vo')], {
			env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
		});
	if (step === 'mix') {
		node('mix.mjs', WORK);
		mkdirSync(join(WORK, 'pub'), { recursive: true });
		copyFileSync(join(WORK, 'mix.wav'), join(WORK, 'pub', 'mix.wav'));
	}
	if (step === 'remotion') {
		setupRemotion();
		const common = ['--public-dir', join(WORK, 'pub'), '--concurrency', process.env.CONCURRENCY ?? '6'];
		remotion('render', 'src/index.jsx', 'resume', join(WORK, 'master.mov'), '--codec', 'prores', '--prores-profile', 'hq', ...common);
		if (existsSync(join(WORK, 'pub', 'frames-portrait')))
			remotion(
				'render',
				'src/index.jsx',
				'resume-vertical',
				join(WORK, 'master-vertical.mov'),
				'--codec',
				'prores',
				'--prores-profile',
				'hq',
				...common,
			);
	}
	if (step === 'encode') {
		// rain and neon cost bits: a two-pass bitrate target keeps the files near 8 Mo for ~37 s
		const twoPass = (input, output, codec, kbps, audio) => {
			const log = join(WORK, `pass-${codec}`);
			const v =
				codec === 'h264'
					? [
							'-c:v',
							'libx264',
							'-preset',
							'slower',
							'-tune',
							'film',
							'-profile:v',
							'high',
							'-g',
							'60',
							'-b:v',
							`${kbps}k`,
							'-maxrate',
							`${kbps * 2}k`,
							'-bufsize',
							`${kbps * 4}k`,
						]
					: [
							'-c:v',
							'libvpx-vp9',
							'-b:v',
							`${kbps}k`,
							'-row-mt',
							'1',
							'-deadline',
							'good',
							'-cpu-used',
							'1',
							'-g',
							'120',
							'-auto-alt-ref',
							'1',
							'-lag-in-frames',
							'25',
						];
			const base = ['-y', '-loglevel', 'error', '-i', input, '-pix_fmt', 'yuv420p', ...v, '-passlogfile', log];
			run(REMOTION_FFMPEG, [
				...base,
				'-pass',
				'1',
				'-an',
				'-f',
				codec === 'h264' ? 'mp4' : 'webm',
				process.platform === 'win32' ? 'NUL' : '/dev/null',
			]);
			run(REMOTION_FFMPEG, [...base, '-pass', '2', ...audio, ...(codec === 'h264' ? ['-movflags', '+faststart'] : []), output]);
			console.log(output, size(output));
		};
		const aac = ['-c:a', 'aac', '-b:a', '128k'];
		const opus = ['-c:a', 'libopus', '-b:a', '96k'];
		twoPass(join(WORK, 'master.mov'), join(OUT, 'resume-30s.mp4'), 'h264', Number(process.env.KBPS ?? 1550), aac);
		twoPass(join(WORK, 'master.mov'), join(OUT, 'resume-30s.webm'), 'vp9', Number(process.env.VP9_KBPS ?? 1150), opus);
		if (existsSync(join(WORK, 'master-vertical.mov')))
			twoPass(join(WORK, 'master-vertical.mov'), join(OUT, 'resume-30s-vertical.mp4'), 'h264', Number(process.env.KBPS_V ?? 1550), aac);
	}
	if (step === 'poster') {
		setupRemotion();
		// a composition of its own (remotion/Poster.jsx); POSTER_FRAME=<n> takes a frame of the film instead
		const frame = process.env.POSTER_FRAME;
		const target = frame ? ['resume', '--frame', frame, '--props', JSON.stringify({ audio: null })] : ['poster'];
		remotion('still', 'src/index.jsx', target[0], join(WORK, 'poster.png'), ...target.slice(1), '--public-dir', join(WORK, 'pub'));
		// the best JPEG quality that stays under 200 Ko
		const jpg = join(OUT, 'resume-30s.jpg');
		for (let q = Number(process.env.POSTER_Q ?? 2); q <= 12; q++) {
			run(REMOTION_FFMPEG, ['-y', '-loglevel', 'error', '-i', join(WORK, 'poster.png'), '-q:v', String(q), jpg]);
			if (statSync(jpg).size <= 200 * 1024) break;
		}
		console.log('poster', size(jpg));
	}
	if (step === 'vtt') node('vtt.mjs', join(OUT, 'resume-30s.fr.vtt'), join(WORK, 'vo', 'durations.json'));
}
