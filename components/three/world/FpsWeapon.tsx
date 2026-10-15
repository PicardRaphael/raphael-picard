'use client';

import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

import { player } from '@/lib/player-state';

/** First-person rifle (Quaternius Sci-Fi Essentials, CC0) glued to the camera, with sway, bob, recoil and muzzle flash. */
useGLTF.preload('/models/rifle.glb');

export function FpsWeapon() {
	const { scene } = useGLTF('/models/rifle.glb');
	const { camera } = useThree();
	const root = useRef<THREE.Group>(null);
	const flash = useRef<THREE.Mesh>(null);
	const kick = useRef(0);
	const sway = useRef({ x: 0, y: 0 });
	const gun = useMemo(() => {
		const g = scene.clone(true);
		g.traverse((o) => {
			const m = o as THREE.Mesh;
			if (m.isMesh) {
				m.frustumCulled = false;
				// always drawn over the world so it never clips into walls
				const mat = (m.material as THREE.MeshStandardMaterial).clone();
				mat.depthTest = true;
				m.material = mat;
				m.renderOrder = 10;
			}
		});
		return g;
	}, [scene]);

	useEffect(() => {
		const on = () => {
			kick.current = 1;
		};
		window.addEventListener('fps:recoil', on);
		return () => window.removeEventListener('fps:recoil', on);
	}, []);

	useFrame(({ clock }, dt) => {
		const g = root.current;
		if (!g) return;
		kick.current = Math.max(0, kick.current - dt * 7);
		const t = clock.elapsedTime;
		const run = Math.min(player.speed / 10, 1);
		g.position.copy(camera.position);
		g.quaternion.copy(camera.quaternion);
		// local offset: lower right, slightly forward; bob while running; recoil pushes back and up
		g.translateX(0.28 + Math.sin(t * 5.5) * 0.012 * run);
		g.translateY(-0.26 + Math.abs(Math.cos(t * 5.5)) * 0.02 * run + Math.sin(t * 1.4) * 0.004);
		g.translateZ(-0.55 + kick.current * 0.09);
		g.rotateX(kick.current * 0.12);
		// the weapon lags a little behind fast mouse movements
		sway.current.x += (THREE.MathUtils.clamp(player.camera.swayX * 0.004, -0.12, 0.12) - sway.current.x) * Math.min(1, dt * 10);
		sway.current.y += (THREE.MathUtils.clamp(player.camera.swayY * 0.004, -0.1, 0.1) - sway.current.y) * Math.min(1, dt * 10);
		player.camera.swayX *= Math.exp(-dt * 18);
		player.camera.swayY *= Math.exp(-dt * 18);
		g.rotateY(sway.current.x);
		g.rotateX(sway.current.y);
		if (flash.current) {
			flash.current.visible = kick.current > 0.75;
			flash.current.rotation.z = t * 40;
		}
	});

	return (
		<group ref={root}>
			<group rotation={[0, -Math.PI / 2, 0]} scale={0.62}>
				<primitive object={gun} />
			</group>
			<mesh ref={flash} position={[0, 0.03, -0.72]} visible={false}>
				<circleGeometry args={[0.09, 6]} />
				<meshBasicMaterial color="#ffd38a" toneMapped={false} transparent opacity={0.95} />
			</mesh>
		</group>
	);
}
