'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

import { NEXUS_CENTER, NEXUS_LAMPS } from '@/lib/world';

const LIGHT_COLORS = ['#ff4fd8', '#5ef2ff', '#ffb45c', '#b18cff'];
/** The 8 real point lights sit in 8 of the lamp heads, spread along the avenue (the light count never changes). */
const LIT = Array.from({ length: 8 }, (_, k) => Math.round((k * (NEXUS_LAMPS.length - 1)) / 7));
/** Lamp heads of slightly different whites, like real streets. */
const HEAD_TINTS = ['#e8f6ff', '#ffe6c4', '#dcd0ff', '#cff7ff'];
const HEAD_Y = 7.15;

/** Soft round light pool, shared by every lamp (additive, no light computation). */
function poolTexture() {
	const c = document.createElement('canvas');
	c.width = c.height = 128;
	const ctx = c.getContext('2d');
	if (ctx) {
		const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
		g.addColorStop(0, 'rgba(255,255,255,0.55)');
		g.addColorStop(0.45, 'rgba(255,255,255,0.18)');
		g.addColorStop(1, 'rgba(255,255,255,0)');
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, 128, 128);
	}
	return new THREE.CanvasTexture(c);
}

/** Modern street lamps along the avenue: pole, arm, glowing head, a faint light cone and a pool on the road. */
function Lamps() {
	const meshes = useMemo(() => {
		const metal = new THREE.MeshStandardMaterial({ color: '#2a2f3d', metalness: 0.7, roughness: 0.4 });
		const additive = (color: string, opacity: number, map?: THREE.Texture) =>
			new THREE.MeshBasicMaterial({ color, map, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide });
		const parts = [
			{ geo: new THREE.CylinderGeometry(0.1, 0.15, 7.4, 8), mat: metal, at: (s: number, h: number) => [0, 3.7 * h, 0], stretch: true },
			{ geo: new THREE.BoxGeometry(2.3, 0.12, 0.14), mat: metal, at: (s: number, h: number) => [-s * 1.1, 7.3 * h, 0] },
			{ geo: new THREE.BoxGeometry(1.1, 0.16, 0.44), mat: new THREE.MeshBasicMaterial({ color: new THREE.Color(2, 2, 2), toneMapped: false }), at: (s: number, h: number) => [-s * 2.1, HEAD_Y * h, 0], tinted: true },
			{ geo: new THREE.CylinderGeometry(0.35, 3.4, HEAD_Y, 24, 1, true), mat: additive('#cfe8ff', 0.035), at: (s: number, h: number) => [-s * 2.1, (HEAD_Y * h) / 2, 0], stretch: true },
			{ geo: new THREE.PlaneGeometry(9, 9), mat: additive('#dbeeff', 0.9, poolTexture()), at: (s: number) => [-s * 2.1, -0.02, 0], flat: true },
		];
		const m = new THREE.Matrix4();
		const q = new THREE.Quaternion();
		const flat = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
		const one = new THREE.Vector3(1, 1, 1);
		return parts.map((p) => {
			const mesh = new THREE.InstancedMesh(p.geo, p.mat, NEXUS_LAMPS.length);
			NEXUS_LAMPS.forEach((l, i) => {
				const [x, y, z] = p.at(l.side, l.h);
				m.compose(new THREE.Vector3(l.x + x, y, l.z + z), p.flat ? flat : q, 'stretch' in p ? new THREE.Vector3(1, l.h, 1) : one);
				mesh.setMatrixAt(i, m);
				if ('tinted' in p) mesh.setColorAt(i, new THREE.Color(HEAD_TINTS[i % HEAD_TINTS.length]));
			});
			mesh.castShadow = p.mat === metal;
			// the instances span the whole avenue: never culled as one block
			mesh.frustumCulled = false;
			return mesh;
		});
	}, []);
	return (
		<>
			{meshes.map((mesh, i) => (
				<primitive key={i} object={mesh} />
			))}
		</>
	);
}

/**
 * Ground under the Hong Kong blocks (their own road and pavements sit on top), street lamps, and the neon
 * street light: 8 coloured point lights hung in lamp heads along both pavements of the canyon.
 */
export function Street() {
	return (
		<group>
			<mesh position={[NEXUS_CENTER.x, -0.06, NEXUS_CENTER.z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
				<planeGeometry args={[520, 520]} />
				{/* wet asphalt: the joins between the city blocks never show a seam, and the side streets catch the neon */}
				<meshStandardMaterial color="#1b1d24" metalness={0.5} roughness={0.35} />
			</mesh>
			<Lamps />
			{LIT.map((idx, i) => {
				const l = NEXUS_LAMPS[idx];
				return <pointLight key={idx} position={[l.x - l.side * 2.1, HEAD_Y * l.h - 0.4, l.z]} color={LIGHT_COLORS[i % LIGHT_COLORS.length]} intensity={120} distance={38} decay={1.5} />;
			})}
		</group>
	);
}
