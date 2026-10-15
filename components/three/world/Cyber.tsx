'use client';

import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

import { player } from '@/lib/player-state';
import { NEXUS_CENTER, NEXUS_RADIUS } from '@/lib/world';
import { mulberry32 } from '../shapes';

/**
 * Cyberpunk dressing for the Nexus, all procedural: towers with lit window grids,
 * neon signs, rain and flying traffic.
 */

const towerVertex = /* glsl */ `
attribute vec3 aSeed;
varying vec3 vLocal;
varying vec3 vScale;
varying vec3 vSeed;
varying vec3 vNormal2;
#include <fog_pars_vertex>
void main() {
	vLocal = position;
	vScale = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));
	vSeed = aSeed;
	vNormal2 = normal;
	vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
	gl_Position = projectionMatrix * mvPosition;
	#include <fog_vertex>
}
`;
const towerFragment = /* glsl */ `
uniform float uTime;
varying vec3 vLocal;
varying vec3 vScale;
varying vec3 vSeed;
varying vec3 vNormal2;
#include <fog_pars_fragment>
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main() {
	// world-sized coordinates on the facade
	vec2 uv = abs(vNormal2.x) > 0.5 ? vec2(vLocal.z * vScale.z, vLocal.y * vScale.y) : vec2(vLocal.x * vScale.x, vLocal.y * vScale.y);
	vec2 cell = floor(uv / vec2(1.6, 2.2));
	vec2 f = fract(uv / vec2(1.6, 2.2));
	float win = step(0.18, f.x) * step(f.x, 0.82) * step(0.25, f.y) * step(f.y, 0.75);
	float r = hash(cell + vSeed.xy * 31.0);
	float lit = step(0.55, r) * (0.75 + 0.25 * sin(uTime * (0.5 + r) + r * 40.0));
	vec3 tint = r > 0.85 ? vec3(1.0, 0.25, 0.85) : r > 0.7 ? vec3(0.25, 0.8, 1.0) : vec3(1.0, 0.75, 0.45);
	vec3 base = vec3(0.025, 0.02, 0.05);
	vec3 col = base + tint * win * lit * 1.4;
	// neon edge on the roof line
	col += mix(vec3(0.77, 0.05, 1.0), vec3(0.22, 0.74, 0.97), vSeed.z) * smoothstep(0.47, 0.5, vLocal.y) * 2.0;
	if (abs(vNormal2.y) > 0.5) col = base * 1.5;
	gl_FragColor = vec4(col, 1.0);
	#include <fog_fragment>
}
`;

function Towers() {
	const ref = useRef<THREE.InstancedMesh>(null);
	const towers = useMemo(() => {
		const rng = mulberry32(2077);
		const list: { x: number; z: number; w: number; h: number; d: number }[] = [];
		for (let i = 0; i < 90; i++) {
			const a = rng() * Math.PI * 2;
			const r = NEXUS_RADIUS * 0.72 + rng() * 90;
			list.push({ x: NEXUS_CENTER.x + Math.cos(a) * r, z: NEXUS_CENTER.z + Math.sin(a) * r, w: 8 + rng() * 12, h: 25 + Math.pow(rng(), 1.6) * 110, d: 8 + rng() * 12 });
		}
		return list;
	}, []);
	const seeds = useMemo(() => {
		const rng = mulberry32(9);
		return new Float32Array(towers.length * 3).map(() => rng());
	}, [towers]);
	const uniforms = useMemo(() => ({ uTime: { value: 0 }, ...THREE.UniformsLib.fog }), []);
	useLayoutEffect(() => {
		const m = new THREE.Matrix4();
		towers.forEach((t, i) => ref.current?.setMatrixAt(i, m.compose(new THREE.Vector3(t.x, t.h / 2, t.z), new THREE.Quaternion(), new THREE.Vector3(t.w, t.h, t.d))));
		if (ref.current) {
			ref.current.instanceMatrix.needsUpdate = true;
			ref.current.computeBoundingSphere();
		}
	}, [towers]);
	useFrame((_, dt) => {
		uniforms.uTime.value += dt;
	});
	return (
		<instancedMesh ref={ref} args={[undefined, undefined, towers.length]} frustumCulled={false}>
			<boxGeometry args={[1, 1, 1]}>
				<instancedBufferAttribute attach="attributes-aSeed" args={[seeds, 3]} />
			</boxGeometry>
			<shaderMaterial vertexShader={towerVertex} fragmentShader={towerFragment} uniforms={uniforms} fog />
		</instancedMesh>
	);
}

const SIGNS = [
	{ text: 'AGENTS IA', color: '#e879f9' },
	{ text: 'RAG', color: '#38bdf8' },
	{ text: 'MCP', color: '#a3e635' },
	{ text: 'LANGGRAPH', color: '#f472b6' },
	{ text: 'CLAUDE', color: '#fb923c' },
	{ text: 'LLMOPS', color: '#22d3ee' },
	{ text: 'NEXUS', color: '#c084fc' },
	{ text: '24/7 EN PROD', color: '#facc15' },
];

function signTexture(text: string, color: string) {
	const c = document.createElement('canvas');
	c.width = 512;
	c.height = 160;
	const ctx = c.getContext('2d');
	if (ctx) {
		ctx.fillStyle = 'rgba(5,3,12,0.85)';
		ctx.fillRect(0, 0, 512, 160);
		ctx.strokeStyle = color;
		ctx.lineWidth = 8;
		ctx.shadowColor = color;
		ctx.shadowBlur = 24;
		ctx.strokeRect(10, 10, 492, 140);
		ctx.font = '900 76px sans-serif';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillStyle = '#ffffff';
		ctx.fillText(text, 256, 84);
		ctx.fillStyle = color;
		ctx.globalAlpha = 0.6;
		ctx.fillText(text, 256, 84);
	}
	const t = new THREE.CanvasTexture(c);
	t.colorSpace = THREE.SRGBColorSpace;
	return t;
}

function Signs() {
	const signs = useMemo(() => {
		const rng = mulberry32(5);
		return Array.from({ length: 16 }, (_, i) => {
			const s = SIGNS[i % SIGNS.length];
			const a = (i / 16) * Math.PI * 2 + rng() * 0.2;
			const r = NEXUS_RADIUS * 0.66;
			return { ...s, tex: signTexture(s.text, s.color), x: NEXUS_CENTER.x + Math.cos(a) * r, z: NEXUS_CENTER.z + Math.sin(a) * r, y: 8 + rng() * 24, rot: -a - Math.PI / 2, flicker: rng() };
		});
	}, []);
	const refs = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
	useFrame(({ clock }) => {
		signs.forEach((s, i) => {
			const m = refs.current[i];
			if (!m) return;
			const t = clock.elapsedTime * (3 + s.flicker * 5) + s.flicker * 100;
			m.opacity = s.flicker > 0.75 && Math.sin(t) > 0.92 ? 0.25 : 1;
		});
	});
	return (
		<>
			{signs.map((s, i) => (
				<mesh key={i} position={[s.x, s.y, s.z]} rotation={[0, s.rot, 0]}>
					<planeGeometry args={[14, 4.4]} />
					<meshBasicMaterial
						ref={(m) => {
							refs.current[i] = m;
						}}
						map={s.tex}
						transparent
						toneMapped={false}
						side={THREE.DoubleSide}
					/>
				</mesh>
			))}
		</>
	);
}

/** Rain streaks recycled in a box around the player. */
export function Rain({ count = 1400 }: { count?: number }) {
	const ref = useRef<THREE.LineSegments>(null);
	const data = useMemo(() => {
		const rng = mulberry32(13);
		const drops = Array.from({ length: count }, () => ({ x: (rng() - 0.5) * 70, y: rng() * 40, z: (rng() - 0.5) * 70, s: 28 + rng() * 14 }));
		return { drops, positions: new Float32Array(count * 6) };
	}, [count]);
	useFrame((_, delta) => {
		const dt = Math.min(delta, 0.05);
		const p = data.positions;
		data.drops.forEach((d, i) => {
			d.y -= d.s * dt;
			if (d.y < 0) d.y += 40;
			const x = player.x + d.x;
			const z = player.z + d.z;
			p.set([x, d.y, z, x + 0.15, d.y + 1.1, z], i * 6);
		});
		if (ref.current) ref.current.geometry.attributes.position.needsUpdate = true;
	});
	return (
		<lineSegments ref={ref} frustumCulled={false}>
			<bufferGeometry>
				<bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
			</bufferGeometry>
			<lineBasicMaterial color="#9fb7ff" transparent opacity={0.35} />
		</lineSegments>
	);
}

/** Flying cars: glowing capsules circling on air lanes. */
function Traffic() {
	const ref = useRef<THREE.InstancedMesh>(null);
	const cars = useMemo(() => {
		const rng = mulberry32(21);
		return Array.from({ length: 40 }, () => ({ r: NEXUS_RADIUS * 0.4 + rng() * 120, y: 18 + rng() * 45, speed: (0.04 + rng() * 0.08) * (rng() > 0.5 ? 1 : -1), a: rng() * Math.PI * 2, magenta: rng() > 0.5 }));
	}, []);
	const colors = useMemo(() => {
		const arr = new Float32Array(cars.length * 3);
		const m = new THREE.Color('#ff3df2');
		const c = new THREE.Color('#38e1ff');
		cars.forEach((car, i) => arr.set((car.magenta ? m : c).toArray(), i * 3));
		return arr;
	}, [cars]);
	useFrame((_, delta) => {
		const mesh = ref.current;
		if (!mesh) return;
		const m = new THREE.Matrix4();
		const q = new THREE.Quaternion();
		const up = new THREE.Vector3(0, 1, 0);
		cars.forEach((car, i) => {
			car.a += car.speed * Math.min(delta, 0.05);
			const x = NEXUS_CENTER.x + Math.cos(car.a) * car.r;
			const z = NEXUS_CENTER.z + Math.sin(car.a) * car.r;
			q.setFromAxisAngle(up, -car.a + (car.speed > 0 ? 0 : Math.PI));
			mesh.setMatrixAt(i, m.compose(new THREE.Vector3(x, car.y, z), q, new THREE.Vector3(0.9, 0.5, 3.2)));
		});
		mesh.instanceMatrix.needsUpdate = true;
	});
	return (
		<instancedMesh ref={ref} args={[undefined, undefined, cars.length]} frustumCulled={false}>
			<capsuleGeometry args={[0.5, 1, 4, 8]}>
				<instancedBufferAttribute attach="attributes-color" args={[colors, 3]} />
			</capsuleGeometry>
			<meshBasicMaterial vertexColors toneMapped={false} />
		</instancedMesh>
	);
}

export function Cyber() {
	return (
		<group>
			<Towers />
			<Signs />
			<Traffic />
		</group>
	);
}
