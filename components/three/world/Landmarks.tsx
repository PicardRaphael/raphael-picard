'use client';

import { useFrame } from '@react-three/fiber';
import { Suspense, useMemo, useRef } from 'react';
import * as THREE from 'three';

import { useGame } from '@/lib/game-store';
import { QUESTS } from '@/lib/quests';
import { LANDMARKS, landmark, valHeight } from '@/lib/world';
import { Village } from './Buildings';
import { DarkGate } from './DarkGate';
import { RaphyModel } from './Raphy';

const stone = new THREE.MeshStandardMaterial({ color: '#9a9184', roughness: 0.95, flatShading: true });
const stoneDark = new THREE.MeshStandardMaterial({ color: '#6c665f', roughness: 1, flatShading: true });
const arcane = new THREE.MeshBasicMaterial({ color: '#d58bff', toneMapped: false });

const ground = (x: number, z: number) => valHeight(x, z);

function Stones() {
	const l = landmark('stones');
	const y = ground(l.x, l.z);
	const rune = useRef<THREE.Mesh>(null);
	useFrame(({ clock }) => {
		if (!rune.current) return;
		rune.current.rotation.y = clock.elapsedTime * 0.8;
		rune.current.position.y = 3.2 + Math.sin(clock.elapsedTime * 1.4) * 0.3;
	});
	return (
		<group position={[l.x, y, l.z]}>
			{Array.from({ length: 9 }, (_, i) => {
				const a = (i / 9) * Math.PI * 2;
				const h = 3.4 + (i % 3) * 0.8;
				return (
					<mesh key={i} position={[Math.cos(a) * 6.5, h / 2, Math.sin(a) * 6.5]} rotation={[0, -a, (i % 2 ? 1 : -1) * 0.05]} material={stone} castShadow>
						<boxGeometry args={[1.1, h, 1.6]} />
					</mesh>
				);
			})}
			<mesh position={[0, 0.5, 0]} material={stoneDark} castShadow receiveShadow>
				<cylinderGeometry args={[1.8, 2.1, 1, 8]} />
			</mesh>
			<mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]} material={arcane}>
				<ringGeometry args={[4.6, 4.85, 64]} />
			</mesh>
			<mesh ref={rune} position={[0, 3.2, 0]} material={arcane}>
				<octahedronGeometry args={[0.7, 0]} />
			</mesh>
			<pointLight position={[0, 3, 0]} color="#c084fc" intensity={18} distance={14} />
		</group>
	);
}

const portalVertex = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const portalFragment = /* glsl */ `
uniform float uTime;
varying vec2 vUv;
void main() {
	vec2 p = vUv - 0.5;
	float r = length(p) * 2.0;
	float a = atan(p.y, p.x);
	float swirl = sin(a * 5.0 - r * 9.0 + uTime * 2.5) * 0.5 + 0.5;
	vec3 violet = vec3(0.4, 0.12, 1.0);
	vec3 magenta = vec3(0.77, 0.05, 1.0);
	vec3 col = mix(violet, magenta, swirl) * (1.4 - r) + vec3(1.0) * pow(1.0 - r, 6.0);
	float alpha = smoothstep(1.0, 0.85, r);
	gl_FragColor = vec4(col * 1.6, alpha);
}
`;

function Portal({ x, z, y, back = false }: { x: number; z: number; y: number; back?: boolean }) {
	const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
	useFrame((_, dt) => {
		uniforms.uTime.value += dt;
	});
	const mat = back ? new THREE.MeshStandardMaterial({ color: '#1e1b3a', metalness: 0.8, roughness: 0.3, emissive: '#38bdf8', emissiveIntensity: 0.25 }) : stone;
	return (
		<group position={[x, y, z]}>
			{Array.from({ length: 16 }, (_, i) => {
				const a = (i / 16) * Math.PI * 2;
				return (
					<mesh key={i} position={[Math.cos(a) * 6, Math.sin(a) * 6 + 6.4, 0]} rotation={[0, 0, a]} material={mat} castShadow>
						<boxGeometry args={[1.3, 2.5, 1.6]} />
					</mesh>
				);
			})}
			<mesh position={[0, 6.4, 0]}>
				<circleGeometry args={[5.4, 64]} />
				<shaderMaterial vertexShader={portalVertex} fragmentShader={portalFragment} uniforms={uniforms} transparent side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
			</mesh>
			{[-1, 1].map((s) => (
				<mesh key={s} position={[s * 6.4, 0.6, 0]} material={mat} castShadow>
					<boxGeometry args={[2.2, 1.2, 2.4]} />
				</mesh>
			))}
			<pointLight position={[0, 6.4, 2]} color="#b06bff" intensity={40} distance={22} />
		</group>
	);
}

/** Floating WoW-style quest marker: yellow "!" to pick up, yellow "?" to turn in. */
export function QuestMarker({ id, height }: { id: string; height: number }) {
	const quests = useGame((s) => s.quests);
	const ref = useRef<THREE.Group>(null);
	const kind = QUESTS.some((q) => q.giver === id && quests[q.id] === 'available') ? '!' : QUESTS.some((q) => q.turnIn === id && quests[q.id] === 'ready') ? '?' : null;
	useFrame(({ clock, camera }) => {
		if (!ref.current) return;
		ref.current.position.y = height + Math.sin(clock.elapsedTime * 2.2) * 0.25;
		ref.current.lookAt(camera.position.x, ref.current.getWorldPosition(new THREE.Vector3()).y, camera.position.z);
	});
	if (!kind) return null;
	return (
		<group ref={ref} position={[0, height, 0]}>
			{kind === '!' ? (
				<>
					<mesh position={[0, 0.55, 0]}>
						<boxGeometry args={[0.32, 1.1, 0.2]} />
						<meshBasicMaterial color="#ffd100" toneMapped={false} />
					</mesh>
					<mesh position={[0, -0.35, 0]}>
						<boxGeometry args={[0.32, 0.32, 0.2]} />
						<meshBasicMaterial color="#ffd100" toneMapped={false} />
					</mesh>
				</>
			) : (
				<>
					<mesh position={[0, 0.65, 0]}>
						<torusGeometry args={[0.38, 0.13, 6, 16, Math.PI * 1.3]} />
						<meshBasicMaterial color="#ffd100" toneMapped={false} />
					</mesh>
					<mesh position={[0.05, 0.02, 0]}>
						<boxGeometry args={[0.26, 0.45, 0.2]} />
						<meshBasicMaterial color="#ffd100" toneMapped={false} />
					</mesh>
					<mesh position={[0.05, -0.42, 0]}>
						<boxGeometry args={[0.26, 0.26, 0.2]} />
						<meshBasicMaterial color="#ffd100" toneMapped={false} />
					</mesh>
				</>
			)}
		</group>
	);
}

function RaphyNpc() {
	const l = landmark('raphy');
	const y = ground(l.x, l.z);
	const ref = useRef<THREE.Group>(null);
	useFrame(({ clock }) => {
		if (!ref.current) return;
		ref.current.position.y = 2.6 + Math.sin(clock.elapsedTime * 1.6) * 0.2;
		ref.current.rotation.y = Math.sin(clock.elapsedTime * 0.7) * 0.35;
	});
	return (
		<group position={[l.x, y, l.z]}>
			<mesh position={[0, 0.5, 0]} material={stoneDark} castShadow receiveShadow>
				<cylinderGeometry args={[1.7, 2, 1, 8]} />
			</mesh>
			<mesh position={[0, 1.05, 0]} rotation={[-Math.PI / 2, 0, 0]} material={arcane}>
				<ringGeometry args={[1.2, 1.35, 40]} />
			</mesh>
			<group ref={ref} position={[0, 2.6, 0]}>
				<Suspense fallback={null}>
					<RaphyModel scale={1.5} />
				</Suspense>
			</group>
			<QuestMarker id="raphy" height={5.6} />
		</group>
	);
}

export function ValleyLandmarks() {
	const portal = landmark('portal');
	return (
		<group>
			<Suspense fallback={null}>
				<Village />
			</Suspense>
			<Stones />
			<RaphyNpc />
			<DarkGate x={portal.x} z={portal.z - 1} y={ground(portal.x, portal.z) - 0.4} />
			{LANDMARKS.filter((l) => l.zone === 'val' && l.id !== 'raphy').map((l) => (
				<group key={l.id} position={[l.x, ground(l.x, l.z), l.z]}>
					<QuestMarker id={l.id} height={l.id === 'tower' ? 29 : 13} />
				</group>
			))}
		</group>
	);
}

export { Portal as PortalGate };
