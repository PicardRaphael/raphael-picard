'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

/**
 * The great gate between the realms, inspired by the colossal stone portals of epic fantasy:
 * stepped base, twin pillars crowned with brazier fires, a heavy lintel and a swirling
 * fel-green / arcane-violet vortex.
 */
const stone = new THREE.MeshStandardMaterial({ color: '#6f6157', roughness: 0.9, flatShading: true });
const stoneDark = new THREE.MeshStandardMaterial({ color: '#463d38', roughness: 1, flatShading: true });
const rune = new THREE.MeshBasicMaterial({ color: '#7dff6b', toneMapped: false });
const flame = new THREE.MeshBasicMaterial({ color: '#9dff4f', transparent: true, opacity: 0.85, toneMapped: false, depthWrite: false });

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
	vec2 p = (vUv - 0.5) * vec2(1.0, 1.4);
	float r = length(p);
	float a = atan(p.y, p.x);
	float swirl = noise(vec2(a * 3.0 + uTime * 0.6 - r * 6.0, r * 5.0 - uTime * 1.4));
	float swirl2 = noise(vec2(a * 6.0 - uTime * 0.9, r * 9.0 + uTime));
	vec3 fel = vec3(0.35, 1.0, 0.25);
	vec3 arcane = vec3(0.55, 0.15, 1.0);
	vec3 col = mix(arcane, fel, smoothstep(0.3, 0.8, swirl)) * (0.6 + swirl2);
	col += vec3(0.9, 1.0, 0.8) * pow(max(0.0, 1.0 - r * 1.8), 4.0);
	float edge = smoothstep(0.5, 0.42, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5) * 0.98));
	gl_FragColor = vec4(col * 1.7, edge * 0.95);
}
`;

export function DarkGate({ x, y, z }: { x: number; y: number; z: number }) {
	const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
	const fires = useRef<THREE.Group>(null);
	useFrame(({ clock }, dt) => {
		uniforms.uTime.value += dt;
		fires.current?.children.forEach((c, i) => {
			const s = 1 + Math.sin(clock.elapsedTime * 9 + i * 2) * 0.15;
			c.scale.set(s, 1 + Math.sin(clock.elapsedTime * 7 + i) * 0.25, s);
		});
	});
	return (
		<group position={[x, y, z]}>
			{/* stepped base */}
			{[0, 1, 2].map((i) => (
				<mesh key={i} position={[0, 0.4 + i * 0.8, -i * 1.2]} material={i % 2 ? stoneDark : stone} receiveShadow castShadow>
					<boxGeometry args={[26 - i * 3, 0.8, 9 - i * 1.6]} />
				</mesh>
			))}
			<group position={[0, 2.4, -2.4]}>
				{/* pillars with carved tiers */}
				{[-1, 1].map((s) => (
					<group key={s} position={[s * 8.4, 0, 0]}>
						<mesh position={[0, 8, 0]} material={stone} castShadow>
							<boxGeometry args={[3.6, 16, 3.6]} />
						</mesh>
						{[2, 7, 12].map((h) => (
							<mesh key={h} position={[0, h, 0]} material={stoneDark} castShadow>
								<boxGeometry args={[4.4, 1, 4.4]} />
							</mesh>
						))}
						<mesh position={[s * -1.85, 8, 0]} material={rune}>
							<boxGeometry args={[0.12, 10, 0.5]} />
						</mesh>
						{/* brazier */}
						<mesh position={[0, 17.4, 0]} material={stoneDark} castShadow>
							<cylinderGeometry args={[1.8, 1.2, 1.4, 6]} />
						</mesh>
					</group>
				))}
				{/* lintel with angular crown */}
				<mesh position={[0, 16.6, 0]} material={stone} castShadow>
					<boxGeometry args={[22, 2.4, 4.2]} />
				</mesh>
				<mesh position={[0, 18.6, 0]} rotation={[0, 0, Math.PI / 4]} material={stoneDark} castShadow>
					<boxGeometry args={[4.2, 4.2, 3.8]} />
				</mesh>
				<mesh position={[0, 18.6, 2]} material={rune}>
					<octahedronGeometry args={[0.8, 0]} />
				</mesh>
				{/* the vortex */}
				<mesh position={[0, 8, 0.3]}>
					<planeGeometry args={[13.2, 15]} />
					<shaderMaterial vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} transparent side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
				</mesh>
				<group ref={fires}>
					{[-1, 1].map((s) => (
						<mesh key={s} position={[s * 8.4, 19, 0]} material={flame}>
							<coneGeometry args={[1.1, 2.6, 7]} />
						</mesh>
					))}
				</group>
				<pointLight position={[0, 8, 4]} color="#7dff6b" intensity={60} distance={30} />
			</group>
		</group>
	);
}
