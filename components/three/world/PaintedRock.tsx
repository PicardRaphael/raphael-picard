'use client';

import { useGLTF } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';

/** A rock from the painted nature kit, sized in world units (base on the ground). */
export function PaintedRock({ name, position, rotation = 0, size }: { name: string; position: [number, number, number]; rotation?: number; size: [number, number, number] }) {
	const { scene } = useGLTF('/models/nature.glb');
	const obj = useMemo(() => {
		const src = scene.getObjectByName(name);
		if (!src) return null;
		const clone = src.clone(true);
		clone.position.set(0, 0, 0);
		clone.rotation.set(0, 0, 0);
		const box = new THREE.Box3().setFromObject(clone);
		const dim = box.getSize(new THREE.Vector3());
		clone.scale.set(size[0] / dim.x, size[1] / dim.y, size[2] / dim.z);
		const scaled = new THREE.Box3().setFromObject(clone);
		clone.position.y = -scaled.min.y - 0.2;
		clone.traverse((o) => {
			const m = o as THREE.Mesh;
			if (m.isMesh) {
				m.castShadow = true;
				m.receiveShadow = true;
			}
		});
		return clone;
	}, [scene, name, size]);
	if (!obj) return null;
	return (
		<group position={position} rotation={[0, rotation, 0]}>
			<primitive object={obj} />
		</group>
	);
}
