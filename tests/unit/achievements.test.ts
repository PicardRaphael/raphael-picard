import { describe, expect, it } from 'vitest';

import { ACHIEVEMENTS, unlocked } from '@/lib/achievements';
import { mobs } from '@/lib/mobs';
import { QUESTS, type QuestStatus, initialQuests } from '@/lib/quests';
import { LANDMARKS } from '@/lib/world';

type State = Parameters<typeof unlocked>[0];
const base = (patch: Partial<State> = {}): State => ({ quests: initialQuests(), visited: [], kills: 0, flags: [], jumps: 0, sound: false, zone: 'val', ...patch });

describe('achievements', () => {
	it('have unique ids and titles', () => {
		expect(new Set(ACHIEVEMENTS.map((a) => a.id)).size).toBe(ACHIEVEMENTS.length);
		expect(new Set(ACHIEVEMENTS.map((a) => a.title)).size).toBe(ACHIEVEMENTS.length);
	});

	it.each(QUESTS.map((q) => [q.id, q.reward.title] as const))('quest %s rewards an existing achievement title (%s)', (_, title) => {
		expect(ACHIEVEMENTS.map((a) => a.title)).toContain(title);
	});

	it.each(QUESTS.filter((q) => q.id !== 'portail').map((q) => [q.id, q.reward.title] as const))('finishing quest %s unlocks « %s »', (id, title) => {
		const a = ACHIEVEMENTS.find((x) => x.title === title)!;
		expect(unlocked(base())).not.toContain(a.id);
		expect(unlocked(base({ quests: { ...initialQuests(), [id]: 'done' as QuestStatus } }))).toContain(a.id);
	});

	it('« Passe-portail » is earned by reaching the Nexus (flag), which the portail quest requires', () => {
		const a = ACHIEVEMENTS.find((x) => x.title === quest('portail').reward.title)!;
		expect(unlocked(base({ flags: ['nexus'] }))).toContain(a.id);
	});

	it('nothing is unlocked at the start', () => {
		expect(unlocked(base())).toEqual([]);
	});

	it('progress never exceeds its max and max is positive', () => {
		const full = base({
			quests: Object.fromEntries(QUESTS.map((q) => [q.id, 'done' as QuestStatus])),
			visited: LANDMARKS.map((l) => l.id),
			kills: mobs.length + 10,
			jumps: 999,
			flags: ['left_spawn', 'nexus', 'map', 'music_val', 'music_nexus'],
		});
		for (const a of ACHIEVEMENTS) {
			const [n, max] = a.progress(full);
			expect(max, a.id).toBeGreaterThan(0);
			expect(n, a.id).toBeLessThanOrEqual(max);
		}
		expect(unlocked(full).sort()).toEqual(ACHIEVEMENTS.map((a) => a.id).sort());
	});

	it('counters unlock exactly at their threshold', () => {
		expect(unlocked(base({ jumps: 19 }))).not.toContain('jumper');
		expect(unlocked(base({ jumps: 20 }))).toContain('jumper');
		expect(unlocked(base({ kills: mobs.length - 1 }))).not.toContain('hunter');
		expect(unlocked(base({ kills: mobs.length }))).toContain('hunter');
		expect(unlocked(base({ flags: ['music_val'] }))).not.toContain('sound');
		expect(unlocked(base({ flags: ['music_val', 'music_nexus'] }))).toContain('sound');
	});

	it('« Grand voyageur » needs every place except the return portal', () => {
		const all = LANDMARKS.map((l) => l.id).filter((id) => id !== 'portal-back');
		expect(unlocked(base({ visited: all }))).toContain('traveler');
		expect(unlocked(base({ visited: all.slice(1) }))).not.toContain('traveler');
	});
});

function quest(id: string) {
	return QUESTS.find((q) => q.id === id)!;
}
