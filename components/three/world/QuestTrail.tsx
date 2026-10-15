'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

import { game } from '@/lib/game-store';
import { player } from '@/lib/player-state';
import { QUESTS } from '@/lib/quests';
import { landmark } from '@/lib/world';
import { groundAt } from './Player';

/**
 * Where the story wants the visitor to go next: the nearest objective of the active quest, else the NPC to hand
 * a quest in to, else the next quest giver. In the other realm, the portal leads there.
 */
function nextTarget(): { x: number; z: number } | null {
	const g = game.get();
	const here = g.zone;
	const pick = (ids: string[]) => {
		const places = ids.map((id) => landmark(id));
		const local = places.filter((l) => l.zone === here);
		if (local.length === 0) return places.length ? landmark(here === 'val' ? 'portal' : 'portal-back') : null;
		return local.reduce((a, b) => (Math.hypot(a.x - player.x, a.z - player.z) < Math.hypot(b.x - player.x, b.z - player.z) ? a : b));
	};
	for (const q of QUESTS) {
		const st = g.quests[q.id];
		if (st === 'active') {
			const left = q.objectives.map((o) => o.id).filter((id) => !g.visited.includes(id));
			if (left.length) return pick(left);
			return pick([q.turnIn]);
		}
		if (st === 'ready') return pick([q.turnIn]);
	}
	const avail = QUESTS.find((q) => g.quests[q.id] === 'available');
	return avail ? pick([avail.giver]) : null;
}

const DOTS = 26;
const STEP = 1.7;

/** A dotted, softly pulsing golden trail on the ground, from the hero toward the next goal. */
export function QuestTrail() {
	const mesh = useRef<THREE.InstancedMesh>(null);
	const geo = useMemo(() => new THREE.CircleGeometry(0.16, 12).rotateX(-Math.PI / 2), []);
	const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#ffd36b', transparent: true, opacity: 0.85, depthWrite: false, toneMapped: false }), []);
	const m = useMemo(() => new THREE.Matrix4(), []);
	const p = useMemo(() => new THREE.Vector3(), []);
	const q = useMemo(() => new THREE.Quaternion(), []);
	const sc = useMemo(() => new THREE.Vector3(), []);
	useFrame(({ clock }) => {
		const im = mesh.current;
		if (!im) return;
		const g = game.get();
		const target = g.started && !g.panel ? nextTarget() : null;
		const dx = target ? target.x - player.x : 0;
		const dz = target ? target.z - player.z : 0;
		const dist = Math.hypot(dx, dz);
		// hidden once the goal is close: the "?" and the E prompt take over
		if (!target || dist < 9) {
			im.visible = false;
			return;
		}
		im.visible = true;
		const ux = dx / dist;
		const uz = dz / dist;
		const t = clock.elapsedTime;
		const shown = Math.min(DOTS, Math.floor((dist - 6) / STEP));
		for (let i = 0; i < DOTS; i++) {
			// dots start a little ahead of the hero and travel toward the goal
			const d = 2.2 + ((i + ((t * 1.4) % 1)) * STEP);
			const x = player.x + ux * d;
			const z = player.z + uz * d;
			const y = (g.zone === 'val' ? groundAt(x, z) : 0) + 0.3;
			const fade = i < shown ? 1 - i / (shown + 4) : 0;
			const pulse = 0.75 + 0.25 * Math.sin(t * 4 - i * 0.6);
			im.setMatrixAt(i, m.compose(p.set(x, y, z), q, sc.setScalar(fade * pulse)));
		}
		im.instanceMatrix.needsUpdate = true;
	});
	return <instancedMesh ref={mesh} args={[geo, mat, DOTS]} frustumCulled={false} renderOrder={2} />;
}
