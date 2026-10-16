'use client';

/**
 * Soundtrack: recorded tracks (credited in the game menu) played as a playlist per zone,
 * crossfading between tracks and when the zone changes:
 * - Val: lute and flute medieval fantasy (RandomMind, CC0),
 * - Nexus: mellow synthwave (Bogart VGM, CC-BY 3.0; The Cynic Project, CC0).
 * Files are only fetched once the player turns the sound on (start() runs in a click), and are
 * streamed by two reusable <audio> elements routed through Web Audio gains: iOS ignores
 * HTMLMediaElement.volume, so fades must happen on GainNodes. Short sound effects stay synthesised.
 */

type Theme = 'val' | 'nexus';

const PLAYLISTS: Record<Theme, string[]> = {
	val: ['/audio/music/val-bards-tale.mp3', '/audio/music/val-exploration.mp3'],
	nexus: ['/audio/music/nexus-nightdrive.mp3', '/audio/music/nexus-synthwave-4k.mp3'],
};
/** Crossfade length in seconds (between tracks and on zone change). */
const FADE = 2.5;
/** Music level under the master gain (the recordings are much louder than the old synth). */
const MUSIC_LEVEL = 0.55;
/** Music bus, lowered while a character speaks. */
let bus: GainNode | null = null;

type Slot = { el: HTMLAudioElement; gain: GainNode; track: string; stopTimer: ReturnType<typeof setTimeout> | null };

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let slots: Slot[] = [];
let active = 0;
let theme: Theme = 'val';
const index: Record<Theme, number> = { val: 0, nexus: 0 };
let playing = false;
let advancing = false;

const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

/** A few ms of silent WAV, used to unlock an <audio> element during the user gesture (iOS). */
function silentWav() {
	const samples = 400;
	const bytes = new Uint8Array(44 + samples);
	const view = new DataView(bytes.buffer);
	const str = (o: number, s: string) => [...s].forEach((c, i) => view.setUint8(o + i, c.charCodeAt(0)));
	str(0, 'RIFF');
	view.setUint32(4, 36 + samples, true);
	str(8, 'WAVEfmt ');
	view.setUint32(16, 16, true);
	view.setUint16(20, 1, true); // PCM
	view.setUint16(22, 1, true); // mono
	view.setUint32(24, 8000, true);
	view.setUint32(28, 8000, true);
	view.setUint16(32, 1, true);
	view.setUint16(34, 8, true);
	str(36, 'data');
	view.setUint32(40, samples, true);
	bytes.fill(128, 44); // 8-bit silence
	let bin = '';
	bytes.forEach((b) => (bin += String.fromCharCode(b)));
	return `data:audio/wav;base64,${btoa(bin)}`;
}

function fade(slot: Slot, to: number, seconds = FADE) {
	if (!ctx) return;
	const t = ctx.currentTime;
	slot.gain.gain.cancelScheduledValues(t);
	slot.gain.gain.setValueAtTime(slot.gain.gain.value, t);
	slot.gain.gain.linearRampToValueAtTime(to, t + seconds);
}

function play(el: HTMLAudioElement) {
	el.play().catch(() => {
		/* blocked (no gesture yet) or interrupted by a src change: the next start() retries */
	});
}

/** Fades the current slot out and the given track in on the other slot. */
function crossfadeTo(track: string, fromStart: boolean) {
	if (!ctx || slots.length < 2) return;
	const from = slots[active];
	const toIndex = 1 - active;
	const to = slots[toIndex];
	if (to.stopTimer) clearTimeout(to.stopTimer);
	to.stopTimer = null;
	if (to.track !== track) {
		to.track = track;
		to.el.src = track;
	} else if (fromStart || to.el.duration - to.el.currentTime < FADE * 2) {
		// same track still loaded (quick back-and-forth across a zone border): resume it, unless it is nearly over
		to.el.currentTime = 0;
	}
	// the incoming slot is silent or still fading out: ramp up from wherever its gain is
	if (playing) play(to.el);
	fade(to, 1);
	fade(from, 0);
	if (from.stopTimer) clearTimeout(from.stopTimer);
	from.stopTimer = setTimeout(
		() => {
			from.el.pause();
			from.stopTimer = null;
		},
		FADE * 1000 + 100,
	);
	active = toIndex;
	advancing = false;
}

/** Next track of the current zone's playlist. */
function advance() {
	if (advancing || !playing) return;
	advancing = true;
	const list = PLAYLISTS[theme];
	index[theme] = (index[theme] + 1) % list.length;
	crossfadeTo(list[index[theme]], true);
}

function createSlot(c: AudioContext, bus: AudioNode): Slot {
	const el = new Audio();
	el.preload = 'none';
	el.crossOrigin = 'anonymous';
	const gain = c.createGain();
	gain.gain.value = 0;
	c.createMediaElementSource(el).connect(gain).connect(bus);
	const slot: Slot = { el, gain, track: '', stopTimer: null };
	el.addEventListener('timeupdate', () => {
		if (slots[active] !== slot || !Number.isFinite(el.duration)) return;
		if (el.duration - el.currentTime <= FADE + 0.25) advance();
	});
	el.addEventListener('ended', () => {
		if (slots[active] === slot) advance();
	});
	el.addEventListener('error', () => {
		// a track failed to load: skip it rather than staying silent
		if (slots[active] === slot && slot.track) setTimeout(advance, 1000);
	});
	return slot;
}

/** Pause the music while the tab is hidden, resume when it comes back. */
function onVisibility() {
	if (!ctx || !playing) return;
	if (document.hidden) {
		slots.forEach((s) => s.el.pause());
		void ctx.suspend();
	} else {
		void ctx.resume();
		play(slots[active].el);
	}
}

/** A film is playing with its own sound: the music goes silent until it stops. */
let hushed = false;
let ducked = false;
function level() {
	if (!ctx || !bus) return;
	const to = hushed ? 0 : ducked ? MUSIC_LEVEL * 0.3 : MUSIC_LEVEL;
	bus.gain.setTargetAtTime(to, ctx.currentTime, to < bus.gain.value ? 0.15 : 0.6);
}

export const music = {
	/** Lowers the music under a voice line, then brings it back. */
	duck(on: boolean) {
		ducked = on;
		level();
	},
	/** Silences the music while a video plays with sound (two soundtracks at once drown each other). */
	hush(on: boolean) {
		hushed = on;
		level();
	},
	/** Must be called from a user gesture the first time (click / key). */
	async start() {
		if (typeof window === 'undefined') return;
		if (!ctx) {
			const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
			ctx = new AC();
			master = ctx.createGain();
			master.gain.value = 0.8;
			master.connect(ctx.destination);
			bus = ctx.createGain();
			bus.gain.value = MUSIC_LEVEL;
			bus.connect(master);
			slots = [createSlot(ctx, bus), createSlot(ctx, bus)];
			// unlock the idle element inside this gesture so later crossfades may start it (iOS)
			const idle = slots[1].el;
			idle.src = silentWav();
			idle.play()
				.then(() => {
					if (!slots[1].track) idle.pause();
				})
				.catch(() => {});
			document.addEventListener('visibilitychange', onVisibility);
		}
		const first = !playing && !slots[active].track;
		playing = true;
		const resumed = ctx.resume();
		const slot = slots[active];
		if (first) {
			slot.track = PLAYLISTS[theme][index[theme]];
			slot.el.src = slot.track;
			slot.gain.gain.setValueAtTime(0, ctx.currentTime);
			fade(slot, 1, 1.5);
		}
		play(slot.el);
		await resumed;
	},
	stop() {
		playing = false;
		advancing = false;
		for (const s of slots) {
			if (s.stopTimer) clearTimeout(s.stopTimer);
			s.stopTimer = null;
			s.el.pause();
		}
		// the faded-out slot keeps its gain at 0, the active one at 1: resuming continues where it stopped
		void ctx?.suspend();
	},
	setTheme(next: Theme) {
		if (next === theme) return;
		theme = next;
		// before the first start(), only remember the zone
		if (!ctx || !slots[active].track) return;
		crossfadeTo(PLAYLISTS[theme][index[theme]], false);
	},
	/** Short synthesised sound effects, only while the sound is on. */
	sfx(kind: 'swing' | 'hit' | 'quest' | 'portal' | 'jump') {
		if (!ctx || !master || !playing) return;
		const t = ctx.currentTime;
		const out = master;
		if (kind === 'swing') voice(out, 220, t, 0.15, 'sawtooth', 0.05, 1200);
		if (kind === 'hit') {
			voice(out, 90, t, 0.2, 'square', 0.12, 500);
			hat(out, t, 0.15);
		}
		if (kind === 'jump') voice(out, 330, t, 0.18, 'triangle', 0.08, 2000);
		if (kind === 'quest') [72, 76, 79, 84].forEach((n, i) => voice(out, midi(n), t + i * 0.11, 0.9, 'triangle', 0.1, 4000));
		if (kind === 'portal') [48, 55, 60, 67, 72].forEach((n, i) => voice(out, midi(n), t + i * 0.07, 1.6, 'sawtooth', 0.05, 2500));
	},
};

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
