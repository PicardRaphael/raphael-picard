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
	{ id: 'agents', name: 'Constellation des Agents', hint: 'Analyser la constellation', zone: 'nexus', x: -46, z: NEXUS_Z - 50, radius: 12, solid: 3 },
	{ id: 'core', name: "Noyau d'orchestration", hint: 'Inspecter le noyau', zone: 'nexus', x: 46, z: NEXUS_Z - 50, radius: 12, solid: 3 },
	{ id: 'gallery', name: 'Galerie des Projets', hint: 'Parcourir la galerie', zone: 'nexus', x: 0, z: NEXUS_Z - 82, radius: 13, solid: 0 },
	{ id: 'beacon', name: 'Balise de contact', hint: 'Activer la balise', zone: 'nexus', x: 0, z: NEXUS_Z - 125, radius: 12, solid: 4 },
	{ id: 'race', name: 'Ligne de départ', hint: 'Lancer la course', zone: 'nexus', x: -60, z: NEXUS_Z - 10, radius: 7, solid: 0 },
];

export const LAKE = { x: -36, z: 22, r: 15, level: -1.4 };

/** Village buildings (KayKit Medieval Hexagon, CC0): model, position, rotation, scale, collision radius. */
export const HOUSES = [
	{ type: 'building_home_A_blue', x: -16, z: -30, r: 0.3, s: 1, c: 5.5 },
	{ type: 'building_tavern_blue', x: -27, z: -22, r: -0.6, s: 1, c: 6.4 },
	{ type: 'building_home_B_blue', x: -12, z: -47, r: 0.9, s: 1, c: 5.8 },
	{ type: 'building_market_blue', x: 15, z: -27, r: -0.3, s: 1, c: 5.8 },
	{ type: 'building_home_A_blue', x: 17, z: -12, r: 2.6, s: 1, c: 5.8 },
	{ type: 'building_home_B_blue', x: -19, z: -6, r: 1.4, s: 1, c: 5.8 },
	{ type: 'building_well_blue', x: -6, z: -32, r: 0, s: 0.8, c: 2 },
	{ type: 'building_church_blue', x: 52, z: 14, r: -2.2, s: 1.15, c: 7.5 },
	{ type: 'building_windmill_blue', x: -60, z: -62, r: 0.6, s: 1.2, c: 6.4 },
	{ type: 'building_watermill_blue', x: -54, z: 30, r: 1.9, s: 1, c: 6.4 },
	{ type: 'building_castle_blue', x: 64, z: -84, r: -0.7, s: 1.6, c: 13 },
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
		const f = smooth(9, 4, Math.hypot(x - hs.x, z - hs.z));
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
	if (r > 92) h += Math.pow((r - 92) * 0.35, 1.6) * (0.8 + fbm(x * 0.03, z * 0.03, 2) * 0.6);
	return h;
}

export function landmark(id: string) {
	const l = LANDMARKS.find((x) => x.id === id);
	if (!l) throw new Error(`Unknown landmark ${id}`);
	return l;
}
