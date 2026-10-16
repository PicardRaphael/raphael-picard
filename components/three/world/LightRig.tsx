'use client';

import { useFrame } from '@react-three/fiber';
import type { ThreeElements } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

import { game } from '@/lib/game-store';
import { player } from '@/lib/player-state';

/**
 * Every point light of the world shares ONE fixed pool of real lights. Each light of a standard material costs
 * per pixel, every frame, wherever it is: 27 lights always mounted made each pixel of the val loop over 27 lights.
 * Lamps, lanterns, gates and kiosks now only declare where a light would be ("candidates"); the pool follows the
 * ones that matter for the current realm and the hero's surroundings, fading a light out before it moves and in
 * after, so nothing pops.
 *
 * The light count never changes (a change recompiles every shader): the pool is mounted once, outside any
 * Suspense boundary, and unused lights are switched off by intensity, never unmounted.
 */
export const RIG_SIZE = 8;

export type RigCandidate = {
	/** World position (updated from `object` when there is one). */
	pos: THREE.Vector3;
	color: THREE.Color;
	intensity: number;
	distance: number;
	decay: number;
	object?: THREE.Object3D;
};

const candidates = new Set<RigCandidate>();

/** Registers static candidates; returns the unregister function. */
export function addRigLights(list: RigCandidate[]) {
	list.forEach((c) => candidates.add(c));
	return () => list.forEach((c) => candidates.delete(c));
}

/** The realm a world position belongs to (same rule as the player's). */
const realmOf = (z: number) => (z < -300 ? 'nexus' : 'val');

/**
 * Drop-in for `<pointLight>`: a light at this place in the scene graph, lit by the shared pool.
 * `decay` defaults to three.js' physical 2, like `<pointLight>`.
 */
export function RigLight({ color = '#ffffff', intensity = 1, distance = 0, decay = 2, ...props }: { color?: THREE.ColorRepresentation; intensity?: number; distance?: number; decay?: number } & ThreeElements['object3D']) {
	const ref = useRef<THREE.Object3D>(null);
	const cand = useMemo<RigCandidate>(() => ({ pos: new THREE.Vector3(), color: new THREE.Color(), intensity: 0, distance: 0, decay: 2 }), []);
	useLayoutEffect(() => {
		cand.color.set(color);
		cand.intensity = intensity;
		cand.distance = distance;
		cand.decay = decay;
	}, [cand, color, intensity, distance, decay]);
	useLayoutEffect(() => {
		const o = ref.current;
		if (!o) return;
		// world position right away (parents included): never lit at the origin before the first render
		o.updateWorldMatrix(true, false);
		o.getWorldPosition(cand.pos);
		cand.object = o;
		candidates.add(cand);
		return () => {
			candidates.delete(cand);
		};
	}, [cand]);
	return <object3D ref={ref} {...props} />;
}

type Slot = { c: RigCandidate | null; w: number };

export function LightRig() {
	const lights = useRef<(THREE.PointLight | null)[]>([]);
	const slots = useMemo<Slot[]>(() => Array.from({ length: RIG_SIZE }, () => ({ c: null, w: 0 })), []);
	const state = useMemo(() => ({ tick: 0, want: new Set<RigCandidate>(), ranked: [] as { c: RigCandidate; s: number }[] }), []);
	useFrame(({ camera }, delta) => {
		const dt = Math.min(delta, 0.1);
		state.tick -= dt;
		if (state.tick <= 0) {
			state.tick = 0.2;
			const zone = game.get().zone;
			const assigned = new Set(slots.map((s) => s.c));
			const ranked = state.ranked;
			ranked.length = 0;
			for (const c of candidates) {
				if (c.object) c.object.getWorldPosition(c.pos);
				if (c.intensity <= 0 || c.distance <= 0 || realmOf(c.pos.z) !== zone) continue;
				// how far the light's reach is from what the visitor looks at (the hero and the camera)
				const d = Math.min(c.pos.distanceTo(camera.position), Math.hypot(c.pos.x - player.x, c.pos.y - player.y, c.pos.z - player.z));
				let s = d / c.distance;
				if (s > 2) continue;
				// hysteresis: a lit light keeps its slot against a barely closer one
				if (assigned.has(c)) s *= 0.8;
				ranked.push({ c, s });
			}
			ranked.sort((a, b) => a.s - b.s);
			state.want.clear();
			for (let i = 0; i < Math.min(RIG_SIZE, ranked.length); i++) state.want.add(ranked[i].c);
		}
		// fade out what is no longer wanted, then give the free slot to a wanted light and fade it in
		const taken = new Set(slots.map((s) => s.c));
		for (let k = 0; k < RIG_SIZE; k++) {
			const slot = slots[k];
			if (slot.c && state.want.has(slot.c)) slot.w = Math.min(1, slot.w + dt * 3);
			else {
				slot.w = Math.max(0, slot.w - dt * 4);
				if (slot.w === 0) {
					if (slot.c) taken.delete(slot.c);
					slot.c = null;
					for (const c of state.want) {
						if (!taken.has(c)) {
							slot.c = c;
							taken.add(c);
							break;
						}
					}
				}
			}
			const l = lights.current[k];
			if (!l) continue;
			const c = slot.c;
			if (!c) {
				l.intensity = 0;
				continue;
			}
			// lights carried by something that moves (the runner's glow) follow it every frame
			if (c.object) c.object.getWorldPosition(c.pos);
			l.position.copy(c.pos);
			l.color.copy(c.color);
			l.distance = c.distance;
			l.decay = c.decay;
			l.intensity = c.intensity * slot.w;
		}
	});
	return (
		<>
			{slots.map((_, k) => (
				<pointLight
					key={k}
					ref={(l) => {
						lights.current[k] = l;
					}}
					intensity={0}
					distance={10}
				/>
			))}
		</>
	);
}
