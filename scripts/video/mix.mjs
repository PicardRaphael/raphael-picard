/**
 * The soundtrack of a cue sheet (cues.json for the 16:9 film, viral.json for the vertical cut): its `audio` events
 * (music, sound effects, voice clips) plus the voice-over lines of its segments (<workDir>/vo/<segment>-<n>.wav),
 * the music ducked under every voice, normalised to −15 LUFS.
 *   node scripts/video/mix.mjs <workDir> [cues.json|viral.json] [--no-voice]   → <workDir>/pub/mix.wav (or mix-viral.wav)
 * « Chillwave Nightdrive » runs at 100 BPM: one beat = 0.6 s = 18 frames, the cuts land on it.
 * Needs an ffmpeg with the usual audio filters (FFMPEG env var, else "ffmpeg").
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const [work, sheetArg = 'cues.json'] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const voice = !process.argv.includes('--no-voice');
const ff = process.env.FFMPEG ?? 'ffmpeg';
const cues = JSON.parse(readFileSync(new URL(`./${sheetArg}`, import.meta.url), 'utf8'));
const total = cues.duration / cues.fps;

const events = cues.audio.map((e) => ({ ...e, file: e.file.replace('{work}', work) })).filter((e) => voice || e.role !== 'voice');
if (voice)
	for (const s of cues.segments)
		(s.vo ?? []).forEach((vo, n) => {
			const file = join(work, 'vo', `${s.id}-${n}.wav`);
			if (existsSync(file)) events.push({ file, role: 'voice', at: vo.at, vol: 1.5 });
		});

const fmt = 'aformat=sample_rates=48000:channel_layouts=stereo';
const inputs = [];
const chains = [];
events.forEach((e, i) => {
	if (e.offset) inputs.push('-ss', String(e.offset));
	if (e.dur) inputs.push('-t', String(e.dur));
	inputs.push('-i', e.file);
	const f = [fmt];
	if (e.fadeIn) f.push(`afade=t=in:st=0:d=${e.fadeIn}`);
	if (e.fadeOut) f.push(`afade=t=out:st=${(e.fadeOut[0] - e.at).toFixed(3)}:d=${e.fadeOut[1]}`);
	f.push(`volume=${e.vol ?? 1}`, `adelay=${Math.round(e.at * 1000)}:all=1`, `apad=whole_dur=${total}`);
	chains.push(`[${i}:a]${f.join(',')}[e${i}]`);
});
const bus = (role) => events.map((e, i) => (e.role === role ? `[e${i}]` : '')).join('');
const count = (role) => events.filter((e) => e.role === role).length;
const mix = (labels, n, out) => (n === 1 ? `${labels}anull[${out}]` : `${labels}amix=inputs=${n}:normalize=0:duration=longest[${out}]`);

chains.push(mix(bus('music'), count('music'), 'music'));
chains.push(mix(bus('sfx'), count('sfx'), 'sfx'));
let last = ['[music]', '[sfx]'];
if (count('voice')) {
	chains.push(`${mix(bus('voice'), count('voice'), 'vox')}`, '[vox]asplit=2[vo][key]');
	chains.push('[music][key]sidechaincompress=threshold=0.04:ratio=5:attack=15:release=350:makeup=1[ducked]');
	last = ['[ducked]', '[sfx]', '[vo]'];
}
chains.push(`${last.join('')}amix=inputs=${last.length}:normalize=0:duration=longest,atrim=0:${total},loudnorm=I=-15:TP=-1.5:LRA=9,${fmt}[out]`);

mkdirSync(join(work, 'pub'), { recursive: true });
const outFile = join(work, 'pub', sheetArg === 'cues.json' ? 'mix.wav' : `mix-${sheetArg.replace('.json', '')}.wav`);
execFileSync(ff, ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', chains.join(';'), '-map', '[out]', '-c:a', 'pcm_s16le', outFile], {
	stdio: 'inherit',
});
console.log('mix →', outFile, `(${total.toFixed(2)} s, ${count('voice')} voix, ${count('sfx')} effets)`);
