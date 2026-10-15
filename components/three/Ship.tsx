'use client';

import { forwardRef, useMemo } from 'react';
import * as THREE from 'three';

/**
 * A procedural interceptor — no model download. Nose points to -Z.
 * Hull in dark metal, arcane violet/magenta accents, cyan canopy.
 */

const hull = new THREE.MeshStandardMaterial({ color: '#191433', metalness: 0.85, roughness: 0.28 });
const plate = new THREE.MeshStandardMaterial({ color: '#2b2160', metalness: 0.7, roughness: 0.35 });
const canopy = new THREE.MeshStandardMaterial({ color: '#0b2a3d', metalness: 0.95, roughness: 0.05, emissive: '#38bdf8', emissiveIntensity: 0.55 });
const neonMagenta = new THREE.MeshBasicMaterial({ color: '#e879f9', toneMapped: false });
const neonCyan = new THREE.MeshBasicMaterial({ color: '#7dd3fc', toneMapped: false });

function useGeometries() {
	return useMemo(() => {
		const profile = [
			[0, 1.75],
			[0.1, 1.45],
			[0.24, 0.9],
			[0.36, 0.2],
			[0.4, -0.5],
			[0.34, -1.1],
			[0.24, -1.35],
			[0, -1.35],
		].map(([r, y]) => new THREE.Vector2(r, y));
		const fuselage = new THREE.LatheGeometry(profile, 10);
		fuselage.rotateX(-Math.PI / 2);
		fuselage.scale(1, 0.62, 1);

		const wingShape = new THREE.Shape();
		wingShape.moveTo(0.2, -0.45);
		wingShape.lineTo(2.25, 0.85);
		wingShape.lineTo(2.3, 1.12);
		wingShape.lineTo(1.6, 1.0);
		wingShape.lineTo(0.25, 1.0);
		const wing = new THREE.ExtrudeGeometry(wingShape, { depth: 0.07, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 1 });
		wing.rotateX(Math.PI / 2);
		wing.translate(0, 0.02, 0);

		const finShape = new THREE.Shape();
		finShape.moveTo(0, 0);
		finShape.lineTo(0.75, 0.15);
		finShape.lineTo(0.95, 0.9);
		finShape.lineTo(0.55, 0.9);
		const fin = new THREE.ExtrudeGeometry(finShape, { depth: 0.05, bevelEnabled: false });
		fin.rotateY(-Math.PI / 2);
		fin.translate(0.025, 0.12, 0.35);

		// leading-edge neon strip, from wing root to tip
		const a = new THREE.Vector3(0.2, 0, -0.45);
		const b = new THREE.Vector3(2.25, 0, 0.85);
		const len = a.distanceTo(b);
		const edge = new THREE.BoxGeometry(len, 0.025, 0.025);
		edge.rotateY(-Math.atan2(b.z - a.z, b.x - a.x));
		edge.translate((a.x + b.x) / 2, 0.06, (a.z + b.z) / 2);

		return { fuselage, wing, fin, edge };
	}, []);
}

export const Ship = forwardRef<THREE.Group, { flameRef?: React.Ref<THREE.Group> }>(function Ship({ flameRef }, ref) {
	const g = useGeometries();

	return (
		<group ref={ref}>
			<group scale={0.9}>
				<mesh geometry={g.fuselage} material={hull} />
				<mesh position={[0, 0.17, -0.55]} scale={[0.2, 0.13, 0.55]} material={canopy}>
					<sphereGeometry args={[1, 24, 16]} />
				</mesh>
				{[1, -1].map((side) => (
					<group key={side} scale={[side, 1, 1]}>
						<mesh geometry={g.wing} material={plate} />
						<mesh geometry={g.edge} material={side > 0 ? neonMagenta : neonCyan} />
						{/* wingtip navigation light */}
						<mesh position={[2.27, 0.05, 1.0]} material={side > 0 ? neonMagenta : neonCyan}>
							<sphereGeometry args={[0.06, 10, 8]} />
						</mesh>
						{/* engine nacelle */}
						<mesh position={[0.5, -0.02, 0.85]} rotation={[Math.PI / 2, 0, 0]} material={hull}>
							<cylinderGeometry args={[0.17, 0.21, 1.1, 12]} />
						</mesh>
						<mesh position={[0.5, -0.02, 1.41]} material={neonMagenta}>
							<circleGeometry args={[0.15, 20]} />
						</mesh>
					</group>
				))}
				<mesh geometry={g.fin} material={plate} />
				{/* arcane ring around the hull */}
				<mesh position={[0, 0, 0.55]} material={neonMagenta}>
					<torusGeometry args={[0.62, 0.012, 6, 64]} />
				</mesh>
				{/* exhaust flames, stretched by the flight speed */}
				<group ref={flameRef} position={[0, -0.02, 1.42]}>
					{[0.5, -0.5].map((x) => (
						<mesh key={x} position={[x, 0, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
							<coneGeometry args={[0.13, 1, 14, 1, true]} />
							<meshBasicMaterial color="#c50eff" transparent opacity={0.55} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
						</mesh>
					))}
				</group>
			</group>
			<pointLight position={[0, 0.2, 1.4]} color="#c50eff" intensity={6} distance={6} />
		</group>
	);
});
