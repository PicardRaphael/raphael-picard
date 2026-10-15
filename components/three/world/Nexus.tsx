'use client';

import { useFrame } from '@react-three/fiber';
import { Suspense, useMemo, useRef } from 'react';
import * as THREE from 'three';

import { projects } from '@/content/work';
import { NEXUS_CENTER, landmark } from '@/lib/world';
import { constellation, knot, mulberry32 } from '../shapes';
import { Cyber } from './Cyber';
import { PortalGate, QuestMarker } from './Landmarks';
import { RaphyModel } from './Raphy';

/**
 * The Nexus: a neon city floor, holographic towers and three AI "systems",
 * with the giant Raphy hologram as contact beacon.
 */

const gridVertex = /* glsl */ `
varying vec3 vWorld;
void main() { vec4 w = modelMatrix * vec4(position, 1.0); vWorld = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }
`;
const gridFragment = /* glsl */ `
uniform float uTime;
uniform vec2 uCenter;
varying vec3 vWorld;
float line(float v, float w) { float d = abs(fract(v - 0.5) - 0.5) / fwidth(v); return 1.0 - min(d / w, 1.0); }
void main() {
	vec2 p = vWorld.xz;
	float g1 = max(line(p.x / 4.0, 1.0), line(p.y / 4.0, 1.0));
	float g2 = max(line(p.x / 20.0, 1.4), line(p.y / 20.0, 1.4));
	float dist = length(p - uCenter);
	float pulse = 0.5 + 0.5 * sin(dist * 0.15 - uTime * 2.0);
	vec3 base = vec3(0.02, 0.015, 0.05);
	vec3 violet = vec3(0.4, 0.12, 1.0);
	vec3 cyan = vec3(0.22, 0.74, 0.97);
	vec3 col = base + violet * g1 * 0.35 + mix(cyan, violet, pulse) * g2 * 0.9;
	col *= smoothstep(160.0, 40.0, dist) * 0.9 + 0.1;
	gl_FragColor = vec4(col, 1.0);
}
`;

const pointsVertex = /* glsl */ `
uniform float uTime;
uniform float uPixelRatio;
attribute float aRand;
varying float vR;
void main() {
	vec4 mv = modelViewMatrix * vec4(position, 1.0);
	gl_Position = projectionMatrix * mv;
	gl_PointSize = (40.0 + aRand * 60.0) * uPixelRatio * (0.7 + 0.3 * sin(uTime * 2.0 + aRand * 30.0)) / -mv.z;
	vR = aRand;
}
`;
const pointsFragment = /* glsl */ `
uniform vec3 uA;
uniform vec3 uB;
varying float vR;
void main() {
	float d = length(gl_PointCoord - 0.5);
	if (d > 0.5) discard;
	gl_FragColor = vec4(mix(uA, uB, vR) * 1.8, pow(smoothstep(0.5, 0.0, d), 2.0));
}
`;

function Hologram({ positions, a, b, pixelRatio, ...props }: { positions: Float32Array; a: string; b: string; pixelRatio: number } & Record<string, unknown>) {
	const ref = useRef<THREE.Points>(null);
	const rand = useMemo(() => new Float32Array(positions.length / 3).map((_, i) => ((i * 9301 + 49297) % 233280) / 233280), [positions]);
	const uniforms = useMemo(() => ({ uTime: { value: 0 }, uPixelRatio: { value: pixelRatio }, uA: { value: new THREE.Color(a) }, uB: { value: new THREE.Color(b) } }), [a, b, pixelRatio]);
	useFrame((_, dt) => {
		uniforms.uTime.value += dt;
		if (ref.current) ref.current.rotation.y += dt * 0.15;
	});
	return (
		<points ref={ref} {...props}>
			<bufferGeometry>
				<bufferAttribute attach="attributes-position" args={[positions, 3]} />
				<bufferAttribute attach="attributes-aRand" args={[rand, 1]} />
			</bufferGeometry>
			<shaderMaterial vertexShader={pointsVertex} fragmentShader={pointsFragment} uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
		</points>
	);
}

const padMat = new THREE.MeshStandardMaterial({ color: '#141026', metalness: 0.8, roughness: 0.3 });
const neon = new THREE.MeshBasicMaterial({ color: '#38bdf8', toneMapped: false });
const neonMagenta = new THREE.MeshBasicMaterial({ color: '#e879f9', toneMapped: false });

function Pad({ x, z, r = 7 }: { x: number; z: number; r?: number }) {
	return (
		<group position={[x, 0, z]}>
			<mesh position={[0, 0.25, 0]} material={padMat} receiveShadow>
				<cylinderGeometry args={[r, r + 0.6, 0.5, 32]} />
			</mesh>
			<mesh position={[0, 0.52, 0]} rotation={[-Math.PI / 2, 0, 0]} material={neon}>
				<ringGeometry args={[r - 0.4, r - 0.2, 64]} />
			</mesh>
		</group>
	);
}

/** Holographic project cards arranged in an arc, drawn on canvas textures (no font download). */
function Gallery() {
	const l = landmark('gallery');
	const cards = useMemo(
		() =>
			projects.map((p, i) => {
				const c = document.createElement('canvas');
				c.width = 512;
				c.height = 320;
				const ctx = c.getContext('2d');
				if (ctx) {
					const g = ctx.createLinearGradient(0, 0, 512, 320);
					g.addColorStop(0, 'rgba(101,31,255,0.55)');
					g.addColorStop(1, 'rgba(197,14,255,0.35)');
					ctx.fillStyle = g;
					ctx.fillRect(0, 0, 512, 320);
					ctx.strokeStyle = i === 0 ? '#ff8000' : '#e879f9';
					ctx.lineWidth = 6;
					ctx.strokeRect(3, 3, 506, 314);
					ctx.fillStyle = '#7dd3fc';
					ctx.font = '600 22px monospace';
					ctx.fillText(p.kind.toUpperCase(), 28, 52);
					ctx.fillStyle = '#ffffff';
					ctx.font = '800 48px sans-serif';
					ctx.fillText(p.name, 28, 120);
					ctx.fillStyle = '#e9e5ff';
					ctx.font = '400 22px sans-serif';
					const words = p.pitch.split(' ');
					let line = '';
					let y = 170;
					for (const w of words) {
						if (ctx.measureText(line + w).width > 450) {
							ctx.fillText(line, 28, y);
							line = '';
							y += 30;
							if (y > 290) break;
						}
						line += `${w} `;
					}
					if (y <= 290) ctx.fillText(line, 28, y);
				}
				const tex = new THREE.CanvasTexture(c);
				tex.colorSpace = THREE.SRGBColorSpace;
				const a = -0.9 + (i / (projects.length - 1)) * 1.8;
				return { tex, x: Math.sin(a) * 14, z: -Math.cos(a) * 14 + 6, rot: -a };
			}),
		[],
	);
	const ref = useRef<THREE.Group>(null);
	useFrame(({ clock }) => {
		ref.current?.children.forEach((c, i) => {
			c.position.y = 4.2 + Math.sin(clock.elapsedTime * 1.2 + i) * 0.25;
		});
	});
	return (
		<group position={[l.x, 0, l.z]}>
			<Pad x={0} z={0} r={9} />
			<group ref={ref}>
				{cards.map((c, i) => (
					<mesh key={i} position={[c.x, 4.2, c.z]} rotation={[0, c.rot, 0]}>
						<planeGeometry args={[6.4, 4]} />
						<meshBasicMaterial map={c.tex} transparent opacity={0.92} side={THREE.DoubleSide} toneMapped={false} />
					</mesh>
				))}
			</group>
		</group>
	);
}

function Beacon() {
	const l = landmark('beacon');
	const ref = useRef<THREE.Group>(null);
	useFrame(({ clock }) => {
		if (!ref.current) return;
		ref.current.rotation.y = clock.elapsedTime * 0.25;
		ref.current.position.y = 11 + Math.sin(clock.elapsedTime) * 0.6;
	});
	return (
		<group position={[l.x, 0, l.z]}>
			<Pad x={0} z={0} r={8} />
			<mesh position={[0, 30, 0]}>
				<cylinderGeometry args={[0.6, 2.4, 60, 24, 1, true]} />
				<meshBasicMaterial color="#c50eff" transparent opacity={0.18} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
			</mesh>
			<group ref={ref} position={[0, 11, 0]}>
				<Suspense fallback={null}>
					<RaphyModel hologram scale={9} />
				</Suspense>
			</group>
			<QuestMarker id="beacon" height={22} />
		</group>
	);
}

function HoloNpc() {
	const l = landmark('holo');
	const ref = useRef<THREE.Group>(null);
	useFrame(({ clock }) => {
		if (ref.current) ref.current.position.y = 2.8 + Math.sin(clock.elapsedTime * 1.6) * 0.2;
	});
	return (
		<group position={[l.x, 0, l.z]}>
			<Pad x={0} z={0} r={2.4} />
			<group ref={ref} position={[0, 2.8, 0]}>
				<Suspense fallback={null}>
					<RaphyModel hologram scale={1.5} />
				</Suspense>
			</group>
			<QuestMarker id="holo" height={5.8} />
		</group>
	);
}

export function Nexus({ pixelRatio }: { pixelRatio: number }) {
	const agents = landmark('agents');
	const core = landmark('core');
	const back = landmark('portal-back');
	const race = landmark('race');
	const shapes = useMemo(() => ({ agents: constellation(5000, mulberry32(3)), core: knot(4500, mulberry32(4)) }), []);
	const uniforms = useMemo(() => ({ uTime: { value: 0 }, uCenter: { value: new THREE.Vector2(NEXUS_CENTER.x, NEXUS_CENTER.z) } }), []);
	useFrame((_, dt) => {
		uniforms.uTime.value += dt;
	});
	return (
		<group>
			<mesh position={[NEXUS_CENTER.x, 0, NEXUS_CENTER.z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
				<planeGeometry args={[520, 520]} />
				<shaderMaterial vertexShader={gridVertex} fragmentShader={gridFragment} uniforms={uniforms} extensions={{ derivatives: true } as never} />
			</mesh>
			<Cyber />
			<group position={[agents.x, 0, agents.z]}>
				<Pad x={0} z={0} r={6} />
				<Hologram positions={shapes.agents} a="#38bdf8" b="#c50eff" pixelRatio={pixelRatio} position={[0, 7, 0]} scale={1.7} />
			</group>
			<group position={[core.x, 0, core.z]}>
				<Pad x={0} z={0} r={6} />
				<Hologram positions={shapes.core} a="#e879f9" b="#651fff" pixelRatio={pixelRatio} position={[0, 7, 0]} scale={1.8} />
			</group>
			<Gallery />
			<Beacon />
			<HoloNpc />
			<PortalGate x={back.x} z={back.z} y={0} back />
			<group position={[race.x, 0, race.z]}>
				<Pad x={0} z={0} r={5} />
				{[-1, 1].map((s) => (
					<mesh key={s} position={[s * 5, 3, 0]} material={s > 0 ? neonMagenta : neon}>
						<boxGeometry args={[0.4, 6, 0.4]} />
					</mesh>
				))}
				<mesh position={[0, 6, 0]} material={neonMagenta}>
					<boxGeometry args={[10.4, 0.4, 0.4]} />
				</mesh>
			</group>
		</group>
	);
}
