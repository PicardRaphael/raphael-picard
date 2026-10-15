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
// rigged model; runner: "Neo Noir - Punk Vigilante" by manoeldarochadeoliveira (Sketchfab, CC BY 4.0) holding
// the same sci-fi gun family as the first-person view (Quaternius, CC0)
const FILES: Record<HeroKind, string> = { knight: '/models/sf/warrior.glb', runner: '/models/sf/runner.glb' };

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
	runner: {
		Idle: 'rig|idle_gun',
		Walking_A: 'rig|walking_in_place',
		Running_A: 'rig|running_in_place',
		Jump_Full_Short: 'rig|jump',
		Hit_A: 'rig|idle',
		Cheer: 'rig|idle',
		Interact: 'rig|idle',
		'1H_Ranged_Shoot': 'rig|pointing_gun_forward',
	},
};
const ONCE = ['Cheer', 'Interact', 'Jump_Full_Short', '1H_Melee_Attack_Slice_Diagonal', '1H_Ranged_Shoot', 'Hit_A'];
const HEIGHT: Partial<Record<HeroKind, number>> = { knight: 2.3, runner: 1.85 };
/** The warrior was exported facing -Z: turn it so it looks where it walks. */
const FACING: Partial<Record<HeroKind, number>> = { knight: Math.PI };
useGLTF.preload(FILES.knight);
useGLTF.preload('/models/pistol.glb');

/** Pistol in the runner's right hand bone (local space, tuned against the gun-pointing pose). */
const GUN_GRIP = { pos: [0, 0.09, 0.03] as [number, number, number], rot: [0, Math.PI / 2, Math.PI / 2] as [number, number, number], length: 0.32 };

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
			m.material = (m.material as THREE.MeshStandardMaterial).clone();
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
			const hand = clone.getObjectByName('hand_R_074');
			if (hand) {
				const gun = new THREE.Group();
				const g = pistol.clone(true);
				g.traverse((o) => {
					const gm = o as THREE.Mesh;
					if (gm.isMesh) gm.castShadow = true;
				});
				const box = new THREE.Box3().setFromObject(g);
				const size = box.getSize(new THREE.Vector3());
				g.position.sub(box.getCenter(new THREE.Vector3()));
				gun.add(g);
				clone.updateMatrixWorld(true);
				const ws = hand.getWorldScale(new THREE.Vector3()).x;
				gun.scale.setScalar(GUN_GRIP.length / Math.max(size.x, size.y, size.z) / ws);
				gun.rotation.set(...GUN_GRIP.rot);
				gun.position.set(...GUN_GRIP.pos).multiplyScalar(1 / ws);
				gun.name = 'gun';
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

	// a new hero brings new actions: forget what the previous one was playing
	useEffect(() => {
		current.current = null;
		playing.current = null;
	}, [actions]);

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
