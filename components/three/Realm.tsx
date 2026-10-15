'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

import { sceneState } from '@/lib/scene-state';
import { PORTAL_INDEX, STATIONS } from '@/lib/stations';
import { LEG, stationAnchor } from './route';
import { mulberry32 } from './shapes';

/**
 * The first realm: floating islands, arcane crystals, glowing trees and fireflies,
 * all procedural (flat-shaded low poly, no downloads). It lives between the start
 * of the route and the portal.
 */

const REALM_END = -(PORTAL_INDEX + 0.4) * LEG;

const rock = new THREE.MeshStandardMaterial({ color: '#2d2142', roughness: 0.95, flatShading: true });
const rockDark = new THREE.MeshStandardMaterial({ color: '#1c1530', roughness: 1, flatShading: true });
const moss = new THREE.MeshStandardMaterial({ color: '#2f6f63', roughness: 0.9, flatShading: true, emissive: '#0c2a26', emissiveIntensity: 0.6 });
const foliage = new THREE.MeshStandardMaterial({ color: '#6b3fa0', roughness: 0.8, flatShading: true, emissive: '#3b1466', emissiveIntensity: 0.9 });
const bark = new THREE.MeshStandardMaterial({ color: '#3a2a2a', roughness: 1, flatShading: true });
const crystalMagenta = new THREE.MeshStandardMaterial({ color: '#e879f9', emissive: '#c50eff', emissiveIntensity: 2.2, roughness: 0.2, metalness: 0.1, flatShading: true });
const crystalCyan = new THREE.MeshStandardMaterial({ color: '#a5f3fc', emissive: '#38bdf8', emissiveIntensity: 2, roughness: 0.2, flatShading: true });
const stone = new THREE.MeshStandardMaterial({ color: '#4a4160', roughness: 0.85, flatShading: true });
const rune = new THREE.MeshBasicMaterial({ color: '#ffb35c', toneMapped: false });

function islandGeometry(seed: number) {
	const rng = mulberry32(seed);
	const g = new THREE.IcosahedronGeometry(1, 2);
	const p = g.attributes.position;
	const v = new THREE.Vector3();
	for (let i = 0; i < p.count; i++) {
		v.fromBufferAttribute(p, i);
		const n = 0.85 + rng() * 0.3;
		if (v.y > 0.15) v.y = 0.15 + (v.y - 0.15) * 0.12; // flat top
		else v.y = v.y * (1.9 + rng() * 0.6); // stalactite underside
		v.x *= n;
		v.z *= n;
		p.setXYZ(i, v.x, v.y, v.z);
	}
	g.computeVertexNormals();
	return g;
}

type IslandSpec = { pos: [number, number, number]; scale: number; seed: number; trees: number; crystals: number; ruin: boolean };

function Island({ spec, geo }: { spec: IslandSpec; geo: THREE.BufferGeometry }) {
	const ref = useRef<THREE.Group>(null);
	const rng = useMemo(() => mulberry32(spec.seed * 7), [spec.seed]);
	const props = useMemo(() => {
		const trees = Array.from({ length: spec.trees }, () => ({ x: (rng() - 0.5) * 1.1, z: (rng() - 0.5) * 1.1, s: 0.18 + rng() * 0.16 }));
		const crystals = Array.from({ length: spec.crystals }, () => ({ x: (rng() - 0.5) * 1.3, z: (rng() - 0.5) * 1.3, s: 0.08 + rng() * 0.12, r: rng() * 0.6, cyan: rng() > 0.6 }));
		return { trees, crystals, phase: rng() * Math.PI * 2 };
	}, [rng, spec.trees, spec.crystals]);

	useFrame(({ clock }) => {
		const g = ref.current;
		if (!g) return;
		g.position.y = spec.pos[1] + Math.sin(clock.elapsedTime * 0.4 + props.phase) * 0.35 * spec.scale * 0.2;
		g.rotation.y = Math.sin(clock.elapsedTime * 0.05 + props.phase) * 0.2;
	});

	return (
		<group ref={ref} position={spec.pos} scale={spec.scale}>
			<mesh geometry={geo} material={spec.seed % 2 ? rock : rockDark} />
			<mesh position={[0, 0.17, 0]} scale={[0.92, 0.06, 0.92]} material={moss}>
				<cylinderGeometry args={[1, 1, 1, 9]} />
			</mesh>
			{props.trees.map((t, i) => (
				<group key={i} position={[t.x, 0.2, t.z]} scale={t.s}>
					<mesh position={[0, 0.8, 0]} material={bark}>
						<cylinderGeometry args={[0.12, 0.2, 1.6, 5]} />
					</mesh>
					<mesh position={[0, 2, 0]} material={foliage}>
						<coneGeometry args={[0.9, 1.6, 6]} />
					</mesh>
					<mesh position={[0, 2.8, 0]} material={foliage}>
						<coneGeometry args={[0.6, 1.2, 6]} />
					</mesh>
				</group>
			))}
			{props.crystals.map((c, i) => (
				<mesh key={i} position={[c.x, 0.2 + c.s, c.z]} rotation={[c.r, c.r * 2, 0]} scale={[c.s * 0.6, c.s * 1.8, c.s * 0.6]} material={c.cyan ? crystalCyan : crystalMagenta}>
					<octahedronGeometry args={[1, 0]} />
				</mesh>
			))}
			{spec.ruin && (
				<group position={[0, 0.2, 0]} scale={0.32}>
					{/* standing stones in a circle, an ancient waystone */}
					{Array.from({ length: 7 }, (_, i) => {
						const a = (i / 7) * Math.PI * 2;
						return (
							<mesh key={i} position={[Math.cos(a) * 1.6, 0.9, Math.sin(a) * 1.6]} rotation={[0, -a, 0.05]} material={stone}>
								<boxGeometry args={[0.35, 1.8 + (i % 3) * 0.3, 0.5]} />
							</mesh>
						);
					})}
					<mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]} material={rune}>
						<ringGeometry args={[0.8, 0.86, 48]} />
					</mesh>
				</group>
			)}
		</group>
	);
}

const fireflyVertex = /* glsl */ `
uniform float uTime;
uniform float uPixelRatio;
attribute float aRand;
varying float vA;
void main() {
	vec3 p = position;
	p.x += sin(uTime * 0.6 + aRand * 30.0) * 0.8;
	p.y += sin(uTime * 0.9 + aRand * 17.0) * 0.6;
	p.z += cos(uTime * 0.5 + aRand * 11.0) * 0.8;
	vec4 mv = modelViewMatrix * vec4(p, 1.0);
	gl_Position = projectionMatrix * mv;
	float blink = 0.5 + 0.5 * sin(uTime * (1.0 + aRand * 2.0) + aRand * 60.0);
	gl_PointSize = (30.0 + aRand * 40.0) * uPixelRatio * blink / -mv.z;
	vA = blink;
}
`;
const fireflyFragment = /* glsl */ `
varying float vA;
void main() {
	float d = length(gl_PointCoord - 0.5);
	if (d > 0.5) discard;
	float g = pow(smoothstep(0.5, 0.0, d), 2.5);
	gl_FragColor = vec4(vec3(1.0, 0.78, 0.42) * 1.8, g * vA);
}
`;

function Fireflies({ count, pixelRatio }: { count: number; pixelRatio: number }) {
	const data = useMemo(() => {
		const rng = mulberry32(77);
		const positions = new Float32Array(count * 3);
		const rand = new Float32Array(count);
		for (let i = 0; i < count; i++) {
			positions.set([(rng() - 0.5) * 70, (rng() - 0.5) * 26, 30 + rng() * (REALM_END - 30)], i * 3);
			rand[i] = rng();
		}
		return { positions, rand };
	}, [count]);
	const uniforms = useMemo(() => ({ uTime: { value: 0 }, uPixelRatio: { value: pixelRatio } }), [pixelRatio]);
	useFrame((_, dt) => {
		uniforms.uTime.value += Math.min(dt, 0.05);
	});
	return (
		<points frustumCulled={false}>
			<bufferGeometry>
				<bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
				<bufferAttribute attach="attributes-aRand" args={[data.rand, 1]} />
			</bufferGeometry>
			<shaderMaterial vertexShader={fireflyVertex} fragmentShader={fireflyFragment} uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
		</points>
	);
}

/** Huge stone arch framing the portal station: the gate between the two realms. */
function PortalArch({ position }: { position: THREE.Vector3 }) {
	const ref = useRef<THREE.Group>(null);
	useFrame(({ camera }) => {
		ref.current?.lookAt(camera.position.x, ref.current.position.y, camera.position.z);
	});
	return (
		<group ref={ref} position={position} scale={1.6}>
			{Array.from({ length: 13 }, (_, i) => {
				const a = (i / 12) * Math.PI;
				return (
					<mesh key={i} position={[Math.cos(a) * 4.6, Math.sin(a) * 4.6 - 0.6, 0]} rotation={[0, 0, a]} material={stone}>
						<boxGeometry args={[0.9, 1.25, 1]} />
					</mesh>
				);
			})}
			{[-1, 1].map((s) => (
				<mesh key={s} position={[s * 4.6, -2.8, 0]} material={stone}>
					<boxGeometry args={[1.1, 4.6, 1.1]} />
				</mesh>
			))}
			<mesh position={[0, 3.95, 0.55]} material={rune}>
				<octahedronGeometry args={[0.35, 0]} />
			</mesh>
		</group>
	);
}

type Props = { route: THREE.CatmullRomCurve3; wide: boolean; pixelRatio: number; density: number; portalAnchor: THREE.Vector3 };

export function Realm({ route, wide, pixelRatio, density, portalAnchor }: Props) {
	const group = useRef<THREE.Group>(null);
	const geos = useMemo(() => [11, 23, 37, 41].map(islandGeometry), []);

	const islands = useMemo<IslandSpec[]>(() => {
		const rng = mulberry32(2024);
		const list: IslandSpec[] = [];
		const tmp = new THREE.Vector3();
		const len = route.getLength();
		const maxU = Math.min(1, -REALM_END / len);
		for (let i = 0; i < 26; i++) {
			const u = (i / 26) * maxU;
			route.getPointAt(Math.min(u, 1), tmp);
			const side = i % 2 ? 1 : -1;
			const dist = (side > 0 ? 22 : 14) + rng() * 22;
			list.push({
				pos: [tmp.x + side * dist, tmp.y - 10 + rng() * 13, tmp.z - rng() * 10],
				scale: 2.5 + rng() * 5,
				seed: i,
				trees: Math.floor(rng() * 4),
				crystals: 1 + Math.floor(rng() * 4),
				ruin: rng() > 0.75,
			});
		}
		// a floating pedestal beneath the home sanctuary (the R logo)
		const home = stationAnchor(route, 0, wide, new THREE.Vector3());
		list.push({ pos: [home.x, home.y - 7.5, home.z], scale: 5.5, seed: 99, trees: 0, crystals: 6, ruin: true });
		return list;
	}, [route, wide]);

	// the realm fades out of existence past the portal
	useFrame(({ camera }) => {
		if (group.current) group.current.visible = camera.position.z > REALM_END - 60 && sceneState.travel < (PORTAL_INDEX + 1.2) / (STATIONS.length - 1);
	});

	return (
		<group ref={group}>
			{islands.map((s, i) => (
				<Island key={i} spec={s} geo={geos[i % geos.length]} />
			))}
			<Fireflies count={Math.round(600 * density)} pixelRatio={pixelRatio} />
			<PortalArch position={portalAnchor} />
		</group>
	);
}
