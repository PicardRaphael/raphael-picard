'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';

import { game } from '@/lib/game-store';
import { mobs } from '@/lib/mobs';
import { player } from '@/lib/player-state';
import { groundAt } from '@/lib/world';

/**
 * Soft dark discs under the hero and the bugs when real-time shadows are off (phones, small screens): without
 * them, characters float over the ground. One instanced quad, no light, nothing at all when shadows are on.
 */
const MAX = 1 + 24;
/** Bugs further than this from the hero get no disc (hardly visible, and spares the update). */
const RANGE = 45;

function discTexture() {
	const c = document.createElement('canvas');
	c.width = c.height = 64;
	const ctx = c.getContext('2d');
	if (ctx) {
		const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
		g.addColorStop(0, 'rgba(0,0,0,0.6)');
		g.addColorStop(0.55, 'rgba(0,0,0,0.32)');
		g.addColorStop(1, 'rgba(0,0,0,0)');
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, 64, 64);
	}
	return new THREE.CanvasTexture(c);
}

function Discs() {
	const mesh = useMemo(() => {
		const geo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
		// drawn over the ground, never fighting with it, never writing depth (the hero and the bugs stay on top)
		const mat = new THREE.MeshBasicMaterial({ map: discTexture(), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
		const m = new THREE.InstancedMesh(geo, mat, MAX);
		m.count = 0;
		m.frustumCulled = false;
		m.renderOrder = 1;
		return m;
	}, []);
	useEffect(
		() => () => {
			mesh.geometry.dispose();
			(mesh.material as THREE.MeshBasicMaterial).map?.dispose();
			(mesh.material as THREE.Material).dispose();
			mesh.dispose();
		},
		[mesh],
	);
	const tmp = useMemo(() => new THREE.Matrix4(), []);
	useFrame(() => {
		const zone = game.get().zone;
		let n = 0;
		const put = (x: number, z: number, size: number) => {
			const y = groundAt(x, z) + 0.05;
			tmp.makeScale(size, 1, size).setPosition(x, y, z);
			mesh.setMatrixAt(n++, tmp);
		};
		// the hero: the disc shrinks as he leaves the ground
		const lift = Math.max(0, player.y - groundAt(player.x, player.z));
		put(player.x, player.z, 1.5 / (1 + lift * 0.35));
		for (const m of mobs) {
			if (n >= MAX) break;
			if (m.zone !== zone || (m.state === 'dead' && m.t > 2)) continue;
			if (Math.hypot(m.x - player.x, m.z - player.z) > RANGE) continue;
			put(m.x, m.z, m.zone === 'nexus' ? 1.7 : 1.5);
		}
		mesh.count = n;
		mesh.instanceMatrix.clearUpdateRanges();
		mesh.instanceMatrix.addUpdateRange(0, n * 16);
		mesh.instanceMatrix.needsUpdate = true;
	});
	return <primitive object={mesh} />;
}

export function BlobShadows() {
	const shadows = useThree((s) => s.gl.shadowMap.enabled);
	return shadows ? null : <Discs />;
}
