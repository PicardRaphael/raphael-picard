'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

import { sceneState } from '@/lib/scene-state';
import { mulberry32 } from './shapes';

const starVertex = /* glsl */ `
uniform float uTime;
uniform float uPixelRatio;
attribute float aRand;
attribute vec3 aColor;
varying vec3 vColor;
varying float vAlpha;
void main() {
	vec4 mv = modelViewMatrix * vec4(position, 1.0);
	gl_Position = projectionMatrix * mv;
	float tw = 0.6 + 0.4 * sin(uTime * (0.5 + aRand * 2.0) + aRand * 50.0);
	gl_PointSize = (1.0 + aRand * 2.6) * uPixelRatio * tw * (90.0 / -mv.z);
	gl_PointSize = clamp(gl_PointSize, 0.0, 5.0 * uPixelRatio);
	vColor = aColor;
	vAlpha = smoothstep(420.0, 60.0, -mv.z);
}
`;
const starFragment = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;
void main() {
	float d = length(gl_PointCoord - 0.5);
	if (d > 0.5) discard;
	gl_FragColor = vec4(vColor, smoothstep(0.5, 0.0, d) * vAlpha);
}
`;

/** Static deep-field stars wrapped around the whole route. */
export function Starfield({ count, pixelRatio }: { count: number; pixelRatio: number }) {
	const data = useMemo(() => {
		const rng = mulberry32(42);
		const positions = new Float32Array(count * 3);
		const colors = new Float32Array(count * 3);
		const rand = new Float32Array(count);
		const tints = ['#ffffff', '#c4b5fd', '#f0abfc', '#7dd3fc'].map((c) => new THREE.Color(c));
		for (let i = 0; i < count; i++) {
			const a = rng() * Math.PI * 2;
			const r = 25 + Math.pow(rng(), 0.6) * 160;
			positions.set([Math.cos(a) * r, Math.sin(a) * r * 0.7, 60 - rng() * 640], i * 3);
			const c = tints[rng() < 0.7 ? 0 : 1 + Math.floor(rng() * 3)];
			colors.set([c.r, c.g, c.b], i * 3);
			rand[i] = rng();
		}
		return { positions, colors, rand };
	}, [count]);
	const uniforms = useMemo(() => ({ uTime: { value: 0 }, uPixelRatio: { value: pixelRatio } }), [pixelRatio]);
	useFrame((_, dt) => {
		uniforms.uTime.value += Math.min(dt, 0.05);
	});
	return (
		<points frustumCulled={false}>
			<bufferGeometry>
				<bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
				<bufferAttribute attach="attributes-aColor" args={[data.colors, 3]} />
				<bufferAttribute attach="attributes-aRand" args={[data.rand, 1]} />
			</bufferGeometry>
			<shaderMaterial vertexShader={starVertex} fragmentShader={starFragment} uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
		</points>
	);
}

function nebulaTexture() {
	const size = 256;
	const c = document.createElement('canvas');
	c.width = c.height = size;
	const ctx = c.getContext('2d');
	if (!ctx) return new THREE.Texture();
	const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
	g.addColorStop(0, 'rgba(255,255,255,0.9)');
	g.addColorStop(0.25, 'rgba(255,255,255,0.35)');
	g.addColorStop(0.6, 'rgba(255,255,255,0.08)');
	g.addColorStop(1, 'rgba(255,255,255,0)');
	ctx.fillStyle = g;
	ctx.fillRect(0, 0, size, size);
	const tex = new THREE.CanvasTexture(c);
	tex.colorSpace = THREE.SRGBColorSpace;
	return tex;
}

/** Big soft additive clouds: cheap volumetric feel. */
export function Nebulae() {
	const map = useMemo(() => nebulaTexture(), []);
	const clouds = useMemo(() => {
		const rng = mulberry32(9);
		const colors = ['#651fff', '#c50eff', '#38bdf8', '#7c3aed', '#a21caf'];
		return Array.from({ length: 16 }, (_, i) => ({
			position: [(rng() - 0.5) * 160, (rng() - 0.5) * 70, -40 - i * 32 - rng() * 20] as [number, number, number],
			scale: 70 + rng() * 90,
			color: colors[i % colors.length],
			opacity: 0.05 + rng() * 0.07,
		}));
	}, []);
	return (
		<>
			{clouds.map((c, i) => (
				<sprite key={i} position={c.position} scale={c.scale}>
					<spriteMaterial map={map} color={c.color} transparent opacity={c.opacity} depthWrite={false} blending={THREE.AdditiveBlending} />
				</sprite>
			))}
		</>
	);
}

/** Hyperspace streaks around the camera: invisible at rest, they stretch with the flight speed. */
export function SpeedLines({ count = 220 }: { count?: number }) {
	const ref = useRef<THREE.LineSegments>(null);
	const state = useMemo(() => {
		const rng = mulberry32(5);
		const seeds = Array.from({ length: count }, () => {
			const a = rng() * Math.PI * 2;
			const r = 2.5 + rng() * 14;
			return { x: Math.cos(a) * r, y: Math.sin(a) * r * 0.75, z: rng() * 90 };
		});
		return { seeds, positions: new Float32Array(count * 6) };
	}, [count]);

	const forward = useMemo(() => new THREE.Vector3(), []);
	const right = useMemo(() => new THREE.Vector3(), []);
	const up = useMemo(() => new THREE.Vector3(), []);

	useFrame(({ camera }, dt) => {
		const line = ref.current;
		if (!line) return;
		const speed = sceneState.speed;
		camera.getWorldDirection(forward);
		right.crossVectors(forward, camera.up).normalize();
		up.crossVectors(right, forward).normalize();
		const p = state.positions;
		const len = 0.4 + speed * 22;
		const travel = (6 + speed * 260) * Math.min(dt, 0.05);
		state.seeds.forEach((s, i) => {
			s.z -= travel;
			if (s.z < 1) s.z += 90;
			const bx = camera.position.x + forward.x * s.z + right.x * s.x + up.x * s.y;
			const by = camera.position.y + forward.y * s.z + right.y * s.x + up.y * s.y;
			const bz = camera.position.z + forward.z * s.z + right.z * s.x + up.z * s.y;
			p[i * 6] = bx;
			p[i * 6 + 1] = by;
			p[i * 6 + 2] = bz;
			p[i * 6 + 3] = bx + forward.x * len;
			p[i * 6 + 4] = by + forward.y * len;
			p[i * 6 + 5] = bz + forward.z * len;
		});
		line.geometry.attributes.position.needsUpdate = true;
		(line.material as THREE.LineBasicMaterial).opacity = Math.min(0.08 + speed * 1.4, 0.75);
	});

	return (
		<lineSegments ref={ref} frustumCulled={false}>
			<bufferGeometry>
				<bufferAttribute attach="attributes-position" args={[state.positions, 3]} />
			</bufferGeometry>
			<lineBasicMaterial color="#c4b5fd" transparent opacity={0.1} blending={THREE.AdditiveBlending} depthWrite={false} />
		</lineSegments>
	);
}

const trailVertex = /* glsl */ `
uniform float uPixelRatio;
attribute float aAge;
varying float vLife;
void main() {
	vLife = clamp(1.0 - aAge / 1.4, 0.0, 1.0);
	vec4 mv = modelViewMatrix * vec4(position, 1.0);
	gl_Position = projectionMatrix * mv;
	gl_PointSize = (9.0 * vLife + 1.5) * uPixelRatio / -mv.z * 6.0;
}
`;
const trailFragment = /* glsl */ `
varying float vLife;
void main() {
	float d = length(gl_PointCoord - 0.5);
	if (d > 0.5) discard;
	vec3 col = mix(vec3(0.22, 0.74, 0.97), vec3(0.77, 0.05, 1.0), vLife);
	gl_FragColor = vec4(col * 1.6, smoothstep(0.5, 0.0, d) * vLife * 0.8);
}
`;

/** Engine exhaust particles emitted in world space so they stream behind the ship. */
export function EngineTrail({ emitters, pixelRatio }: { emitters: React.RefObject<THREE.Object3D[]>; pixelRatio: number }) {
	const max = 700;
	const ref = useRef<THREE.Points>(null);
	const data = useMemo(() => ({ positions: new Float32Array(max * 3), ages: new Float32Array(max).fill(99), velocity: new Float32Array(max * 3), head: 0 }), []);
	const uniforms = useMemo(() => ({ uPixelRatio: { value: pixelRatio } }), [pixelRatio]);
	const world = useMemo(() => new THREE.Vector3(), []);
	const back = useMemo(() => new THREE.Vector3(), []);
	const q = useMemo(() => new THREE.Quaternion(), []);

	useFrame((_, delta) => {
		const pts = ref.current;
		const list = emitters.current;
		if (!pts || !list) return;
		const dt = Math.min(delta, 0.05);
		const perEngine = 2 + Math.round(sceneState.speed * 10);
		for (const e of list) {
			e.getWorldPosition(world);
			e.getWorldQuaternion(q);
			back.set(0, 0, 1).applyQuaternion(q);
			for (let k = 0; k < perEngine; k++) {
				const i = data.head;
				data.head = (data.head + 1) % max;
				data.positions[i * 3] = world.x + (Math.random() - 0.5) * 0.08;
				data.positions[i * 3 + 1] = world.y + (Math.random() - 0.5) * 0.08;
				data.positions[i * 3 + 2] = world.z + (Math.random() - 0.5) * 0.08;
				const s = 2.5 + Math.random() * 2;
				data.velocity[i * 3] = back.x * s;
				data.velocity[i * 3 + 1] = back.y * s;
				data.velocity[i * 3 + 2] = back.z * s;
				data.ages[i] = 0;
			}
		}
		for (let i = 0; i < max; i++) {
			if (data.ages[i] > 5) continue;
			data.ages[i] += dt;
			data.positions[i * 3] += data.velocity[i * 3] * dt;
			data.positions[i * 3 + 1] += data.velocity[i * 3 + 1] * dt;
			data.positions[i * 3 + 2] += data.velocity[i * 3 + 2] * dt;
		}
		pts.geometry.attributes.position.needsUpdate = true;
		pts.geometry.attributes.aAge.needsUpdate = true;
	});

	return (
		<points ref={ref} frustumCulled={false}>
			<bufferGeometry>
				<bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
				<bufferAttribute attach="attributes-aAge" args={[data.ages, 1]} />
			</bufferGeometry>
			<shaderMaterial vertexShader={trailVertex} fragmentShader={trailFragment} uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
		</points>
	);
}
