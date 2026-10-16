'use client';

import { useSyncExternalStore } from 'react';

import { type Zone, landmark } from './world';
import { QUESTS, type QuestStatus, initialQuests, objectiveDone, quest } from './quests';

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
	/** Small line announcing an objective reached or a quest to hand in. */
	ticker: { id: number; text: string } | null;
	/** Portal crossing in progress (start time): the screen whirls while the realm changes. */
	warp: number | null;
	/** A previous game was restored from this browser: the start screen offers to continue it or start over. */
	saved: boolean;
	/** Realm the saved game was left in: « Continuer » brings the hero back there. */
	resume: Zone;
	/** The last main quest has just been handed in: the end card shows (once the panel is closed). */
	ending: boolean;
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
	ticker: null,
	warp: null,
	saved: false,
	resume: 'val',
	ending: false,
	banner: null,
};

const listeners = new Set<() => void>();

const toastQueue: { title: string; text: string }[] = [];
let toastBusyUntil = 0;
/** The zone banner owns the screen for 3.8 s: toasts wait behind it. */
let bannerUntil = 0;
let toastTimer: ReturnType<typeof setTimeout> | null = null;
/** Shows the next queued toast once the current one (4.5 s) is gone. */
function pumpToasts() {
	if (toastTimer || !toastQueue.length) return;
	toastTimer = setTimeout(
		() => {
			toastTimer = null;
			// a reading panel or a portal crossing owns the screen: the announcement waits until it is seen
			if (state.panel !== null || state.warp !== null || state.overlay !== null || state.ending || Date.now() < bannerUntil) {
				toastTimer = setTimeout(() => {
					toastTimer = null;
					pumpToasts();
				}, 400);
				return;
			}
			const next = toastQueue.shift();
			if (!next) return;
			toastBusyUntil = Date.now() + 4800;
			game.set({ toast: { id: Date.now(), ...next } });
			pumpToasts();
		},
		Math.max(0, toastBusyUntil - Date.now(), bannerUntil - Date.now()),
	);
}

/** What the server rendered: React hydrates from it, then switches to the restored save. */
const INITIAL: GameState = state;
const SAVE_KEY = 'rp-save-v1';
const SAVED = ['quests', 'progress', 'tracked', 'visited', 'kills', 'defeated', 'flags', 'jumps', 'hero', 'timeMode', 'zone'] as const;
if (typeof window !== 'undefined') {
	try {
		const raw = window.localStorage.getItem(SAVE_KEY);
		if (raw) {
			const saved = JSON.parse(raw) as Partial<GameState>;
			// quests added since the save start from their initial status
			// the world always opens on the val (start screen); the saved realm is rejoined on « Continuer »
			state = { ...state, ...saved, zone: 'val', resume: saved.zone === 'nexus' ? 'nexus' : 'val', quests: { ...state.quests, ...saved.quests } };
			state.saved = (state.visited?.length ?? 0) > 0 || state.kills > 0 || Object.values(state.quests).some((v) => v !== 'available' && v !== 'locked');
		}
	} catch {
		// private mode or corrupt save: a fresh game
	}
	let timer = 0;
	listeners.add(() => {
		clearTimeout(timer);
		timer = window.setTimeout(() => {
			try {
				window.localStorage.setItem(SAVE_KEY, JSON.stringify(Object.fromEntries(SAVED.map((k) => [k, state[k]]))));
			} catch {
				// storage full or blocked: progress simply isn't kept
			}
		}, 400);
	});
}

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
	/** Starts over: quests, bugs and achievements back to the beginning (the hero and the options stay). */
	newGame() {
		game.set({ quests: initialQuests(), progress: {}, tracked: null, visited: [], kills: 0, defeated: [], flags: [], jumps: 0, zone: 'val', overlay: null, saved: false, resume: 'val' });
	},
	/** Toasts wait their turn: one at a time, never on top of another. */
	toast(title: string, text: string) {
		toastQueue.push({ title, text });
		pumpToasts();
	},
	/** Keeps the announcements back for a while (the portal crossing, then its zone banner). */
	holdToasts(ms: number) {
		bannerUntil = Math.max(bannerUntil, Date.now() + ms);
	},
	banner(title: string, subtitle: string) {
		bannerUntil = Math.max(bannerUntil, Date.now() + 3800);
		game.set({ banner: { id: Date.now(), title, subtitle } });
	},
	/** Called when the player opens a landmark: progresses objectives. */
	/** Progresses objectives; `before` is the hunt progress prior to this step (for the ticker). */
	visit(id?: string, before = state.progress) {
		const s = state;
		const visited = !id || s.visited.includes(id) ? s.visited : [...s.visited, id];
		const quests = { ...s.quests };
		let tick: string | null = null;
		for (const q of QUESTS) {
			if (quests[q.id] !== 'active') continue;
			// what this very step achieved, announced by the ticker
			for (const o of q.objectives) {
				if (objectiveDone(q, o, s.visited, before) || !objectiveDone(q, o, visited, s.progress)) continue;
				const done = q.objectives.filter((x) => objectiveDone(q, x, visited, s.progress)).length;
				tick = `${o.label} ✓  ·  ${q.title} ${done}/${q.objectives.length}`;
			}
			const hunt = q.objectives.find((o) => o.kills);
			if (!tick && hunt?.kills && (s.progress[q.id] ?? 0) > (before[q.id] ?? 0)) {
				tick = `Bug corrigé  ·  ${q.title} ${Math.min(s.progress[q.id] ?? 0, hunt.kills.n)}/${hunt.kills.n}`;
			}
			if (q.objectives.every((o) => objectiveDone(q, o, visited, s.progress))) {
				quests[q.id] = 'ready';
				tick = `Quête accomplie : retourne voir ${landmark(q.turnIn).name.split(',')[0]}`;
			}
		}
		game.set({ visited, quests, ...(tick ? { ticker: { id: Date.now(), text: tick } } : {}) });
	},
	/** A bug was defeated in a realm: counts for every active hunt quest of that realm. */
	kill(zone: 'val' | 'nexus') {
		const before = state.progress;
		const progress = { ...state.progress };
		for (const q of QUESTS) if (state.quests[q.id] === 'active' && q.objectives.some((o) => o.kills?.zone === zone)) progress[q.id] = (progress[q.id] ?? 0) + 1;
		game.set({ progress });
		game.visit(undefined, before);
	},
	accept(id: string) {
		game.set((s) => ({ quests: { ...s.quests, [id]: 'active' }, progress: { ...s.progress, [id]: 0 }, tracked: s.tracked && s.quests[s.tracked] === 'active' ? s.tracked : id }));
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
		// the end of the adventure gets its own card instead of a toast
		if (id === 'agents') game.set({ ending: true, panel: null });
		else game.toast(`Haut fait : ${q.reward.title}`, q.reward.text);
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
		() => selector(INITIAL),
	);
}
