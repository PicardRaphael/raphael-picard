import { fbm, noise2 } from './noise';

/**
 * Map of the explorable world. Two zones on the same ground plane:
 * the fantasy valley around the origin, and the Nexus far to the north,
 * reached only through the portal (teleport).
 */

export type Zone = 'val' | 'nexus';

export type Landmark = {
	id: string;
	name: string;
	/** One line shown in the prompt when the player is in range. */
	hint: string;
	zone: Zone;
	x: number;
	z: number;
	/** Interaction radius. */
	radius: number;
	/** Collision radius (0 = drive-through). */
	solid: number;
};

export const NEXUS_Z = -600;

export const SPAWN = { x: 0, z: 10, yaw: 0 };
export const NEXUS_SPAWN = { x: 0, z: NEXUS_Z - 8, yaw: 0 };

export const LANDMARKS: Landmark[] = [
	// — Val des Origines (fantasy) —
	{ id: 'raphy', name: 'Raphy, gardien du val', hint: 'Parler à Raphy', zone: 'val', x: 0, z: -12, radius: 7, solid: 1.6 },
	{ id: 'forge', name: 'La Forge du Code', hint: 'Examiner la forge', zone: 'val', x: -38, z: -48, radius: 10, solid: 5 },
	{ id: 'tower', name: 'La Tour du Savoir', hint: 'Entrer dans la tour', zone: 'val', x: 40, z: -42, radius: 9, solid: 4.2 },
	{ id: 'stones', name: 'Le Cercle du Manifeste', hint: 'Lire les pierres', zone: 'val', x: 28, z: 20, radius: 9, solid: 0 },
	{ id: 'portal', name: 'Le Portail arcanique', hint: 'Traverser le portail', zone: 'val', x: 0, z: -92, radius: 7, solid: 0 },
	// — Le Nexus (futuristic) —
	{ id: 'portal-back', name: 'Portail de retour', hint: 'Retourner au val', zone: 'nexus', x: 0, z: NEXUS_Z + 14, radius: 6, solid: 0 },
	{ id: 'holo', name: 'Raphy·OS', hint: 'Parler à Raphy·OS', zone: 'nexus', x: -10, z: NEXUS_Z - 22, radius: 7, solid: 1.4 },
	{ id: 'agents', name: 'Constellation des Agents', hint: 'Analyser la constellation', zone: 'nexus', x: -32, z: NEXUS_Z - 86, radius: 10, solid: 2.5 },
	{ id: 'core', name: "Noyau d'orchestration", hint: 'Inspecter le noyau', zone: 'nexus', x: 32, z: NEXUS_Z - 34, radius: 10, solid: 2.5 },
	{ id: 'gallery', name: 'Galerie des Projets', hint: 'Parcourir la galerie', zone: 'nexus', x: 34, z: NEXUS_Z - 118, radius: 10, solid: 0 },
	{ id: 'beacon', name: 'Balise de contact', hint: 'Activer la balise', zone: 'nexus', x: 0, z: NEXUS_Z - 125, radius: 12, solid: 4 },
	{ id: 'race', name: 'Ligne de départ', hint: 'Lancer la course', zone: 'nexus', x: -30, z: NEXUS_Z - 1, radius: 7, solid: 0 },
];

export const LAKE = { x: -36, z: 22, r: 15, level: -1.4 };

/**
 * Village buildings, all from one hand-painted pack ("Village_Personal Assets" by jakekieferwaddington, CC BY 4.0)
 * so the valley reads as one place: model, position, rotation, scale, collision radius.
 */
export const HOUSES = [
	{ type: 'house_a', x: -16, z: -30, r: 0.3, s: 1, c: 5.5 },
	{ type: 'house_c', x: -27, z: -18, r: -0.6, s: 1, c: 5 },
	{ type: 'house_c', x: -12, z: -47, r: 0.9, s: 1, c: 5 },
	{ type: 'house_a', x: 15, z: -27, r: -0.3, s: 1, c: 5.5 },
	{ type: 'house_a', x: 17, z: -12, r: 2.6, s: 1, c: 5.5 },
	{ type: 'house_c', x: -19, z: -4, r: 1.4, s: 1, c: 5 },
	{ type: 'house_c', x: 24, z: -52, r: -1.1, s: 1, c: 5 },
	{ type: 'house_a', x: -36, z: -2, r: 1.9, s: 1, c: 5.5 },
];

/** Dirt roads, as polylines. */
export const PATHS: [number, number][][] = [
	[
		[0, 14],
		[0, -12],
		[-2, -40],
		[2, -70],
		[0, -92],
	],
	[
		[0, -20],
		[-20, -36],
		[-38, -48],
	],
	[
		[0, -24],
		[22, -34],
		[40, -42],
	],
	[
		[0, 2],
		[16, 10],
		[28, 20],
	],
	[
		[-2, -2],
		[-20, 8],
		[-30, 10],
	],
];

export const VAL_RADIUS = 112;
export const NEXUS_RADIUS = 150;
export const NEXUS_CENTER = { x: 0, z: NEXUS_Z - 60 };

function segDist(px: number, pz: number, ax: number, az: number, bx: number, bz: number) {
	const dx = bx - ax;
	const dz = bz - az;
	const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz)));
	const x = ax + dx * t - px;
	const z = az + dz * t - pz;
	return Math.sqrt(x * x + z * z);
}

export function pathDistance(x: number, z: number) {
	let d = Infinity;
	for (const line of PATHS) for (let i = 0; i < line.length - 1; i++) d = Math.min(d, segDist(x, z, line[i][0], line[i][1], line[i + 1][0], line[i + 1][1]));
	return d;
}

const smooth = (e0: number, e1: number, x: number) => {
	const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
	return t * t * (3 - 2 * t);
};

/** Ground height of the fantasy valley. Used by the terrain mesh AND the vehicle, so they always agree. */
export function valHeight(x: number, z: number) {
	let h = fbm(x * 0.011, z * 0.011, 4) * 7 + noise2(x * 0.05, z * 0.05) * 0.6;
	// flatten the places people stand on
	for (const l of LANDMARKS) {
		if (l.zone !== 'val') continue;
		const d = Math.hypot(x - l.x, z - l.z);
		const f = smooth(l.radius + 12, l.radius + 2, d);
		h = h * (1 - f) + 0.4 * f;
	}
	for (const hs of HOUSES) {
		const f = smooth(hs.c + 6, hs.c + 1, Math.hypot(x - hs.x, z - hs.z));
		h = h * (1 - f) + 0.4 * f;
	}
	// roads sit slightly lower and smoother
	const p = pathDistance(x, z);
	const pf = smooth(6, 1.5, p);
	h = h * (1 - pf * 0.85) + 0.2 * pf * 0.85;
	// the lake bowl
	const ld = Math.hypot(x - LAKE.x, z - LAKE.z);
	h -= smooth(LAKE.r + 6, LAKE.r - 6, ld) * 4.2;
	// portal hill
	h += smooth(26, 6, Math.hypot(x - 0, z + 96)) * 2.2;
	// mountains enclose the valley
	const r = Math.hypot(x, z + 20);
	// broad massifs rather than needles: a rising shoulder, ridges, and a few higher summits
	if (r > 92) {
		const t = r - 92;
		const ridge = 1 - Math.abs(fbm(x * 0.018, z * 0.018, 3));
		h += Math.pow(t * 0.3, 1.35) * (0.55 + ridge * 0.55) + Math.max(0, fbm(x * 0.008 + 7, z * 0.008, 2)) * t * 0.35;
	}
	return h;
}

export function landmark(id: string) {
	const l = LANDMARKS.find((x) => x.id === id);
	if (!l) throw new Error(`Unknown landmark ${id}`);
	return l;
}

/** Ground height anywhere: the valley relief, or the flat floor of the Nexus. */
export function groundAt(x: number, z: number) {
	return z < -300 ? 0 : valHeight(x, z);
}

/**
 * The Nexus is a Hong Kong street canyon: the main avenue along the axis, and four side streets
 * (two on each side, where the city blocks leave their crossroads). Everything else is building.
 */
const NEXUS_AVENUE = { x: 14, zMin: NEXUS_Z - 146, zMax: NEXUS_Z + 24 };
const NEXUS_SIDE_STREETS = [
	{ side: -1, z0: NEXUS_Z - 8, z1: NEXUS_Z + 5 },
	{ side: -1, z0: NEXUS_Z - 92, z1: NEXUS_Z - 79 },
	{ side: 1, z0: NEXUS_Z - 41, z1: NEXUS_Z - 28 },
	{ side: 1, z0: NEXUS_Z - 125, z1: NEXUS_Z - 112 },
];
export function nexusWalkable(x: number, z: number) {
	if (Math.abs(x) <= NEXUS_AVENUE.x && z >= NEXUS_AVENUE.zMin && z <= NEXUS_AVENUE.zMax) return true;
	return NEXUS_SIDE_STREETS.some((s) => z >= s.z0 && z <= s.z1 && x * s.side >= 0 && Math.abs(x) <= 60);
}
