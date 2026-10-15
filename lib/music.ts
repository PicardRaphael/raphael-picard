'use client';

/**
 * Generative soundtrack with the Web Audio API (no audio files):
 * - Val: slow harp arpeggios and warm pads in D dorian,
 * - Nexus: synthwave arpeggio, bass and soft kick in A minor.
 * The two themes crossfade with the zone. Plus a few sound effects.
 */

type Theme = 'val' | 'nexus';

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let reverb: ConvolverNode | null = null;
const bus: Partial<Record<Theme, GainNode>> = {};
let timer: ReturnType<typeof setInterval> | null = null;
let step = 0;
let nextTime = 0;
let theme: Theme = 'val';

const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

function impulse(c: AudioContext, seconds = 2.8) {
	const len = c.sampleRate * seconds;
	const buf = c.createBuffer(2, len, c.sampleRate);
	for (let ch = 0; ch < 2; ch++) {
		const d = buf.getChannelData(ch);
		for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
	}
	return buf;
}

function voice(dest: AudioNode, freq: number, t: number, dur: number, type: OscillatorType, gain: number, cutoff = 2400, detune = 0) {
	if (!ctx) return;
	const o = ctx.createOscillator();
	const g = ctx.createGain();
	const f = ctx.createBiquadFilter();
	o.type = type;
	o.frequency.value = freq;
	o.detune.value = detune;
	f.type = 'lowpass';
	f.frequency.value = cutoff;
	g.gain.setValueAtTime(0, t);
	g.gain.linearRampToValueAtTime(gain, t + Math.min(0.02, dur / 4));
	g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
	o.connect(f).connect(g).connect(dest);
	o.start(t);
	o.stop(t + dur + 0.05);
}

function pad(dest: AudioNode, notes: number[], t: number, dur: number, gain: number) {
	if (!ctx) return;
	for (const n of notes) {
		for (const d of [-7, 7]) {
			const o = ctx.createOscillator();
			const g = ctx.createGain();
			const f = ctx.createBiquadFilter();
			o.type = 'sawtooth';
			o.frequency.value = midi(n);
			o.detune.value = d;
			f.type = 'lowpass';
			f.frequency.value = 900;
			g.gain.setValueAtTime(0, t);
			g.gain.linearRampToValueAtTime(gain, t + dur * 0.35);
			g.gain.linearRampToValueAtTime(0, t + dur);
			o.connect(f).connect(g).connect(dest);
			o.start(t);
			o.stop(t + dur + 0.1);
		}
	}
}

function kick(dest: AudioNode, t: number) {
	if (!ctx) return;
	const o = ctx.createOscillator();
	const g = ctx.createGain();
	o.frequency.setValueAtTime(140, t);
	o.frequency.exponentialRampToValueAtTime(45, t + 0.18);
	g.gain.setValueAtTime(0.5, t);
	g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
	o.connect(g).connect(dest);
	o.start(t);
	o.stop(t + 0.35);
}

function hat(dest: AudioNode, t: number, gain = 0.05) {
	if (!ctx) return;
	const buf = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
	const d = buf.getChannelData(0);
	for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
	const s = ctx.createBufferSource();
	const f = ctx.createBiquadFilter();
	const g = ctx.createGain();
	s.buffer = buf;
	f.type = 'highpass';
	f.frequency.value = 7000;
	g.gain.setValueAtTime(gain, t);
	g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
	s.connect(f).connect(g).connect(dest);
	s.start(t);
}

// D dorian: Dm – C – Bb – C ; A minor: Am – F – C – G
const VAL_CHORDS = [
	[62, 65, 69],
	[60, 64, 67],
	[58, 62, 65],
	[60, 64, 67],
];
const NEX_CHORDS = [
	[57, 60, 64],
	[53, 57, 60],
	[60, 64, 67],
	[55, 59, 62],
];

function schedule() {
	if (!ctx) return;
	const val = bus.val;
	const nex = bus.nexus;
	if (!val || !nex) return;
	while (nextTime < ctx.currentTime + 0.25) {
		const t = nextTime;
		// 16th-note grid: val at 72 bpm, nexus at 100 bpm share the scheduler at the val tempo × 4/3 swing-free
		const sixteenth = 60 / 96 / 4;
		const bar = Math.floor(step / 16) % 4;
		const s16 = step % 16;
		// — Val —
		const vc = VAL_CHORDS[bar];
		if (s16 === 0) {
			pad(val, vc.map((n) => n - 12), t, sixteenth * 16, 0.035);
			voice(val, midi(vc[0] - 24), t, sixteenth * 14, 'triangle', 0.12, 600);
		}
		if (s16 % 2 === 0) {
			const arp = [0, 1, 2, 1, 2, 0, 1, 2][(s16 / 2) % 8];
			voice(val, midi(vc[arp] + (s16 >= 8 ? 12 : 0)), t, 1.4, 'triangle', 0.07, 3000);
		}
		// — Nexus —
		const nc = NEX_CHORDS[bar];
		if (s16 % 4 === 0) kick(nex, t);
		if (s16 % 2 === 1) hat(nex, t);
		if (s16 === 0) pad(nex, nc, t, sixteenth * 16, 0.025);
		voice(nex, midi(nc[s16 % 3] + 12 + (s16 % 8 === 7 ? 12 : 0)), t, sixteenth * 0.9, 'sawtooth', 0.04, 1800 + 800 * Math.sin(step / 10));
		if (s16 % 4 === 2) voice(nex, midi(nc[0] - 24), t, sixteenth * 2, 'square', 0.06, 400);
		nextTime += sixteenth;
		step++;
	}
}

export const music = {
	async start() {
		if (typeof window === 'undefined') return;
		if (!ctx) {
			const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
			ctx = new AC();
			master = ctx.createGain();
			master.gain.value = 0.8;
			reverb = ctx.createConvolver();
			reverb.buffer = impulse(ctx);
			const wet = ctx.createGain();
			wet.gain.value = 0.45;
			reverb.connect(wet).connect(master);
			master.connect(ctx.destination);
			for (const th of ['val', 'nexus'] as Theme[]) {
				const g = ctx.createGain();
				g.gain.value = th === theme ? 1 : 0;
				g.connect(master);
				g.connect(reverb);
				bus[th] = g;
			}
			nextTime = ctx.currentTime + 0.1;
		}
		await ctx.resume();
		if (!timer) timer = setInterval(schedule, 60);
	},
	stop() {
		if (timer) clearInterval(timer);
		timer = null;
		void ctx?.suspend();
	},
	setTheme(next: Theme) {
		theme = next;
		if (!ctx) return;
		for (const th of ['val', 'nexus'] as Theme[]) {
			const g = bus[th];
			if (!g) continue;
			g.gain.cancelScheduledValues(ctx.currentTime);
			g.gain.setTargetAtTime(th === next ? 1 : 0, ctx.currentTime, 1.2);
		}
	},
	/** Short sound effects, only while the music is on. */
	sfx(kind: 'swing' | 'hit' | 'quest' | 'portal' | 'jump') {
		if (!ctx || !master || !timer) return;
		const t = ctx.currentTime;
		if (kind === 'swing') voice(master, 220, t, 0.15, 'sawtooth', 0.05, 1200);
		if (kind === 'hit') {
			voice(master, 90, t, 0.2, 'square', 0.12, 500);
			hat(master, t, 0.15);
		}
		if (kind === 'jump') voice(master, 330, t, 0.18, 'triangle', 0.08, 2000);
		if (kind === 'quest') [72, 76, 79, 84].forEach((n, i) => voice(master as GainNode, midi(n), t + i * 0.11, 0.9, 'triangle', 0.1, 4000));
		if (kind === 'portal') [48, 55, 60, 67, 72].forEach((n, i) => voice(master as GainNode, midi(n), t + i * 0.07, 1.6, 'sawtooth', 0.05, 2500));
	},
};
