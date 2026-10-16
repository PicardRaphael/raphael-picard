'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

import { NEXUS_AVENUE_END, NEXUS_CENTER, NEXUS_LAMPS, NEXUS_SIDE_STREETS, NEXUS_STREET_END } from '@/lib/world';
import { RigLight } from './LightRig';

const LIGHT_COLORS = ['#ff4fd8', '#5ef2ff', '#ffb45c', '#b18cff'];
/** 8 of the lamp heads, spread along the avenue, hold a light of the shared pool (LightRig). */
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

/** Head and pool colour of each lamp: the 8 lit ones wear the colour of their light, the others a street white. */
const lampTint = (i: number) => {
	const k = LIT.indexOf(i);
	return k >= 0 ? LIGHT_COLORS[k % LIGHT_COLORS.length] : HEAD_TINTS[i % HEAD_TINTS.length];
};

/** Modern street lamps along the avenue: pole, arm, glowing head and a small coloured pool on the road. */
function Lamps() {
	const meshes = useMemo(() => {
		const metal = new THREE.MeshStandardMaterial({ color: '#2a2f3d', metalness: 0.7, roughness: 0.4 });
		const additive = (color: string, opacity: number, map?: THREE.Texture) =>
			new THREE.MeshBasicMaterial({ color, map, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide });
		const parts = [
			{ geo: new THREE.CylinderGeometry(0.1, 0.15, 7.4, 8), mat: metal, at: (s: number, h: number) => [0, 3.7 * h, 0], stretch: true },
			{ geo: new THREE.BoxGeometry(2.3, 0.12, 0.14), mat: metal, at: (s: number, h: number) => [-s * 1.1, 7.3 * h, 0] },
			{ geo: new THREE.BoxGeometry(1.1, 0.16, 0.44), mat: new THREE.MeshBasicMaterial({ color: new THREE.Color(2, 2, 2), toneMapped: false }), at: (s: number, h: number) => [-s * 2.1, HEAD_Y * h, 0], tinted: true },
			{ geo: new THREE.PlaneGeometry(5, 5), mat: additive('#ffffff', 0.7, poolTexture()), at: (s: number) => [-s * 2.1, -0.02, 0], flat: true, tinted: true },
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
				if ('tinted' in p) mesh.setColorAt(i, new THREE.Color(lampTint(i)));
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

/** A night facade: dark wall, scattered lit windows (warm, cyan, magenta) and one vertical neon strip. Unlit. */
function facadeTexture(seed: number) {
	const c = document.createElement('canvas');
	c.width = 512;
	c.height = 512;
	const ctx = c.getContext('2d');
	if (ctx) {
		let n = seed;
		const rnd = () => ((n = (n * 16807) % 2147483647) - 1) / 2147483646;
		// a concrete wall caught by the street glow from below
		const wall = ctx.createLinearGradient(0, 0, 0, 512);
		wall.addColorStop(0, '#0d1018');
		wall.addColorStop(1, '#1a1e2b');
		ctx.fillStyle = wall;
		ctx.fillRect(0, 0, 512, 512);
		// pilasters every 4 bays, a lighter slab at each floor
		ctx.fillStyle = '#20253a';
		for (let x = 0; x < 512; x += 128) ctx.fillRect(x, 0, 8, 512);
		const lit = ['#ffd49a', '#ffe6c2', '#ffd49a', '#d6e9ff', '#fff3de', '#ff9be8', '#8ff0ff'];
		for (let y = 0; y < 512; y += 32) {
			ctx.fillStyle = '#262b3d';
			ctx.fillRect(0, y + 27, 512, 5);
			const awake = rnd() < 0.8;
			for (let x = 14; x < 512; x += 30) {
				if (x % 128 < 10) continue;
				const r = rnd();
				// dark glass with a cold sheen, or a lit room
				if (awake && r < 0.32) {
					ctx.globalAlpha = 0.6 + rnd() * 0.4;
					ctx.fillStyle = lit[Math.floor(rnd() * lit.length)];
				} else {
					ctx.globalAlpha = 1;
					ctx.fillStyle = r < 0.7 ? '#1b2335' : '#141a29';
				}
				ctx.fillRect(x, y + 6, 20, 18);
				ctx.globalAlpha = 1;
				// window frame and the odd air-conditioner box under it
				ctx.strokeStyle = '#2c3247';
				ctx.lineWidth = 2;
				ctx.strokeRect(x, y + 6, 20, 18);
				if (rnd() < 0.12) {
					ctx.fillStyle = '#353b4f';
					ctx.fillRect(x + 4, y + 24, 12, 4);
				}
			}
		}
		// one vertical neon sign
		const neon = ['#ff4fd8', '#5ef2ff', '#b18cff'][seed % 3];
		ctx.fillStyle = neon;
		const sx = seed % 2 ? 60 : 430;
		ctx.fillRect(sx, 120, 22, 230);
		ctx.fillStyle = '#06070b';
		for (let y = 132; y < 340; y += 34) ctx.fillRect(sx + 5, y, 12, 20);
	}
	const t = new THREE.CanvasTexture(c);
	t.colorSpace = THREE.SRGBColorSpace;
	t.anisotropy = 4;
	t.wrapS = t.wrapT = THREE.RepeatWrapping;
	return t;
}

/** Facades closing the four side streets and the avenue behind the beacon, so no street opens on the void. */
function StreetEnds() {
	const walls = useMemo(() => {
		type Wall = { position: [number, number, number]; size: [number, number, number]; face: 'x' | 'z'; seed: number };
		const list: Wall[] = NEXUS_SIDE_STREETS.map((st, i) => ({ position: [st.side * (NEXUS_STREET_END + 2), 24, (st.z0 + st.z1) / 2], size: [4, 48, 34], face: 'x', seed: 7 + i * 13 }));
		list.push({ position: [0, 26, NEXUS_AVENUE_END], size: [40, 52, 4], face: 'z', seed: 101 });
		return list.map((w) => {
			const tex = facadeTexture(w.seed);
			const wide = w.face === 'x' ? w.size[2] : w.size[0];
			tex.repeat.set(Math.max(1, Math.round(wide / 14)), Math.max(1, Math.round(w.size[1] / 14)));
			return { ...w, mat: new THREE.MeshBasicMaterial({ map: tex, color: new THREE.Color(1, 1, 1) }) };
		});
	}, []);
	return (
		<>
			{walls.map((w, i) => (
				<mesh key={i} position={w.position} material={w.mat}>
					<boxGeometry args={w.size} />
				</mesh>
			))}
		</>
	);
}

/** Zebra crossing over the seam where the mirrored city blocks meet, in the middle of the avenue. */
function Crosswalk() {
	const mat = useMemo(() => {
		const c = document.createElement('canvas');
		c.width = 256;
		c.height = 64;
		const ctx = c.getContext('2d');
		if (ctx) {
			ctx.fillStyle = '#1d1f27';
			ctx.fillRect(0, 0, 256, 64);
			ctx.fillStyle = '#c9ccd6';
			for (let x = 6; x < 256; x += 22) ctx.fillRect(x, 6, 12, 52);
		}
		const t = new THREE.CanvasTexture(c);
		t.colorSpace = THREE.SRGBColorSpace;
		return new THREE.MeshStandardMaterial({ map: t, roughness: 0.5, metalness: 0.1 });
	}, []);
	return (
		<mesh position={[NEXUS_CENTER.x, 0.02, NEXUS_CENTER.z]} rotation={[-Math.PI / 2, 0, 0]} material={mat} receiveShadow>
			<planeGeometry args={[30, 7]} />
		</mesh>
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
				<meshStandardMaterial color="#23252e" metalness={0.1} roughness={0.55} />
			</mesh>
			<Crosswalk />
			<StreetEnds />
			<Lamps />
			{LIT.map((idx, i) => {
				const l = NEXUS_LAMPS[idx];
				return <RigLight key={idx} position={[l.x - l.side * 2.1, HEAD_Y * l.h - 0.4, l.z]} color={LIGHT_COLORS[i % LIGHT_COLORS.length]} intensity={120} distance={38} decay={1.5} />;
			})}
		</group>
	);
}
