'use client';

import { Suspense } from 'react';

import { NEXUS_CENTER, NEXUS_Z } from '@/lib/world';
import { SfModel } from './SfModel';

/**
 * Sketchfab set dressing for the Nexus (all CC BY 4.0, credited in the menu):
 * Asian Shop Pack (abhayexe), vertical neon signs (alexbescg), cyberpunk car (3d_Bob).
 */
export const SHOPS = [
	{ x: -34, z: NEXUS_Z - 18, r: Math.PI / 2 },
	{ x: 34, z: NEXUS_Z - 26, r: -Math.PI / 2 },
	{ x: -66, z: NEXUS_Z - 110, r: Math.PI / 2.6 },
	{ x: 66, z: NEXUS_Z - 112, r: -Math.PI / 2.6 },
];

export const CARS = [
	{ x: -18, z: NEXUS_Z - 40, r: 0.3 },
	{ x: 16, z: NEXUS_Z - 64, r: 2.6 },
	{ x: -26, z: NEXUS_Z - 96, r: -1.2 },
	{ x: 24, z: NEXUS_Z - 118, r: 1.9 },
	{ x: -8, z: NEXUS_Z - 10, r: 1.5 },
];

const SIGNS = Array.from({ length: 12 }, (_, i) => {
	const a = (i / 12) * Math.PI * 2 + 0.2;
	const r = 92 + (i % 3) * 8;
	return { x: NEXUS_CENTER.x + Math.cos(a) * r, z: NEXUS_CENTER.z + Math.sin(a) * r, y: 4 + (i % 4) * 5, r: -a - Math.PI / 2 };
});

export function NexusProps() {
	return (
		<Suspense fallback={null}>
			{SHOPS.map((s, i) => (
				<SfModel key={`shop-${i}`} file="asian_shops" height={9} position={[s.x, 0, s.z]} rotation={[0, s.r, 0]} />
			))}
			{CARS.map((c, i) => (
				<SfModel key={`car-${i}`} file="cyber_car" height={1.5} position={[c.x, 0, c.z]} rotation={[0, c.r, 0]} />
			))}
			{SIGNS.map((s, i) => (
				<SfModel key={`sign-${i}`} file="neon_sign" height={7} glow={4} shadows={false} position={[s.x, s.y, s.z]} rotation={[0, s.r, 0]} />
			))}
		</Suspense>
	);
}
