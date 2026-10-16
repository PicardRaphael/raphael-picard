'use client';

import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

import { game, useGame } from '@/lib/game-store';
import { type Mob, type MobState, mobs } from '@/lib/mobs';
import { player } from '@/lib/player-state';
import { HOUSES, LAKE, nexusWalkable } from '@/lib/world';
import { groundAt } from './Player';
import { Warmup } from './Warmup';

/** Valley bugs are KayKit skeletons (CC0); Nexus bugs are Quaternius sci-fi robots (CC0, PBR textures). */
type Kind = { url: string; height: number; hover: number; once: string[]; anim: Record<MobState, string> };
const KINDS: Record<'bones' | 'drone' | 'quadshell' | 'trilobite', Kind> = {
	// hand-painted Sketchfab monster (CC BY 4.0): Skelet_warrior by uchaikineugene
	bones: {
		url: '/models/sf/skeleton_warrior.glb',
		height: 2.2,
		hover: 0,
		once: ['rig|Attack_1', 'rig|Dead'],
		anim: { idle: 'rig|Idel', walk: 'rig|Walck', chase: 'rig|Run', attack: 'rig|Attack_1', hit: 'rig|Idel', dead: 'rig|Dead' },
	},
	drone: {
		url: '/models/drone.glb',
		height: 1.3,
		hover: 1.6,
		once: ['Attack', 'Hit', 'BackFlip'],
		anim: { idle: 'Idle', walk: 'Look', chase: 'Charging', attack: 'Attack', hit: 'Hit', dead: 'BackFlip' },
	},
	quadshell: {
		url: '/models/quadshell.glb',
		height: 1.7,
		hover: 0,
		once: ['Attack', 'Hit', 'TurnOff'],
		anim: { idle: 'Idle', walk: 'Walk', chase: 'Run', attack: 'Attack', hit: 'Hit', dead: 'TurnOff' },
	},
	trilobite: {
		url: '/models/trilobite.glb',
		height: 2.2,
		hover: 0,
		once: ['Attack', 'Hit', 'TurnOff'],
		anim: { idle: 'Idle', walk: 'Walk', chase: 'Run', attack: 'Attack', hit: 'Hit', dead: 'TurnOff' },
	},
};
// only the val's skeletons hold up the start screen: the Nexus robots are fetched once the val is ready (see Mobs)
useGLTF.preload(KINDS.bones.url);
const ROBOTS = ['drone', 'quadshell', 'trilobite'] as const;
/** Lake and houses as circles monsters cannot enter. */
const MOB_BLOCKERS = [{ x: LAKE.x, z: LAKE.z, r: LAKE.r + 1.5 }, ...HOUSES.map((h) => ({ x: h.x, z: h.z, r: h.c + 0.5 }))];
const kindOf = (mob: Mob) => (mob.zone === 'nexus' ? ROBOTS[mob.id % ROBOTS.length] : 'bones');

/**
 * A hidden subtree skips its world-matrix update: three.js walks every node each frame, visible or not, and one
 * val skeleton alone is ~400 bones (11 of them were most of the scene's 5,600 nodes). Nothing moves a hidden bug,
 * and the first visible frame recomputes everything (updateMatrix always flags the world matrix).
 */
function skipWhenHidden(o: THREE.Object3D) {
	const update = THREE.Object3D.prototype.updateMatrixWorld;
	o.updateMatrixWorld = function (force?: boolean) {
		if (this.visible) update.call(this, force);
	};
}

/** Camera frustum, rebuilt once per rendered frame and shared by every bug. */
const view = { frustum: new THREE.Frustum(), m: new THREE.Matrix4(), sphere: new THREE.Sphere(), frame: -1 };
function inView(camera: THREE.Camera, frame: number, x: number, y: number, z: number, r: number) {
	if (view.frame !== frame) {
		view.frame = frame;
		view.frustum.setFromProjectionMatrix(view.m.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
	}
	view.sphere.center.set(x, y, z);
	view.sphere.radius = r;
	return view.frustum.intersectsSphere(view.sphere);
}
/** Beyond this distance a bug is a few pixels tall (and past the fog's thick part): not drawn, not animated. */
const DRAW_DIST = { val: 100, nexus: 120 } as const;

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
	const kind = KINDS[kindOf(mob)];
	const { scene, animations } = useGLTF(kind.url);
	const nexus = mob.zone === 'nexus';
	const model = useMemo(() => {
		const clone = SkeletonUtils.clone(scene) as THREE.Group;
		clone.traverse((o) => {
			const m = o as THREE.Mesh;
			if (!m.isMesh) return;
			m.castShadow = true;
			m.frustumCulled = false;
			const mat = (m.material as THREE.MeshStandardMaterial).clone();
			mat.emissive = new THREE.Color('#000000');
			// every monster keeps its own colours (a red flash only marks a hit)
			mat.emissiveIntensity = 0;
			m.material = mat;
		});
		if (kind.height) {
			const box = new THREE.Box3().setFromObject(clone);
			clone.scale.setScalar(kind.height / Math.max(box.max.y - box.min.y, 0.01));
		}
		skipWhenHidden(clone);
		return clone;
	}, [scene, kind]);
	const group = useRef<THREE.Group>(null);
	const mixer = useMemo(() => new THREE.AnimationMixer(model), [model]);
	const actions = useMemo(() => Object.fromEntries(animations.map((a) => [a.name, mixer.clipAction(a)])), [animations, mixer]);
	const label = useLabel(mob.name, nexus);
	const sprite = useRef<THREE.Sprite>(null);
	const v = useRef({ anim: '', hp: -1, flash: 0, shadow: true });
	useEffect(() => {
		if (group.current) skipWhenHidden(group.current);
	}, []);

	useEffect(() => {
		label.draw(mob.hp, mob.maxHp);
		return () => {
			mixer.stopAllAction();
		};
	}, [label, mixer, mob]);

	useFrame((state, delta) => {
		const dt = Math.min(delta, 1 / 20);
		const g = group.current;
		if (!g) return;
		const zone = game.get().zone;
		g.visible = zone === mob.zone;
		if (!g.visible) return;
		mob.t += dt;
		const s = game.get();
		const calm = s.panel !== null || s.overlay !== null || s.warp !== null;
		mob.cooldown = calm ? Math.max(mob.cooldown, 1.5) : Math.max(0, mob.cooldown - dt);
		const dp = Math.hypot(player.x - mob.x, player.z - mob.z);

		// monsters stay on dry land and outside the houses: pushed back to the edge, and they stop wandering there
		if (mob.zone === 'val') {
			for (const o of MOB_BLOCKERS) {
				const ox = mob.x - o.x;
				const oz = mob.z - o.z;
				const od = Math.hypot(ox, oz);
				if (od < o.r && od > 1e-3) {
					mob.x = o.x + (ox / od) * o.r;
					mob.z = o.z + (oz / od) * o.r;
					if (mob.state === 'walk') {
						mob.state = 'idle';
						mob.t = 0;
					}
				}
			}
		}

		// Nexus bugs stay in the streets
		if (mob.zone === 'nexus' && !nexusWalkable(mob.x, mob.z)) {
			mob.x += (mob.homeX - mob.x) * 0.2;
			mob.z += (mob.homeZ - mob.z) * 0.2;
			if (mob.state === 'walk') {
				mob.state = 'idle';
				mob.t = 0;
			}
		}

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
				if (!calm && mob.t > 0.55 && mob.t - dt <= 0.55 && dp < 2.8) window.dispatchEvent(new CustomEvent('player:hit'));
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

		const anim = mob.state === 'hit' && mob.hp <= 0 ? kind.anim.dead : kind.anim[mob.state];
		if (anim !== v.current.anim) {
			const next = actions[anim];
			const prev = actions[v.current.anim];
			if (next) {
				next.reset();
				if (kind.once.includes(anim)) {
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
		// off-screen or far bugs are not drawn (their skinned meshes are never culled by three.js): no skeleton
		// update, no bone upload, no draw call. The sphere is wide enough to keep a bug whose shadow enters the view.
		const seen = dp < DRAW_DIST[mob.zone] && inView(state.camera, state.clock.elapsedTime, mob.x, groundAt(mob.x, mob.z) + 1.2 + kind.hover, mob.z, 4);
		model.visible = seen;
		// far bugs: no skinning update and no shadow (CPU and shadow-map cost on phones)
		const close = dp < 45;
		if (dp < 70 && seen) mixer.update(dt);
		if (close !== v.current.shadow) {
			v.current.shadow = close;
			model.traverse((o) => {
				if ((o as THREE.Mesh).isMesh) o.castShadow = close;
			});
		}
		// corpses stay solid for 2 s, then sink into the ground before respawning later
		const sink = mob.state === 'dead' && mob.t > 2 ? (mob.t - 2) * 0.9 : 0;
		// a blow shoves the bug back and flashes it red for a moment
		const struck = mob.state === 'hit' && mob.t < 0.25;
		if (struck) {
			const kx = mob.x - player.x;
			const kz = mob.z - player.z;
			const kd = Math.hypot(kx, kz) || 1;
			mob.x += (kx / kd) * 6 * dt;
			mob.z += (kz / kd) * 6 * dt;
		}
		const flash = mob.state === 'hit' ? Math.max(0, 1 - mob.t * 4) : 0;
		if (flash !== v.current.flash) {
			v.current.flash = flash;
			model.traverse((o) => {
				const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
				if (!m?.emissive) return;
				m.emissive.set(flash > 0 ? '#ff2a2a' : '#000000');
				m.emissiveIntensity = flash > 0 ? flash * 1.2 : 0;
			});
		}
		g.position.set(mob.x, groundAt(mob.x, mob.z) - sink + kind.hover + (kind.hover ? Math.sin(mob.t * 2.4) * 0.2 : 0), mob.z);
		if (mob.state === 'dead' && mob.t > 4.5) g.visible = false;
		g.rotation.y = mob.yaw;
		if (sprite.current) {
			// name plates: hidden by walls, readable from afar (the Nexus avenue is long): full up to 48 m (val 33 m), gone 12 m further
			const d = state.camera.position.distanceTo(g.position);
			const k = THREE.MathUtils.clamp(d / 14, 0.45, 3.2);
			sprite.current.scale.set(3.2 * k, 0.8 * k, 1);
			sprite.current.position.y = 2.6 + 0.5 * k;
			const far = mob.zone === 'nexus' ? 60 : 45;
			const near = mob.state === 'chase' || mob.state === 'attack' ? 1 : THREE.MathUtils.clamp((far - d) / 12, 0, 1);
			(sprite.current.material as THREE.SpriteMaterial).opacity = near;
			sprite.current.visible = near > 0 && (mob.state !== 'dead' || mob.t < 1.5);
		}
	});

	return (
		<group ref={group}>
			<primitive object={model} />
			<sprite ref={sprite} position={[0, 3.1, 0]} scale={[3.2, 0.8, 1]} renderOrder={20}>
				<spriteMaterial map={label.tex} transparent depthWrite={false} toneMapped={false} />
			</sprite>
		</group>
	);
}

/** The val's bugs load with the val; the Nexus robots, 600 m away, only once it is playable (their own boundary). */
export function Mobs() {
	const ready = useGame((s) => s.ready);
	return (
		<>
			{mobs
				.filter((m) => m.zone !== 'nexus')
				.map((m) => (
					<MobUnit key={m.id} mob={m} />
				))}
			{ready && (
				<Suspense fallback={null}>
					{mobs
						.filter((m) => m.zone === 'nexus')
						.map((m) => (
							<MobUnit key={m.id} mob={m} />
						))}
					<Warmup />
				</Suspense>
			)}
		</>
	);
}
