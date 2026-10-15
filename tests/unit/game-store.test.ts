import { beforeEach, describe, expect, it, vi } from 'vitest';

import { QUESTS, initialQuests } from '@/lib/quests';

type Store = typeof import('@/lib/game-store');
let game: Store['game'];

// the store is a module singleton: reload it for every test
beforeEach(async () => {
	vi.resetModules();
	({ game } = await import('@/lib/game-store'));
});

const visitAll = (id: string) => {
	for (const o of QUESTS.find((q) => q.id === id)!.objectives) if (!o.kills) game.visit(o.id);
};

describe('game store', () => {
	it('starts with the initial quest statuses and nothing tracked', () => {
		const s = game.get();
		expect(s.quests).toEqual(initialQuests());
		expect(s.tracked).toBeNull();
		expect(s.visited).toEqual([]);
		expect(s.progress).toEqual({});
		expect(s.started).toBe(false);
	});

	it('notifies subscribers and stops after unsubscribe', () => {
		const l = vi.fn();
		const off = game.subscribe(l);
		game.set({ jumps: 1 });
		expect(l).toHaveBeenCalledTimes(1);
		off();
		game.set({ jumps: 2 });
		expect(l).toHaveBeenCalledTimes(1);
	});

	it('accept: quest becomes active, tracked, with progress 0', () => {
		game.accept('origines');
		const s = game.get();
		expect(s.quests.origines).toBe('active');
		expect(s.tracked).toBe('origines');
		expect(s.progress.origines).toBe(0);
	});

	it('visit: records the place once and flips the quest to ready when every objective is met', () => {
		game.accept('origines');
		game.visit('forge');
		game.visit('forge');
		expect(game.get().visited).toEqual(['forge']);
		expect(game.get().quests.origines).toBe('active');
		game.visit('tower');
		expect(game.get().quests.origines).toBe('active');
		game.visit('stones');
		expect(game.get().quests.origines).toBe('ready');
	});

	it('visit before accepting still counts once the quest is accepted', () => {
		game.visit('forge');
		game.visit('tower');
		game.visit('stones');
		expect(game.get().quests.origines).toBe('available');
		game.accept('origines');
		expect(game.get().quests.origines).toBe('ready');
	});

	it('visit does not touch quests that are not active', () => {
		visitAll('parcours');
		expect(game.get().quests.parcours).toBe('available');
	});

	it('kill(zone) counts only for active hunt quests of that zone', () => {
		game.kill('val');
		expect(game.get().progress).toEqual({});
		game.accept('chasse');
		game.accept('origines');
		game.kill('nexus');
		expect(game.get().progress.chasse).toBe(0);
		game.kill('val');
		game.kill('val');
		expect(game.get().progress.chasse).toBe(2);
		expect(game.get().progress.origines).toBe(0);
		expect(game.get().quests.chasse).toBe('active');
		game.kill('val');
		expect(game.get().quests.chasse).toBe('ready');
		// once ready, further kills no longer count
		game.kill('val');
		expect(game.get().progress.chasse).toBe(3);
	});

	it('kills made before accepting a hunt do not count (progress starts at 0)', () => {
		game.set({ quests: { ...game.get().quests, purge: 'available' } });
		game.kill('nexus');
		game.accept('purge');
		expect(game.get().progress.purge).toBe(0);
		game.kill('nexus');
		game.kill('val');
		expect(game.get().progress.purge).toBe(1);
	});

	it('complete: done, toast, next quest auto-accepted when the giver is the turn-in NPC', async () => {
		game.accept('origines');
		visitAll('origines');
		game.complete('origines');
		const s = game.get();
		expect(s.quests.origines).toBe('done');
		// portail is given by raphy, who is also the turn-in NPC of origines
		expect(s.quests.portail).toBe('active');
		expect(s.tracked).toBe('portail');
		// toasts are queued: the reward shows on the next tick, once nothing else is on screen
		await new Promise((r) => setTimeout(r, 10));
		expect(game.get().toast?.title).toContain('Artisan du code');
		// and each step of the quest was announced by the ticker
		expect(s.ticker?.text).toContain('Raphy');
	});

	it('complete: unlocks the next quest and side quests that require it', () => {
		game.set({ quests: { ...game.get().quests, origines: 'done', portail: 'active' } });
		game.visit('portal');
		expect(game.get().quests.portail).toBe('ready');
		game.complete('portail');
		const s = game.get();
		expect(s.quests.portail).toBe('done');
		// production is given by holo, who is the turn-in NPC of portail: auto-accepted
		expect(s.quests.production).toBe('active');
		expect(s.tracked).toBe('production');
		expect(s.quests.purge).toBe('available');
	});

	it.each(QUESTS.filter((q) => q.next).map((q) => [q.id, q] as const))('complete(%s): next is auto-accepted only when the turn-in NPC also gives it', (id, q) => {
		game.set({ quests: { ...game.get().quests, [id]: 'ready' } });
		game.complete(id);
		const n = QUESTS.find((x) => x.id === q.next)!;
		expect(game.get().quests[n.id]).toBe(n.giver === q.turnIn ? 'active' : 'available');
	});

	it('complete: a quest without next or dependants leaves the others untouched', () => {
		const before = { ...game.get().quests };
		game.set({ quests: { ...before, parcours: 'ready' } });
		game.complete('parcours');
		expect(game.get().quests).toEqual({ ...before, parcours: 'done' });
	});

	it('complete: untracks the completed quest but keeps another tracked one', () => {
		game.accept('parcours');
		game.accept('chasse');
		expect(game.get().tracked).toBe('chasse');
		game.complete('parcours');
		expect(game.get().tracked).toBe('chasse');
		game.complete('chasse');
		expect(game.get().tracked).toBeNull();
	});

	it('complete: ignores unknown ids', () => {
		const before = game.get();
		game.complete('nope');
		expect(game.get()).toBe(before);
	});

	it('flag is idempotent', () => {
		game.flag('map');
		game.flag('map');
		expect(game.get().flags).toEqual(['map']);
	});

	it('the whole story can be played to the end', () => {
		const order = ['origines', 'parcours', 'chasse', 'portail', 'production', 'purge', 'agents'];
		for (const id of order) {
			const q = QUESTS.find((x) => x.id === id)!;
			if (game.get().quests[id] === 'available') game.accept(id);
			expect(game.get().quests[id], id).toMatch(/active|ready/);
			visitAll(id);
			for (const o of q.objectives) if (o.kills) for (let i = 0; i < o.kills.n; i++) game.kill(o.kills.zone);
			expect(game.get().quests[id], id).toBe('ready');
			game.complete(id);
		}
		expect(Object.values(game.get().quests).every((s) => s === 'done')).toBe(true);
	});

	it('reset (Menu › Progression › Réinitialiser) restores the initial progression', () => {
		// the store has no reset() method: the menu applies this patch (components/game/Menu.tsx)
		game.accept('origines');
		visitAll('origines');
		game.complete('origines');
		game.kill('val');
		game.flag('map');
		game.set({ quests: initialQuests(), progress: {}, tracked: null, visited: [], kills: 0, defeated: [], flags: [], jumps: 0, zone: 'val', overlay: null });
		const s = game.get();
		expect(s.quests).toEqual(initialQuests());
		expect(s.tracked).toBeNull();
		expect(s.visited).toEqual([]);
		expect(s.progress).toEqual({});
		expect(s.flags).toEqual([]);
		// and the story can be replayed
		game.accept('origines');
		expect(game.get().quests.origines).toBe('active');
		expect(game.get().progress.origines).toBe(0);
	});
});
