'use client';

import { useAnimations, useGLTF } from '@react-three/drei';
import type { ThreeElements } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

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
		clone.traverse((o) => {
			const m = o as THREE.Mesh;
			if (!m.isMesh) return;
			m.castShadow = shadows;
			m.receiveShadow = shadows;
			// foliage and grass cards: alpha cut-out instead of unsorted blending (which reads as dark blocks)
			const base = m.material as THREE.MeshStandardMaterial;
			if (base?.transparent && base.map) {
				const cut = base.clone();
				cut.transparent = false;
				cut.depthWrite = true;
				cut.alphaTest = 0.5;
				m.material = cut;
			}
			if (glow && m.material) {
				const mat = (m.material as THREE.MeshStandardMaterial).clone();
				if (mat.emissiveMap || mat.emissive.getHex() !== 0) {
					mat.emissiveIntensity = glow;
					if (tint) mat.emissive.set(tint);
				}
				m.material = mat;
			}
		});
		return clone;
	}, [scene, height, shadows, glow, tint, hide, fix]);

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
