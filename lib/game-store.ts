'use client';

import { useSyncExternalStore } from 'react';

/** Tiny UI store for the game layer (pilot mode, race, sound, docking). */
export type GameMode = 'journey' | 'pilot' | 'race';

type GameState = {
	mode: GameMode;
	sound: boolean;
	/** Station the ship is docked at in pilot mode, opens its holo panel. */
	docked: number | null;
	/** Station in range for docking. */
	inRange: number | null;
	visited: number[];
	fragments: number;
	race: { status: 'idle' | 'countdown' | 'running' | 'finished'; checkpoint: number; total: number; startedAt: number; time: number };
	toast: { id: number; title: string; text: string } | null;
};

let state: GameState = {
	mode: 'journey',
	sound: false,
	docked: null,
	inRange: null,
	visited: [],
	fragments: 0,
	race: { status: 'idle', checkpoint: 0, total: 0, startedAt: 0, time: 0 },
	toast: null,
};

const listeners = new Set<() => void>();

export const game = {
	get: () => state,
	set(patch: Partial<GameState> | ((s: GameState) => Partial<GameState>)) {
		const next = typeof patch === 'function' ? patch(state) : patch;
		state = { ...state, ...next };
		listeners.forEach((l) => l());
	},
	subscribe(l: () => void) {
		listeners.add(l);
		return () => listeners.delete(l);
	},
	toast(title: string, text: string) {
		game.set({ toast: { id: Date.now(), title, text } });
	},
};

export function useGame<T>(selector: (s: GameState) => T): T {
	return useSyncExternalStore(
		game.subscribe,
		() => selector(state),
		() => selector(state),
	);
}
