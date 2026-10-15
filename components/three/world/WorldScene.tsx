'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

import { useGame } from '@/lib/game-store';
import { player } from '@/lib/player-state';
import { Starfield } from '../Cosmos';
import { ValleyLandmarks } from './Landmarks';
import { phaseFor, NIGHT } from '@/lib/daytime';
import { Rain } from './Cyber';
import { Lanterns } from './Lanterns';
import { Lasers } from './Lasers';
import { Mobs } from './Mobs';
import { Nature } from './Nature';
import { Nexus } from './Nexus';
import { HeadPrompt } from './HeadPrompt';
import { QuestTrail } from './QuestTrail';
import { Player } from './Player';
import { SkyDome } from './SkyDome';
import { Valley } from './Valley';

type Quality = { dpr: [number, number]; post: boolean; shadows: boolean; pr: number };

function detect(): Quality {
	const coarse = window.matchMedia('(pointer: coarse)').matches;
	const small = window.innerWidth < 768;
	const pr = Math.min(window.devicePixelRatio || 1, 2);
	if (coarse || small) return { dpr: [1, 1.5], post: false, shadows: false, pr: Math.min(pr, 1.5) };
	// sharp desktop rendering: full device resolution up to 2x
	return { dpr: [1, 2], post: true, shadows: true, pr };
}

const LIGHT = {
	day: { hemi: ['#d6ebff', '#55752f', 1.25], sun: ['#fff1d6', 2.8], fog: '#b9d2ea', near: 140, far: 420 },
	dusk: { hemi: ['#ffe2b8', '#4a6b2a', 1.1], sun: ['#ffc58a', 2.6], fog: '#e8bf98', near: 120, far: 380 },
	night: { hemi: ['#4b5aa8', '#0d1020', 0.55], sun: ['#9fb4ff', 0.75], fog: '#151b36', near: 45, far: 210 },
} as const;

/** Sun, fog, sky and weather: the visitor's clock (or the options) in the valley, eternal rainy neon night in the Nexus. */
function Atmosphere({ shadows }: { shadows: boolean }) {
	const zone = useGame((s) => s.zone);
	const timeMode = useGame((s) => s.timeMode);
	const weatherMode = useGame((s) => s.weather);
	const { scene } = useThree();
	const sun = useRef<THREE.DirectionalLight>(null);
	const target = useMemo(() => new THREE.Object3D(), []);
	const phase = phaseFor(timeMode);
	const night = NIGHT[phase];
	const val = zone === 'val';
	const weather = weatherMode === 'auto' ? (val ? (phase === 'dusk' ? 'clear' : 'clear') : 'rain') : weatherMode;
	const L = LIGHT[phase];

	useEffect(() => {
		scene.add(target);
		return () => {
			scene.remove(target);
		};
	}, [scene, target]);

	useEffect(() => {
		const fogK = weather === 'fog' ? 0.35 : weather === 'rain' ? 0.7 : 1;
		scene.fog = val ? new THREE.Fog(weather === 'rain' ? '#7d8796' : L.fog, L.near * fogK, L.far * fogK) : new THREE.Fog('#0b0e1a', 28 * fogK, 200 * fogK);
		scene.background = val ? null : new THREE.Color('#07030f');
	}, [val, scene, L, weather]);

	// the shadow camera follows the player so shadows stay crisp everywhere
	useFrame(() => {
		const s = sun.current;
		if (!s) return;
		s.position.set(player.x + 40, player.y + (phase === 'day' ? 80 : 45), player.z + 25);
		target.position.set(player.x, player.y, player.z);
		s.target = target;
	});

	const dim = weather === 'rain' ? 0.6 : 1;
	return (
		<>
			{val && <SkyDome night={weather === 'rain' ? Math.max(night, 0.35) : night} />}
			<hemisphereLight args={[val ? L.hemi[0] : '#41507f', val ? L.hemi[1] : '#05060a', (val ? L.hemi[2] : 0.55) * dim]} />
			<directionalLight
				ref={sun}
				color={val ? L.sun[0] : '#8fb3ff'}
				intensity={(val ? L.sun[1] : 0.9) * dim}
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
			{weather === 'rain' && <Rain count={val ? 1100 : 1500} />}
			{val && <Lanterns night={Math.max(night, weather === 'rain' ? 0.5 : 0)} />}
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
				<Lasers />
			</Suspense>
			<ValleyLandmarks />
			<Nexus pixelRatio={q.pr} reflect={q.post} />
			<Player />
			<HeadPrompt />
			<QuestTrail />
			{q.post && (
				<EffectComposer multisampling={4}>
					<Bloom mipmapBlur intensity={0.75} luminanceThreshold={0.85} luminanceSmoothing={0.2} radius={0.65} />
					<Vignette eskil={false} offset={0.3} darkness={0.6} />
				</EffectComposer>
			)}
		</Canvas>
	);
}
