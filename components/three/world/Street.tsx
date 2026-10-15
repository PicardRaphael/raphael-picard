'use client';

import { MeshReflectorMaterial, useGLTF } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';

import { NEXUS_CENTER } from '@/lib/world';
import { mulberry32 } from '../shapes';

/**
 * Street level of the Nexus: wet reflective asphalt, glowing lane lines, coloured street lights
 * and sci-fi props (Quaternius Sci-Fi Essentials, CC0) piled along the plaza.
 */
useGLTF.preload('/models/props.glb');

const PROPS = ['Prop_Crate', 'Prop_Crate_Large', 'Prop_Crate_Tarp_Large', 'Prop_Barrel1', 'Prop_Barrel2_Closed', 'Prop_Locker', 'Prop_SatelliteDish'];

function Props() {
	const { scene } = useGLTF('/models/props.glb');
	const items = useMemo(() => {
		const rng = mulberry32(88);
		const list: { obj: THREE.Object3D; x: number; z: number; r: number }[] = [];
		for (let i = 0; i < 46; i++) {
			const name = PROPS[Math.floor(rng() * (PROPS.length - (i % 9 === 0 ? 0 : 1)))];
			const src = scene.getObjectByName(name);
			if (!src) continue;
			const obj = src.clone(true);
			obj.position.set(0, 0, 0);
			const box = new THREE.Box3().setFromObject(obj);
			const s = (name.includes('Large') || name.includes('Locker') ? 2.4 : name.includes('Dish') ? 3.4 : 1.4) / Math.max(box.max.y - box.min.y, 0.01);
			obj.scale.setScalar(s);
			obj.position.y = -box.min.y * s;
			obj.traverse((o) => {
				const m = o as THREE.Mesh;
				if (m.isMesh) {
					m.castShadow = true;
					m.receiveShadow = true;
				}
			});
			// clusters along the edge of the plaza, away from the paths of the landmarks
			const a = rng() * Math.PI * 2;
			const r = 72 + rng() * 40;
			list.push({ obj, x: NEXUS_CENTER.x + Math.cos(a) * r, z: NEXUS_CENTER.z + Math.sin(a) * r, r: rng() * Math.PI * 2 });
		}
		return list;
	}, [scene]);
	return (
		<>
			{items.map((it, i) => (
				<group key={i} position={[it.x, 0, it.z]} rotation={[0, it.r, 0]}>
					<primitive object={it.obj} />
				</group>
			))}
		</>
	);
}

const LIGHT_COLORS = ['#ff2bd6', '#22d3ee', '#ff8a00', '#a855f7', '#22d3ee', '#ff2bd6'];

export function Street({ reflect }: { reflect: boolean }) {
	const lanes = useMemo(() => {
		const list: { x: number; z: number; w: number; d: number; c: string }[] = [];
		for (let i = -3; i <= 3; i++) list.push({ x: NEXUS_CENTER.x + i * 26, z: NEXUS_CENTER.z, w: 0.18, d: 300, c: i % 2 ? '#22d3ee' : '#ff2bd6' });
		for (let i = -3; i <= 3; i++) list.push({ x: NEXUS_CENTER.x, z: NEXUS_CENTER.z + i * 26, w: 300, d: 0.18, c: i % 2 ? '#a855f7' : '#22d3ee' });
		return list;
	}, []);
	return (
		<group>
			<mesh position={[NEXUS_CENTER.x, 0, NEXUS_CENTER.z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
				<planeGeometry args={[520, 520]} />
				{reflect ? (
					<MeshReflectorMaterial
						resolution={1024}
						blur={[400, 120]}
						mixBlur={1}
						mixStrength={2.4}
						mixContrast={1.1}
						depthScale={1.2}
						minDepthThreshold={0.35}
						maxDepthThreshold={1.3}
						mirror={0.85}
						color="#0a0b12"
						metalness={0.55}
						roughness={0.72}
					/>
				) : (
					<meshStandardMaterial color="#0b0c14" metalness={0.6} roughness={0.35} />
				)}
			</mesh>
			{lanes.map((l, i) => (
				<mesh key={i} position={[l.x, 0.03, l.z]} rotation={[-Math.PI / 2, 0, 0]}>
					<planeGeometry args={[l.w, l.d]} />
					<meshBasicMaterial color={l.c} transparent opacity={0.55} toneMapped={false} />
				</mesh>
			))}
			{LIGHT_COLORS.map((c, i) => {
				const a = (i / LIGHT_COLORS.length) * Math.PI * 2;
				return <pointLight key={i} position={[NEXUS_CENTER.x + Math.cos(a) * 55, 9, NEXUS_CENTER.z + Math.sin(a) * 55]} color={c} intensity={120} distance={70} decay={1.6} />;
			})}
			<Props />
		</group>
	);
}
