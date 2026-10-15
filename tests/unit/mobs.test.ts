import { describe, expect, it } from 'vitest';

import { mobs, nearestMob } from '@/lib/mobs';
import { HOUSES, LAKE, LANDMARKS, NEXUS_SPAWN, SPAWN, nexusWalkable } from '@/lib/world';
import { walk } from './walker';

/** Where a val bug can stand: dry land, out of houses and solid landmarks, inside the playable radius (Player.tsx). */
function valWalkable(x: number, z: number) {
	if (Math.hypot(x - LAKE.x, z - LAKE.z) < LAKE.r + 2) return false;
	if (HOUSES.some((h) => Math.hypot(x - h.x, z - h.z) < h.c)) return false;
	if (LANDMARKS.some((l) => l.zone === 'val' && l.solid > 0 && Math.hypot(x - l.x, z - l.z) < l.solid)) return false;
	return Math.hypot(x, z + 20) <= 92;
}

describe('mobs', () => {
	it('have unique names, a problem and a lesson', () => {
		expect(new Set(mobs.map((m) => m.name)).size).toBe(mobs.length);
		for (const m of mobs) {
			expect(m.problem.trim(), `${m.name} has no PROBLEMS entry`).not.toBe('');
			expect(m.lesson.trim(), m.name).not.toBe('');
		}
	});

	it('each hunt quest zone has enough bugs', () => {
		expect(mobs.filter((m) => m.zone === 'val').length).toBeGreaterThanOrEqual(3);
		expect(mobs.filter((m) => m.zone === 'nexus').length).toBeGreaterThanOrEqual(3);
	});

	it.each(mobs.map((m) => [m.name, m] as const))('%s lives on walkable ground of its zone', (_, m) => {
		if (m.zone === 'nexus') {
			expect(m.homeZ).toBeLessThan(-300);
			expect(nexusWalkable(m.homeX, m.homeZ)).toBe(true);
		} else {
			expect(m.homeZ).toBeGreaterThan(-300);
			expect(valWalkable(m.homeX, m.homeZ)).toBe(true);
		}
	});

	it.each(mobs.map((m) => [m.name, m] as const))('%s can be reached from the zone spawn', (_, m) => {
		// melee range of the knight (Player.tsx) plus the bug's own collision radius
		const r = walk(m.zone === 'nexus' ? NEXUS_SPAWN : SPAWN, { x: m.homeX, z: m.homeZ }, 2.6 + 0.75);
		expect(r.reached, `stuck near ${JSON.stringify(r.path.at(-1))}`).toBe(true);
		if (m.zone === 'nexus') expect(r.offStreet).toEqual([]);
	});

	it('nearestMob finds the closest living bug within range', () => {
		const m = mobs[0];
		expect(nearestMob(m.homeX, m.homeZ, 1)?.id).toBe(m.id);
		expect(nearestMob(1000, 1000, 5)).toBeNull();
		const prev = m.state;
		m.state = 'dead';
		expect(nearestMob(m.homeX, m.homeZ, 0.5)).toBeNull();
		m.state = prev;
	});
});
