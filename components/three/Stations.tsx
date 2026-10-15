'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

import { sceneState } from '@/lib/scene-state';
import { STATIONS, type StationShape } from '@/lib/stations';
import { stationAnchor } from './route';
import { constellation, galaxy, helix, knot, mulberry32, portal, sampleLogo, sphere, tree } from './shapes';

const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uSize;
uniform float uPixelRatio;
uniform float uEnergy;
attribute vec3 aColor;
attribute float aRand;
varying vec3 vColor;
varying float vAlpha;
void main() {
	vec3 p = position;
	// breathing + shimmer, stronger when the ship is close
	float wave = sin(uTime * 0.9 + aRand * 6.2831 + length(p) * 1.4);
	p += normalize(p + 1e-4) * wave * (0.03 + 0.07 * uEnergy);
	vec4 mv = modelViewMatrix * vec4(p, 1.0);
	gl_Position = projectionMatrix * mv;
	float twinkle = 0.7 + 0.3 * sin(uTime * (1.5 + aRand * 3.0) + aRand * 40.0);
	gl_PointSize = uSize * (0.4 + aRand) * uPixelRatio * twinkle / -mv.z;
	vColor = aColor;
	vAlpha = (0.45 + 0.55 * uEnergy) * (0.5 + aRand * 0.5);
}
`;

const fragmentShader = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;
void main() {
	float d = length(gl_PointCoord - 0.5);
	if (d > 0.5) discard;
	float glow = pow(smoothstep(0.5, 0.0, d), 2.0);
	gl_FragColor = vec4(vColor * (0.6 + glow * 1.5), glow * vAlpha);
}
`;

const PALETTES: Record<StationShape, string[]> = {
	logo: ['#651fff', '#c50eff'],
	tree: ['#38bdf8', '#c50eff', '#e879f9', '#ffb35c'],
	constellation: ['#38bdf8', '#8b5cf6', '#c50eff', '#ffffff'],
	knot: ['#c50eff', '#e879f9', '#651fff', '#38bdf8'],
	galaxy: ['#ffffff', '#e879f9', '#8b5cf6', '#38bdf8', '#651fff'],
	helix: ['#ffb35c', '#e879f9', '#8b5cf6'],
	portal: ['#c50eff', '#ffb35c', '#e879f9', '#ffffff'],
};

const GENERATORS: Record<Exclude<StationShape, 'logo'>, (count: number, rng: () => number) => Float32Array> = {
	tree,
	constellation,
	knot,
	galaxy,
	helix,
	portal,
};

function buildColors(count: number, palette: string[], positions: Float32Array, rng: () => number) {
	const colors = new Float32Array(count * 3);
	const cols = palette.map((c) => new THREE.Color(c));
	const tmp = new THREE.Color();
	for (let i = 0; i < count; i++) {
		// gradient across height, with random accents from the palette
		const y = positions[i * 3 + 1];
		const t = THREE.MathUtils.clamp((y + 3) / 6, 0, 1);
		tmp.copy(cols[0]).lerp(cols[Math.min(1, cols.length - 1)], t);
		if (rng() < 0.3) tmp.copy(cols[Math.floor(rng() * cols.length)]);
		colors.set([tmp.r, tmp.g, tmp.b], i * 3);
	}
	return colors;
}

type StationProps = { index: number; shape: StationShape; count: number; wide: boolean; route: THREE.CatmullRomCurve3; pixelRatio: number };

function Station({ index, shape, count, wide, route, pixelRatio }: StationProps) {
	const group = useRef<THREE.Group>(null);
	const ring = useRef<THREE.Mesh>(null);
	const geometry = useRef<THREE.BufferGeometry>(null);
	const anchor = useMemo(() => stationAnchor(route, index, wide, new THREE.Vector3()), [route, index, wide]);

	const data = useMemo(() => {
		const rng = mulberry32(100 + index * 17);
		const positions = shape === 'logo' ? sphere(count, rng, 2.2) : GENERATORS[shape](count, rng);
		const colors = buildColors(count, PALETTES[shape], positions, rng);
		const rand = new Float32Array(count).map(() => rng());
		return { positions, colors, rand };
	}, [shape, count, index]);

	const uniforms = useMemo(
		() => ({ uTime: { value: 0 }, uSize: { value: shape === 'logo' ? 120 : 75 }, uPixelRatio: { value: pixelRatio }, uEnergy: { value: 0 } }),
		[pixelRatio, shape],
	);

	// The home port is the real "R" logo, rasterized from the SVG with its gradient and white eyes.
	useEffect(() => {
		if (shape !== 'logo') return;
		let cancelled = false;
		sampleLogo('/logo/logo-sombre.svg', count, mulberry32(7), 4.6)
			.then(({ positions, colors }) => {
				const geo = geometry.current;
				if (cancelled || !geo) return;
				geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
				geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
			})
			.catch(() => undefined);
		return () => {
			cancelled = true;
		};
	}, [shape, count]);

	useFrame((state, dt) => {
		const g = group.current;
		if (!g) return;
		uniforms.uTime.value += Math.min(dt, 0.05);
		const proximity = Math.max(0, 1 - Math.abs(sceneState.travel * (STATIONS.length - 1) - index));
		uniforms.uEnergy.value += (proximity - uniforms.uEnergy.value) * 0.06;
		// cull far stations: they would only cost fill-rate
		g.visible = state.camera.position.distanceTo(anchor) < 190;
		const t = uniforms.uTime.value;
		if (shape === 'logo' || shape === 'portal') {
			// face the incoming ship, with a gentle sway
			g.lookAt(state.camera.position);
			g.rotateY(Math.sin(t * 0.4) * 0.25);
		} else {
			g.rotation.y = t * (0.08 + index * 0.01);
			g.rotation.x = Math.sin(t * 0.2 + index) * 0.15;
		}
		if (ring.current) {
			ring.current.rotation.z = t * 0.15 * (index % 2 ? 1 : -1);
			(ring.current.material as THREE.MeshBasicMaterial).opacity = 0.12 + uniforms.uEnergy.value * 0.35;
		}
	});

	const scale = shape === 'logo' ? 2.3 : shape === 'galaxy' ? 1.3 : 1.6;

	return (
		<group ref={group} position={anchor} scale={scale}>
			<points frustumCulled={false}>
				<bufferGeometry ref={geometry}>
					<bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
					<bufferAttribute attach="attributes-aColor" args={[data.colors, 3]} />
					<bufferAttribute attach="attributes-aRand" args={[data.rand, 1]} />
				</bufferGeometry>
				<shaderMaterial
					vertexShader={vertexShader}
					fragmentShader={fragmentShader}
					uniforms={uniforms}
					transparent
					depthWrite={false}
					blending={THREE.AdditiveBlending}
				/>
			</points>
			{/* arcane orbit: a thin ring of light around each world (the logo and the portal carry their own) */}
			<mesh ref={ring} rotation={[Math.PI / 2.3, 0, 0]} visible={shape !== 'logo' && shape !== 'portal'}>
				<torusGeometry args={[shape === 'galaxy' ? 5.2 : 4.1, 0.012, 6, 220]} />
				<meshBasicMaterial color={index % 2 ? '#38bdf8' : '#c50eff'} transparent opacity={0.2} blending={THREE.AdditiveBlending} depthWrite={false} />
			</mesh>
		</group>
	);
}

type Props = { route: THREE.CatmullRomCurve3; wide: boolean; density: number; pixelRatio: number };

export function Stations({ route, wide, density, pixelRatio }: Props) {
	return (
		<>
			{STATIONS.map((s, i) => (
				<Station
					key={s.id}
					index={i}
					shape={s.shape}
					count={Math.round((s.shape === 'logo' ? 9000 : s.shape === 'galaxy' ? 7000 : 5000) * density)}
					wide={wide}
					route={route}
					pixelRatio={pixelRatio}
				/>
			))}
		</>
	);
}
