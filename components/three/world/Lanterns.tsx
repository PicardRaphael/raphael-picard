'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

import { HOUSES, PATHS, landmark, valHeight } from '@/lib/world';

/**
 * Street lanterns along the roads and warm lights on the key buildings.
 * They glow softly by day and light the valley at dusk and night.
 */
const post = new THREE.MeshStandardMaterial({ color: '#2b2420', roughness: 0.9 });

export function Lanterns({ night }: { night: number }) {
	const spots = useMemo(() => {
		const list: { x: number; z: number }[] = [];
		for (const line of PATHS) {
			for (let i = 0; i < line.length - 1; i++) {
				const [ax, az] = line[i];
				const [bx, bz] = line[i + 1];
				const len = Math.hypot(bx - ax, bz - az);
				const n = Math.floor(len / 14);
				for (let k = 1; k <= n; k++) {
					const t = k / (n + 1);
					// offset to the side of the road
					const nx = -(bz - az) / len;
					const nz = (bx - ax) / len;
					list.push({ x: ax + (bx - ax) * t + nx * 3.6, z: az + (bz - az) * t + nz * 3.6 });
				}
			}
		}
		return list;
	}, []);

	// a few real lights on the places that matter; the rest are emissive only
	const keyLights = useMemo(() => {
		const ids = ['forge', 'tower', 'raphy', 'stones'];
		const pts = ids.map((id) => {
			const l = landmark(id);
			return { x: l.x + 3, z: l.z + 3 };
		});
		const tavern = HOUSES.find((h) => h.type.includes('tavern'));
		if (tavern) pts.push({ x: tavern.x + 4, z: tavern.z + 4 });
		return pts;
	}, []);

	const glow = 0.6 + night * 3.4;
	const lampMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ffd59a', emissive: '#ffb347', emissiveIntensity: glow, toneMapped: false }), [glow]);

	return (
		<group>
			{spots.map((s, i) => {
				const y = valHeight(s.x, s.z);
				return (
					<group key={i} position={[s.x, y, s.z]}>
						<mesh position={[0, 1.6, 0]} material={post} castShadow>
							<cylinderGeometry args={[0.09, 0.13, 3.2, 6]} />
						</mesh>
						<mesh position={[0, 3.35, 0]} material={lampMat}>
							<boxGeometry args={[0.5, 0.6, 0.5]} />
						</mesh>
						<mesh position={[0, 3.75, 0]} material={post}>
							<coneGeometry args={[0.45, 0.35, 4]} />
						</mesh>
					</group>
				);
			})}
			{night > 0.2 &&
				keyLights.map((p, i) => <pointLight key={i} position={[p.x, valHeight(p.x, p.z) + 4, p.z]} color="#ffb347" intensity={40 * night} distance={22} decay={1.6} />)}
		</group>
	);
}
