'use client';

import { useSyncExternalStore } from 'react';

import { game } from './game-store';
import { music } from './music';
import clips from './voice-clips.json';

/**
 * Voice-over of the quest dialogs: clips pre-generated offline by scripts/voices/generate.py
 * (public/audio/voice/<questId>-<intro|outro>.mp3). One clip at a time, only while the sound is on.
 */
type Clip = { text: string; seconds: number };
const CLIPS: Record<string, Clip> = clips;

/** FNV-1a 32 bits over UTF-16 code units: same value as fnv1a() in the generator. */
function voiceHash(text: string) {
	let h = 0x811c9dc5;
	for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 0x01000193) >>> 0;
	return h.toString(16).padStart(8, '0');
}

/** Clip recorded for this exact text, or null (not generated yet, or the text changed since). */
export function voiceClip(id: string, text: string): string | null {
	const c = CLIPS[id];
	// typographic spaces (no-break, thin) do not change what is said
	return c && c.text === voiceHash(text.replace(/[\u00a0\u202f]/g, ' ')) ? id : null;
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
	play(id: string) {
		if (!game.get().sound || typeof Audio === 'undefined') return;
		voice.stop();
		audio ??= new Audio();
		audio.src = `/audio/voice/${id}.mp3?v=${CLIPS[id]?.text ?? ''}`;
		// a stale clip ending or aborting must not reset the one playing now
		const take = ++takes;
		const done = () => take === takes && setCurrent(null);
		audio.onended = done;
		audio.onerror = done;
		setCurrent(id);
		audio.play().catch(done);
	},
	stop() {
		audio?.pause();
		if (current) setCurrent(null);
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
