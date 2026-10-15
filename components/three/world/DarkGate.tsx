'use client';

import { useFrame } from '@react-three/fiber';
import { Suspense, useMemo } from 'react';
import * as THREE from 'three';

import { SfModel } from './SfModel';

/**
 * The gate between the realms: a hand-painted stone arch ("Low Poly Hand Painted Dungeon Arch" by bitgem,
 * Sketchfab, CC BY 4.0) filled with a swirling arcane vortex, like a mage portal.
 */
const ARCH_H = 14;
// the opening of the arch, in world units (arch base at y = 0)
const OPENING = { w: 8.6, h: 10.4, y: 0.2 };
const ASPECT = (OPENING.w / OPENING.h).toFixed(3);

const vertex = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const fragment = /* glsl */ `
uniform float uTime;
varying vec2 vUv;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
	vec2 i = floor(p), f = fract(p);
	f = f * f * (3.0 - 2.0 * f);
	return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}
void main() {
	// round-topped mask that follows the arch: a rectangle below, a half disc on top
	float k = ${ASPECT};
	float top = 1.0 - 0.5 * k;
	vec2 q = vec2((vUv.x - 0.5) / 0.5, (vUv.y - top) / (0.5 * k));
	float dRect = max(abs(vUv.x - 0.5) / 0.5, vUv.y > top ? length(q) : 0.0);
	float inside = 1.0 - smoothstep(0.96, 1.0, dRect);
	inside *= smoothstep(0.0, 0.02, vUv.y);
	// spiral arms around a deep centre, like a mage portal
	vec2 p = (vUv - vec2(0.5, 0.48)) * vec2(1.0, 1.0 / k);
	float r = length(p) + 1e-4;
	float a = atan(p.y, p.x);
	float arms = sin(a * 3.0 + log(r) * 7.0 - uTime * 3.2) * 0.5 + 0.5;
	float grain = noise(vec2(a * 4.0 + uTime * 0.5, r * 12.0 - uTime * 1.5));
	vec3 indigo = vec3(0.05, 0.04, 0.22);
	vec3 blue = vec3(0.18, 0.45, 1.0);
	vec3 violet = vec3(0.62, 0.3, 1.0);
	vec3 col = mix(indigo, mix(blue, violet, grain), smoothstep(0.35, 0.95, arms) * smoothstep(0.02, 0.35, r));
	// bright rim along the stone and a faint glow in the heart
	col += vec3(0.55, 0.75, 1.0) * smoothstep(0.75, 0.98, dRect) * 0.9;
	col += vec3(0.5, 0.6, 1.0) * pow(max(0.0, 1.0 - r * 4.0), 3.0) * 0.6;
	// drifting sparks
	float spark = step(0.995, hash(floor((vUv + vec2(0.0, uTime * 0.05)) * 90.0)));
	col += vec3(0.8, 0.9, 1.0) * spark * 0.8;
	gl_FragColor = vec4(col, inside * 0.95);
}
`;

/** Sparks drawn into the vortex along a spiral, then reborn on the rim. */
const SPARKS = 420;
const sparkMat = new THREE.PointsMaterial({ size: 0.16, color: '#b9c8ff', transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });

function Sparks() {
	const data = useMemo(() => {
		const pos = new Float32Array(SPARKS * 3);
		const col = new Float32Array(SPARKS * 3);
		const s = Array.from({ length: SPARKS }, () => ({ a: Math.random() * Math.PI * 2, r: Math.random(), v: 0.25 + Math.random() * 0.35, z: Math.random() }));
		const g = new THREE.BufferGeometry();
		g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
		g.setAttribute('color', new THREE.BufferAttribute(col, 3));
		return { g, s, pos, col };
	}, []);
	const blue = useMemo(() => new THREE.Color('#7fa2ff'), []);
	const violet = useMemo(() => new THREE.Color('#d6a8ff'), []);
	const tmp = useMemo(() => new THREE.Color(), []);
	useFrame((_, dt) => {
		const cx = 0;
		const cy = OPENING.y + OPENING.h * 0.48;
		const rx = OPENING.w * 0.5;
		const ry = OPENING.h * 0.5;
		data.s.forEach((p, i) => {
			p.r -= p.v * dt * 0.35;
			p.a += dt * (1.2 + 2.5 * (1 - p.r));
			if (p.r <= 0.02) {
				p.r = 1;
				p.a = Math.random() * Math.PI * 2;
				p.z = Math.random();
			}
			data.pos[i * 3] = cx + Math.cos(p.a) * p.r * rx;
			data.pos[i * 3 + 1] = cy + Math.sin(p.a) * p.r * ry;
			// sparks come from in front of the gate and are sucked into its plane
			data.pos[i * 3 + 2] = 0.15 + p.z * 2.5 * p.r * p.r;
			tmp.copy(blue).lerp(violet, p.r).multiplyScalar(0.4 + (1 - p.r) * 1.4);
			data.col.set([tmp.r, tmp.g, tmp.b], i * 3);
		});
		data.g.attributes.position.needsUpdate = true;
		data.g.attributes.color.needsUpdate = true;
	});
	return <points geometry={data.g} material={sparkMat} frustumCulled={false} />;
}
sparkMat.vertexColors = true;

export function DarkGate({ x, y, z }: { x: number; y: number; z: number }) {
	const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
	useFrame((_, dt) => {
		uniforms.uTime.value += dt;
	});
	return (
		<group position={[x, y, z]}>
			<Suspense fallback={null}>
				<SfModel file="arch" height={ARCH_H} />
			</Suspense>
			<mesh position={[0, OPENING.y + OPENING.h / 2, 0]}>
				<planeGeometry args={[OPENING.w, OPENING.h]} />
				<shaderMaterial vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} transparent side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
			</mesh>
			<Sparks />
			<pointLight position={[0, 6, 3]} color="#7c6bff" intensity={50} distance={26} />
		</group>
	);
}
