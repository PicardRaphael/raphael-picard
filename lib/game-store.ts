'use client';

import { useSyncExternalStore } from 'react';

import { QUESTS, type QuestStatus, initialQuests, objectiveDone, quest } from './quests';
import type { Zone } from './world';

/** UI store shared by the 3D world and the DOM overlay (quests, panels, race, sound). */
export type GameMode = 'journey' | 'pilot' | 'race';

export type RaceState = { status: 'idle' | 'countdown' | 'running' | 'finished'; checkpoint: number; total: number; startedAt: number; time: number };

type GameState = {
	mode: GameMode;
	started: boolean;
	/** The val is downloaded and its shaders compiled: the game can start without freezing. */
	ready: boolean;
	/** Download progress of the first scene, 0–100 (fed by the 3D chunk, so the start screen never imports three.js). */
	loading: number;
	/** Chosen character: fantasy knight or cyberpunk runner. */
	hero: 'knight' | 'runner';
	sound: boolean;
	zone: Zone;
	/** Landmark the player can interact with right now. */
	inRange: string | null;
	/** Landmark whose panel is open. */
	panel: string | null;
	quests: Record<string, QuestStatus>;
	/** Bugs defeated since each hunt quest was accepted. */
	progress: Record<string, number>;
	/** Quest the visitor chose to follow (trail and tracker); null = the next one in the story. */
	tracked: string | null;
	visited: string[];
	/** Bugs defeated. */
	kills: number;
	/** Ids of the bugs defeated at least once (bestiary). */
	defeated: number[];
	/** Problem / solution card currently shown. */
	bugCard: number | null;
	/** One-off events used by achievements (left_spawn, map, sound…). */
	flags: string[];
	jumps: number;
	/** Open UI overlay. */
	overlay: null | 'menu' | 'map';
	/** Time of day: auto follows the visitor's clock. */
	timeMode: 'auto' | 'day' | 'dusk' | 'night';
	weather: 'auto' | 'clear' | 'rain' | 'fog';
	quality: 'high' | 'low';
	race: RaceState;
	toast: { id: number; title: string; text: string } | null;
	banner: { id: number; title: string; subtitle: string } | null;
};

let state: GameState = {
	mode: 'journey',
	started: false,
	ready: false,
	loading: 0,
	hero: 'knight',
	sound: false,
	zone: 'val',
	inRange: null,
	panel: null,
	// every quest that no other quest leads to is open from the start (side quests run in parallel, like in an MMO)
	quests: initialQuests(),
	progress: {},
	tracked: null,
	visited: [],
	kills: 0,
	defeated: [],
	bugCard: null,
	flags: [],
	jumps: 0,
	overlay: null,
	timeMode: 'auto',
	weather: 'auto',
	quality: 'high',
	race: { status: 'idle', checkpoint: 0, total: 0, startedAt: 0, time: 0 },
	toast: null,
	banner: null,
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
		return () => {
			listeners.delete(l);
		};
	},
	flag(name: string) {
		if (!state.flags.includes(name)) game.set((s) => ({ flags: [...s.flags, name] }));
	},
	toast(title: string, text: string) {
		game.set({ toast: { id: Date.now(), title, text } });
	},
	banner(title: string, subtitle: string) {
		game.set({ banner: { id: Date.now(), title, subtitle } });
	},
	/** Called when the player opens a landmark: progresses objectives. */
	visit(id?: string) {
		const s = state;
		const visited = !id || s.visited.includes(id) ? s.visited : [...s.visited, id];
		const quests = { ...s.quests };
		for (const q of QUESTS) {
			if (quests[q.id] !== 'active') continue;
			if (q.objectives.every((o) => objectiveDone(q, o, visited, s.progress))) quests[q.id] = 'ready';
		}
		game.set({ visited, quests });
	},
	/** A bug was defeated in a realm: counts for every active hunt quest of that realm. */
	kill(zone: 'val' | 'nexus') {
		const progress = { ...state.progress };
		for (const q of QUESTS) if (state.quests[q.id] === 'active' && q.objectives.some((o) => o.kills?.zone === zone)) progress[q.id] = (progress[q.id] ?? 0) + 1;
		game.set({ progress });
		game.visit();
	},
	accept(id: string) {
		game.set((s) => ({ quests: { ...s.quests, [id]: 'active' }, progress: { ...s.progress, [id]: 0 }, tracked: id }));
		game.visit();
	},
	complete(id: string) {
		const q = quest(id);
		if (!q) return;
		game.set((s) => {
			const quests = { ...s.quests, [id]: 'done' as QuestStatus };
			if (q.next && quests[q.next] === 'locked') quests[q.next] = 'available';
			for (const side of QUESTS) if (side.requires === id && quests[side.id] === 'locked') quests[side.id] = 'available';
			return { quests, tracked: s.tracked === id ? null : s.tracked };
		});
		game.toast(`Haut fait : ${q.reward.title}`, q.reward.text);
		// a follow-up quest given by the same NPC starts right away
		if (q.next) {
			const n = quest(q.next);
			if (n && n.giver === q.turnIn) game.accept(n.id);
		}
	},
};

export function useGame<T>(selector: (s: GameState) => T): T {
	return useSyncExternalStore(
		game.subscribe,
		() => selector(state),
		() => selector(state),
	);
}
