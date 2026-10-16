/**
 * The soundtrack, mixed from cues.json: the lute of the val until the portal, a whoosh and an impact on the crossing,
 * then « Chillwave Nightdrive » from its first downbeat (100 BPM: one bar = 2.4 s = 72 frames), ducked under the voice.
 *   node scripts/video/mix.mjs <workDir> [--no-voice]   (reads <workDir>/vo/*.wav and <workDir>/sfx/*.wav, writes <workDir>/mix.wav)
 * Needs an ffmpeg with the usual audio filters (FFMPEG env var, else "ffmpeg").
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const work = process.argv[2];
const voice = !process.argv.includes('--no-voice');
const ff = process.env.FFMPEG ?? 'ffmpeg';
const cues = JSON.parse(readFileSync(new URL('./cues.json', import.meta.url), 'utf8'));
const total = cues.duration / cues.fps;
const { intro, main } = cues.music;

const inputs = [];
const add = (args) => inputs.push(...args) && inputs.filter((a) => a === '-i').length - 1;
const iIntro = add(['-ss', String(intro.offset), '-t', String(intro.to - intro.from + 0.4), '-i', intro.file]);
const iMain = add(['-ss', String(main.offset), '-t', String(total - main.from + 0.5), '-i', main.file]);
const iWhoosh = add(['-i', join(work, 'sfx', 'whoosh.wav')]);
const iImpact = add(['-i', join(work, 'sfx', 'impact.wav')]);
const vo = voice ? cues.segments.filter((s) => s.vo && existsSync(join(work, 'vo', `${s.id}.wav`))) : [];
const iVo = vo.map((s) => add(['-i', join(work, 'vo', `${s.id}.wav`)]));

const ms = (s) => Math.round(s * 1000);
const fmt = 'aformat=sample_rates=48000:channel_layouts=stereo';
const f = [
	`[${iIntro}:a]${fmt},afade=t=in:st=0:d=0.3,afade=t=out:st=${intro.to - 0.55}:d=0.5,volume=0.55[intro]`,
	`[${iMain}:a]${fmt},afade=t=in:st=0:d=0.02,afade=t=out:st=${main.fadeOut[0] - main.from}:d=${main.fadeOut[1] - main.fadeOut[0]},volume=0.8,adelay=${ms(main.from)}:all=1[main]`,
	`[intro][main]amix=inputs=2:normalize=0:duration=longest[music]`,
	`[${iWhoosh}:a]${fmt},volume=0.55,adelay=${ms(intro.to - 1.5)}:all=1[whoosh]`,
	`[${iImpact}:a]${fmt},volume=0.9,adelay=${ms(intro.to - 0.02)}:all=1[impact]`,
];
let musicOut = '[music]';
if (vo.length) {
	vo.forEach((s, k) => f.push(`[${iVo[k]}:a]${fmt},volume=1.5,adelay=${ms(s.vo.at)}:all=1[v${k}]`));
	f.push(`${vo.map((_, k) => `[v${k}]`).join('')}amix=inputs=${vo.length}:normalize=0:duration=longest,asplit=2[vo][key]`);
	f.push(`[music][key]sidechaincompress=threshold=0.04:ratio=5:attack=15:release=350:makeup=1[ducked]`);
	musicOut = '[ducked]';
}
f.push(
	`${musicOut}[whoosh][impact]${vo.length ? '[vo]' : ''}amix=inputs=${vo.length ? 4 : 3}:normalize=0:duration=longest,` +
		`atrim=0:${total},apad=whole_dur=${total},loudnorm=I=-15:TP=-1.5:LRA=9,${fmt}[out]`,
);

const outFile = join(work, voice ? 'mix.wav' : 'mix-music.wav');
execFileSync(ff, ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', f.join(';'), '-map', '[out]', '-c:a', 'pcm_s16le', outFile], {
	stdio: 'inherit',
});
console.log('mix →', outFile, `(${total.toFixed(2)} s, ${vo.length} voice clips)`);
