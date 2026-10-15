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
uniform float uNight;
varying vec3 vDir;
float hash(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5); }
float noise(vec2 p) {
	vec2 i = floor(p), f = fract(p);
	f = f * f * (3.0 - 2.0 * f);
	return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}
void main() {
	float h = vDir.y;
	// three palettes: day, dusk, night
	vec3 dZen = vec3(0.22, 0.45, 0.88), dHor = vec3(0.78, 0.88, 0.98);
	vec3 sZen = vec3(0.17, 0.12, 0.42), sMid = vec3(0.62, 0.38, 0.62), sHor = vec3(1.0, 0.72, 0.5);
	vec3 nZen = vec3(0.01, 0.015, 0.06), nHor = vec3(0.08, 0.1, 0.24);
	vec3 day = mix(dHor, dZen, smoothstep(0.0, 0.6, h));
	vec3 dusk = mix(sHor, sMid, smoothstep(0.02, 0.3, h));
	dusk = mix(dusk, sZen, smoothstep(0.3, 0.9, h));
	vec3 night = mix(nHor, nZen, smoothstep(0.0, 0.5, h));
	vec3 col = uNight < 0.5 ? mix(day, dusk, uNight * 2.0) : mix(dusk, night, (uNight - 0.5) * 2.0);
	col = mix(col, col * 0.85 + vec3(0.05), smoothstep(0.0, -0.2, h));
	float s = max(dot(vDir, normalize(uSun)), 0.0);
	vec3 sunCol = mix(vec3(1.0, 0.95, 0.8), vec3(0.75, 0.82, 1.0), step(0.75, uNight));
	col += sunCol * pow(s, 18.0) * 0.5 * (1.0 - uNight * 0.5) + sunCol * pow(s, 900.0) * 2.0;
	// stars at night
	vec2 sp = floor(vDir.xz / max(h, 0.05) * 90.0);
	float star = step(0.997, hash(sp)) * smoothstep(0.05, 0.3, h) * smoothstep(0.6, 1.0, uNight);
	col += vec3(star);
	// cloud streaks
	vec2 uv = vDir.xz / max(h + 0.15, 0.05) * 1.4 + vec2(uTime * 0.01, 0.0);
	float cl = smoothstep(0.55, 0.85, noise(uv * vec2(1.0, 3.5)) * 0.7 + noise(uv * 3.0) * 0.3);
	vec3 cloudCol = mix(vec3(1.0), vec3(1.0, 0.82, 0.76), min(uNight * 2.0, 1.0)) * (1.0 - uNight * 0.75);
	col = mix(col, cloudCol, cl * smoothstep(0.02, 0.25, h) * 0.55);
	gl_FragColor = vec4(col, 1.0);
}
`;

const SUN = new THREE.Vector3(120, 30, 60);

export function SkyDome({ night }: { night: number }) {
	const ref = useRef<THREE.Mesh>(null);
	const uniforms = useMemo(() => ({ uTime: { value: 0 }, uSun: { value: SUN.clone() }, uNight: { value: night } }), []); // eslint-disable-line react-hooks/exhaustive-deps
	uniforms.uNight.value = night;
	uniforms.uSun.value.set(120, night < 0.25 ? 140 : night < 0.75 ? 30 : 90, 60);
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
