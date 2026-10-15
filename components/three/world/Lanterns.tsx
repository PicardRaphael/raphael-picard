'use client';

import { useFrame } from '@react-three/fiber';
import { Suspense, useMemo, useRef } from 'react';
import * as THREE from 'three';

import { player } from '@/lib/player-state';
import { HOUSES, LAKE, LANDMARKS, PATHS, landmark, valHeight } from '@/lib/world';
import { SfModel } from './SfModel';

/**
 * Street lamps along the roads ("Stylized Street Lamp" by lazarys, Sketchfab, CC BY 4.0: a timber post with a
 * hanging lantern, the arm reaching over the road) and warm lights on the key buildings.
 */
const LAMP_H = 4.4;
// the hanging lantern, relative to the model's centred base (model units scaled to LAMP_H)
const LANTERN: [number, number, number] = [0.5, 2.95, 0.08];
const POOL = 8;

/** Soft round halo drawn once, shared by every lantern. */
let haloTex: THREE.Texture | null = null;
function halo() {
	if (haloTex) return haloTex;
	const c = document.createElement('canvas');
	c.width = c.height = 64;
	const ctx = c.getContext('2d');
	if (ctx) {
		const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
		g.addColorStop(0, 'rgba(255,220,150,1)');
		g.addColorStop(0.3, 'rgba(255,170,70,0.45)');
		g.addColorStop(1, 'rgba(255,140,40,0)');
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, 64, 64);
	}
	haloTex = new THREE.CanvasTexture(c);
	return haloTex;
}

/**
 * The light count never changes (a change recompiles every shader): lights are switched off by intensity,
 * never unmounted or hidden — also when the hero is in the Nexus (`on` false).
 */
export function Lanterns({ night, on = true }: { night: number; on?: boolean }) {
	const spots = useMemo(() => {
		const list: { x: number; z: number; rot: number }[] = [];
		for (const line of PATHS) {
			for (let i = 0; i < line.length - 1; i++) {
				const [ax, az] = line[i];
				const [bx, bz] = line[i + 1];
				const len = Math.hypot(bx - ax, bz - az);
				const n = Math.floor(len / 14);
				for (let k = 1; k <= n; k++) {
					const t = k / (n + 1);
					// offset to the side of the road
					const nx = -(bz - az) / len;
					const nz = (bx - ax) / len;
					// the arm (model +X) points back over the road
					list.push({ x: ax + (bx - ax) * t + nx * 3.2, z: az + (bz - az) * t + nz * 3.2, rot: Math.atan2(nz, -nx) });
				}
			}
		}
		// never inside a house, a landmark or the lake
		return list.filter(
			(p) =>
				HOUSES.every((h) => Math.hypot(p.x - h.x, p.z - h.z) > h.c + 2.5) &&
				LANDMARKS.every((l) => l.zone !== 'val' || Math.hypot(p.x - l.x, p.z - l.z) > l.radius + (l.id === 'portal' ? 10 : 3)) &&
				Math.hypot(p.x - LAKE.x, p.z - LAKE.z) > LAKE.r + 2,
		);
	}, []);

	// a few real lights on the places that matter; the rest are emissive only
	const keyLights = useMemo(() => {
		const ids = ['forge', 'tower', 'raphy', 'stones'];
		const pts = ids.map((id) => {
			const l = landmark(id);
			return { x: l.x + 3, z: l.z + 3 };
		});
		const tavern = HOUSES[1];
		if (tavern) pts.push({ x: tavern.x + 4, z: tavern.z + 4 });
		return pts;
	}, []);

	const glow = 0.6 + night * 3.4;
	const lampMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ffd59a', emissive: '#ffb347', emissiveIntensity: glow, toneMapped: false }), [glow]);
	const haloMat = useMemo(() => new THREE.SpriteMaterial({ map: halo(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.25 + night * 0.75 }), [night]);

	// world position of every hanging lantern
	const bulbs = useMemo(
		() =>
			spots.map((s) => {
				const c = Math.cos(s.rot);
				const sn = Math.sin(s.rot);
				return new THREE.Vector3(s.x + LANTERN[0] * c + LANTERN[2] * sn, valHeight(s.x, s.z) - 0.1 + LANTERN[1], s.z - LANTERN[0] * sn + LANTERN[2] * c);
			}),
		[spots],
	);
	// a small pool of real lights follows the lanterns nearest to the hero
	const pool = useRef<(THREE.PointLight | null)[]>([]);
	const tick = useRef(0);
	useFrame((_, dt) => {
		tick.current -= dt;
		if (tick.current > 0) return;
		tick.current = 0.25;
		const near = bulbs
			.map((b, i) => ({ i, d: (b.x - player.x) ** 2 + (b.z - player.z) ** 2 }))
			.sort((a, b) => a.d - b.d)
			.slice(0, POOL);
		pool.current.forEach((l, k) => {
			if (!l) return;
			const n = near[k];
			l.intensity = n && on ? 6 + night * 34 : 0;
			if (n) l.position.copy(bulbs[n.i]);
		});
	});

	return (
		<group>
			<Suspense fallback={null}>
				{spots.map((s, i) => (
					<group key={i} position={[s.x, valHeight(s.x, s.z) - 0.1, s.z]} rotation={[0, s.rot, 0]}>
						<SfModel file="street_lamp" height={LAMP_H} />
						<mesh position={LANTERN} material={lampMat}>
							<sphereGeometry args={[0.13, 10, 8]} />
						</mesh>
						<sprite position={LANTERN} scale={[2.2, 2.2, 1]} material={haloMat} />
					</group>
				))}
			</Suspense>
			{Array.from({ length: POOL }, (_, k) => (
				<pointLight
					key={k}
					ref={(l) => {
						pool.current[k] = l;
					}}
					color="#ffb45c"
					intensity={0}
					distance={14}
					decay={1.5}
				/>
			))}
			{keyLights.map((p, i) => (
				<pointLight key={i} position={[p.x, valHeight(p.x, p.z) + 4, p.z]} color="#ffb347" intensity={on && night > 0.2 ? 40 * night : 0} distance={22} decay={1.6} />
			))}
		</group>
	);
}
