'use client';

import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

import { player } from '@/lib/player-state';

import { fpsMuzzle, glowTexture } from './Lasers';

/**
 * First-person rifle (Quaternius Sci-Fi Essentials, CC0) held by gloved arms (para's "fps arms", CC0, MakeHuman mesh,
 * posed on the rifle and baked in the weapon frame), glued to the camera with sway, bob, recoil and muzzle flash.
 */
useGLTF.preload('/models/rifle.glb');
useGLTF.preload('/models/fps/arms.glb');

/** Copy of a model drawn over the world (no culling, after the scene) so it never clips into walls. */
function useViewModel(scene: THREE.Object3D) {
	return useMemo(() => {
		const g = scene.clone(true);
		g.traverse((o) => {
			const m = o as THREE.Mesh;
			if (m.isMesh) {
				m.frustumCulled = false;
				const mat = (m.material as THREE.MeshStandardMaterial).clone();
				mat.depthTest = true;
				m.material = mat;
				m.renderOrder = 10;
			}
		});
		return g;
	}, [scene]);
}

export function FpsWeapon() {
	const gun = useViewModel(useGLTF('/models/rifle.glb').scene);
	const arms = useViewModel(useGLTF('/models/fps/arms.glb').scene);
	const { camera } = useThree();
	const root = useRef<THREE.Group>(null);
	const flash = useRef<THREE.Mesh>(null);
	const glow = useRef<THREE.Mesh>(null);
	const kick = useRef(0);
	const sway = useRef({ x: 0, y: 0 });
	const shot = useRef({ roll: 0, size: 1 });
	// muzzle flash: a white-hot star with a cyan glow, the same energy as the tracer it launches
	const fx = useMemo(() => {
		const star = glowTexture(1.1);
		const soft = glowTexture(0);
		const mat = (map: THREE.Texture, r: number, g: number, b: number) =>
			new THREE.MeshBasicMaterial({
				map,
				color: new THREE.Color(r, g, b),
				transparent: true,
				blending: THREE.AdditiveBlending,
				depthWrite: false,
				toneMapped: false,
				fog: false,
			});
		return { star: mat(star, 3.2, 3.0, 2.8), soft: mat(soft, 0.6, 1.6, 2.4), textures: [star, soft] };
	}, []);
	useEffect(
		() => () => {
			fx.star.dispose();
			fx.soft.dispose();
			fx.textures.forEach((t) => t.dispose());
			fpsMuzzle.ok = false;
		},
		[fx],
	);

	useEffect(() => {
		const on = () => {
			kick.current = 1;
			shot.current.roll = Math.random() * Math.PI;
			shot.current.size = 0.8 + Math.random() * 0.45;
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
		// whatever the zoom, the gun keeps the same size on screen: scale it (and its offsets) about the eye
		const fov = (camera as THREE.PerspectiveCamera).fov ?? 72;
		const k = Math.tan(THREE.MathUtils.degToRad(fov) / 2) / Math.tan(THREE.MathUtils.degToRad(72) / 2);
		g.scale.setScalar(k);
		// local offset: lower right, stock off screen, hands in view (Valorant-like framing); bob while running; recoil pushes back and up
		g.translateX((0.2 + Math.sin(t * 5.5) * 0.012 * run) * k);
		g.translateY((-0.2 + Math.abs(Math.cos(t * 5.5)) * 0.018 * run + Math.sin(t * 1.4) * 0.004) * k);
		g.translateZ((-0.36 + kick.current * 0.06) * k);
		// the barrel converges toward the crosshair; the arms are baked for exactly this pose
		g.rotateY(0.12);
		g.rotateZ(-0.05);
		g.rotateX(0.03 + kick.current * 0.1);
		// the weapon lags a little behind fast mouse movements
		sway.current.x += (THREE.MathUtils.clamp(player.camera.swayX * 0.004, -0.12, 0.12) - sway.current.x) * Math.min(1, dt * 10);
		sway.current.y += (THREE.MathUtils.clamp(player.camera.swayY * 0.004, -0.1, 0.1) - sway.current.y) * Math.min(1, dt * 10);
		player.camera.swayX *= Math.exp(-dt * 18);
		player.camera.swayY *= Math.exp(-dt * 18);
		g.rotateY(sway.current.x);
		g.rotateX(sway.current.y);
		const f = flash.current;
		if (f) {
			// two frames of star, a soft glow fading a little longer
			f.visible = kick.current > 0.74;
			f.rotation.z = shot.current.roll;
			f.scale.setScalar(0.15 * shot.current.size * (0.7 + 0.3 * kick.current));
			// the barrel's end in the world, where the tracers leave from
			g.updateMatrixWorld(true);
			fpsMuzzle.x = f.matrixWorld.elements[12];
			fpsMuzzle.y = f.matrixWorld.elements[13];
			fpsMuzzle.z = f.matrixWorld.elements[14];
			fpsMuzzle.ok = Number.isFinite(fpsMuzzle.x + fpsMuzzle.y + fpsMuzzle.z);
		}
		if (glow.current) {
			const k = Math.max(0, (kick.current - 0.45) / 0.55);
			glow.current.visible = k > 0;
			glow.current.scale.setScalar(0.12 + 0.1 * k);
			(glow.current.material as THREE.MeshBasicMaterial).opacity = k * k;
		}
	});

	return (
		<group ref={root}>
			<group rotation={[0, -Math.PI / 2, 0]} scale={0.62}>
				<primitive object={gun} />
			</group>
			{/* right hand on the grip, left hand on the handguard, forearms leaving the bottom of the screen */}
			<primitive object={arms} />
			<mesh ref={flash} position={[0, 0.117, -0.48]} visible={false} renderOrder={11} material={fx.star}>
				<planeGeometry args={[1, 1]} />
			</mesh>
			<mesh ref={glow} position={[0, 0.117, -0.47]} visible={false} renderOrder={11} material={fx.soft}>
				<planeGeometry args={[1, 1]} />
			</mesh>
		</group>
	);
}
