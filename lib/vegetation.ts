import { noise2 } from './noise';
import { HOUSES, LAKE, LANDMARKS, pathDistance, valHeight } from './world';

/** Deterministic PRNG (same as the 3D shapes) so trees are always at the same place. */
function mulberry32(seed: number) {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/** Where the vegetation grows: shared by the renderer and the collisions. */
type Kind = { names: string[]; height: [number, number]; shadow: boolean };

export const KINDS = {
	oak: { names: ['CommonTree_1', 'CommonTree_2', 'CommonTree_4'], height: [9, 14], shadow: true },
	twisted: { names: ['TwistedTree_1', 'TwistedTree_3'], height: [8, 12], shadow: true },
	pine: { names: ['Pine_1', 'Pine_3'], height: [12, 18], shadow: true },
	rock: { names: ['Rock_Medium_1', 'Rock_Medium_2', 'Rock_Medium_3'], height: [1.2, 3.8], shadow: true },
	bush: { names: ['Bush_Common_Flowers', 'Bush_Common'], height: [1.2, 2.2], shadow: false },
	grass: { names: ['Grass_Common_Tall', 'Grass_Wispy_Tall', 'Fern_1'], height: [0.7, 1.3], shadow: false },
	flower: { names: ['Flower_3_Group', 'Flower_4_Group', 'Mushroom_Laetiporus'], height: [0.5, 0.9], shadow: false },
} satisfies Record<string, Kind>;

type KindName = keyof typeof KINDS;
export type Placement = { x: number; y: number; z: number; rot: number; h: number; variant: number };

function clearOf(x: number, z: number, margin: number) {
	if (Math.hypot(x, z + 20) > 104) return false;
	if (Math.hypot(x - LAKE.x, z - LAKE.z) < LAKE.r + 2 + margin) return false;
	if (pathDistance(x, z) < 2.5 + margin) return false;
	if (Math.hypot(x, z - 10) < 6 + margin * 2) return false;
	for (const l of LANDMARKS) if (l.zone === 'val' && Math.hypot(x - l.x, z - l.z) < l.radius + margin) return false;
	for (const h of HOUSES) if (Math.hypot(x - h.x, z - h.z) < h.c + 1.5 + margin) return false;
	return true;
}

function scatter(): Record<KindName, Placement[]> {
	const rng = mulberry32(77);
	const out = { oak: [], twisted: [], pine: [], rock: [], bush: [], grass: [], flower: [] } as Record<KindName, Placement[]>;
	const place = (kind: KindName, x: number, z: number) => {
		const [a, b] = KINDS[kind].height;
		out[kind].push({ x, z, y: valHeight(x, z), rot: rng() * Math.PI * 2, h: a + rng() * (b - a), variant: Math.floor(rng() * KINDS[kind].names.length) });
	};
	for (let i = 0; i < 6000 && out.oak.length + out.pine.length + out.twisted.length < 420; i++) {
		const x = (rng() - 0.5) * 220;
		const z = (rng() - 0.5) * 220 - 20;
		if (!clearOf(x, z, 6)) continue;
		const forest = noise2(x * 0.025, z * 0.025);
		if (forest < 0 && rng() > 0.12) continue;
		const y = valHeight(x, z);
		if (y > 20) continue;
		if (y > 8 || rng() < 0.25) place('pine', x, z);
		else if (rng() < 0.18) place('twisted', x, z);
		else place('oak', x, z);
	}
	for (let i = 0; i < 400; i++) {
		const x = (rng() - 0.5) * 230;
		const z = (rng() - 0.5) * 230 - 20;
		if (clearOf(x, z, 1)) place('rock', x, z);
	}
	for (let i = 0; i < 500; i++) {
		const x = (rng() - 0.5) * 200;
		const z = (rng() - 0.5) * 200 - 20;
		if (clearOf(x, z, 2)) place('bush', x, z);
	}
	for (let i = 0; i < 5000; i++) {
		const x = (rng() - 0.5) * 200;
		const z = (rng() - 0.5) * 200 - 20;
		if (!clearOf(x, z, 0)) continue;
		if (valHeight(x, z) > 12) continue;
		place(rng() < 0.75 ? 'grass' : 'flower', x, z);
	}
	return out;
}

let cache: Record<KindName, Placement[]> | null = null;
export function placements() {
	cache ??= scatter();
	return cache;
}

/** Solid vegetation as circles (trunks and rocks) for the player's collisions. */
export function vegetationObstacles() {
	const p = placements();
	return [
		...[...p.oak, ...p.pine, ...p.twisted].map((t) => ({ x: t.x, z: t.z, r: 0.7 })),
		...p.rock.map((r) => ({ x: r.x, z: r.z, r: r.h * 0.45 })),
	];
}

/** Tree crowns as circles: the camera stays out of them. */
export function canopies() {
	const p = placements();
	return [...p.oak, ...p.pine, ...p.twisted].map((t) => ({ x: t.x, z: t.z, r: 2.6 + t.h * 0.12, top: t.y + t.h }));
}
