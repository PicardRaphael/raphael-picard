/**
 * Builds the videos from a work folder outside the repo (see README.md):
 *   node scripts/video/render.mjs <workDir> [step…]
 * steps (default: all, in this order): capture, capture-portrait, capture-viral, sfx, voice, mix, remotion, encode, poster, vtt
 * Remotion and its own ffmpeg (with libx264) are installed in <workDir>/remotion, never in the repo's package.json.
 */
import { execFileSync } from 'node:child_process';
import { copyFileSync, cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const [workArg, ...stepArgs] = process.argv.slice(2);
if (!workArg) throw new Error('usage: node scripts/video/render.mjs <workDir> [steps…]');
const WORK = resolve(workArg);
const REPO = resolve(new URL('../..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'));
const HERE = join(REPO, 'scripts', 'video');
const OUT = join(REPO, 'public', 'video');
const RW = join(WORK, 'remotion');
const ALL = ['capture', 'capture-portrait', 'capture-viral', 'sfx', 'voice', 'mix', 'remotion', 'encode', 'poster', 'vtt'];
const steps = stepArgs.length ? stepArgs : ALL;
/** ONLY=resume,vertical,viral limits the remotion, encode and poster steps to some of the videos (all by default). */
const only = (name) => !process.env.ONLY || process.env.ONLY.split(',').includes(name);

const REMOTION_FFMPEG = join(
	RW,
	'node_modules',
	'@remotion',
	`compositor-${process.platform}-x64${process.platform === 'win32' ? '-msvc' : ''}`,
	process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg',
);
const PYTHON = process.env.TTS_PYTHON ?? 'python';
const TTS_MODELS = process.env.TTS_MODELS ?? join(REPO, '..', 'voice-models');
const CHROME = process.env.REMOTION_BROWSER; // e.g. Playwright's chrome-headless-shell, avoids a download

const run = (cmd, args, opts = {}) => execFileSync(cmd, args, { stdio: 'inherit', cwd: REPO, ...opts });
const node = (script, ...args) => run(process.execPath, [join(HERE, script), ...args]);
const remotion = (...args) =>
	run(
		process.execPath,
		[join(RW, 'node_modules', '@remotion', 'cli', 'remotion-cli.js'), ...args, ...(CHROME ? ['--browser-executable', CHROME] : [])],
		{ cwd: RW },
	);
const size = (f) => `${(statSync(f).size / 1024 / 1024).toFixed(2)} Mio`;

mkdirSync(WORK, { recursive: true });
mkdirSync(OUT, { recursive: true });

function setupRemotion() {
	mkdirSync(join(RW, 'src'), { recursive: true });
	if (!existsSync(join(RW, 'node_modules', 'remotion'))) {
		writeFileSync(join(RW, 'package.json'), JSON.stringify({ name: 'resume-30s-render', private: true, type: 'module' }));
		const v = '4.0.535';
		run(
			process.platform === 'win32' ? 'npm.cmd' : 'npm',
			[
				'install',
				'--no-audit',
				'--no-fund',
				`remotion@${v}`,
				`@remotion/cli@${v}`,
				`@remotion/renderer@${v}`,
				`@remotion/bundler@${v}`,
				`@remotion/google-fonts@${v}`,
				'react@19',
				'react-dom@19',
			],
			{ cwd: RW, shell: true },
		);
	}
	for (const f of readdirSync(join(HERE, 'remotion'))) copyFileSync(join(HERE, 'remotion', f), join(RW, 'src', f));
	for (const f of ['cues.json', 'viral.json']) copyFileSync(join(HERE, f), join(RW, 'src', f));
}

/** Two-pass encode at a target bitrate: rain and neon cost bits, a bitrate target keeps the weight under control. */
function twoPass(input, output, codec, kbps, audio) {
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
	run(REMOTION_FFMPEG, [...base, '-pass', '1', '-an', '-f', codec === 'h264' ? 'mp4' : 'webm', process.platform === 'win32' ? 'NUL' : '/dev/null']);
	run(REMOTION_FFMPEG, [...base, '-pass', '2', ...audio, ...(codec === 'h264' ? ['-movflags', '+faststart'] : []), output]);
	console.log(output, size(output));
}

/** A still of a composition, as the best JPEG quality that stays under 200 Ko. */
function poster(composition, out, extra = []) {
	const png = join(WORK, `${composition}-poster.png`);
	remotion('still', 'src/index.jsx', composition, png, ...extra, '--public-dir', join(WORK, 'pub'));
	for (let q = Number(process.env.POSTER_Q ?? 2); q <= 12; q++) {
		run(REMOTION_FFMPEG, ['-y', '-loglevel', 'error', '-i', png, '-q:v', String(q), out]);
		if (statSync(out).size <= 200 * 1024) break;
	}
	console.log(out, size(out));
}

const prores = (id, out) =>
	remotion(
		'render',
		'src/index.jsx',
		id,
		join(WORK, out),
		'--codec',
		'prores',
		'--prores-profile',
		'hq',
		'--public-dir',
		join(WORK, 'pub'),
		'--concurrency',
		process.env.CONCURRENCY ?? '6',
	);
const aac = ['-c:a', 'aac', '-b:a', '128k'];
const opus = ['-c:a', 'libopus', '-b:a', '96k'];

for (const step of steps) {
	console.log(`\n=== ${step} ===`);
	if (step === 'capture') node('capture.mjs', join(WORK, 'pub', 'frames'));
	if (step === 'capture-portrait') node('capture.mjs', join(WORK, 'pub', 'frames-portrait'), '--portrait');
	if (step === 'capture-viral') {
		// the takes played in the game (knight through the portal, runner against a bug, the core's trace)
		node('viral.mjs', join(WORK, 'pub', 'viral'));
		node('viral.mjs', join(WORK, 'pub', 'frames'), '--landscape', '--only', 'fight');
		// the vertical version of the film uses the vertical take of the fight
		rmSync(join(WORK, 'pub', 'frames-portrait', 'h-fight'), { recursive: true, force: true });
		cpSync(join(WORK, 'pub', 'viral', 'v-fight'), join(WORK, 'pub', 'frames-portrait', 'h-fight'), { recursive: true });
	}
	if (step === 'sfx') node('sfx.mjs', join(WORK, 'sfx'));
	if (step === 'voice')
		run(PYTHON, ['-I', join(HERE, 'voice.py'), '--models', TTS_MODELS, '--out', join(WORK, 'vo')], {
			env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
		});
	if (step === 'mix') {
		node('mix.mjs', WORK, 'cues.json');
		node('mix.mjs', WORK, 'viral.json');
	}
	if (step === 'remotion') {
		setupRemotion();
		if (only('resume')) prores('resume', 'master.mov');
		if (only('vertical') && existsSync(join(WORK, 'pub', 'frames-portrait'))) prores('resume-vertical', 'master-vertical.mov');
		if (only('viral') && existsSync(join(WORK, 'pub', 'viral'))) prores('viral', 'master-viral.mov');
	}
	if (step === 'encode') {
		// ENCODE=mp4,webm,vertical,viral limits the outputs (all by default)
		const want = (name) =>
			(!process.env.ENCODE || process.env.ENCODE.split(',').includes(name)) && only(name === 'mp4' || name === 'webm' ? 'resume' : name);
		if (want('mp4')) twoPass(join(WORK, 'master.mov'), join(OUT, 'resume-30s.mp4'), 'h264', Number(process.env.KBPS ?? 1900), aac);
		if (want('webm')) twoPass(join(WORK, 'master.mov'), join(OUT, 'resume-30s.webm'), 'vp9', Number(process.env.VP9_KBPS ?? 1400), opus);
		if (want('vertical') && existsSync(join(WORK, 'master-vertical.mov')))
			twoPass(join(WORK, 'master-vertical.mov'), join(OUT, 'resume-30s-vertical.mp4'), 'h264', Number(process.env.KBPS_V ?? 1900), aac);
		if (want('viral') && existsSync(join(WORK, 'master-viral.mov')))
			twoPass(join(WORK, 'master-viral.mov'), join(OUT, 'viral-vertical.mp4'), 'h264', Number(process.env.KBPS_VIRAL ?? 2600), aac);
	}
	if (step === 'poster') {
		setupRemotion();
		// the film's poster is a composition of its own (remotion/Poster.jsx); POSTER_FRAME=<n> takes a frame of the film instead
		const frame = process.env.POSTER_FRAME;
		if (only('resume')) {
			if (frame) poster('resume', join(OUT, 'resume-30s.jpg'), ['--frame', frame, '--props', JSON.stringify({ audio: null })]);
			else poster('poster', join(OUT, 'resume-30s.jpg'));
		}
		// the viral cut: the knight at the portal under « J'ai transformé mon CV en jeu vidéo »
		if (only('viral'))
			poster('viral', join(OUT, 'viral-vertical.jpg'), [
				'--frame',
				process.env.VIRAL_POSTER_FRAME ?? '40',
				'--props',
				JSON.stringify({ audio: null }),
			]);
	}
	if (step === 'vtt') node('vtt.mjs', join(OUT, 'resume-30s.fr.vtt'), join(WORK, 'vo', 'durations.json'));
}
