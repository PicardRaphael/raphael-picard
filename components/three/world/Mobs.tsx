'use client';

import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

import { game } from '@/lib/game-store';
import { type Mob, type MobState, mobs } from '@/lib/mobs';
import { player } from '@/lib/player-state';
import { groundAt } from './Player';

const URL = '/models/skeleton.glb';
useGLTF.preload(URL);

const ANIM: Record<MobState, string> = {
	idle: 'Idle',
	walk: 'Walking_A',
	chase: 'Walking_A',
	attack: '1H_Melee_Attack_Chop',
	hit: 'Hit_A',
	dead: 'Death_A',
};

/** Name plate + health bar drawn on a canvas sprite. */
function useLabel(name: string, nexus: boolean) {
	return useMemo(() => {
		const c = document.createElement('canvas');
		c.width = 512;
		c.height = 128;
		const tex = new THREE.CanvasTexture(c);
		tex.colorSpace = THREE.SRGBColorSpace;
		const draw = (hp: number, max: number) => {
			const ctx = c.getContext('2d');
			if (!ctx) return;
			ctx.clearRect(0, 0, 512, 128);
			ctx.font = '800 46px sans-serif';
			ctx.textAlign = 'center';
			ctx.lineWidth = 8;
			ctx.strokeStyle = 'rgba(0,0,0,0.85)';
			ctx.strokeText(name, 256, 52);
			ctx.fillStyle = nexus ? '#f472b6' : '#ff5a4f';
			ctx.fillText(name, 256, 52);
			ctx.fillStyle = 'rgba(0,0,0,0.75)';
			ctx.fillRect(136, 76, 240, 22);
			ctx.fillStyle = '#e11d48';
			ctx.fillRect(140, 80, 232 * (hp / max), 14);
			tex.needsUpdate = true;
		};
		return { tex, draw };
	}, [name, nexus]);
}

function MobUnit({ mob }: { mob: Mob }) {
	const { scene, animations } = useGLTF(URL);
	const nexus = mob.zone === 'nexus';
	const model = useMemo(() => {
		const clone = SkeletonUtils.clone(scene) as THREE.Group;
		clone.traverse((o) => {
			const m = o as THREE.Mesh;
			if (!m.isMesh) return;
			m.castShadow = true;
			m.frustumCulled = false;
			const mat = (m.material as THREE.MeshStandardMaterial).clone();
			// a cursed glow: green in the valley, neon pink in the Nexus
			mat.emissive = new THREE.Color(nexus ? '#db2777' : '#16a34a');
			mat.emissiveIntensity = 0.35;
			m.material = mat;
		});
		return clone;
	}, [scene, nexus]);
	const group = useRef<THREE.Group>(null);
	const mixer = useMemo(() => new THREE.AnimationMixer(model), [model]);
	const actions = useMemo(() => Object.fromEntries(animations.map((a) => [a.name, mixer.clipAction(a)])), [animations, mixer]);
	const label = useLabel(mob.name, nexus);
	const sprite = useRef<THREE.Sprite>(null);
	const v = useRef({ anim: '', hp: -1 });

	useEffect(() => {
		label.draw(mob.hp, mob.maxHp);
		return () => {
			mixer.stopAllAction();
		};
	}, [label, mixer, mob]);

	useFrame((_, delta) => {
		const dt = Math.min(delta, 1 / 20);
		const g = group.current;
		if (!g) return;
		const zone = game.get().zone;
		g.visible = zone === mob.zone;
		if (!g.visible) return;
		mob.t += dt;
		mob.cooldown = Math.max(0, mob.cooldown - dt);
		const dp = Math.hypot(player.x - mob.x, player.z - mob.z);

		// simple AI: wander near home, chase and swing when the player comes close
		switch (mob.state) {
			case 'idle':
				if (dp < 11) mob.state = 'chase';
				else if (mob.t > 3) {
					mob.tx = mob.homeX + (Math.random() - 0.5) * 14;
					mob.tz = mob.homeZ + (Math.random() - 0.5) * 14;
					mob.state = 'walk';
					mob.t = 0;
				}
				break;
			case 'walk': {
				if (dp < 11) mob.state = 'chase';
				const d = Math.hypot(mob.tx - mob.x, mob.tz - mob.z);
				if (d < 0.5 || mob.t > 6) {
					mob.state = 'idle';
					mob.t = 0;
				} else {
					mob.x += ((mob.tx - mob.x) / d) * 1.6 * dt;
					mob.z += ((mob.tz - mob.z) / d) * 1.6 * dt;
					mob.yaw = Math.atan2(mob.tx - mob.x, mob.tz - mob.z);
				}
				break;
			}
			case 'chase':
				mob.yaw = Math.atan2(player.x - mob.x, player.z - mob.z);
				if (dp > 16 || Math.hypot(mob.x - mob.homeX, mob.z - mob.homeZ) > 22) {
					mob.state = 'walk';
					mob.tx = mob.homeX;
					mob.tz = mob.homeZ;
					mob.t = 0;
				} else if (dp < 2.2 && mob.cooldown === 0) {
					mob.state = 'attack';
					mob.t = 0;
					mob.cooldown = 2.2;
				} else if (dp > 2) {
					mob.x += ((player.x - mob.x) / dp) * 3.2 * dt;
					mob.z += ((player.z - mob.z) / dp) * 3.2 * dt;
				}
				break;
			case 'attack':
				mob.yaw = Math.atan2(player.x - mob.x, player.z - mob.z);
				if (mob.t > 0.55 && mob.t - dt <= 0.55 && dp < 2.8) window.dispatchEvent(new CustomEvent('player:hit'));
				if (mob.t > 1.1) {
					mob.state = 'chase';
					mob.t = 0;
				}
				break;
			case 'hit':
				if (mob.t > 0.5) {
					mob.state = mob.hp <= 0 ? 'dead' : 'chase';
					mob.t = 0;
				}
				break;
			case 'dead':
				if (mob.t > 18) {
					// respawn at home
					mob.hp = mob.maxHp;
					mob.x = mob.homeX;
					mob.z = mob.homeZ;
					mob.state = 'idle';
					mob.t = 0;
				}
				break;
		}

		const anim = mob.state === 'hit' && mob.hp <= 0 ? 'Death_A' : ANIM[mob.state];
		if (anim !== v.current.anim) {
			const next = actions[anim];
			const prev = actions[v.current.anim];
			if (next) {
				next.reset();
				if (anim === 'Death_A' || anim === 'Hit_A' || anim === '1H_Melee_Attack_Chop') {
					next.setLoop(THREE.LoopOnce, 1);
					next.clampWhenFinished = true;
				}
				next.fadeIn(0.15).play();
			}
			prev?.fadeOut(0.15);
			v.current.anim = anim;
		}
		if (mob.hp !== v.current.hp) {
			v.current.hp = mob.hp;
			label.draw(Math.max(mob.hp, 0), mob.maxHp);
		}
		mixer.update(dt);
		g.position.set(mob.x, groundAt(mob.x, mob.z), mob.z);
		g.rotation.y = mob.yaw;
		if (sprite.current) sprite.current.visible = mob.state !== 'dead' || mob.t < 1.5;
	});

	return (
		<group ref={group}>
			<primitive object={model} />
			<sprite ref={sprite} position={[0, 3.1, 0]} scale={[3.2, 0.8, 1]}>
				<spriteMaterial map={label.tex} transparent depthWrite={false} />
			</sprite>
		</group>
	);
}

export function Mobs() {
	return (
		<>
			{mobs.map((m) => (
				<MobUnit key={m.id} mob={m} />
			))}
		</>
	);
}
