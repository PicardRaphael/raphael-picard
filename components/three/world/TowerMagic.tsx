'use client';

import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

import { landmark, valHeight } from '@/lib/world';

/** Arcane dressing for the Tower of Knowledge: orbiting orbs, a violet beam, floating runes and crystals. */
const orbMat = new THREE.MeshBasicMaterial({ color: '#d58bff', toneMapped: false });
const runeMat = new THREE.MeshBasicMaterial({ color: '#7dd3fc', toneMapped: false, transparent: true, opacity: 0.9, side: THREE.DoubleSide });
const crystal = new THREE.MeshStandardMaterial({ color: '#e9d5ff', emissive: '#a855f7', emissiveIntensity: 2.2, roughness: 0.2, flatShading: true });

export function TowerMagic({ scale }: { scale: number }) {
	const l = landmark('tower');
	const { scene } = useGLTF('/models/village.glb');
	const height = useMemo(() => {
		const node = scene.getObjectByName('building_tower_A_blue');
		if (!node) return 20;
		const b = new THREE.Box3().setFromObject(node);
		return (b.max.y - b.min.y) * scale;
	}, [scene, scale]);
	const orbs = useRef<THREE.Group>(null);
	const runes = useRef<THREE.Group>(null);
	useFrame(({ clock }) => {
		const t = clock.elapsedTime;
		if (orbs.current) orbs.current.rotation.y = t * 0.7;
		if (runes.current) {
			runes.current.rotation.y = -t * 0.35;
			runes.current.position.y = height * 0.55 + Math.sin(t * 1.2) * 0.4;
		}
	});
	const y = valHeight(l.x, l.z);
	return (
		<group position={[l.x, y, l.z]}>
			<group ref={orbs} position={[0, height + 1.5, 0]}>
				{[0, 1, 2, 3].map((i) => {
					const a = (i / 4) * Math.PI * 2;
					return (
						<mesh key={i} position={[Math.cos(a) * 6.5, Math.sin(i * 2) * 1.2, Math.sin(a) * 6.5]} material={orbMat}>
							<icosahedronGeometry args={[0.55, 1]} />
						</mesh>
					);
				})}
			</group>
			<mesh position={[0, height + 22, 0]}>
				<cylinderGeometry args={[0.35, 1.4, 44, 16, 1, true]} />
				<meshBasicMaterial color="#b06bff" transparent opacity={0.22} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
			</mesh>
			<group ref={runes}>
				{Array.from({ length: 10 }, (_, i) => {
					const a = (i / 10) * Math.PI * 2;
					return (
						<mesh key={i} position={[Math.cos(a) * 7.5, 0, Math.sin(a) * 7.5]} rotation={[0, -a + Math.PI / 2, 0]} material={runeMat}>
							<ringGeometry args={[0.25, 0.45, 3]} />
						</mesh>
					);
				})}
			</group>
			{[0, 1, 2, 3, 4].map((i) => {
				const a = (i / 5) * Math.PI * 2 + 0.4;
				return (
					<mesh key={i} position={[Math.cos(a) * 6.8, 0.9, Math.sin(a) * 6.8]} rotation={[0.15, a, 0.1]} scale={[0.5, 1.6 + (i % 2) * 0.6, 0.5]} material={crystal}>
						<octahedronGeometry args={[1, 0]} />
					</mesh>
				);
			})}
			<pointLight position={[0, height * 0.6, 0]} color="#c084fc" intensity={35} distance={26} />
		</group>
	);
}
