import { vegetationObstacles } from '@/lib/vegetation';
import { HOUSES, LAKE, LANDMARKS, NEXUS_CENTER, NEXUS_RADIUS, groundAt, nexusWalkable, nexusWaypoint, valWaypoint } from '@/lib/world';

/**
 * Headless click-to-move walker: steps toward the waypoints of lib/world.ts like the hero does
 * (components/three/world/Player.tsx), with the same radial push around solid obstacles and the same
 * playable radius. In the Nexus it does NOT slide along the facades, so a route through a building is
 * caught (`offStreet`). In the val, `shore: true` adds the game's lake guard (slide along the shore,
 * give up when cornered); without it, the raw waypoint route is followed and `wet` lists every step
 * under the water line.
 */
export type Point = { x: number; z: number };
export type Walk = { reached: boolean; steps: number; path: Point[]; offStreet: Point[]; wet: Point[] };

const STATIC = [
	...LANDMARKS.filter((l) => l.solid > 0).map((l) => ({ x: l.x, z: l.z, r: l.solid })),
	...HOUSES.map((h) => ({ x: h.x, z: h.z, r: h.c })),
	// the lake, a solid in Player.tsx too
	{ x: LAKE.x, z: LAKE.z, r: LAKE.r + 1.8 },
];
let solids: { x: number; z: number; r: number }[] | null = null;
const obstacles = () => (solids ??= [...STATIC, ...vegetationObstacles()]);

const lakeD = (x: number, z: number) => Math.hypot(x - LAKE.x, z - LAKE.z);
/** Under the water plane: inside the water disc (Valley.tsx draws it with radius LAKE.r + 9) and below LAKE.level. */
export const underwater = (p: Point) => lakeD(p.x, p.z) < LAKE.r + 9 && groundAt(p.x, p.z) < LAKE.level;

export function walk(from: Point, to: Point, arriveWithin: number, { step = 0.5, maxSteps = 4000, shore = true } = {}): Walk {
	let x = from.x;
	let z = from.z;
	const path = [{ x, z }];
	const offStreet: Point[] = [];
	const wet: Point[] = [];
	const nexus = from.z < -300;
	const done = (reached: boolean, steps: number): Walk => ({ reached, steps, path, offStreet, wet });
	for (let i = 0; i < maxSteps; i++) {
		if (Math.hypot(to.x - x, to.z - z) <= arriveWithin) return done(true, i);
		const w = nexus ? nexusWaypoint(x, z, to.x, to.z) : valWaypoint(x, z, to.x, to.z);
		const wd = Math.hypot(w.x - x, w.z - z) || 1;
		const dirX = (w.x - x) / wd;
		const dirZ = (w.z - z) / wd;
		let nx = x + dirX * step;
		let nz = z + dirZ * step;
		for (const o of obstacles()) {
			const dx = nx - o.x;
			const dz = nz - o.z;
			const d = Math.hypot(dx, dz);
			const min = o.r + 0.8;
			if (d < min) {
				const ux = d > 1e-3 ? dx / d : 1;
				const uz = d > 1e-3 ? dz / d : 0;
				// same tangential slide as Player.tsx when walking head-on into an obstacle
				const into = -(dirX * ux + dirZ * uz);
				if (into > 0.2) {
					const side = dirX * -uz + dirZ * ux >= 0 ? 1 : -1;
					const a = (side * step * into) / min;
					nx = o.x + (ux * Math.cos(a) - uz * Math.sin(a)) * min;
					nz = o.z + (uz * Math.cos(a) + ux * Math.sin(a)) * min;
				} else {
					nx = o.x + ux * min;
					nz = o.z + uz * min;
				}
			}
		}
		const cx = nexus ? NEXUS_CENTER.x : 0;
		const cz = nexus ? NEXUS_CENTER.z : -20;
		const R = nexus ? NEXUS_RADIUS : 92;
		const rd = Math.hypot(nx - cx, nz - cz);
		if (rd > R) {
			nx = cx + ((nx - cx) / rd) * R;
			nz = cz + ((nz - cz) / rd) * R;
		}
		if (nexus && !nexusWalkable(nx, nz)) offStreet.push({ x: nx, z: nz });
		if (!nexus && shore) {
			// same guard as Player.tsx: no step deeper into the wet rim, slide on one axis, else give up
			const blocked = (px: number, pz: number) => lakeD(px, pz) < LAKE.r + 2 && groundAt(px, pz) < -1.6 && lakeD(px, pz) <= lakeD(x, z);
			if (blocked(nx, nz)) {
				if (!blocked(nx, z)) nz = z;
				else if (!blocked(x, nz)) nx = x;
				else return done(false, i);
			}
		}
		x = nx;
		z = nz;
		path.push({ x, z });
		if (!nexus && underwater({ x, z })) wet.push({ x, z });
	}
	return done(false, maxSteps);
}

/** Where Player.tsx sends the hero when a landmark is clicked: in front of it, on the visitor's side. */
export function clickTarget(from: Point, l: { x: number; z: number; solid: number }) {
	const dx = from.x - l.x;
	const dz = from.z - l.z;
	const d = Math.hypot(dx, dz) || 1;
	const stop = Math.max(l.solid + 2.2, 3);
	return { x: l.x + (dx / d) * stop, z: l.z + (dz / d) * stop };
}
