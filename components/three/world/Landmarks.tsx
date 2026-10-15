'use client';

import { useFrame } from '@react-three/fiber';
import { Suspense, useMemo, useRef } from 'react';
import * as THREE from 'three';

import { useGame } from '@/lib/game-store';
import { QUESTS } from '@/lib/quests';
import { HOUSES, LANDMARKS, landmark, valHeight } from '@/lib/world';
import { RaphyModel } from './Raphy';

const wall = new THREE.MeshStandardMaterial({ color: '#eadbbd', roughness: 0.9, flatShading: true });
const timber = new THREE.MeshStandardMaterial({ color: '#5a3a24', roughness: 1, flatShading: true });
const roofBlue = new THREE.MeshStandardMaterial({ color: '#3b5aa8', roughness: 0.7, flatShading: true });
const roofRed = new THREE.MeshStandardMaterial({ color: '#9c4030', roughness: 0.8, flatShading: true });
const stone = new THREE.MeshStandardMaterial({ color: '#9a9184', roughness: 0.95, flatShading: true });
const stoneDark = new THREE.MeshStandardMaterial({ color: '#6c665f', roughness: 1, flatShading: true });
const windowGlow = new THREE.MeshBasicMaterial({ color: '#ffcf7a', toneMapped: false });
const arcane = new THREE.MeshBasicMaterial({ color: '#d58bff', toneMapped: false });
const fire = new THREE.MeshBasicMaterial({ color: '#ff8a2a', toneMapped: false });
const banner = new THREE.MeshStandardMaterial({ color: '#6d28d9', roughness: 0.8, side: THREE.DoubleSide, emissive: '#3b0a66', emissiveIntensity: 0.4 });
const gold = new THREE.MeshStandardMaterial({ color: '#d4a93c', metalness: 0.7, roughness: 0.3 });

const ground = (x: number, z: number) => valHeight(x, z);

/** Smoke puffs rising from a chimney. */
function Smoke({ position, color = '#d8d2c8' }: { position: [number, number, number]; color?: string }) {
	const ref = useRef<THREE.Group>(null);
	const puffs = useMemo(() => Array.from({ length: 6 }, (_, i) => i / 6), []);
	useFrame(({ clock }) => {
		ref.current?.children.forEach((c, i) => {
			const t = (clock.elapsedTime * 0.25 + puffs[i]) % 1;
			c.position.set(Math.sin(t * 6 + i) * 0.4 * t, t * 6, t * 0.8);
			const s = 0.35 + t * 1.2;
			c.scale.setScalar(s);
			((c as THREE.Mesh).material as THREE.MeshStandardMaterial).opacity = 0.55 * (1 - t);
		});
	});
	return (
		<group ref={ref} position={position}>
			{puffs.map((_, i) => (
				<mesh key={i}>
					<icosahedronGeometry args={[1, 0]} />
					<meshStandardMaterial color={color} transparent opacity={0.4} depthWrite={false} flatShading />
				</mesh>
			))}
		</group>
	);
}

function House({ x, z, r, s }: { x: number; z: number; r: number; s: number }) {
	const y = ground(x, z);
	const roof = Math.abs(x * 7 + z * 3) % 3 < 2 ? roofBlue : roofRed;
	return (
		<group position={[x, y, z]} rotation={[0, r, 0]} scale={s}>
			<mesh position={[0, 0.6, 0]} material={stoneDark} castShadow receiveShadow>
				<boxGeometry args={[6.4, 1.2, 5.4]} />
			</mesh>
			<mesh position={[0, 2.6, 0]} material={wall} castShadow receiveShadow>
				<boxGeometry args={[6, 2.8, 5]} />
			</mesh>
			{/* half-timbering */}
			{[-2.6, 0, 2.6].map((dx) => (
				<mesh key={dx} position={[dx, 2.6, 2.52]} material={timber}>
					<boxGeometry args={[0.25, 2.8, 0.1]} />
				</mesh>
			))}
			<mesh position={[0, 3.9, 2.53]} material={timber}>
				<boxGeometry args={[6, 0.25, 0.1]} />
			</mesh>
			{/* gable roof: a triangular prism */}
			<mesh position={[0, 5.3, 0]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 1]} material={roof} castShadow>
				<cylinderGeometry args={[2.6, 2.6, 7, 3, 1]} />
			</mesh>
			<mesh position={[1.8, 6.2, -1]} material={stone} castShadow>
				<boxGeometry args={[0.8, 2.4, 0.8]} />
			</mesh>
			<Smoke position={[1.8, 7.5, -1]} />
			{[-1.5, 1.5].map((dx) => (
				<mesh key={dx} position={[dx, 2.8, 2.56]} material={windowGlow}>
					<planeGeometry args={[0.9, 0.9]} />
				</mesh>
			))}
			<mesh position={[0, 1.9, 2.56]} material={timber}>
				<planeGeometry args={[1.1, 1.9]} />
			</mesh>
		</group>
	);
}

function Forge() {
	const l = landmark('forge');
	const y = ground(l.x, l.z);
	const light = useRef<THREE.PointLight>(null);
	useFrame(({ clock }) => {
		if (light.current) light.current.intensity = 30 + Math.sin(clock.elapsedTime * 13) * 6 + Math.sin(clock.elapsedTime * 7.3) * 5;
	});
	return (
		<group position={[l.x, y, l.z]} rotation={[0, 0.6, 0]}>
			<mesh position={[0, 2.5, -1.5]} material={stone} castShadow receiveShadow>
				<boxGeometry args={[9, 5, 5]} />
			</mesh>
			<mesh position={[0, 5.9, -1.5]} rotation={[0, 0, Math.PI / 2]} material={roofRed} castShadow>
				<cylinderGeometry args={[3.4, 3.4, 9.6, 3]} />
			</mesh>
			{/* open workshop with pillars */}
			{[-4, 4].map((dx) => (
				<mesh key={dx} position={[dx, 2, 2.6]} material={timber} castShadow>
					<boxGeometry args={[0.5, 4, 0.5]} />
				</mesh>
			))}
			<mesh position={[0, 4.1, 2.6]} material={timber} castShadow>
				<boxGeometry args={[8.6, 0.4, 0.5]} />
			</mesh>
			{/* furnace */}
			<mesh position={[-2.4, 1.4, 1.4]} material={stoneDark} castShadow>
				<boxGeometry args={[2.4, 2.8, 2]} />
			</mesh>
			<mesh position={[-2.4, 1.2, 2.42]} material={fire}>
				<planeGeometry args={[1.3, 1]} />
			</mesh>
			<mesh position={[-2.4, 6.6, -0.2]} material={stoneDark} castShadow>
				<boxGeometry args={[1.2, 5, 1.2]} />
			</mesh>
			<Smoke position={[-2.4, 9.3, -0.2]} color="#9a948c" />
			{/* anvil */}
			<group position={[1.6, 0, 2.4]}>
				<mesh position={[0, 0.5, 0]} material={stoneDark} castShadow>
					<cylinderGeometry args={[0.5, 0.6, 1, 6]} />
				</mesh>
				<mesh position={[0, 1.15, 0]} material={gold} castShadow>
					<boxGeometry args={[1.6, 0.4, 0.6]} />
				</mesh>
			</group>
			<pointLight ref={light} position={[-2.4, 1.6, 3.4]} color="#ff7a1a" intensity={30} distance={14} />
		</group>
	);
}

function Tower() {
	const l = landmark('tower');
	const y = ground(l.x, l.z);
	const orbs = useRef<THREE.Group>(null);
	useFrame(({ clock }) => {
		if (orbs.current) orbs.current.rotation.y = clock.elapsedTime * 0.6;
	});
	return (
		<group position={[l.x, y, l.z]}>
			<mesh position={[0, 1, 0]} material={stoneDark} castShadow receiveShadow>
				<cylinderGeometry args={[4.6, 5, 2, 10]} />
			</mesh>
			<mesh position={[0, 9, 0]} material={stone} castShadow receiveShadow>
				<cylinderGeometry args={[3.2, 3.9, 16, 10]} />
			</mesh>
			<mesh position={[0, 17.4, 0]} material={stoneDark} castShadow>
				<cylinderGeometry args={[4.1, 3.4, 1, 10]} />
			</mesh>
			<mesh position={[0, 21.4, 0]} material={roofBlue} castShadow>
				<coneGeometry args={[4.4, 7.5, 10]} />
			</mesh>
			<mesh position={[0, 25.8, 0]} material={gold}>
				<sphereGeometry args={[0.45, 12, 8]} />
			</mesh>
			{/* window ring */}
			{Array.from({ length: 6 }, (_, i) => {
				const a = (i / 6) * Math.PI * 2;
				return (
					<mesh key={i} position={[Math.cos(a) * 3.45, 12, Math.sin(a) * 3.45]} rotation={[0, -a + Math.PI / 2, 0]} material={arcane}>
						<planeGeometry args={[0.7, 1.4]} />
					</mesh>
				);
			})}
			{/* banners */}
			{[0.3, Math.PI + 0.3].map((a) => (
				<mesh key={a} position={[Math.cos(a) * 3.6, 7, Math.sin(a) * 3.6]} rotation={[0, -a + Math.PI / 2, 0]} material={banner}>
					<planeGeometry args={[1.6, 5]} />
				</mesh>
			))}
			<group ref={orbs} position={[0, 18.5, 0]}>
				{[0, 1, 2].map((i) => {
					const a = (i / 3) * Math.PI * 2;
					return (
						<mesh key={i} position={[Math.cos(a) * 6, Math.sin(i) * 0.8, Math.sin(a) * 6]} material={arcane}>
							<octahedronGeometry args={[0.5, 0]} />
						</mesh>
					);
				})}
			</group>
			<pointLight position={[0, 12, 0]} color="#c084fc" intensity={25} distance={18} />
		</group>
	);
}

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
			{HOUSES.map((h, i) => (
				<House key={i} {...h} />
			))}
			<Forge />
			<Tower />
			<Stones />
			<RaphyNpc />
			<Portal x={portal.x} z={portal.z} y={ground(portal.x, portal.z)} />
			{LANDMARKS.filter((l) => l.zone === 'val' && l.id !== 'raphy').map((l) => (
				<group key={l.id} position={[l.x, ground(l.x, l.z), l.z]}>
					<QuestMarker id={l.id} height={l.id === 'tower' ? 29 : 13} />
				</group>
			))}
		</group>
	);
}

export { Portal as PortalGate };
