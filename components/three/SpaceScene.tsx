'use client';

import { Environment, Lightformer } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';

import { PORTAL_INDEX } from '@/lib/stations';

import { Nebulae, SpeedLines, Starfield } from './Cosmos';
import { Flight } from './Flight';
import { Realm } from './Realm';
import { createRoute, stationAnchor } from './route';
import { Sky } from './Sky';
import { Stations } from './Stations';

type Quality = { density: number; stars: number; dpr: [number, number]; post: boolean; reducedMotion: boolean; wide: boolean };

function detectQuality(): Quality {
	const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const coarse = window.matchMedia('(pointer: coarse)').matches;
	const wide = window.innerWidth >= 1024;
	const cores = navigator.hardwareConcurrency ?? 4;
	if (coarse || window.innerWidth < 768) return { density: 0.5, stars: 2500, dpr: [1, 1.5], post: false, reducedMotion, wide };
	if (cores <= 4) return { density: 0.7, stars: 3500, dpr: [1, 1.25], post: true, reducedMotion, wide };
	return { density: 1, stars: 5000, dpr: [1, 1.5], post: true, reducedMotion, wide };
}

function hasWebGL() {
	try {
		const c = document.createElement('canvas');
		return Boolean(c.getContext('webgl2') ?? c.getContext('webgl'));
	} catch {
		return false;
	}
}

/**
 * The 3D journey: a ship flies from station to station as the visitor scrolls.
 * Purely decorative (aria-hidden): every piece of content lives in the HTML.
 */
export default function SpaceScene() {
	const [quality, setQuality] = useState<Quality | null>(null);
	const route = useMemo(() => createRoute(), []);

	useEffect(() => {
		if (!hasWebGL()) return;
		const update = () => setQuality(detectQuality());
		update();
		let t: ReturnType<typeof setTimeout>;
		const onResize = () => {
			clearTimeout(t);
			t = setTimeout(update, 250);
		};
		window.addEventListener('resize', onResize);
		return () => window.removeEventListener('resize', onResize);
	}, []);

	const portalAnchor = useMemo(() => stationAnchor(route, PORTAL_INDEX, quality?.wide ?? true, new THREE.Vector3()), [route, quality?.wide]);

	if (!quality) return null;
	const pr = Math.min(window.devicePixelRatio || 1, quality.dpr[1]);

	return (
		<Canvas
			className="!fixed inset-0 -z-10"
			aria-hidden
			dpr={quality.dpr}
			camera={{ position: [0, 2, 8], fov: 55, near: 0.1, far: 600 }}
			gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
			style={{ pointerEvents: 'none' }}
		>
			<color attach="background" args={['#1a0d2e']} />
			<Sky />
			<fog attach="fog" args={['#2b1340', 40, 190]} />
			<ambientLight intensity={0.25} />
			<directionalLight position={[6, 8, 4]} intensity={1.4} color="#d8ccff" />
			<directionalLight position={[-8, -2, -6]} intensity={1.2} color="#38bdf8" />
			<Environment resolution={64} frames={1}>
				<Lightformer form="rect" intensity={3} color="#8b5cf6" position={[0, 5, -6]} scale={[12, 2, 1]} />
				<Lightformer form="rect" intensity={2} color="#38bdf8" position={[-6, 0, 2]} rotation-y={Math.PI / 2} scale={[8, 2, 1]} />
				<Lightformer form="ring" intensity={2.5} color="#c50eff" position={[6, 1, 2]} rotation-y={-Math.PI / 2} scale={4} />
			</Environment>

			<Starfield count={quality.stars} pixelRatio={pr} />
			<Nebulae />
			<SpeedLines count={quality.wide ? 220 : 120} />
			<Realm route={route} wide={quality.wide} pixelRatio={pr} density={quality.density} portalAnchor={portalAnchor} />
			<Stations route={route} wide={quality.wide} density={quality.density} pixelRatio={pr} />
			<Flight route={route} wide={quality.wide} pixelRatio={pr} reducedMotion={quality.reducedMotion} />

			{quality.post && (
				<EffectComposer multisampling={0}>
					<Bloom mipmapBlur intensity={1.05} luminanceThreshold={0.2} luminanceSmoothing={0.25} radius={0.7} />
					<Vignette eskil={false} offset={0.25} darkness={0.8} />
				</EffectComposer>
			)}
		</Canvas>
	);
}
