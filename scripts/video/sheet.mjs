/**
 * Contact sheet of still frames (for reviewing shots): node scripts/video/sheet.mjs <out.jpg> <cols> <img...>
 * Uses ffmpeg (FFMPEG env var, else "ffmpeg" on the PATH).
 */
import { execFileSync } from 'node:child_process';

const [out, colsArg, ...imgs] = process.argv.slice(2);
const cols = Number(colsArg) || 3;
const W = Number(process.env.SHEET_W ?? 640);
const H = Number(process.env.SHEET_H ?? Math.round((W * 9) / 16));
const ff = process.env.FFMPEG ?? 'ffmpeg';
const inputs = imgs.flatMap((f) => ['-i', f]);
const scaled = imgs.map((_, i) => `[${i}:v]scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2[v${i}]`).join(';');
const layout = imgs.map((_, i) => `${(i % cols) * W}_${Math.floor(i / cols) * H}`).join('|');
const filter =
	imgs.length === 1
		? `${scaled.replace('[v0]', '')}`
		: `${scaled};${imgs.map((_, i) => `[v${i}]`).join('')}xstack=inputs=${imgs.length}:layout=${layout}:fill=black`;
execFileSync(ff, ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', filter, '-frames:v', '1', '-q:v', '3', out], { stdio: 'inherit' });
