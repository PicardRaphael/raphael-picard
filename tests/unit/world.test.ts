import { describe, expect, it } from 'vitest';

import { HOUSES, LAKE, LANDMARKS, type Landmark, NEXUS_SPAWN, NEXUS_Z, SPAWN, groundAt, landmark, nexusWalkable, nexusWaypoint, pathDistance, valHeight, valWaypoint } from '@/lib/world';
import { type Point, clickTarget, underwater, walk } from './walker';

const val = LANDMARKS.filter((l) => l.zone === 'val');
const nexus = LANDMARKS.filter((l) => l.zone === 'nexus');
const lakeDist = (p: { x: number; z: number }) => Math.hypot(p.x - LAKE.x, p.z - LAKE.z);

describe('landmarks', () => {
	it('have unique ids and sane radii', () => {
		expect(new Set(LANDMARKS.map((l) => l.id)).size).toBe(LANDMARKS.length);
		for (const l of LANDMARKS) {
			expect(l.radius, l.id).toBeGreaterThan(l.solid);
			expect(l.name.trim(), l.id).not.toBe('');
			expect(l.hint.trim(), l.id).not.toBe('');
		}
	});

	it('val landmarks are dry land, Nexus landmarks stand in the streets', () => {
		for (const l of val) expect(lakeDist(l), l.id).toBeGreaterThan(LAKE.r + 4);
		for (const l of nexus) {
			expect(l.z, l.id).toBeLessThan(-300);
			expect(nexusWalkable(l.x, l.z), l.id).toBe(true);
		}
	});

	it('landmark() throws on unknown ids', () => {
		expect(landmark('raphy').zone).toBe('val');
		expect(() => landmark('nope')).toThrow();
	});
});

describe('valHeight / groundAt', () => {
	it('is finite on the whole valley grid', () => {
		for (let x = -130; x <= 130; x += 2.5)
			for (let z = -150; z <= 110; z += 2.5) {
				const h = valHeight(x, z);
				expect(Number.isFinite(h), `${x},${z}`).toBe(true);
			}
	});

	it('is deterministic and flattened around landmarks and on the roads', () => {
		expect(valHeight(12.3, -45.6)).toBe(valHeight(12.3, -45.6));
		for (const l of val.filter((x) => x.id !== 'portal')) expect(Math.abs(valHeight(l.x, l.z) - 0.4), l.id).toBeLessThan(1);
		expect(pathDistance(0, 0)).toBeLessThan(0.01);
		expect(valHeight(SPAWN.x, SPAWN.z)).toBeLessThan(2);
	});

	it('digs the lake below water level', () => {
		expect(valHeight(LAKE.x, LAKE.z)).toBeLessThan(LAKE.level);
	});

	it('the Nexus is flat', () => {
		expect(groundAt(10, NEXUS_Z - 50)).toBe(0);
		expect(groundAt(0, 0)).toBe(valHeight(0, 0));
	});
});

describe('nexusWalkable', () => {
	it('accepts the avenue and the side streets, rejects the city blocks', () => {
		expect(nexusWalkable(0, NEXUS_Z - 60)).toBe(true);
		expect(nexusWalkable(13, NEXUS_Z - 60)).toBe(true);
		expect(nexusWalkable(30, NEXUS_Z - 60)).toBe(false);
		expect(nexusWalkable(-40, NEXUS_Z - 85)).toBe(true);
		expect(nexusWalkable(40, NEXUS_Z - 85)).toBe(false);
		expect(nexusWalkable(0, NEXUS_Z + 40)).toBe(false);
	});
});

describe('waypoints', () => {
	it('valWaypoint goes straight when the lake is not in the way', () => {
		expect(valWaypoint(0, 10, 0, -12)).toEqual({ x: 0, z: -12 });
	});

	it('valWaypoint detours around the lake when the segment crosses it', () => {
		const w = valWaypoint(-70, 22, 0, 22);
		expect(w).not.toEqual({ x: 0, z: 22 });
		expect(lakeDist(w)).toBeGreaterThan(LAKE.r + 4);
	});

	it('nexusWaypoint goes straight along the avenue and leaves a side street through the avenue', () => {
		expect(nexusWaypoint(0, NEXUS_Z - 10, 0, NEXUS_Z - 100)).toEqual({ x: 0, z: NEXUS_Z - 100 });
		const w = nexusWaypoint(-40, NEXUS_Z - 85, 32, NEXUS_Z - 34);
		expect(Math.abs(w.x)).toBeLessThanOrEqual(14);
	});
});


/** Start next to `a`, on the side of `b`, slightly off the exact axis (a real hero is never perfectly aligned). */
function besides(a: Landmark, b: Point) {
	const d = Math.hypot(b.x - a.x, b.z - a.z) || 1;
	const k = a.solid + 2.5;
	return { x: a.x + ((b.x - a.x) / d) * k + 0.3, z: a.z + ((b.z - a.z) / d) * k };
}
const HOUSE_LANDMARKS = val.filter((l) => HOUSES.some((h) => h.x === l.x && h.z === l.z)).map((l) => l.id);

describe('click-to-move: every landmark is reachable (interaction range)', () => {
	it.each(val.filter((l) => l.id !== 'portal').map((l) => [l.id, l] as const))('val: spawn → %s, never in the water', (_, l) => {
		const r = walk(SPAWN, l, l.radius);
		expect(r.reached, `stuck near ${JSON.stringify(r.path.at(-1))}`).toBe(true);
		expect(r.wet).toEqual([]);
	});

	it('val: spawn → portal once the hero stands a little off the spawn axis', () => {
		const r = walk({ x: SPAWN.x + 0.5, z: SPAWN.z }, landmark('portal'), landmark('portal').radius);
		expect(r.reached, `stuck near ${JSON.stringify(r.path.at(-1))}`).toBe(true);
	});

	// Regression: the push out of a solid used to be purely radial, so a hero walking EXACTLY at its centre (spawn → portal
	// along x = 0 through Raphy, or the kiosks aligned on x = -10 in the Nexus) ran in place; Player.tsx now slides along the tangent.
	it('val: spawn → portal straight from the spawn (dead-centre on Raphy)', () => {
		const portal = landmark('portal');
		expect(walk(SPAWN, clickTarget(SPAWN, portal), 0.6).reached).toBe(true);
	});

	it('nexus: NeoAgent kiosk → Raphy·OS along x = -10 (dead-centre on the NeoChat kiosk)', () => {
		const from = { x: landmark('neoagent').x, z: landmark('neoagent').z + 3 };
		expect(walk(from, landmark('holo'), landmark('holo').radius).reached).toBe(true);
	});

	it.each(nexus.map((l) => [l.id, l] as const))('nexus: spawn → %s, always in the streets', (_, l) => {
		const r = walk(NEXUS_SPAWN, l, l.radius);
		expect(r.reached, `stuck near ${JSON.stringify(r.path.at(-1))}`).toBe(true);
		expect(r.offStreet, 'steps through a building').toEqual([]);
	});

	it('val: every landmark to every other one, never in the water', () => {
		const failures: string[] = [];
		for (const a of val)
			for (const b of val) {
				if (a === b) continue;
				const r = walk(besides(a, b), b, b.radius);
				if (!r.reached) failures.push(`${a.id} → ${b.id} stuck at ${JSON.stringify(r.path.at(-1))}`);
				else if (r.wet.length) failures.push(`${a.id} → ${b.id} through the lake`);
			}
		expect(failures).toEqual([]);
	});

	it('nexus: every landmark to every other one, never through a building', () => {
		const failures: string[] = [];
		for (const a of nexus)
			for (const b of nexus) {
				if (a === b) continue;
				const r = walk(besides(a, b), b, b.radius);
				if (!r.reached) failures.push(`${a.id} → ${b.id} stuck at ${JSON.stringify(r.path.at(-1))}`);
				else if (r.offStreet.length) failures.push(`${a.id} → ${b.id} off street at ${JSON.stringify(r.offStreet[0])}`);
			}
		expect(failures).toEqual([]);
	});
});

describe('click-to-move: clicking a landmark walks to its stop point and opens it', () => {
	it.each(val.filter((l) => l.id !== 'portal').map((l) => [l.id, l] as const))('val: spawn → %s', (_, l) => {
		// Player.tsx opens the panel when the hero gets within 0.6 of the stop point
		const r = walk(SPAWN, clickTarget(SPAWN, l), 0.6);
		expect(r.reached, `stuck near ${JSON.stringify(r.path.at(-1))}`).toBe(true);
	});

	it('the career houses are landmarks standing on a house collider', () => {
		expect([...HOUSE_LANDMARKS].sort()).toEqual(['leasys', 'royal', 'schoolmouv']);
	});

	// regression: the stop point (Player.tsx: max(l.solid + 2.2, 3) from the landmark) used to lie inside the house
	// collider of the career houses (solid 0 on a HOUSES entry of radius 5–5.5): the hero ran into the wall forever
	it.each(LANDMARKS.map((l) => [l.id, l] as const))('%s: the stop point is out of every collider', (_, l) => {
		const stop = Math.max(l.solid + 2.2, 3);
		const blockers = [...HOUSES.map((h) => ({ x: h.x, z: h.z, r: h.c })), ...LANDMARKS.filter((o) => o.solid > 0).map((o) => ({ x: o.x, z: o.z, r: o.solid }))];
		// sample the ring of possible stop points around the landmark: most of it must be free
		let free = 0;
		for (let k = 0; k < 36; k++) {
			const x = l.x + Math.cos((k * Math.PI) / 18) * stop;
			const z = l.z + Math.sin((k * Math.PI) / 18) * stop;
			if (blockers.every((o) => Math.hypot(x - o.x, z - o.z) >= o.r + 0.8)) free++;
		}
		expect(free, 'free stop points around the landmark').toBeGreaterThan(18);
	});
});

describe('the lake', () => {
	const CASES: [Point, Point][] = [
		[{ x: -70, z: 22 }, { x: 0, z: 22 }],
		[{ x: -36, z: 50 }, SPAWN],
		[{ x: -60, z: 30 }, { x: -10, z: 15 }],
		[{ x: -36, z: -5 }, { x: -36, z: 50 }],
		[{ x: -10, z: 22 }, { x: -64, z: 22 }],
	];

	it.each(CASES)('routes never cut through the middle of the lake: %o → %o', (from, to) => {
		for (const shore of [true, false]) {
			const r = walk(from, to, 1.5, { shore });
			expect(Math.min(...r.path.map(lakeDist))).toBeGreaterThan(LAKE.r - 2);
		}
	});

	it('the val landmarks and houses are dry', () => {
		for (const l of val) expect(underwater(l), l.id).toBe(false);
		for (const h of HOUSES) expect(lakeDist(h)).toBeGreaterThan(LAKE.r + h.c);
	});

	// Regression: on the south side the ground used to stay under the water plane far past the lake collision, so routes
	// round the lake walked under the water or got stuck at the shore guard. valHeight now keeps a dry shore up to the edge
	// of the water disc (r + 9) and the lake is a solid (r + 1.8) in Player.tsx.
	it('going round the lake never walks under the water (with the game shore guard)', () => {
		const failures = CASES.map(([from, to]) => ({ from, to, r: walk(from, to, 1.5) }))
			.filter(({ r }) => !r.reached || r.wet.length)
			.map(({ from, to, r }) => `${JSON.stringify(from)} → ${JSON.stringify(to)}: ${r.reached ? `${r.wet.length} steps under water` : 'stuck'}`);
		expect(failures).toEqual([]);
	});

	it('the raw valWaypoint detour stays out of the water', () => {
		const wet = CASES.filter(([from, to]) => walk(from, to, 1.5, { shore: false }).wet.length);
		expect(wet).toEqual([]);
	});
});
