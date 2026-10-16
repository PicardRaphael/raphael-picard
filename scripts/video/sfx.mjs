/**
 * Two synthesised sound effects for the portal crossing (no sample, no licence): a rising whoosh and a deep impact.
 *   node scripts/video/sfx.mjs <outDir>  →  whoosh.wav (1.5 s), impact.wav (2.2 s), 48 kHz stereo 16-bit
 */
import { mkdirSync, writeFileSync } from 'node:fs';

const out = process.argv[2] ?? 'sfx';
const SR = 48000;

function wav(file, left, right = left) {
	const n = left.length;
	const buf = Buffer.alloc(44 + n * 4);
	buf.write('RIFF', 0);
	buf.writeUInt32LE(36 + n * 4, 4);
	buf.write('WAVEfmt ', 8);
	buf.writeUInt32LE(16, 16);
	buf.writeUInt16LE(1, 20);
	buf.writeUInt16LE(2, 22);
	buf.writeUInt32LE(SR, 24);
	buf.writeUInt32LE(SR * 4, 28);
	buf.writeUInt16LE(4, 32);
	buf.writeUInt16LE(16, 34);
	buf.write('data', 36);
	buf.writeUInt32LE(n * 4, 40);
	for (let i = 0; i < n; i++) {
		buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, left[i])) * 32000), 44 + i * 4);
		buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, right[i])) * 32000), 46 + i * 4);
	}
	writeFileSync(`${out}/${file}`, buf);
}

let seed = 12345;
const noise = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;

/** Resonant band-pass (RBJ biquad) whose centre frequency follows `freq(t)`. */
function sweep(len, freq, q, gain) {
	const y = new Float32Array(len);
	let x1 = 0,
		x2 = 0,
		y1 = 0,
		y2 = 0;
	for (let i = 0; i < len; i++) {
		const t = i / SR;
		const w = (2 * Math.PI * freq(t)) / SR;
		const alpha = Math.sin(w) / (2 * q);
		const b0 = alpha,
			b2 = -alpha,
			a0 = 1 + alpha,
			a1 = -2 * Math.cos(w),
			a2 = 1 - alpha;
		const x = noise();
		const v = (b0 * x + b2 * x2 - a1 * y1 - a2 * y2) / a0;
		x2 = x1;
		x1 = x;
		y2 = y1;
		y1 = v;
		y[i] = v * gain(t);
	}
	return y;
}

mkdirSync(out, { recursive: true });

// whoosh: a band of noise rising from 300 Hz to 6 kHz, swelling, cut dead at the portal
{
	const len = Math.round(1.5 * SR);
	const f = (t) => 300 * Math.pow(20, Math.pow(t / 1.5, 1.6));
	const g = (t) => Math.pow(t / 1.5, 2.2) * 2.4 * Math.min(1, (1.5 - t) / 0.03);
	const l = sweep(len, f, 2.5, g);
	seed = 999;
	const r = sweep(len, (t) => f(t) * 1.07, 2.5, g);
	wav('whoosh.wav', l, r);
}

// impact: a sub drop (70 → 32 Hz) with a soft noise crack and a long tail
{
	const len = Math.round(2.2 * SR);
	const l = new Float32Array(len);
	let phase = 0;
	for (let i = 0; i < len; i++) {
		const t = i / SR;
		phase += (2 * Math.PI * (32 + 38 * Math.exp(-t * 6))) / SR;
		const sub = Math.sin(phase) * Math.exp(-t * 2.2) * 0.9;
		const crack = noise() * Math.exp(-t * 28) * 0.35;
		l[i] = (sub + crack) * Math.min(1, t / 0.004);
	}
	wav('impact.wav', l);
}
// laser shot of the runner: a fast downward chirp with a bright attack
{
	const len = Math.round(0.32 * SR);
	const l = new Float32Array(len);
	let phase = 0;
	for (let i = 0; i < len; i++) {
		const t = i / SR;
		phase += (2 * Math.PI * (1900 * Math.exp(-t * 14) + 180)) / SR;
		const tone = Math.sign(Math.sin(phase)) * 0.25 + Math.sin(phase) * 0.35;
		l[i] = (tone + noise() * 0.18 * Math.exp(-t * 60)) * Math.exp(-t * 11) * Math.min(1, t / 0.002);
	}
	wav('zap.wav', l);
}

// a bolt landing on a bug: a short crunchy hit
{
	const len = Math.round(0.25 * SR);
	const l = new Float32Array(len);
	let phase = 0;
	for (let i = 0; i < len; i++) {
		const t = i / SR;
		phase += (2 * Math.PI * (140 * Math.exp(-t * 9) + 60)) / SR;
		l[i] = (Math.sin(phase) * 0.7 + noise() * 0.5 * Math.exp(-t * 35)) * Math.exp(-t * 14);
	}
	wav('hit.wav', l);
}

// « bug corrigé » : two bright bell notes (E6 then B6)
{
	const len = Math.round(1.2 * SR);
	const l = new Float32Array(len);
	for (let i = 0; i < len; i++) {
		const t = i / SR;
		const note = (f, t0) =>
			t < t0 ? 0 : (Math.sin(2 * Math.PI * f * (t - t0)) + 0.35 * Math.sin(2 * Math.PI * f * 2.01 * (t - t0))) * Math.exp(-(t - t0) * 4.5);
		l[i] = 0.32 * (note(1318.5, 0) + note(1975.5, 0.09));
	}
	wav('chime.wav', l);
}
console.log('sfx →', out);
