'use client';

import { useAnimations, useGLTF } from '@react-three/drei';
import type { ThreeElements } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

import { bakeGeometry } from './bake';

/**
 * A Sketchfab model (CC BY 4.0, credited in the menu), normalised to a target height,
 * standing on its base, casting shadows, optionally playing one of its animations in a loop.
 */
type Props = {
	file: string;
	height: number;
	/** Name (or part of the name) of the animation to loop; first clip when true. */
	animate?: string | boolean;
	shadows?: boolean;
	/** Extra emissive boost for neon-like assets. */
	glow?: number;
	/** Colour of that glow (neon signs of one model told apart by colour). */
	tint?: string;
	/** Nodes to hide (e.g. a baked ground plate), matched by name prefix. */
	hide?: string[];
	/** Rotation applied to the model itself before normalising (fix Z-up exports). */
	fix?: [number, number, number];
} & ThreeElements['group'];

/** Bounds of the visible meshes only (hidden ground plates must not count). */
function visibleBox(root: THREE.Object3D) {
	const box = new THREE.Box3();
	root.updateMatrixWorld(true);
	root.traverseVisible((o) => {
		const m = o as THREE.Mesh;
		if (m.isMesh) box.expandByObject(m, true);
	});
	return box;
}

/**
 * A still model (no animation, no skinning) is merged into one mesh per material: the village packs come split in
 * dozens of nodes sharing a few materials, each node a draw call and a node to update every frame. Merged once per
 * model and size, shared by every copy (the eight houses use two). Null when the model cannot be merged as is.
 */
type Merged = { geometry: THREE.BufferGeometry; material: THREE.Material }[];
const merged = new Map<string, Merged | null>();

function mergeStill(root: THREE.Object3D): Merged | null {
	root.updateMatrixWorld(true);
	const byMat = new Map<THREE.Material, THREE.BufferGeometry[]>();
	let ok = true;
	root.traverse((o) => {
		if ((o as THREE.SkinnedMesh).isSkinnedMesh || (o as THREE.InstancedMesh).isInstancedMesh) ok = false;
	});
	if (!ok) return null;
	root.traverseVisible((o) => {
		const m = o as THREE.Mesh;
		if (!m.isMesh || !ok) return;
		if (Array.isArray(m.material) || m.morphTargetInfluences || m.geometry.groups.length > 0) {
			ok = false;
			return;
		}
		const list = byMat.get(m.material) ?? [];
		list.push(bakeGeometry(m.geometry, m.matrixWorld));
		byMat.set(m.material, list);
	});
	if (!ok || byMat.size === 0) return null;
	const out: Merged = [];
	for (const [material, geos] of byMat) {
		// one attribute set for all (an attribute missing somewhere is dropped, unless the material reads it)
		const names = Object.keys(geos[0].attributes).filter((n) => geos.every((g) => g.getAttribute(n)));
		if ((material as THREE.MeshStandardMaterial).vertexColors && !names.includes('color')) return null;
		const indexed = geos.every((g) => g.index);
		const ready = geos.map((g) => {
			const h = indexed ? g : g.index ? g.toNonIndexed() : g;
			for (const n of Object.keys(h.attributes)) if (!names.includes(n)) h.deleteAttribute(n);
			return h;
		});
		const geometry = ready.length === 1 ? ready[0] : mergeGeometries(ready, false);
		if (!geometry) return null;
		geometry.computeBoundingSphere();
		out.push({ geometry, material });
	}
	return out;
}

export function SfModel({ file, height, animate, shadows = true, glow, tint, hide, fix, ...props }: Props) {
	const url = `/models/sf/${file}.glb`;
	const { scene, animations } = useGLTF(url);
	const model = useMemo(() => {
		const clone = SkeletonUtils.clone(scene) as THREE.Group;
		if (hide) clone.traverse((o) => {
			if (hide.some((h) => o.name.startsWith(h))) o.visible = false;
		});
		if (fix) clone.rotation.set(...fix);
		clone.updateMatrixWorld(true);
		const box = visibleBox(clone);
		const size = box.getSize(new THREE.Vector3());
		const k = height / Math.max(size.y, 0.001);
		clone.scale.multiplyScalar(k);
		clone.updateMatrixWorld(true);
		const scaled = visibleBox(clone);
		const center = scaled.getCenter(new THREE.Vector3());
		clone.position.x -= center.x;
		clone.position.z -= center.z;
		clone.position.y -= scaled.min.y;
		// one adjusted material per source material (meshes sharing one keep sharing it, and can be merged)
		const adjusted = new Map<THREE.Material, THREE.Material>();
		clone.traverse((o) => {
			const m = o as THREE.Mesh;
			if (!m.isMesh) return;
			m.castShadow = shadows;
			m.receiveShadow = shadows;
			const source = m.material as THREE.MeshStandardMaterial;
			if (!source || Array.isArray(source)) return;
			const known = adjusted.get(source);
			if (known) {
				m.material = known;
				return;
			}
			let mat: THREE.MeshStandardMaterial = source;
			// foliage and grass cards: alpha cut-out instead of unsorted blending (which reads as dark blocks)
			if (source.transparent && source.map) {
				mat = source.clone();
				mat.transparent = false;
				mat.depthWrite = true;
				mat.alphaTest = 0.5;
			}
			if (glow) {
				mat = mat === source ? source.clone() : mat;
				if (mat.emissiveMap || mat.emissive.getHex() !== 0) {
					mat.emissiveIntensity = glow;
					if (tint) mat.emissive.set(tint);
				}
			}
			adjusted.set(source, mat);
			m.material = mat;
		});
		if (animate) return clone;
		const key = [url, height, shadows, glow, tint, hide?.join(','), fix?.join(',')].join('|');
		if (!merged.has(key)) merged.set(key, mergeStill(clone));
		const parts = merged.get(key);
		if (!parts) return clone;
		const still = new THREE.Group();
		for (const p of parts) {
			const mesh = new THREE.Mesh(p.geometry, p.material);
			mesh.castShadow = shadows;
			mesh.receiveShadow = shadows;
			mesh.matrixAutoUpdate = false;
			still.add(mesh);
		}
		return still;
	}, [scene, url, animate, height, shadows, glow, tint, hide, fix]);

	const group = useRef<THREE.Group>(null);
	const { actions, names } = useAnimations(animations, group);
	useEffect(() => {
		if (!animate || names.length === 0) return;
		const name = typeof animate === 'string' ? (names.find((n) => n.toLowerCase().includes(animate.toLowerCase())) ?? names[0]) : names[0];
		const a = actions[name];
		a?.reset().fadeIn(0.2).play();
		return () => {
			a?.fadeOut(0.2);
		};
	}, [animate, actions, names]);

	return (
		<group {...props}>
			<group ref={group}>
				<primitive object={model} />
			</group>
		</group>
	);
}

export function preloadSf(...files: string[]) {
	files.forEach((f) => useGLTF.preload(`/models/sf/${f}.glb`));
}
