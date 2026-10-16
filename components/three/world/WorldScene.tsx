'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Bloom, EffectComposer, ToneMapping, Vignette } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

import { game, useGame } from '@/lib/game-store';
import { player } from '@/lib/player-state';
import { Starfield } from '../Cosmos';
import { ValleyLandmarks } from './Landmarks';
import { phaseFor, NIGHT } from '@/lib/daytime';
import { Rain } from './Cyber';
import { Lanterns } from './Lanterns';
import { AdaptiveQuality } from './AdaptiveQuality';
import { BlobShadows } from './BlobShadows';
import { Lasers } from './Lasers';
import { LightRig } from './LightRig';
import { Mobs } from './Mobs';
import { Nature } from './Nature';
import { Nexus } from './Nexus';
import { HeadPrompt } from './HeadPrompt';
import { QuestTrail } from './QuestTrail';
import { Player } from './Player';
import { SkyDome } from './SkyDome';
import { Valley } from './Valley';
import { Warmup, warmupSettings } from './Warmup';

type Quality = { dpr: [number, number]; post: boolean; shadows: boolean; pr: number };

function detect(): Quality {
	const coarse = window.matchMedia('(pointer: coarse)').matches;
	const small = window.innerWidth < 768;
	const pr = Math.min(window.devicePixelRatio || 1, 2);
	if (coarse || small) return { dpr: [1, 1.5], post: false, shadows: false, pr: Math.min(pr, 1.5) };
	// desktop: up to 1.5x (with the post-processing's 4x MSAA, 2x cost nearly twice the pixels for no visible gain)
	return { dpr: [1, 1.5], post: true, shadows: true, pr: Math.min(pr, 1.5) };
}

const LIGHT = {
	day: { hemi: ['#d6ebff', '#55752f', 1.45], sun: ['#fff1d6', 3.2], fog: '#b9d2ea', near: 140, far: 420 },
	dusk: { hemi: ['#ffd6a8', '#4a6b2a', 1.3], sun: ['#ffb070', 3.0], fog: '#d9b48f', near: 150, far: 400 },
	// a moonlit night, not a black one: the hand-painted val stays readable after 21 h
	night: { hemi: ['#7f8fe0', '#1c2440', 1.6], sun: ['#a9bcff', 1.8], fog: '#1a2142', near: 60, far: 280 },
} as const;

/** Sun, fog, sky and weather: the visitor's clock (or the options) in the valley, eternal rainy neon night in the Nexus. */
function Atmosphere({ shadows }: { shadows: boolean }) {
	const zone = useGame((s) => s.zone);
	const timeMode = useGame((s) => s.timeMode);
	const weatherMode = useGame((s) => s.weather);
	const { scene, camera } = useThree();
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
		// nothing is drawn past the fog: the other realm, 600 m away, is culled and costs no draw call
		const cam = camera as THREE.PerspectiveCamera;
		cam.far = val ? 450 : 240;
		cam.updateProjectionMatrix();
	}, [val, scene, camera, L, weather]);

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
			<hemisphereLight args={[val ? L.hemi[0] : '#41507f', val ? L.hemi[1] : '#05060a', (val ? L.hemi[2] : 0.8) * dim]} />
			<directionalLight
				ref={sun}
				color={val ? L.sun[0] : '#8fb3ff'}
				intensity={(val ? L.sun[1] : 1.1) * dim}
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
			<Lanterns on={val} night={Math.max(night, weather === 'rain' ? 0.5 : 0)} />
			{/* the only point lights of the world: a fixed pool shared by lanterns, lamps, gates and kiosks */}
			<LightRig />
		</>
	);
}

/**
 * Download progress for the start screen (which must not import three.js itself). The loaders start while
 * React renders the suspended models, before any effect could subscribe: the manager is hooked as soon as
 * this chunk loads, and publishes on the next frame, never in the middle of a render.
 */
if (typeof window !== 'undefined') {
	const manager = THREE.DefaultLoadingManager;
	let frame = 0;
	const publish = (loading: number) => {
		cancelAnimationFrame(frame);
		frame = requestAnimationFrame(() => game.set({ loading }));
	};
	manager.onProgress = (_url, loaded, total) => publish(Math.min(99, Math.round((loaded / Math.max(total, 1)) * 100)));
	manager.onLoad = () => publish(100);
}

/** The val is compiled: the start screen lets the visitor in. */
const markReady = () => game.set({ ready: true });

export default function WorldScene() {
	const [q, setQ] = useState<Quality | null>(null);
	useEffect(() => {
		const quality = detect();
		warmupSettings.offscreen = quality.post;
		// eslint-disable-next-line react-hooks/set-state-in-effect -- capability detection must run on the client
		setQ(quality);
	}, []);
	if (!q) return null;
	return (
		<Canvas
			className="!fixed inset-0"
			// PCF: what three draws anyway (it swaps the deprecated soft PCF for it on the first shadow pass, and every shader
			// compiled before that pass would be compiled again, one by one)
			shadows={q.shadows ? 'percentage' : false}
			dpr={q.dpr}
			camera={{ fov: 55, near: 0.3, far: 900, position: [0, 14, 30] }}
			// MSAA comes from the post-processing composer when it runs
			gl={{ antialias: !q.post, powerPreference: 'high-performance' }}
			// shader errors are read back synchronously (a blocking query under ANGLE): development only
			onCreated={({ gl }) => {
				gl.debug.checkShaderErrors = process.env.NODE_ENV !== 'production';
			}}
			aria-hidden
		>
			<Atmosphere shadows={q.shadows} />
			<AdaptiveQuality cap={q.dpr[1]} />
			<Suspense fallback={null}>
				<Valley />
				<Nature />
				<ValleyLandmarks />
				<Mobs />
				<BlobShadows />
				<Lasers />
				<Player />
				<Warmup pause onReady={markReady} />
			</Suspense>
			{/* the Nexus loads on its own: the val is playable without waiting for the city across the portal */}
			<Suspense fallback={null}>
				<Nexus pixelRatio={q.pr} reflect={q.post} />
				<Warmup />
			</Suspense>
			<HeadPrompt />
			<QuestTrail />
			{/* what mounts at once, outside the loading boundaries (sky, lanterns, trail…) */}
			<Warmup />
			{q.post && (
				<EffectComposer multisampling={4}>
					<Bloom mipmapBlur intensity={0.75} luminanceThreshold={0.85} luminanceSmoothing={0.2} radius={0.65} />
					{/* the composer turns the renderer's tone mapping off: ACES here, so desktop matches phones and neon no longer clips to white */}
					<ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
					<Vignette eskil={false} offset={0.3} darkness={0.6} />
				</EffectComposer>
			)}
		</Canvas>
	);
}
