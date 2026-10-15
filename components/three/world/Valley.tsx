'use client';

import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

import { fbm, noise2 } from '@/lib/noise';
import { HOUSES, LAKE, LANDMARKS, pathDistance, valHeight } from '@/lib/world';
import { mulberry32 } from '../shapes';

/**
 * The fantasy valley: painted-look terrain (vertex colours), a lake, oak and pine
 * forests, rocks and wild flowers. Everything is procedural and instanced.
 */

const C = {
	grassDark: new THREE.Color('#3f7a2a'),
	grass: new THREE.Color('#62a136'),
	grassLight: new THREE.Color('#93bf47'),
	gold: new THREE.Color('#c2b14c'),
	path: new THREE.Color('#a8865a'),
	pathDark: new THREE.Color('#87683f'),
	sand: new THREE.Color('#d2bb84'),
	rock: new THREE.Color('#8b8378'),
	rockDark: new THREE.Color('#5f5a55'),
	snow: new THREE.Color('#f3efe9'),
};

function useTerrainGeometry() {
	return useMemo(() => {
		const size = 300;
		const seg = 220;
		const g = new THREE.PlaneGeometry(size, size, seg, seg);
		g.rotateX(-Math.PI / 2);
		g.translate(0, 0, -20);
		const pos = g.attributes.position;
		const colors = new Float32Array(pos.count * 3);
		const c = new THREE.Color();
		for (let i = 0; i < pos.count; i++) {
			const x = pos.getX(i);
			const z = pos.getZ(i);
			const h = valHeight(x, z);
			pos.setY(i, h);
			// slope from finite differences
			const sx = valHeight(x + 1, z) - h;
			const sz = valHeight(x, z + 1) - h;
			const slope = Math.sqrt(sx * sx + sz * sz);
			const n = fbm(x * 0.05, z * 0.05, 2);
			c.copy(C.grass).lerp(n > 0 ? C.grassLight : C.grassDark, Math.min(Math.abs(n) * 1.6, 1));
			const goldPatch = noise2(x * 0.02 + 40, z * 0.02);
			if (goldPatch > 0.35) c.lerp(C.gold, Math.min((goldPatch - 0.35) * 2, 0.7));
			const p = pathDistance(x, z);
			if (p < 3.6) c.lerp(noise2(x * 0.4, z * 0.4) > 0 ? C.path : C.pathDark, Math.min((3.6 - p) / 1.6, 1));
			const ld = Math.hypot(x - LAKE.x, z - LAKE.z);
			if (h < LAKE.level + 1.2 && ld < LAKE.r + 8) c.lerp(C.sand, 0.85);
			if (slope > 0.9) c.lerp(C.rock, Math.min((slope - 0.9) * 1.5, 1));
			if (h > 16) c.lerp(slope > 1.4 ? C.rockDark : C.rock, Math.min((h - 16) / 6, 1));
			if (h > 30) c.lerp(C.snow, Math.min((h - 30) / 6, 1));
			colors.set([c.r, c.g, c.b], i * 3);
		}
		g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
		g.computeVertexNormals();
		return g;
	}, []);
}

const waterVertex = /* glsl */ `
varying vec3 vWorld;
void main() {
	vec4 w = modelMatrix * vec4(position, 1.0);
	vWorld = w.xyz;
	gl_Position = projectionMatrix * viewMatrix * w;
}
`;
const waterFragment = /* glsl */ `
uniform float uTime;
uniform vec3 uCenter;
uniform float uRadius;
varying vec3 vWorld;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main() {
	float d = length(vWorld.xz - uCenter.xz) / uRadius;
	vec3 deep = vec3(0.07, 0.32, 0.42);
	vec3 shallow = vec3(0.24, 0.62, 0.62);
	vec3 col = mix(deep, shallow, smoothstep(0.2, 1.0, d));
	// moving ripples and sun sparkles
	float r = sin(vWorld.x * 1.3 + uTime * 1.2) * sin(vWorld.z * 1.1 - uTime * 0.9);
	col += vec3(1.0, 0.85, 0.6) * pow(max(r, 0.0), 12.0) * 0.6;
	vec2 cell = floor(vWorld.xz * 2.0);
	float s = step(0.985, hash(cell + floor(uTime * 2.0)));
	col += vec3(1.0, 0.9, 0.7) * s * 0.8;
	float edge = smoothstep(1.0, 0.92, d);
	gl_FragColor = vec4(col, 0.88 * edge);
}
`;

function Water() {
	const uniforms = useMemo(() => ({ uTime: { value: 0 }, uCenter: { value: new THREE.Vector3(LAKE.x, 0, LAKE.z) }, uRadius: { value: LAKE.r + 9 } }), []);
	useFrame((_, dt) => {
		uniforms.uTime.value += dt;
	});
	return (
		<mesh position={[LAKE.x, LAKE.level, LAKE.z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
			<circleGeometry args={[LAKE.r + 9, 64]} />
			<shaderMaterial vertexShader={waterVertex} fragmentShader={waterFragment} uniforms={uniforms} transparent />
		</mesh>
	);
}

function blocked(x: number, z: number) {
	if (Math.hypot(x, z + 20) > 104) return true;
	if (pathDistance(x, z) < 5) return true;
	if (Math.hypot(x, z - 10) < 20) return true; // keep the spawn clearing open
	if (Math.hypot(x - LAKE.x, z - LAKE.z) < LAKE.r + 4) return true;
	for (const l of LANDMARKS) if (l.zone === 'val' && Math.hypot(x - l.x, z - l.z) < l.radius + 7) return true;
	for (const h of HOUSES) if (Math.hypot(x - h.x, z - h.z) < 8) return true;
	return false;
}

const trunkMat = new THREE.MeshStandardMaterial({ color: '#6b4a2f', roughness: 1, flatShading: true });
const leafMat = new THREE.MeshStandardMaterial({ roughness: 0.85, flatShading: true });
const pineMat = new THREE.MeshStandardMaterial({ color: '#2f6a3a', roughness: 0.9, flatShading: true });
const rockMat = new THREE.MeshStandardMaterial({ color: '#8d867c', roughness: 1, flatShading: true });
const flowerMat = new THREE.MeshStandardMaterial({ roughness: 0.8, flatShading: true });

const LEAVES = ['#4d8f2c', '#6aa83a', '#3c7a2a', '#86b443', '#d08a2c', '#b8572b', '#8e5bc4'].map((c) => new THREE.Color(c));

function Forest() {
	const data = useMemo(() => {
		const rng = mulberry32(31);
		const oaks: { x: number; z: number; y: number; s: number; r: number }[] = [];
		const pines: { x: number; z: number; y: number; s: number }[] = [];
		const rocks: { x: number; z: number; y: number; s: number; r: number }[] = [];
		const flowers: { x: number; z: number; y: number; c: number }[] = [];
		for (let i = 0; i < 4200 && oaks.length + pines.length < 520; i++) {
			const x = (rng() - 0.5) * 220;
			const z = (rng() - 0.5) * 220 - 20;
			if (blocked(x, z)) continue;
			// forests grow in clusters
			const density = noise2(x * 0.025, z * 0.025);
			if (density < -0.05 && rng() > 0.15) continue;
			const y = valHeight(x, z);
			if (y > 18) continue;
			if (y > 7 || rng() < 0.3) pines.push({ x, z, y, s: 0.8 + rng() * 0.8 });
			else oaks.push({ x, z, y, s: 0.8 + rng() * 0.7, r: rng() * Math.PI });
		}
		for (let i = 0; i < 260; i++) {
			const x = (rng() - 0.5) * 230;
			const z = (rng() - 0.5) * 230 - 20;
			if (Math.hypot(x, z + 20) > 108 || pathDistance(x, z) < 3) continue;
			rocks.push({ x, z, y: valHeight(x, z), s: 0.4 + rng() * 1.6, r: rng() * 6 });
		}
		for (let i = 0; i < 2600; i++) {
			const x = (rng() - 0.5) * 200;
			const z = (rng() - 0.5) * 200 - 20;
			if (blocked(x, z) && pathDistance(x, z) < 3.5) continue;
			if (Math.hypot(x - LAKE.x, z - LAKE.z) < LAKE.r + 1) continue;
			const y = valHeight(x, z);
			if (y > 12) continue;
			flowers.push({ x, z, y, c: Math.floor(rng() * 4) });
		}
		return { oaks, pines, rocks, flowers };
	}, []);

	const trunks = useRef<THREE.InstancedMesh>(null);
	const canopy = useRef<THREE.InstancedMesh>(null);
	const pineTrunks = useRef<THREE.InstancedMesh>(null);
	const pineCones = useRef<THREE.InstancedMesh>(null);
	const rocks = useRef<THREE.InstancedMesh>(null);
	const flowers = useRef<THREE.InstancedMesh>(null);

	useLayoutEffect(() => {
		const m = new THREE.Matrix4();
		const q = new THREE.Quaternion();
		const e = new THREE.Euler();
		const s = new THREE.Vector3();
		const p = new THREE.Vector3();
		const rng = mulberry32(5);
		let ci = 0;
		data.oaks.forEach((t, i) => {
			trunks.current?.setMatrixAt(i, m.compose(p.set(t.x, t.y + 1.6 * t.s, t.z), q.identity(), s.set(t.s, t.s, t.s)));
			// three overlapping round blobs make a painted-style oak crown
			const color = LEAVES[rng() < 0.82 ? Math.floor(rng() * 4) : 4 + Math.floor(rng() * 3)];
			for (let k = 0; k < 3; k++) {
				const a = t.r + (k / 3) * Math.PI * 2;
				const off = k === 0 ? 0 : 0.9 * t.s;
				p.set(t.x + Math.cos(a) * off, t.y + (3.8 + (k === 0 ? 0.8 : 0)) * t.s, t.z + Math.sin(a) * off);
				const sc = (k === 0 ? 2.1 : 1.6) * t.s;
				canopy.current?.setMatrixAt(ci, m.compose(p, q.setFromEuler(e.set(rng(), rng(), rng())), s.set(sc, sc * 0.9, sc)));
				canopy.current?.setColorAt(ci, color);
				ci++;
			}
		});
		data.pines.forEach((t, i) => {
			pineTrunks.current?.setMatrixAt(i, m.compose(p.set(t.x, t.y + 1.2 * t.s, t.z), q.identity(), s.set(t.s * 0.8, t.s, t.s * 0.8)));
			pineCones.current?.setMatrixAt(i, m.compose(p.set(t.x, t.y + 4.6 * t.s, t.z), q.identity(), s.set(t.s, t.s, t.s)));
		});
		data.rocks.forEach((r, i) => {
			rocks.current?.setMatrixAt(i, m.compose(p.set(r.x, r.y + r.s * 0.3, r.z), q.setFromEuler(e.set(r.r, r.r * 2, r.r * 0.5)), s.set(r.s, r.s * 0.7, r.s)));
		});
		const fc = ['#f4f1e6', '#f2c94c', '#c084fc', '#f87171'].map((c) => new THREE.Color(c));
		data.flowers.forEach((f, i) => {
			flowers.current?.setMatrixAt(i, m.compose(p.set(f.x, f.y + 0.25, f.z), q.identity(), s.set(1, 1, 1)));
			flowers.current?.setColorAt(i, fc[f.c]);
		});
		[trunks, canopy, pineTrunks, pineCones, rocks, flowers].forEach((r) => {
			if (!r.current) return;
			r.current.instanceMatrix.needsUpdate = true;
			if (r.current.instanceColor) r.current.instanceColor.needsUpdate = true;
			r.current.computeBoundingSphere();
		});
	}, [data]);

	const pineGeo = useMemo(() => {
		// three stacked cones merged into one geometry
		const parts = [
			{ r: 2.2, h: 3.2, y: -1.4 },
			{ r: 1.7, h: 2.8, y: 0.2 },
			{ r: 1.1, h: 2.4, y: 1.7 },
		].map(({ r, h, y }) => new THREE.ConeGeometry(r, h, 7).translate(0, y, 0));
		const merged = new THREE.BufferGeometry();
		const positions: number[] = [];
		parts.forEach((g) => {
			const ng = g.toNonIndexed();
			positions.push(...(ng.attributes.position.array as Float32Array));
		});
		merged.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
		merged.computeVertexNormals();
		return merged;
	}, []);

	return (
		<group>
			<instancedMesh ref={trunks} args={[undefined, trunkMat, data.oaks.length]} castShadow>
				<cylinderGeometry args={[0.28, 0.42, 3.2, 6]} />
			</instancedMesh>
			<instancedMesh ref={canopy} args={[undefined, leafMat, data.oaks.length * 3]} castShadow>
				<icosahedronGeometry args={[1, 1]} />
			</instancedMesh>
			<instancedMesh ref={pineTrunks} args={[undefined, trunkMat, data.pines.length]} castShadow>
				<cylinderGeometry args={[0.22, 0.32, 2.4, 5]} />
			</instancedMesh>
			<instancedMesh ref={pineCones} args={[pineGeo, pineMat, data.pines.length]} castShadow />
			<instancedMesh ref={rocks} args={[undefined, rockMat, data.rocks.length]} castShadow receiveShadow>
				<dodecahedronGeometry args={[1, 0]} />
			</instancedMesh>
			<instancedMesh ref={flowers} args={[undefined, flowerMat, data.flowers.length]}>
				<octahedronGeometry args={[0.22, 0]} />
			</instancedMesh>
		</group>
	);
}

export function Valley() {
	const terrain = useTerrainGeometry();
	return (
		<group>
			<mesh geometry={terrain} receiveShadow>
				<meshStandardMaterial vertexColors roughness={0.95} flatShading />
			</mesh>
			<Water />
			<Forest />
		</group>
	);
}
