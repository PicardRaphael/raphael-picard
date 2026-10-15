'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

import { useGame } from '@/lib/game-store';
import { player } from '@/lib/player-state';
import { Starfield } from '../Cosmos';
import { ValleyLandmarks } from './Landmarks';
import { Mobs } from './Mobs';
import { Nature } from './Nature';
import { Nexus } from './Nexus';
import { Player } from './Player';
import { SkyDome } from './SkyDome';
import { Valley } from './Valley';

type Quality = { dpr: [number, number]; post: boolean; shadows: boolean; pr: number };

function detect(): Quality {
	const coarse = window.matchMedia('(pointer: coarse)').matches;
	const small = window.innerWidth < 768;
	const pr = Math.min(window.devicePixelRatio || 1, 1.5);
	if (coarse || small) return { dpr: [1, 1.25], post: false, shadows: false, pr: Math.min(pr, 1.25) };
	return { dpr: [1, 1.5], post: true, shadows: true, pr };
}

/** Sun, fog and background follow the zone: golden sunset in the valley, neon night in the Nexus. */
function Atmosphere({ shadows }: { shadows: boolean }) {
	const zone = useGame((s) => s.zone);
	const { scene } = useThree();
	const sun = useRef<THREE.DirectionalLight>(null);
	const target = useMemo(() => new THREE.Object3D(), []);

	useEffect(() => {
		scene.add(target);
		return () => {
			scene.remove(target);
		};
	}, [scene, target]);

	useEffect(() => {
		const val = zone === 'val';
		scene.fog = new THREE.Fog(val ? '#f2c79a' : '#120726', val ? 80 : 40, val ? 260 : 230);
		scene.background = val ? null : new THREE.Color('#07030f');
	}, [zone, scene]);

	// the shadow camera follows the player so shadows stay crisp everywhere
	useFrame(() => {
		const s = sun.current;
		if (!s) return;
		s.position.set(player.x + 40, player.y + 55, player.z + 25);
		target.position.set(player.x, player.y, player.z);
		s.target = target;
	});

	const val = zone === 'val';
	return (
		<>
			{val && <SkyDome />}
			<hemisphereLight args={[val ? '#ffe2b8' : '#6d4bd8', val ? '#4a6b2a' : '#0b0618', val ? 1.1 : 0.7]} />
			<directionalLight
				ref={sun}
				color={val ? '#ffc58a' : '#9f7aea'}
				intensity={val ? 2.6 : 0.9}
				castShadow={shadows}
				shadow-mapSize={[2048, 2048]}
				shadow-camera-left={-60}
				shadow-camera-right={60}
				shadow-camera-top={60}
				shadow-camera-bottom={-60}
				shadow-camera-near={1}
				shadow-camera-far={200}
				shadow-bias={-0.0004}
				shadow-normalBias={0.04}
			/>
			{!val && <Starfield count={2500} pixelRatio={1} />}
		</>
	);
}

export default function WorldScene() {
	const [q, setQ] = useState<Quality | null>(null);
	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect -- capability detection must run on the client
		setQ(detect());
	}, []);
	if (!q) return null;
	return (
		<Canvas
			className="!fixed inset-0"
			shadows={q.shadows ? 'soft' : false}
			dpr={q.dpr}
			camera={{ fov: 55, near: 0.3, far: 900, position: [0, 14, 30] }}
			gl={{ antialias: true, powerPreference: 'high-performance' }}
			aria-label="Monde 3D explorable de Raphaël Picard"
		>
			<Atmosphere shadows={q.shadows} />
			<Valley />
			<Suspense fallback={null}>
				<Nature />
				<Mobs />
			</Suspense>
			<ValleyLandmarks />
			<Nexus pixelRatio={q.pr} />
			<Player />
			{q.post && (
				<EffectComposer multisampling={0}>
					<Bloom mipmapBlur intensity={0.75} luminanceThreshold={0.85} luminanceSmoothing={0.2} radius={0.65} />
					<Vignette eskil={false} offset={0.3} darkness={0.6} />
				</EffectComposer>
			)}
		</Canvas>
	);
}
