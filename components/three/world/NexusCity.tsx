'use client';

import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

import { NEXUS_CENTER, nexusWalkable } from '@/lib/world';
import { SfModel } from './SfModel';

/**
 * The Nexus streets: "Full Gameready City Buildings III [HongKong]" by abhayexe (Sketchfab, CC BY 4.0), a whole
 * Hong Kong corner block with its road, laid out twice face to face to form a neon canyon. At night the windows
 * and shop fronts glow; real brand panels are tinted into anonymous neon.
 */
const URL = '/models/sf/hk_block.glb';

/** Block placements around the Nexus centre (x, z, rotation). Tuned live in dev through window.__city. */
export const CITY_BLOCKS: { x: number; z: number; r: number }[] = [
	// the block's main road runs along its X axis at z 10–27 m, buildings on the −z side:
	// turned a quarter so the road follows the Nexus axis, and mirrored across the road for the far side
	{ x: -18.5, z: 42, r: Math.PI / 2 },
	{ x: 18.5, z: 42, r: (3 * Math.PI) / 2 },
	{ x: -18.5, z: -42, r: Math.PI / 2 },
	{ x: 18.5, z: -42, r: (3 * Math.PI) / 2 },
];

export function NexusCity() {
	const { scene } = useGLTF(URL);
	const blocks = useMemo(
		() =>
			CITY_BLOCKS.map(() => {
				const clone = scene.clone(true);
				clone.traverse((o) => {
					const m = o as THREE.Mesh;
					if (!m.isMesh) return;
					m.castShadow = false;
					m.receiveShadow = true;
					// night city: every lit window and shop front glows from its own texture
					const mat = (m.material as THREE.MeshStandardMaterial).clone();
					if (mat.map) {
						mat.emissiveMap = mat.map;
						mat.emissive = new THREE.Color('#ffd9b0');
						mat.emissiveIntensity = 0.32;
					}
					m.material = mat;
				});
				return clone;
			}),
		[scene],
	);
	const refs = useRef<(THREE.Group | null)[]>([]);
	useFrame(() => {
		CITY_BLOCKS.forEach((b, i) => {
			const g = refs.current[i];
			if (!g) return;
			// mirrored blocks share the road: sink them a hair so the two road surfaces never fight
			g.position.set(NEXUS_CENTER.x + b.x, i % 2 ? -0.03 : 0, NEXUS_CENTER.z + b.z);
			g.rotation.y = b.r;
		});
	});
	if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') Object.assign(window, { __city: CITY_BLOCKS });
	return (
		<group>
			<NexusSigns />
			{blocks.map((obj, i) => (
				<group
					key={i}
					ref={(g) => {
						refs.current[i] = g;
					}}
				>
					<primitive object={obj} />
				</group>
			))}
		</group>
	);
}

/**
 * Neon blade signs and panels hung on both facades of the avenue (alexbescg and mcmanusmedia, Sketchfab,
 * CC BY 4.0), skipping the mouths of the side streets.
 */
const SIGNS = (() => {
	const list: { x: number; y: number; z: number; r: number; file: string; h: number }[] = [];
	let i = 0;
	for (let z = NEXUS_CENTER.z + 80; z > NEXUS_CENTER.z - 84; z -= 11) {
		for (const side of [-1, 1]) {
			i++;
			// no sign where a side street opens
			if (nexusWalkable(side * 22, z)) continue;
			const blade = i % 3 !== 0;
			list.push({
				x: side * (blade ? 15.2 : 15.9),
				y: 4.5 + ((i * 7) % 4) * 2.2,
				z: z + ((i * 5) % 3) - 1,
				r: side < 0 ? Math.PI / 2 : -Math.PI / 2,
				file: blade ? 'neon_sign' : 'neon_sign2',
				h: blade ? 5.5 : 2.6,
			});
		}
	}
	return list;
})();

export function NexusSigns() {
	return (
		<>
			{SIGNS.map((g, i) => (
				<SfModel key={i} file={g.file} height={g.h} glow={4} shadows={false} position={[g.x, g.y, g.z]} rotation={[0, g.r, 0]} />
			))}
		</>
	);
}
