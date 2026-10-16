/**
 * French subtitles (WebVTT) of the voice-over, timed from cues.json and the measured clip lengths:
 *   node scripts/video/vtt.mjs <out.vtt> [durations.json]
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const [out, durationsFile] = process.argv.slice(2);
const cues = JSON.parse(readFileSync(new URL('./cues.json', import.meta.url), 'utf8'));
const durations = durationsFile && existsSync(durationsFile) ? JSON.parse(readFileSync(durationsFile, 'utf8')) : {};
const total = cues.duration / cues.fps;

const NNBSP = ' ';
const fr = (s) =>
	String(s)
		.replace(/\s+([;:!?%»])/g, `${NNBSP}$1`)
		.replace(/«\s+/g, `«${NNBSP}`)
		.replace(/(\d)\s(\d{3})\b/g, `$1${NNBSP}$2`);
const ts = (s) => {
	const ms = Math.round(s * 1000);
	const h = String(Math.floor(ms / 3600000)).padStart(2, '0');
	const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, '0');
	const sec = String(Math.floor((ms % 60000) / 1000)).padStart(2, '0');
	return `${h}:${m}:${sec}.${String(ms % 1000).padStart(3, '0')}`;
};

const voiced = cues.segments.filter((s) => s.vo);
const lines = ['WEBVTT', '', 'NOTE Raphaël Picard en 30 secondes — voix off (synthèse vocale), sous-titres français', ''];
voiced.forEach((s, i) => {
	const next = i + 1 < voiced.length ? voiced[i + 1].vo.at : total;
	const segEnd = (s.from + s.len) / cues.fps;
	const spoken = durations[s.id]?.dur ?? 2;
	// on screen at least 1.6 s, and until the cut when the voice ends near it
	const end = Math.min(next - 0.05, Math.max(s.vo.at + spoken + 0.5, s.vo.at + 1.6, Math.min(segEnd, next) - 0.05));
	lines.push(String(i + 1), `${ts(s.vo.at)} --> ${ts(end)}`, fr(s.vo.text), '');
});
writeFileSync(out, lines.join('\n'), 'utf8');
console.log('vtt →', out, `(${voiced.length} cues)`);
