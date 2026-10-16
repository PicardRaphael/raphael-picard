'use client';

import { useTexture } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

import { fbm, noise2 } from '@/lib/noise';
import { HOUSES, LAKE, LANDMARKS, pathDistance, valHeight } from '@/lib/world';
import { mulberry32 } from '../shapes';

/**
 * The fantasy valley: painted-look terrain (vertex colours), a lake, oak and pine
 * forests, rocks and wild flowers. Everything is procedural and instanced.
 */

/**
 * Terrain splat weights per vertex: the ground is painted with hand-painted tiling textures by rudolfs
 * ("Texture pack 2 (Ground)", Sketchfab, CC BY 4.0), the same artist as the trees, so grass, paths,
 * cliffs and peaks share one brush.
 */
function useTerrainGeometry() {
	return useMemo(() => {
		const size = 300;
		const seg = 220;
		const g = new THREE.PlaneGeometry(size, size, seg, seg);
		g.rotateX(-Math.PI / 2);
		g.translate(0, 0, -20);
		const pos = g.attributes.position;
		const splatA = new Float32Array(pos.count * 3); // dry grass, dirt path, sand
		const splatB = new Float32Array(pos.count * 2); // rock, snow
		for (let i = 0; i < pos.count; i++) {
			const x = pos.getX(i);
			const z = pos.getZ(i);
			const h = valHeight(x, z);
			pos.setY(i, h);
			const sx = valHeight(x + 1, z) - h;
			const sz = valHeight(x, z + 1) - h;
			const slope = Math.sqrt(sx * sx + sz * sz);
			const patch = noise2(x * 0.02 + 40, z * 0.02) + fbm(x * 0.08, z * 0.08, 2) * 0.35;
			const dry = THREE.MathUtils.clamp((patch - 0.15) * 2.2, 0, 0.85);
			const p = pathDistance(x, z);
			const path = THREE.MathUtils.clamp((3.4 - p) / 1.8 + fbm(x * 0.3, z * 0.3, 2) * 0.35, 0, 1);
			const ld = Math.hypot(x - LAKE.x, z - LAKE.z);
			const sand = h < LAKE.level + 1.2 && ld < LAKE.r + 8 ? 0.9 : 0;
			let rock = THREE.MathUtils.clamp((slope - 0.75) * 1.6, 0, 1);
			if (h > 14) rock = Math.max(rock, THREE.MathUtils.clamp((h - 14) / 6, 0, 1));
			const snow = THREE.MathUtils.clamp((h - 30) / 6 - Math.max(0, slope - 2) * 0.4, 0, 1);
			splatA.set([dry, path, sand], i * 3);
			splatB.set([rock, snow], i * 2);
		}
		g.setAttribute('splatA', new THREE.BufferAttribute(splatA, 3));
		g.setAttribute('splatB', new THREE.BufferAttribute(splatB, 2));
		g.computeVertexNormals();
		return g;
	}, []);
}

const TEX = ['grass', 'grass_dry', 'dirt', 'sand', 'rock', 'snow'] as const;

function useTerrainMaterial() {
	const maps = useTexture(Object.fromEntries(TEX.map((t) => [t, `/textures/val/${t}.webp`])) as Record<(typeof TEX)[number], string>);
	return useMemo(() => {
		for (const t of Object.values(maps)) {
			t.wrapS = t.wrapT = THREE.RepeatWrapping;
			t.colorSpace = THREE.SRGBColorSpace;
			t.anisotropy = 8;
		}
		const mat = new THREE.MeshStandardMaterial({ roughness: 0.95, metalness: 0 });
		mat.onBeforeCompile = (shader) => {
			for (const t of TEX) shader.uniforms[`t_${t}`] = { value: maps[t] };
			shader.vertexShader = shader.vertexShader
				.replace(
					'#include <common>',
					`#include <common>
attribute vec3 splatA;
attribute vec2 splatB;
varying vec3 vSplatA;
varying vec2 vSplatB;
varying vec2 vTerrainXZ;`,
				)
				.replace(
					'#include <begin_vertex>',
					`#include <begin_vertex>
vSplatA = splatA;
vSplatB = splatB;
vTerrainXZ = (modelMatrix * vec4(transformed, 1.0)).xz;`,
				);
			shader.fragmentShader = shader.fragmentShader
				.replace(
					'#include <common>',
					`#include <common>
uniform sampler2D ${TEX.map((t) => `t_${t}`).join(', ')};
varying vec3 vSplatA;
varying vec2 vSplatB;
varying vec2 vTerrainXZ;
vec3 tex(sampler2D s, float tile) { return texture2D(s, vTerrainXZ / tile).rgb; }`,
				)
				.replace(
					'#include <map_fragment>',
					`// two scales of grass break the tiling
vec3 ground = mix(tex(t_grass, 7.0), tex(t_grass, 23.0), 0.4);
ground = mix(ground, tex(t_grass_dry, 9.0), vSplatA.x);
ground = mix(ground, tex(t_sand, 6.0), vSplatA.z);
ground = mix(ground, tex(t_dirt, 5.0), smoothstep(0.25, 0.75, vSplatA.y));
ground = mix(ground, tex(t_rock, 9.0), smoothstep(0.2, 0.8, vSplatB.x));
ground = mix(ground, tex(t_snow, 10.0), smoothstep(0.3, 0.8, vSplatB.y));
diffuseColor.rgb *= ground * 1.25;`,
				);
		};
		return mat;
	}, [maps]);
}



const waterVertex = /* glsl */ `
varying vec3 vWorld;
#include <fog_pars_vertex>
void main() {
	vec4 world = modelMatrix * vec4(position, 1.0);
	vWorld = world.xyz;
	vec4 mvPosition = viewMatrix * world;
	gl_Position = projectionMatrix * mvPosition;
	#include <fog_vertex>
}
`;
const waterFragment = /* glsl */ `
uniform sampler2D uNormals;
uniform float uTime;
uniform vec3 uSky;
uniform vec3 uHorizon;
uniform vec3 uDeep;
uniform vec3 uSun;
uniform vec3 uSunDir;
varying vec3 vWorld;
#include <fog_pars_fragment>
void main() {
	// two scrolling layers of the ripple normal map (rg = slope), never a zero-length normal
	vec2 p = vWorld.xz * 0.06;
	vec3 n1 = texture2D(uNormals, p + vec2(uTime * 0.02, uTime * 0.013)).rgb * 2.0 - 1.0;
	vec3 n2 = texture2D(uNormals, p * 1.7 - vec2(uTime * 0.017, -uTime * 0.011)).rgb * 2.0 - 1.0;
	vec3 n = normalize(vec3(n1.x + n2.x, 5.0, n1.y + n2.y));
	vec3 v = normalize(cameraPosition - vWorld);
	// Fresnel: deep teal seen from above, the sky mirrored at grazing angles
	float fres = mix(0.06, 1.0, pow(1.0 - max(dot(n, v), 0.0), 3.0));
	vec3 r = reflect(-v, n);
	vec3 sky = mix(uHorizon, uSky, smoothstep(0.0, 0.45, r.y));
	vec3 col = mix(uDeep, sky, fres);
	col += uSun * pow(max(dot(r, uSunDir), 0.0), 140.0) * 1.6;
	gl_FragColor = vec4(col, 1.0);
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}
`;

/**
 * The lake: rippled water from a shader alone (scrolling normal map, Fresnel between a deep teal and the sky colour,
 * the sun's glint). No mirror pass: a planar reflection re-rendered the whole valley every frame (half the frame
 * rate on phones).
 */
function Water() {
	const normals = useTexture('/textures/waternormals.jpg');
	const { scene } = useThree();
	const material = useMemo(() => {
		normals.wrapS = normals.wrapT = THREE.RepeatWrapping;
		return new THREE.ShaderMaterial({
			vertexShader: waterVertex,
			fragmentShader: waterFragment,
			fog: true,
			uniforms: {
				...THREE.UniformsUtils.clone(THREE.UniformsLib.fog),
				uNormals: { value: normals },
				uTime: { value: 0 },
				uSky: { value: new THREE.Color('#5b8fd0') },
				uHorizon: { value: new THREE.Color('#b9d2ea') },
				uDeep: { value: new THREE.Color('#0b3c46') },
				uSun: { value: new THREE.Color('#fff1d0') },
				uSunDir: { value: new THREE.Vector3(0.4, 0.8, 0.3).normalize() },
			},
		});
	}, [normals]);
	const night = useMemo(() => new THREE.Color('#0d1430'), []);
	useFrame((_, dt) => {
		const u = material.uniforms;
		u.uTime.value += dt;
		// the sky it mirrors follows the val's weather: the fog colour on the horizon, a deeper tone overhead
		const fog = scene.fog as THREE.Fog | null;
		if (fog) {
			(u.uHorizon.value as THREE.Color).copy(fog.color);
			(u.uSky.value as THREE.Color).copy(fog.color).lerp(night, 0.45);
		}
	});
	return (
		<mesh position={[LAKE.x, LAKE.level, LAKE.z]} rotation={[-Math.PI / 2, 0, 0]} material={material}>
			<circleGeometry args={[LAKE.r + 9, 64]} />
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

export function LowPolyForest() {
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
	const material = useTerrainMaterial();
	return (
		<group>
			<mesh geometry={terrain} material={material} receiveShadow />
			<Water />
		</group>
	);
}
