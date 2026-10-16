/**
 * The shot list of « Raphaël Picard en 30 secondes »: one camera path per shot, u in [0, 1] over `frames` (30 fps).
 * Positions are world metres (lib/world.ts): the val around z = 0, the Nexus avenue from z = -586 (gate) to -725 (beacon).
 * `hero` is where the (hidden) hero stands: the realm, the shadows and the city loading follow him.
 */
import { ease, lerp, spline } from './lib.mjs';

const NZ = -600;

/** Camera along a spline with an eased progress, looking at a (possibly moving) target. */
const path =
	(points, looks, { fov = 55, fovEnd, curve = ease.inOut, roll = 0, rollEnd } = {}) =>
	(u) => {
		const k = curve(u);
		return {
			pos: spline(points, k),
			look: Array.isArray(looks[0]) ? spline(looks, k) : looks,
			fov: fovEnd === undefined ? fov : lerp(fov, fovEnd, k),
			roll: rollEnd === undefined ? roll : lerp(roll, rollEnd, k),
		};
	};

/** Orbit around a point: angles in radians (0 = +z side), radius and height eased between start and end. */
const orbit =
	(center, { a0, a1, r0, r1 = r0, h0, h1 = h0, lookY = center[1], fov = 50, curve = ease.inOut }) =>
	(u) => {
		const k = curve(u);
		const a = lerp(a0, a1, k);
		const r = lerp(r0, r1, k);
		return { pos: [center[0] + Math.sin(a) * r, lerp(h0, h1, k), center[2] + Math.cos(a) * r], look: [center[0], lookY, center[2]], fov };
	};

export const SHOTS = [
	// 0.0–3.0 s — the hook: a slow drift over the golden val, then the dive into the arcane portal
	{
		name: 'val-dive',
		timeMode: 'dusk',
		hero: { x: 30, z: 20 },
		frames: 92,
		camera: path(
			[
				[0, 15, 28],
				[0, 12, -10],
				[0, 8, -55],
				[0, 6.2, -84],
				[0, 5.6, -92.5],
			],
			[
				[0, 4, -92],
				[0, 5, -92],
				[0, 5.6, -92],
				[0, 5.6, -95],
				[0, 5.6, -100],
			],
			{ fov: 50, fovEnd: 85, curve: (u) => Math.pow(u, 1.7) },
		),
	},
	// 3.0–5.4 s — out of the gate, low and fast over the wet neon avenue
	{
		name: 'nexus-emerge',
		hero: { x: 0, z: NZ - 30 },
		frames: 74,
		camera: path(
			[
				[0, 6.2, NZ + 13],
				[0, 4, NZ - 2],
				[0.5, 2, NZ - 20],
				[1, 1.6, NZ - 34],
			],
			[0, 3.5, NZ - 95],
			{ fov: 85, fovEnd: 55, curve: ease.out },
		),
	},
	// 5.4–7.8 s — crane up over the avenue: the title
	{
		name: 'nexus-crane',
		hero: { x: 0, z: NZ - 40 },
		frames: 110,
		camera: path(
			[
				[6, 2.5, NZ - 36],
				[4, 8, NZ - 30],
				[2, 16, NZ - 22],
			],
			[
				[0, 4, NZ - 90],
				[0, 3, NZ - 95],
			],
			{ fov: 52, curve: ease.sine },
		),
	},
	// 7.8–10.2 s — the NeoChat kiosk: « 7 agents IA en production »
	{
		name: 'kiosk',
		hero: { x: 0, z: NZ - 40 },
		frames: 74,
		camera: path(
			[
				[-0.5, 2.2, NZ - 40],
				[-3.5, 2.8, NZ - 44.5],
			],
			[
				[-10, 3, NZ - 50],
				[-10, 3.4, NZ - 50],
			],
			{ fov: 48, curve: ease.sine },
		),
	},
	// 10.2–12.6 s — Raphy·OS, the hologram guide: « 5 contrôles humains »
	{
		name: 'holo',
		hero: { x: 0, z: NZ - 5 },
		frames: 74,
		camera: orbit([-10, 3.5, NZ - 22], { a0: 0.5, a1: 1.1, r0: 9, r1: 7.5, h0: 2.5, h1: 3.5, lookY: 4, fov: 50, curve: ease.sine }),
	},
	// 12.6–15.0 s — a dolly a hand above the wet asphalt: « −33 % »
	{
		name: 'street',
		hero: { x: 0, z: NZ - 30 },
		frames: 74,
		camera: path(
			[
				[2.4, 0.55, NZ - 16],
				[1.6, 0.75, NZ - 30],
			],
			[
				[0, 2.6, NZ - 70],
				[0, 3.2, NZ - 80],
			],
			{ fov: 50, curve: ease.sine },
		),
	},
	// 15.0–17.4 s — the NeoSupport kiosk from below: « 7 000+ tests »
	{
		name: 'kiosk2',
		hero: { x: 0, z: NZ - 66 },
		frames: 74,
		camera: path(
			[
				[3.5, 1.2, NZ - 70],
				[5.5, 1.5, NZ - 72.5],
			],
			[
				[10, 3.4, NZ - 76],
				[10, 3.6, NZ - 76],
			],
			{ fov: 50, curve: ease.sine },
		),
	},
	// 17.4–22.2 s — the agents constellation, behind the architecture diagram
	{
		name: 'agents',
		hero: { x: -18, z: NZ - 80 },
		frames: 218,
		camera: orbit([-32, 7, NZ - 86], { a0: 1.2, a1: 2.4, r0: 16, r1: 14, h0: 5, h1: 7, lookY: 7, fov: 50, curve: ease.linear }),
	},
	// 19.8–24.6 s — « ce portfolio est un jeu » : four quick cuts
	{
		name: 'game-val',
		timeMode: 'dusk',
		hero: { x: 30, z: 20 },
		frames: 38,
		camera: path(
			[
				[70, 42, 45],
				[62, 38, 30],
			],
			[0, 0, -40],
			{ fov: 50, curve: ease.linear },
		),
	},
	{
		name: 'game-portal',
		timeMode: 'dusk',
		hero: { x: 30, z: 20 },
		frames: 38,
		camera: path(
			[
				[9, 3, -72],
				[5, 3.6, -75],
			],
			[0, 5.5, -92],
			{ fov: 50, curve: ease.linear },
		),
	},
	{
		name: 'game-nexus',
		hero: { x: 0, z: NZ - 60 },
		frames: 38,
		camera: path(
			[
				[0, 32, NZ + 8],
				[0, 30, NZ - 2],
			],
			[0, 0, NZ - 80],
			{ fov: 55, curve: ease.linear },
		),
	},
	{
		name: 'game-gallery',
		hero: { x: 20, z: NZ - 110 },
		frames: 38,
		camera: path(
			[
				[19.5, 5, NZ - 106],
				[19, 4.6, NZ - 109],
			],
			[34, 5, NZ - 118],
			{ fov: 50, curve: ease.linear },
		),
	},
	// 24.6–31.0 s — the contact beacon: « Discutons. »
	{
		name: 'beacon',
		hero: { x: 0, z: NZ - 80 },
		frames: 194,
		camera: path(
			[
				[0, 2.2, NZ - 78],
				[0, 4, NZ - 92],
				[0, 6.5, NZ - 102],
			],
			[
				[0, 9, NZ - 125],
				[0, 12, NZ - 125],
			],
			{ fov: 55, curve: ease.out },
		),
	},
];

export const FPS = 30;
