'use client';

import { useSyncExternalStore } from 'react';

import { game } from './game-store';
import { music } from './music';
import clips from './voice-clips.json';

/**
 * Voice-over of the quest dialogs and of the defeated bugs: clips pre-generated offline by scripts/voices/generate.py,
 * each one recorded twice (public/audio/voice/<id>-f.mp3 female voice, <id>-m.mp3 male voice), loaded on demand.
 * One clip at a time, only while the sound is on. Options › « Voix des personnages » picks the voice: « Auto » keeps the
 * voice of each character (default in the manifest), « Femme » / « Homme » use the same voice everywhere.
 */
export type VoiceGender = 'f' | 'm';
type Take = { seconds: number };
type Clip = { text: string; default: VoiceGender } & Partial<Record<VoiceGender, Take>>;
const CLIPS = clips as unknown as Record<string, Clip>;

/** FNV-1a 32 bits over UTF-16 code units: same value as fnv1a() in the generator. */
export function voiceHash(text: string) {
	let h = 0x811c9dc5;
	for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 0x01000193) >>> 0;
	return h.toString(16).padStart(8, '0');
}

/** Clip recorded for this exact text, or null (not generated yet, or the text changed since). */
export function voiceClip(id: string, text: string): string | null {
	const c = CLIPS[id];
	// typographic spaces (no-break, thin) do not change what is said
	return c && c.text === voiceHash(text.replace(/[  ]/g, ' ')) ? id : null;
}

/** Voice a clip is played in for the visitor's choice (« auto »: the character's own voice). */
export function voiceGender(id: string, choice = game.get().voiceGender): VoiceGender | null {
	const c = CLIPS[id];
	if (!c) return null;
	const want = choice === 'auto' ? c.default : choice;
	if (c[want]) return want;
	return c[c.default] ? c.default : null;
}

let audio: HTMLAudioElement | null = null;
let current: string | null = null;
let takes = 0;
const listeners = new Set<() => void>();

function setCurrent(id: string | null) {
	current = id;
	music.duck(id !== null);
	listeners.forEach((l) => l());
}

// muting the game also silences the voice
game.subscribe(() => {
	if (current && !game.get().sound) voice.stop();
});

export const voice = {
	/** Plays a clip, cutting the one playing (a quest line always takes over). */
	play(id: string) {
		const g = voiceGender(id);
		if (!g || !game.get().sound || typeof Audio === 'undefined') return;
		voice.stop();
		audio ??= new Audio();
		audio.src = `/audio/voice/${id}-${g}.mp3?v=${CLIPS[id].text}`;
		// a stale clip ending or aborting must not reset the one playing now
		const take = ++takes;
		const done = () => take === takes && setCurrent(null);
		audio.onended = done;
		audio.onerror = done;
		setCurrent(id);
		audio.play().catch(done);
	},
	/** Plays a clip only if no other one is playing (a bug card never talks over a quest line). */
	offer(id: string) {
		if (current === null) voice.play(id);
	},
	stop() {
		audio?.pause();
		if (current) setCurrent(null);
	},
	/** Id of the clip playing right now, or null. */
	current() {
		return current;
	},
	subscribe(l: () => void) {
		listeners.add(l);
		return () => {
			listeners.delete(l);
		};
	},
};

/** Id of the clip playing right now, or null. */
export function useVoice() {
	return useSyncExternalStore(
		voice.subscribe,
		() => current,
		() => null,
	);
}
