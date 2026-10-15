'use client';

import { useGLTF } from '@react-three/drei';
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

import { KINDS, type Placement, placements as scatterAll } from '@/lib/vegetation';

/**
 * Painted vegetation from Quaternius' Stylized Nature MegaKit (CC0), instanced.
 * Each model is split into its sub-meshes (bark, leaves…), one InstancedMesh per sub-mesh.
 */

const URL = '/models/nature.glb';
useGLTF.preload(URL);

type KindName = keyof typeof KINDS;

type Part = { geometry: THREE.BufferGeometry; material: THREE.Material; height: number; minY: number };

/** For every model name: its sub-meshes, with the model's height so instances can be scaled to a target size. */
function useParts() {
	const { scene } = useGLTF(URL);
	return useMemo(() => {
		scene.updateMatrixWorld(true);
		const parts: Record<string, Part[]> = {};
		for (const child of scene.children) {
			const box = new THREE.Box3().setFromObject(child);
			const height = Math.max(box.max.y - box.min.y, 0.01);
			const list: Part[] = [];
			child.traverse((o) => {
				const m = o as THREE.Mesh;
				if (!m.isMesh) return;
				const g = m.geometry.clone();
				g.applyMatrix4(m.matrixWorld.clone().premultiply(new THREE.Matrix4().copy(child.matrixWorld).invert()));
				const mat = (m.material as THREE.MeshStandardMaterial).clone();
				mat.roughness = 1;
				list.push({ geometry: g, material: mat, height, minY: box.min.y });
			});
			parts[child.name] = list;
		}
		return parts;
	}, [scene]);
}

function KindInstances({ kind, items, parts }: { kind: KindName; items: Placement[]; parts: Record<string, Part[]> }) {
	const cfg = KINDS[kind];
	return (
		<>
			{cfg.names.map((name, variant) => {
				const subset = items.filter((p) => p.variant === variant);
				return (parts[name] ?? []).map((part, k) => <PartInstances key={`${name}-${k}`} part={part} items={subset} shadow={cfg.shadow} />);
			})}
		</>
	);
}

function PartInstances({ part, items, shadow }: { part: Part; items: Placement[]; shadow: boolean }) {
	const ref = useRef<THREE.InstancedMesh>(null);
	useLayoutEffect(() => {
		const mesh = ref.current;
		if (!mesh) return;
		const m = new THREE.Matrix4();
		const q = new THREE.Quaternion();
		const s = new THREE.Vector3();
		const p = new THREE.Vector3();
		const up = new THREE.Vector3(0, 1, 0);
		items.forEach((it, i) => {
			const k = it.h / part.height;
			mesh.setMatrixAt(i, m.compose(p.set(it.x, it.y - part.minY * k - 0.15, it.z), q.setFromAxisAngle(up, it.rot), s.setScalar(k)));
		});
		mesh.instanceMatrix.needsUpdate = true;
		mesh.computeBoundingSphere();
	}, [items, part]);
	if (items.length === 0) return null;
	return <instancedMesh ref={ref} args={[part.geometry, part.material, items.length]} castShadow={shadow} receiveShadow />;
}

export function Nature() {
	const parts = useParts();
	const placements = useMemo(() => scatterAll(), []);
	return (
		<group>
			{(Object.keys(KINDS) as KindName[]).map((k) => (
				<KindInstances key={k} kind={k} items={placements[k]} parts={parts} />
			))}
		</group>
	);
}
