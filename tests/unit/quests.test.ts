import { describe, expect, it } from 'vitest';

import { QUESTS, type QuestStatus, initialQuests, markerFor, objectiveDone, quest } from '@/lib/quests';
import { LANDMARKS } from '@/lib/world';

const landmarkIds = new Set(LANDMARKS.map((l) => l.id));
const questIds = new Set(QUESTS.map((q) => q.id));

describe('quest data', () => {
	it('has unique quest ids', () => {
		expect(questIds.size).toBe(QUESTS.length);
	});

	it.each(QUESTS.map((q) => [q.id, q] as const))('%s: giver, turn-in and place objectives are real landmarks', (_, q) => {
		expect(landmarkIds, `giver ${q.giver}`).toContain(q.giver);
		expect(landmarkIds, `turnIn ${q.turnIn}`).toContain(q.turnIn);
		for (const o of q.objectives) {
			if (o.kills) continue;
			expect(landmarkIds, `objective ${o.id}`).toContain(o.id);
		}
	});

	it.each(QUESTS.map((q) => [q.id, q] as const))('%s: next / requires point to existing quests', (_, q) => {
		if (q.next) expect(questIds).toContain(q.next);
		if (q.requires) expect(questIds).toContain(q.requires);
		expect(q.next).not.toBe(q.id);
		expect(q.requires).not.toBe(q.id);
	});

	it('every quest has at least one objective, unique objective ids and non-empty texts', () => {
		for (const q of QUESTS) {
			expect(q.objectives.length, q.id).toBeGreaterThan(0);
			expect(new Set(q.objectives.map((o) => o.id)).size, q.id).toBe(q.objectives.length);
			for (const s of [q.title, q.intro, q.outro, q.reward.title, q.reward.text, ...q.objectives.map((o) => o.label)]) expect(s.trim(), q.id).not.toBe('');
		}
	});

	it('kill objectives target a known zone with a positive count', () => {
		for (const q of QUESTS)
			for (const o of q.objectives)
				if (o.kills) {
					expect(['val', 'nexus']).toContain(o.kills.zone);
					expect(o.kills.n).toBeGreaterThan(0);
				}
	});

	it('the story chain (next) has no cycle and every quest is reachable', () => {
		for (const start of QUESTS) {
			const seen = new Set<string>();
			let cur: string | undefined = start.id;
			while (cur) {
				expect(seen.has(cur), `cycle through ${cur}`).toBe(false);
				seen.add(cur);
				cur = quest(cur)?.next;
			}
		}
		// reachable: available from the start, or unlocked by completing a reachable quest
		const status = initialQuests();
		const reachable = new Set(QUESTS.filter((q) => status[q.id] === 'available').map((q) => q.id));
		let grew = true;
		while (grew) {
			grew = false;
			for (const q of QUESTS) {
				if (reachable.has(q.id)) continue;
				if (QUESTS.some((o) => o.next === q.id && reachable.has(o.id)) || (q.requires && reachable.has(q.requires))) {
					reachable.add(q.id);
					grew = true;
				}
			}
		}
		expect([...reachable].sort()).toEqual([...questIds].sort());
	});

	it('quest() finds by id and returns undefined otherwise', () => {
		expect(quest('origines')?.title).toBe(QUESTS.find((q) => q.id === 'origines')?.title);
		expect(quest('nope')).toBeUndefined();
	});
});

describe('initialQuests', () => {
	it('locks story quests behind `next` and side quests behind `requires`; everything else is available', () => {
		const s = initialQuests();
		expect(Object.keys(s).sort()).toEqual([...questIds].sort());
		for (const q of QUESTS) {
			const lockedByStory = QUESTS.some((o) => o.next === q.id);
			const expected: QuestStatus = lockedByStory || q.requires ? 'locked' : 'available';
			expect(s[q.id], q.id).toBe(expected);
		}
		// pin the current design
		expect(s.origines).toBe('available');
		expect(s.parcours).toBe('available');
		expect(s.chasse).toBe('available');
		expect(s.portail).toBe('locked');
		expect(s.production).toBe('locked');
		expect(s.agents).toBe('locked');
		expect(s.purge).toBe('locked');
	});

	it('returns a fresh object each time', () => {
		const a = initialQuests();
		a.origines = 'done';
		expect(initialQuests().origines).toBe('available');
	});
});

describe('objectiveDone', () => {
	const origines = quest('origines')!;
	const chasse = quest('chasse')!;

	it('place objectives are done once visited', () => {
		const forge = origines.objectives.find((o) => o.id === 'forge')!;
		expect(objectiveDone(origines, forge, [], {})).toBe(false);
		expect(objectiveDone(origines, forge, ['tower'], {})).toBe(false);
		expect(objectiveDone(origines, forge, ['forge'], {})).toBe(true);
	});

	it('kill objectives count the progress of the quest, not visits', () => {
		const o = chasse.objectives[0];
		const n = o.kills!.n;
		expect(objectiveDone(chasse, o, [o.id], {})).toBe(false);
		expect(objectiveDone(chasse, o, [], { [chasse.id]: n - 1 })).toBe(false);
		expect(objectiveDone(chasse, o, [], { [chasse.id]: n })).toBe(true);
		expect(objectiveDone(chasse, o, [], { [chasse.id]: n + 5 })).toBe(true);
		// another quest's progress does not count
		expect(objectiveDone(chasse, o, [], { purge: 99 })).toBe(false);
	});
});

describe('markerFor', () => {
	it('shows "!" on givers of available quests at the start', () => {
		const s = initialQuests();
		for (const q of QUESTS.filter((x) => s[x.id] === 'available')) expect(markerFor(q.giver, s, []), q.giver).toBe('!');
		expect(markerFor('tower', s, [])).toBeNull();
		expect(markerFor('holo', s, [])).toBeNull();
	});

	it('marks objectives of an active quest until visited, and the turn-in NPC in grey', () => {
		const s = { ...initialQuests(), origines: 'active' as QuestStatus, parcours: 'done' as QuestStatus };
		expect(markerFor('tower', s, [])).toBe('objective');
		expect(markerFor('tower', s, ['tower'])).toBeNull();
		expect(markerFor('raphy', s, [])).toBe('?grey');
		// "!" wins over "objective": the forge hands out the bug hunt and is also an objective of origines
		expect(markerFor('forge', s, [])).toBe('!');
		expect(markerFor('forge', { ...s, chasse: 'done' }, [])).toBe('objective');
	});

	it('shows a gold "?" on the turn-in NPC of a ready quest', () => {
		const s = { ...initialQuests(), origines: 'ready' as QuestStatus, parcours: 'done' as QuestStatus };
		expect(markerFor('raphy', s, [])).toBe('?');
	});

	it('kill objectives use the progress argument', () => {
		const s = { ...initialQuests(), chasse: 'active' as QuestStatus };
		expect(markerFor('bugs-val', s, [], { chasse: 0 })).toBe('objective');
		expect(markerFor('bugs-val', s, [], { chasse: 3 })).toBeNull();
		// forge is giver and turn-in of the active hunt: grey "?"
		expect(markerFor('forge', s, [], { chasse: 0 })).toBe('?grey');
	});

	it('returns null for done quests and unknown places', () => {
		const s = Object.fromEntries(QUESTS.map((q) => [q.id, 'done' as QuestStatus]));
		for (const l of LANDMARKS) expect(markerFor(l.id, s, []), l.id).toBeNull();
		expect(markerFor('nowhere', initialQuests(), [])).toBeNull();
	});
});
