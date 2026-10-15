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

// knight: "3DRT - Fantasy Warrior" by 3DRT.com (Sketchfab, CC BY 4.0): armour, sword and shield are part of the
// rigged model; runner: KayKit rogue (CC0)
const FILES: Record<HeroKind, string> = { knight: '/models/sf/warrior.glb', runner: '/models/rogue_hooded.glb' };

/** The warrior ships one 33 s take: its moves are cut out by frame range (30 fps, ranges from 3DRT's sheet). */
const WARRIOR_TAKES: [string, number, number][] = [
	['w_idle', 0, 100],
	['w_defend', 120, 150],
	['w_attack1', 150, 200],
	['w_attack2', 230, 290],
	['w_walk', 320, 360],
	['w_run', 400, 420],
	['w_hit', 930, 980],
];
const CLIPS: Partial<Record<HeroKind, Record<string, string>>> = {
	knight: {
		Idle: 'w_idle',
		Walking_A: 'w_walk',
		Running_A: 'w_run',
		Jump_Full_Short: 'w_run',
		Hit_A: 'w_hit',
		Cheer: 'w_defend',
		Interact: 'w_defend',
		'1H_Melee_Attack_Slice_Diagonal': 'w_attack1',
		'1H_Melee_Attack_Slice_Diagonal:1': 'w_attack2',
		'1H_Melee_Attack_Slice_Diagonal:2': 'w_attack1',
	},
};
const ONCE = ['Cheer', 'Interact', 'Jump_Full_Short', '1H_Melee_Attack_Slice_Diagonal', '1H_Ranged_Shoot', 'Hit_A'];
const HEIGHT: Partial<Record<HeroKind, number>> = { knight: 2.3 };
/** The warrior was exported facing -Z: turn it so it looks where it walks. */
const FACING: Partial<Record<HeroKind, number>> = { knight: Math.PI };
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
		const h = HEIGHT[kind];
		if (h) {
			clone.updateMatrixWorld(true);
			const b = new THREE.Box3().setFromObject(clone, true);
			clone.scale.multiplyScalar(h / Math.max(b.max.y - b.min.y, 0.01));
			clone.updateMatrixWorld(true);
			const b2 = new THREE.Box3().setFromObject(clone, true);
			clone.position.y -= b2.min.y;
		}
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
	const clips = useMemo(() => {
		if (kind !== 'knight' || !animations[0]) return animations;
		return WARRIOR_TAKES.map(([name, from, to]) => THREE.AnimationUtils.subclip(animations[0], name, from, to, 30));
	}, [animations, kind]);
	const { actions } = useAnimations(clips, group);
	const current = useRef<string | null>(null);
	const playing = useRef<string | null>(null);

	// `animation` may carry a "#n" suffix so that a repeated one-shot (sword swing) restarts
	useEffect(() => {
		const [logical, nth] = animation.split('#');
		const variant = nth ? CLIPS[kind]?.[`${logical}:${Number(nth) % 3}`] : undefined;
		const name = variant ?? CLIPS[kind]?.[logical] ?? logical;
		const next = actions[name];
		if (!next || current.current === animation) return;
		const prevName = playing.current;
		const prev = prevName && prevName !== name ? actions[prevName] : null;
		if (ONCE.includes(logical)) {
			next.setLoop(THREE.LoopOnce, 1);
			next.clampWhenFinished = true;
		} else next.setLoop(THREE.LoopRepeat, Infinity);
		next.reset().fadeIn(0.15).play();
		prev?.fadeOut(0.15);
		current.current = animation;
		playing.current = name;
	}, [animation, actions, kind]);

	useFrame(() => {
		const a = playing.current ? actions[playing.current] : null;
		// attacks play a bit faster so a click feels responsive
		if (a) a.timeScale = current.current?.startsWith('1H_Melee') ? 1.5 : speed;
	});

	return (
		<group ref={ref}>
			<group ref={group} rotation={[0, FACING[kind] ?? 0, 0]}>
				<primitive object={model} />
			</group>
			{kind === 'runner' && <pointLight position={[0, 1.6, 0.6]} color="#e879f9" intensity={6} distance={6} />}
		</group>
	);
});
