'use client';

import { useGLTF } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';

import { HOUSES, landmark, valHeight } from '@/lib/world';

/** Medieval buildings from KayKit Medieval Hexagon (CC0): one hex tile = 2 units, scaled to the world. */
const URL = '/models/village.glb';
useGLTF.preload(URL);
const UNIT = 6;

export function Building({ type, x, z, r = 0, s = 1, y }: { type: string; x: number; z: number; r?: number; s?: number; y?: number }) {
	const { scene } = useGLTF(URL);
	const obj = useMemo(() => {
		const src = scene.getObjectByName(type);
		if (!src) return null;
		const clone = src.clone(true);
		clone.position.set(0, 0, 0);
		clone.traverse((o) => {
			const m = o as THREE.Mesh;
			if (m.isMesh) {
				m.castShadow = true;
				m.receiveShadow = true;
			}
		});
		const box = new THREE.Box3().setFromObject(clone);
		clone.position.y = -box.min.y;
		return clone;
	}, [scene, type]);
	if (!obj) return null;
	return (
		<group position={[x, (y ?? valHeight(x, z)) - 0.2, z]} rotation={[0, r, 0]} scale={UNIT * s}>
			<primitive object={obj} />
		</group>
	);
}

export function Village() {
	const forge = landmark('forge');
	const tower = landmark('tower');
	return (
		<group>
			{HOUSES.map((h, i) => (
				<Building key={i} {...h} />
			))}
			<Building type="building_blacksmith_blue" x={forge.x} z={forge.z} r={0.6} s={1.25} />
			<Building type="building_tower_A_blue" x={tower.x} z={tower.z} r={0.3} s={1.5} />
		</group>
	);
}
