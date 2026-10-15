'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

/**
 * A ring gate in the spirit of the classic sci-fi stargates: brushed metal ring, rotating inner glyph
 * track, nine glowing chevrons and a rippling "event horizon" like a vertical pool of water.
 */
const metal = new THREE.MeshStandardMaterial({ color: '#7b828c', metalness: 0.9, roughness: 0.35 });
const metalDark = new THREE.MeshStandardMaterial({ color: '#3d434c', metalness: 0.85, roughness: 0.45 });
const chevronOn = new THREE.MeshStandardMaterial({ color: '#ff7a1a', emissive: '#ff5a00', emissiveIntensity: 3, roughness: 0.3, toneMapped: false });

const vertex = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const fragment = /* glsl */ `
uniform float uTime;
varying vec2 vUv;
// smooth interference of travelling waves: crisp water caustics, no blocky noise
float waves(vec2 p, float t) {
	float v = 0.0;
	v += sin(p.x * 7.0 + t * 1.3) * 0.5;
	v += sin(p.y * 8.0 - t * 1.1 + p.x * 2.0) * 0.5;
	v += sin((p.x + p.y) * 11.0 + t * 1.7) * 0.35;
	v += sin(length(p) * 18.0 - t * 2.4) * 0.6;
	return v;
}
void main() {
	vec2 p = vUv - 0.5;
	float r = length(p) * 2.0;
	if (r > 1.0) discard;
	float t = uTime;
	float w = waves(p * 3.0, t);
	float caustic = pow(1.0 - abs(sin(w * 1.6)), 6.0);
	// concentric ripples spreading from the centre, like a vertical pool of water
	float ripple = pow(0.5 + 0.5 * sin(r * 34.0 - t * 3.2), 3.0) * (1.0 - r);
	vec3 deep = vec3(0.03, 0.16, 0.42);
	vec3 mid = vec3(0.12, 0.42, 0.85);
	vec3 bright = vec3(0.62, 0.86, 1.0);
	vec3 col = mix(deep, mid, smoothstep(1.0, 0.15, r));
	col = mix(col, bright, caustic * 0.55 + ripple * 0.35);
	col += vec3(0.5, 0.75, 1.0) * pow(max(0.0, 1.0 - r * 2.2), 2.0) * 0.35;
	// darker rim where the water meets the ring
	col *= 0.55 + 0.45 * smoothstep(1.0, 0.82, r);
	gl_FragColor = vec4(col, 0.95);
}
`;

/** The rippling "event horizon" alone, to fill any ring (the Sketchfab gate model). */
export function EventHorizon({ radius, ...props }: { radius: number } & Record<string, unknown>) {
	const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
	useFrame((_, dt) => {
		uniforms.uTime.value += dt;
	});
	return (
		<group {...props}>
			<mesh>
				<circleGeometry args={[radius, 96]} />
				<shaderMaterial vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} transparent side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
			</mesh>
			<pointLight position={[0, 0, 3]} color="#4fb4ff" intensity={70} distance={28} />
		</group>
	);
}

export function Stargate({ x, z, y = 0, rotation = 0 }: { x: number; z: number; y?: number; rotation?: number }) {
	const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
	const track = useRef<THREE.Group>(null);
	const glyphs = useMemo(() => {
		const c = document.createElement('canvas');
		c.width = 2048;
		c.height = 64;
		const ctx = c.getContext('2d');
		if (ctx) {
			ctx.fillStyle = '#4a5059';
			ctx.fillRect(0, 0, 2048, 64);
			ctx.strokeStyle = '#a7b0bb';
			ctx.lineWidth = 3;
			// 39 glyphs, abstract constellation marks
			for (let i = 0; i < 39; i++) {
				const cx = (i + 0.5) * (2048 / 39);
				ctx.beginPath();
				for (let k = 0; k < 4; k++) {
					const a = ((i * 7 + k * 13) % 17) / 17;
					const b = ((i * 11 + k * 5) % 19) / 19;
					ctx.lineTo(cx - 18 + a * 36, 12 + b * 40);
				}
				ctx.stroke();
			}
		}
		const t = new THREE.CanvasTexture(c);
		t.wrapS = THREE.RepeatWrapping;
		t.colorSpace = THREE.SRGBColorSpace;
		return t;
	}, []);

	useFrame((_, dt) => {
		uniforms.uTime.value += dt;
		if (track.current) track.current.rotation.z += dt * 0.12;
	});

	const R = 5.2;
	return (
		<group position={[x, y + R + 0.9, z]} rotation={[0, rotation, 0]}>
			{/* outer ring */}
			<mesh material={metal} castShadow>
				<torusGeometry args={[R, 0.7, 24, 96]} />
			</mesh>
			{/* rotating inner glyph track */}
			<group ref={track}>
				<mesh>
					<torusGeometry args={[R - 0.55, 0.32, 12, 96]} />
					<meshStandardMaterial map={glyphs} metalness={0.8} roughness={0.4} />
				</mesh>
			</group>
			{/* chevrons */}
			{Array.from({ length: 9 }, (_, i) => {
				const a = Math.PI / 2 - (i / 9) * Math.PI * 2;
				return (
					<group key={i} position={[Math.cos(a) * (R + 0.55), Math.sin(a) * (R + 0.55), 0.35]} rotation={[0, 0, a - Math.PI / 2]}>
						<mesh material={metalDark} castShadow>
							<boxGeometry args={[1.1, 0.7, 0.6]} />
						</mesh>
						<mesh position={[0, -0.15, 0.32]} material={chevronOn}>
							<coneGeometry args={[0.32, 0.5, 3]} />
						</mesh>
					</group>
				);
			})}
			{/* event horizon */}
			<mesh position={[0, 0, 0.05]}>
				<circleGeometry args={[R - 0.85, 96]} />
				<shaderMaterial vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} transparent side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
			</mesh>
			{/* ramp and base */}
			<mesh position={[0, -R - 0.6, 3]} rotation={[-0.12, 0, 0]} material={metalDark} receiveShadow>
				<boxGeometry args={[4.6, 0.3, 7]} />
			</mesh>
			<mesh position={[0, -R - 0.75, 0]} material={metalDark} receiveShadow castShadow>
				<boxGeometry args={[R * 2.4, 0.5, 3]} />
			</mesh>
			<pointLight position={[0, 0, 3]} color="#4fb4ff" intensity={60} distance={26} />
		</group>
	);
}
