'use client';

import { useAnimations, useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { forwardRef, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

/**
 * Animated characters from KayKit Adventurers (CC0).
 * Knight = fantasy hero. Runner = the hooded rogue with a neon recolour (cyberpunk).
 */

export type HeroKind = 'knight' | 'runner';

const FILES: Record<HeroKind, string> = { knight: '/models/knight.glb', runner: '/models/rogue_hooded.glb' };
useGLTF.preload(FILES.knight);
useGLTF.preload(FILES.runner);
useGLTF.preload('/models/pistol.glb');

const RUNNER_HIDDEN = ['Knife', 'Knife_Offhand', '1H_Crossbow', '2H_Crossbow', 'Throwable'];

/** Hue-shifts the KayKit gradient atlas toward magenta/cyan neon. */
function neonTexture(src: THREE.Texture) {
	const img = src.image as HTMLImageElement | ImageBitmap | undefined;
	if (!img) return src;
	const c = document.createElement('canvas');
	c.width = img.width;
	c.height = img.height;
	const ctx = c.getContext('2d');
	if (!ctx) return src;
	ctx.filter = 'hue-rotate(170deg) saturate(1.25) brightness(0.8) contrast(1.2)';
	ctx.drawImage(img, 0, 0);
	const t = new THREE.CanvasTexture(c);
	t.flipY = src.flipY;
	t.colorSpace = THREE.SRGBColorSpace;
	t.magFilter = src.magFilter;
	t.minFilter = src.minFilter;
	return t;
}

export type HeroHandle = THREE.Group;

type Props = { kind: HeroKind; animation: string; speed: number };

export const HeroModel = forwardRef<THREE.Group, Props>(function HeroModel({ kind, animation, speed }, ref) {
	const { scene, animations } = useGLTF(FILES[kind]);
	const pistol = useGLTF('/models/pistol.glb').scene;
	const model = useMemo(() => {
		const clone = SkeletonUtils.clone(scene) as THREE.Group;
		clone.traverse((o) => {
			const m = o as THREE.Mesh;
			if (!m.isMesh) return;
			m.castShadow = true;
			m.frustumCulled = false;
			const mat = (m.material as THREE.MeshStandardMaterial).clone();
			if (kind === 'runner') {
				if (mat.map) mat.map = neonTexture(mat.map);
				mat.emissive = new THREE.Color('#0ea5e9');
				mat.emissiveIntensity = 0.08;
				mat.metalness = 0.35;
				mat.roughness = 0.45;
			}
			m.material = mat;
		});
		if (kind === 'runner') {
			// the runner trades the crossbow and knives for a sci-fi pistol (Quaternius, CC0)
			RUNNER_HIDDEN.forEach((n) => {
				const o = clone.getObjectByName(n);
				if (o) o.visible = false;
			});
			const hand = clone.getObjectByName('handslot.r');
			if (hand) {
				const gun = pistol.clone(true);
				gun.name = 'pistol';
				gun.rotation.set(0, Math.PI / 2, 0);
				gun.scale.setScalar(1.6);
				gun.position.set(0, 0.05, 0.12);
				gun.traverse((o) => {
					const gm = o as THREE.Mesh;
					if (gm.isMesh) gm.castShadow = true;
				});
				hand.add(gun);
			}
		}
		return clone;
	}, [scene, kind, pistol]);

	const group = useRef<THREE.Group>(null);
	const { actions } = useAnimations(animations, group);
	const current = useRef<string | null>(null);

	// `animation` may carry a "#n" suffix so that a repeated one-shot (sword swing) restarts
	useEffect(() => {
		const name = animation.split('#')[0];
		const next = actions[name];
		if (!next || current.current === animation) return;
		const prevName = current.current?.split('#')[0];
		const prev = prevName && prevName !== name ? actions[prevName] : null;
		next.reset().fadeIn(0.2).play();
		if (['Cheer', 'Interact', 'Jump_Full_Short', '1H_Melee_Attack_Slice_Diagonal', '1H_Ranged_Shoot', 'Hit_A'].includes(name)) {
			next.setLoop(THREE.LoopOnce, 1);
			next.clampWhenFinished = true;
		}
		prev?.fadeOut(0.2);
		current.current = animation;
	}, [animation, actions]);

	useFrame(() => {
		const a = current.current ? actions[current.current.split('#')[0]] : null;
		if (a) a.timeScale = speed;
	});

	return (
		<group ref={ref}>
			<group ref={group}>
				<primitive object={model} />
			</group>
			{kind === 'runner' && <pointLight position={[0, 1.6, 0.6]} color="#e879f9" intensity={6} distance={6} />}
		</group>
	);
});
