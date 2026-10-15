'use client';

import { useGLTF } from '@react-three/drei';
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

import { noise2 } from '@/lib/noise';
import { HOUSES, LAKE, LANDMARKS, pathDistance, valHeight } from '@/lib/world';
import { mulberry32 } from '../shapes';

/**
 * Painted vegetation from Quaternius' Stylized Nature MegaKit (CC0), instanced.
 * Each model is split into its sub-meshes (bark, leaves…), one InstancedMesh per sub-mesh.
 */

const URL = '/models/nature.glb';
useGLTF.preload(URL);

type Kind = { names: string[]; height: [number, number]; shadow: boolean };

const KINDS = {
	oak: { names: ['CommonTree_1', 'CommonTree_2', 'CommonTree_4'], height: [9, 14], shadow: true },
	twisted: { names: ['TwistedTree_1', 'TwistedTree_3'], height: [8, 12], shadow: true },
	pine: { names: ['Pine_1', 'Pine_3'], height: [12, 18], shadow: true },
	rock: { names: ['Rock_Medium_1', 'Rock_Medium_2', 'Rock_Medium_3'], height: [1.2, 3.8], shadow: true },
	bush: { names: ['Bush_Common_Flowers', 'Bush_Common'], height: [1.2, 2.2], shadow: false },
	grass: { names: ['Grass_Common_Tall', 'Grass_Wispy_Tall', 'Fern_1'], height: [0.7, 1.3], shadow: false },
	flower: { names: ['Flower_3_Group', 'Flower_4_Group', 'Mushroom_Laetiporus'], height: [0.5, 0.9], shadow: false },
} satisfies Record<string, Kind>;

type KindName = keyof typeof KINDS;
type Placement = { x: number; y: number; z: number; rot: number; h: number; variant: number };

function clearOf(x: number, z: number, margin: number) {
	if (Math.hypot(x, z + 20) > 104) return false;
	if (Math.hypot(x - LAKE.x, z - LAKE.z) < LAKE.r + 2 + margin) return false;
	if (pathDistance(x, z) < 2.5 + margin) return false;
	if (Math.hypot(x, z - 10) < 6 + margin * 2) return false;
	for (const l of LANDMARKS) if (l.zone === 'val' && Math.hypot(x - l.x, z - l.z) < l.radius + margin) return false;
	for (const h of HOUSES) if (Math.hypot(x - h.x, z - h.z) < h.c + 1.5 + margin) return false;
	return true;
}

function scatter(): Record<KindName, Placement[]> {
	const rng = mulberry32(77);
	const out = { oak: [], twisted: [], pine: [], rock: [], bush: [], grass: [], flower: [] } as Record<KindName, Placement[]>;
	const place = (kind: KindName, x: number, z: number) => {
		const [a, b] = KINDS[kind].height;
		out[kind].push({ x, z, y: valHeight(x, z), rot: rng() * Math.PI * 2, h: a + rng() * (b - a), variant: Math.floor(rng() * KINDS[kind].names.length) });
	};
	for (let i = 0; i < 6000 && out.oak.length + out.pine.length + out.twisted.length < 420; i++) {
		const x = (rng() - 0.5) * 220;
		const z = (rng() - 0.5) * 220 - 20;
		if (!clearOf(x, z, 6)) continue;
		const forest = noise2(x * 0.025, z * 0.025);
		if (forest < 0 && rng() > 0.12) continue;
		const y = valHeight(x, z);
		if (y > 20) continue;
		if (y > 8 || rng() < 0.25) place('pine', x, z);
		else if (rng() < 0.18) place('twisted', x, z);
		else place('oak', x, z);
	}
	for (let i = 0; i < 400; i++) {
		const x = (rng() - 0.5) * 230;
		const z = (rng() - 0.5) * 230 - 20;
		if (clearOf(x, z, 1)) place('rock', x, z);
	}
	for (let i = 0; i < 500; i++) {
		const x = (rng() - 0.5) * 200;
		const z = (rng() - 0.5) * 200 - 20;
		if (clearOf(x, z, 2)) place('bush', x, z);
	}
	for (let i = 0; i < 5000; i++) {
		const x = (rng() - 0.5) * 200;
		const z = (rng() - 0.5) * 200 - 20;
		if (!clearOf(x, z, 0)) continue;
		if (valHeight(x, z) > 12) continue;
		place(rng() < 0.75 ? 'grass' : 'flower', x, z);
	}
	return out;
}

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
	const placements = useMemo(() => scatter(), []);
	return (
		<group>
			{(Object.keys(KINDS) as KindName[]).map((k) => (
				<KindInstances key={k} kind={k} items={placements[k]} parts={parts} />
			))}
		</group>
	);
}
