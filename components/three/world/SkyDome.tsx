'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

/**
 * Painted sunset sky: deep violet zenith, rose band, golden horizon, a soft sun disc
 * and drifting cloud streaks. Follows the camera so it never clips.
 */
const vertex = /* glsl */ `
varying vec3 vDir;
void main() {
	vDir = normalize(position);
	vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
	gl_Position = p.xyww;
}
`;
const fragment = /* glsl */ `
uniform float uTime;
uniform vec3 uSun;
varying vec3 vDir;
float hash(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5); }
float noise(vec2 p) {
	vec2 i = floor(p), f = fract(p);
	f = f * f * (3.0 - 2.0 * f);
	return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}
void main() {
	float h = vDir.y;
	vec3 zenith = vec3(0.17, 0.12, 0.42);
	vec3 mid = vec3(0.62, 0.38, 0.62);
	vec3 rose = vec3(0.98, 0.58, 0.48);
	vec3 horizon = vec3(1.0, 0.8, 0.52);
	vec3 col = mix(horizon, rose, smoothstep(0.0, 0.12, h));
	col = mix(col, mid, smoothstep(0.1, 0.35, h));
	col = mix(col, zenith, smoothstep(0.3, 0.9, h));
	col = mix(col, vec3(0.93, 0.72, 0.55), smoothstep(0.0, -0.2, h));
	float s = max(dot(vDir, normalize(uSun)), 0.0);
	col += vec3(1.0, 0.75, 0.45) * pow(s, 18.0) * 0.6 + vec3(1.0, 0.95, 0.8) * pow(s, 900.0) * 2.0;
	// cloud streaks
	vec2 uv = vDir.xz / max(h + 0.15, 0.05) * 1.4 + vec2(uTime * 0.01, 0.0);
	float cl = smoothstep(0.55, 0.85, noise(uv * vec2(1.0, 3.5)) * 0.7 + noise(uv * 3.0) * 0.3);
	col = mix(col, vec3(1.0, 0.82, 0.76), cl * smoothstep(0.02, 0.25, h) * 0.55);
	gl_FragColor = vec4(col, 1.0);
}
`;

const SUN = new THREE.Vector3(120, 30, 60);

export function SkyDome() {
	const ref = useRef<THREE.Mesh>(null);
	const uniforms = useMemo(() => ({ uTime: { value: 0 }, uSun: { value: SUN } }), []);
	useFrame(({ camera }, dt) => {
		uniforms.uTime.value += dt;
		ref.current?.position.copy(camera.position);
	});
	return (
		<mesh ref={ref} frustumCulled={false} renderOrder={-1}>
			<sphereGeometry args={[400, 32, 16]} />
			<shaderMaterial vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} side={THREE.BackSide} depthWrite={false} fog={false} toneMapped={false} />
		</mesh>
	);
}
