'use client';

import { useGLTF } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';

/** A rock from the painted stone pack (ashkan.fancy, CC BY 4.0), sized in world units (base on the ground). */
export function PaintedRock({ name, position, rotation = 0, size }: { name: string; position: [number, number, number]; rotation?: number; size: [number, number, number] }) {
	const { scene } = useGLTF('/models/sf/painted_nature.glb');
	const obj = useMemo(() => {
		const src = scene.getObjectByName(name);
		if (!src) return null;
		// the pack is a Z-up export: keep the node's own rotation inside a wrapper and size the wrapper in world axes
		const inner = src.clone(true);
		inner.position.set(0, 0, 0);
		const clone = new THREE.Group();
		clone.add(inner);
		clone.updateMatrixWorld(true);
		const box = new THREE.Box3().setFromObject(clone);
		const dim = box.getSize(new THREE.Vector3());
		clone.scale.set(size[0] / dim.x, size[1] / dim.y, size[2] / dim.z);
		clone.updateMatrixWorld(true);
		const scaled = new THREE.Box3().setFromObject(clone);
		const c = scaled.getCenter(new THREE.Vector3());
		clone.position.set(-c.x, -scaled.min.y - 0.2, -c.z);
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
