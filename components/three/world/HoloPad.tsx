'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

/**
 * Holo-emitter dais of the Nexus places: an octagonal steel plinth, an animated holographic top, a chevron
 * ring, a neon contact line on the street, a label band, an optional light beam and a fake ground glow.
 * No light is added (the light count stays constant): the glow is additive geometry.
 * Every shader guards atan/pow: one NaN pixel and the bloom blacks out the whole frame.
 */

/** Shared clock of every pad, advanced by the Nexus frame loop. */
export const PAD_TIME = { value: 0 };

const VERT = /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;

const TOP = /* glsl */ `
uniform float uTime; uniform vec3 uColor; uniform vec3 uColor2; uniform float uSeed; varying vec2 vUv;
float hexd(vec2 uv){ vec2 r = vec2(1.0, 1.7320508); vec2 h = r * 0.5; vec2 a = mod(uv, r) - h; vec2 b = mod(uv - h, r) - h; vec2 g = dot(a, a) < dot(b, b) ? a : b; return max(dot(abs(g), normalize(r)), abs(g.x)); }
void main(){
	vec2 p = vUv * 2.0 - 1.0; float r = length(p); if (r > 1.0) discard;
	float ang = atan(p.y, abs(p.x) < 1e-4 ? 1e-4 : p.x) / 6.2831853 + 0.5;
	float f = fract(r * 4.0); float rings = smoothstep(0.05, 0.0, min(f, 1.0 - f)) * step(0.2, r);
	float g = fract(ang * 64.0); float ticks = smoothstep(0.12, 0.0, min(g, 1.0 - g)) * step(0.86, r) * step(r, 0.95);
	float hx = smoothstep(0.04, 0.0, abs(hexd(p * 6.0) - 0.5)) * (1.0 - smoothstep(0.45, 0.7, r));
	float sweep = pow(clamp(fract(ang + uTime * 0.08 + uSeed), 0.0, 1.0), 10.0) * step(r, 0.95);
	float pr = fract(uTime * 0.3 + uSeed); float pulse = smoothstep(0.025, 0.0, abs(r - pr)) * (1.0 - pr);
	float rim = smoothstep(0.02, 0.0, abs(r - 0.975));
	float core = smoothstep(0.22, 0.0, r);
	vec3 col = uColor * (rings * 0.55 + ticks * 1.1 + hx * 0.3 + sweep * 0.45 + pulse * 1.6 + rim * 2.2) + uColor2 * core * 1.4;
	float a = clamp(rings * 0.55 + ticks + hx * 0.3 + sweep * 0.45 + pulse + rim + core * 0.8, 0.0, 1.0);
	gl_FragColor = vec4(col * a, a);
}`;

const CHEVRONS = /* glsl */ `
uniform float uTime; uniform vec3 uColor; varying vec2 vUv;
void main(){
	vec2 p = vUv * 2.0 - 1.0;
	float ang = atan(p.y, abs(p.x) < 1e-4 ? 1e-4 : p.x) / 6.2831853 + 0.5;
	float on = step(0.38, fract(ang * 16.0 + uTime * 0.05));
	gl_FragColor = vec4(uColor * on, on);
}`;

const BEAM = /* glsl */ `
uniform float uTime; uniform vec3 uColor; varying vec2 vUv;
void main(){
	float fade = pow(clamp(1.0 - vUv.y, 0.0, 1.0), 2.2);
	float scan = 0.55 + 0.45 * sin(vUv.y * 70.0 - uTime * 5.0);
	float streak = 0.5 + 0.5 * sin(vUv.x * 6.2831853 * 18.0 + uTime * 0.6);
	float a = clamp(fade * scan * (0.45 + 0.55 * streak) * 0.8, 0.0, 1.0);
	gl_FragColor = vec4(uColor * a, a);
}`;

const GLOW = /* glsl */ `uniform vec3 uColor; varying vec2 vUv; void main(){ float d = length(vUv * 2.0 - 1.0); float a = smoothstep(1.0, 0.35, d) * 0.28; gl_FragColor = vec4(uColor * a, a); }`;

const steel = new THREE.MeshStandardMaterial({ color: '#262a38', metalness: 0.3, roughness: 0.5, flatShading: true });

function additive(frag: string, uniforms: Record<string, THREE.IUniform>) {
	return new THREE.ShaderMaterial({
		vertexShader: VERT,
		fragmentShader: frag,
		uniforms: { uTime: PAD_TIME, ...uniforms },
		transparent: true,
		depthWrite: false,
		blending: THREE.AdditiveBlending,
		side: THREE.DoubleSide,
		toneMapped: false,
	});
}

function labelTexture(text: string, color: string) {
	const c = document.createElement('canvas');
	c.width = 1024;
	c.height = 64;
	const ctx = c.getContext('2d');
	if (ctx) {
		ctx.fillStyle = '#000';
		ctx.fillRect(0, 0, 1024, 64);
		ctx.font = '700 38px monospace';
		ctx.fillStyle = color;
		ctx.textBaseline = 'middle';
		let line = '';
		while (ctx.measureText(line).width < 1024) line += `${text}  //  `;
		ctx.fillText(line, 8, 34);
	}
	const t = new THREE.CanvasTexture(c);
	t.wrapS = THREE.RepeatWrapping;
	t.colorSpace = THREE.SRGBColorSpace;
	return t;
}

type Props = { x?: number; z?: number; r: number; color: string; color2?: string; label: string; beam?: number };

export function HoloPad({ x = 0, z = 0, r, color, color2 = '#ffffff', label, beam = 0 }: Props) {
	const parts = useMemo(() => {
		const profile = [
			[0, 0.36],
			[r * 0.8, 0.36],
			[r * 0.84, 0.31],
			[r * 0.86, 0.24],
			[r * 0.97, 0.22],
			[r, 0.17],
			[r, 0],
		].map(([a, b]) => new THREE.Vector2(a, b));
		const neon = new THREE.Color(color).multiplyScalar(2.2);
		const tex = labelTexture(label, color);
		tex.repeat.set(Math.max(1, Math.round(r * 1.2)), 1);
		return {
			base: new THREE.LatheGeometry(profile, 8),
			top: additive(TOP, { uColor: { value: new THREE.Color(color) }, uColor2: { value: new THREE.Color(color2) }, uSeed: { value: (Math.abs(x * 7.13 + z * 3.71) % 1) || 0.37 } }),
			chevrons: additive(CHEVRONS, { uColor: { value: neon } }),
			contact: new THREE.MeshBasicMaterial({ color: neon, toneMapped: false }),
			band: new THREE.MeshBasicMaterial({ map: tex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }),
			beam: beam > 0 ? additive(BEAM, { uColor: { value: new THREE.Color(color) } }) : null,
			glow: additive(GLOW, { uColor: { value: new THREE.Color(color) } }),
		};
	}, [r, color, color2, label, beam, x, z]);
	const ring = useRef<THREE.Mesh>(null);
	useFrame((_, dt) => {
		if (ring.current) ring.current.rotation.z += dt * 0.15;
	});

	return (
		// the street sits at -0.06: the dais stands on it
		<group position={[x, -0.06, z]}>
			<mesh geometry={parts.base} material={steel} rotation={[0, Math.PI / 8, 0]} castShadow receiveShadow />
			<mesh position={[0, 0.365, 0]} rotation={[-Math.PI / 2, 0, 0]} material={parts.top}>
				<circleGeometry args={[r * 0.8, 64]} />
			</mesh>
			<mesh ref={ring} position={[0, 0.225, 0]} rotation={[-Math.PI / 2, 0, 0]} material={parts.chevrons}>
				<ringGeometry args={[r * 0.875, r * 0.945, 64]} />
			</mesh>
			{/* the neon line where the dais meets the street: what grounds it visually */}
			<mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 8]} material={parts.contact}>
				<ringGeometry args={[r + 0.02, r + 0.09, 8, 1]} />
			</mesh>
			<mesh position={[0, 0.09, 0]} rotation={[0, Math.PI / 8, 0]} material={parts.band}>
				<cylinderGeometry args={[r * 1.004, r * 1.004, 0.1, 8, 1, true]} />
			</mesh>
			{parts.beam && (
				<mesh position={[0, 0.37 + beam / 2, 0]} material={parts.beam}>
					<cylinderGeometry args={[r * 0.78, r * 0.8, beam, 48, 1, true]} />
				</mesh>
			)}
			<mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} material={parts.glow}>
				<planeGeometry args={[r * 3.4, r * 3.4]} />
			</mesh>
		</group>
	);
}
