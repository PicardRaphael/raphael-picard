'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

import type { Mob } from '@/lib/mobs';
import { groundAt } from '@/lib/world';

/** Laser bolts fired by the runner's pistol: they fly to the target and hit on arrival. */
type Bolt = { x: number; y: number; z: number; target: Mob; onHit: () => void; life: number };

export const bolts: Bolt[] = [];

export function fireBolt(from: { x: number; y: number; z: number }, target: Mob, onHit: () => void) {
	bolts.push({ ...from, target, onHit, life: 0 });
}

const MAX = 24;

export function Lasers() {
	const ref = useRef<THREE.InstancedMesh>(null);
	const m = new THREE.Matrix4();
	const q = new THREE.Quaternion();
	const dir = new THREE.Vector3();
	const fwd = new THREE.Vector3(0, 0, 1);

	useFrame((_, delta) => {
		const mesh = ref.current;
		if (!mesh) return;
		const dt = Math.min(delta, 0.05);
		for (let i = bolts.length - 1; i >= 0; i--) {
			const b = bolts[i];
			b.life += dt;
			const tx = b.target.x;
			const ty = groundAt(b.target.x, b.target.z) + 1.2;
			const tz = b.target.z;
			dir.set(tx - b.x, ty - b.y, tz - b.z);
			const d = dir.length();
			const step = 55 * dt;
			if (d <= step || b.life > 1.5) {
				b.onHit();
				bolts.splice(i, 1);
				continue;
			}
			dir.multiplyScalar(1 / d);
			b.x += dir.x * step;
			b.y += dir.y * step;
			b.z += dir.z * step;
		}
		for (let i = 0; i < MAX; i++) {
			const b = bolts[i];
			if (!b) {
				m.makeScale(0, 0, 0);
			} else {
				dir.set(b.target.x - b.x, 0, b.target.z - b.z).normalize();
				q.setFromUnitVectors(fwd, dir.lengthSq() > 0 ? dir : fwd);
				m.compose(new THREE.Vector3(b.x, b.y, b.z), q, new THREE.Vector3(0.12, 0.12, 1.6));
			}
			mesh.setMatrixAt(i, m);
		}
		mesh.instanceMatrix.needsUpdate = true;
	});

	return (
		<instancedMesh ref={ref} args={[undefined, undefined, MAX]} frustumCulled={false}>
			<capsuleGeometry args={[0.5, 1, 4, 8]} />
			<meshBasicMaterial color="#ff4fd8" toneMapped={false} />
		</instancedMesh>
	);
}
