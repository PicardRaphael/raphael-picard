'use client';

import { useFrame } from '@react-three/fiber';
import { Suspense, useMemo, useRef } from 'react';
import * as THREE from 'three';

import { useGame } from '@/lib/game-store';
import { markerFor } from '@/lib/quests';
import { LANDMARKS, landmark, valHeight } from '@/lib/world';
import { Village } from './Buildings';
import { DarkGate } from './DarkGate';
import { PaintedRock } from './PaintedRock';
import { RaphyModel } from './Raphy';

const stone = new THREE.MeshStandardMaterial({ color: '#9a9184', roughness: 0.95, flatShading: true });
const stoneDark = new THREE.MeshStandardMaterial({ color: '#6c665f', roughness: 1, flatShading: true });
const arcane = new THREE.MeshBasicMaterial({ color: '#8fb0ff', toneMapped: false });

const ground = (x: number, z: number) => valHeight(x, z);

/** Menhirs carved from the painted stone pack, so the circle matches the rest of the valley. */
export const STONES = Array.from({ length: 9 }, (_, i) => ({ a: (i / 9) * Math.PI * 2, h: 4.2 + (i % 3) * 1.1, name: ['RockTall', 'RockBig_3', 'RockTall'][i % 3] }));

function Stones() {
	const l = landmark('stones');
	const y = ground(l.x, l.z);
	return (
		<group position={[l.x, y, l.z]}>
			<Suspense fallback={null}>
				{STONES.map((st, i) => (
					<PaintedRock key={i} name={st.name} position={[Math.cos(st.a) * 6.8, 0, Math.sin(st.a) * 6.8]} rotation={-st.a} size={[1.6, st.h, 2]} />
				))}
				<PaintedRock name="RockBig_1" position={[0, 0, 0]} size={[3.6, 1.3, 3.6]} />
			</Suspense>
			<mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]} material={arcane}>
				<ringGeometry args={[4.6, 4.85, 64]} />
			</mesh>
			<pointLight position={[0, 3, 0]} color="#7c9bff" intensity={14} distance={14} />
		</group>
	);
}

const portalVertex = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const portalFragment = /* glsl */ `
uniform float uTime;
varying vec2 vUv;
void main() {
	vec2 p = vUv - 0.5;
	float r = length(p) * 2.0;
	float a = atan(p.y, p.x);
	float swirl = sin(a * 5.0 - r * 9.0 + uTime * 2.5) * 0.5 + 0.5;
	vec3 violet = vec3(0.4, 0.12, 1.0);
	vec3 magenta = vec3(0.77, 0.05, 1.0);
	vec3 col = mix(violet, magenta, swirl) * (1.4 - r) + vec3(1.0) * pow(1.0 - r, 6.0);
	float alpha = smoothstep(1.0, 0.85, r);
	gl_FragColor = vec4(col * 1.6, alpha);
}
`;

function Portal({ x, z, y, back = false }: { x: number; z: number; y: number; back?: boolean }) {
	const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
	useFrame((_, dt) => {
		uniforms.uTime.value += dt;
	});
	const mat = back ? new THREE.MeshStandardMaterial({ color: '#1e1b3a', metalness: 0.8, roughness: 0.3, emissive: '#38bdf8', emissiveIntensity: 0.25 }) : stone;
	return (
		<group position={[x, y, z]}>
			{Array.from({ length: 16 }, (_, i) => {
				const a = (i / 16) * Math.PI * 2;
				return (
					<mesh key={i} position={[Math.cos(a) * 6, Math.sin(a) * 6 + 6.4, 0]} rotation={[0, 0, a]} material={mat} castShadow>
						<boxGeometry args={[1.3, 2.5, 1.6]} />
					</mesh>
				);
			})}
			<mesh position={[0, 6.4, 0]}>
				<circleGeometry args={[5.4, 64]} />
				<shaderMaterial vertexShader={portalVertex} fragmentShader={portalFragment} uniforms={uniforms} transparent side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
			</mesh>
			{[-1, 1].map((s) => (
				<mesh key={s} position={[s * 6.4, 0.6, 0]} material={mat} castShadow>
					<boxGeometry args={[2.2, 1.2, 2.4]} />
				</mesh>
			))}
			<pointLight position={[0, 6.4, 2]} color="#b06bff" intensity={40} distance={22} />
		</group>
	);
}

/** Floating WoW-style quest markers: yellow "!" to pick up, yellow "?" to hand in, grey "?" while in progress, golden beam on objectives. */

/** WoW-style quest glyph drawn on a canvas: bold serif, golden (or grey) gradient, dark outline. */
const glyphCache = new Map<string, THREE.Texture>();
function glyphTexture(kind: '!' | '?' | '?grey') {
	const hit = glyphCache.get(kind);
	if (hit) return hit;
	const c = document.createElement('canvas');
	c.width = 128;
	c.height = 256;
	const ctx = c.getContext('2d');
	if (ctx) {
		const char = kind === '!' ? '!' : '?';
		ctx.font = '900 230px Georgia, "Times New Roman", serif';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		const g = ctx.createLinearGradient(0, 30, 0, 230);
		if (kind === '?grey') {
			g.addColorStop(0, '#f2f2f2');
			g.addColorStop(1, '#8a8a8a');
		} else {
			g.addColorStop(0, '#fff3a0');
			g.addColorStop(0.45, '#ffd100');
			g.addColorStop(1, '#d97706');
		}
		ctx.lineJoin = 'round';
		ctx.lineWidth = 16;
		ctx.strokeStyle = '#1a0f00';
		ctx.strokeText(char, 64, 140);
		ctx.fillStyle = g;
		ctx.fillText(char, 64, 140);
	}
	const t = new THREE.CanvasTexture(c);
	t.colorSpace = THREE.SRGBColorSpace;
	glyphCache.set(kind, t);
	return t;
}

function Glyph({ kind }: { kind: '!' | '?' | '?grey' }) {
	const map = useMemo(() => glyphTexture(kind), [kind]);
	return (
		<sprite scale={[0.9, 1.8, 1]}>
			<spriteMaterial map={map} transparent depthWrite={false} toneMapped={false} />
		</sprite>
	);
}

export function QuestMarker({ id, height }: { id: string; height: number }) {
	const quests = useGame((s) => s.quests);
	const visited = useGame((s) => s.visited);
	const ref = useRef<THREE.Group>(null);
	const kind = markerFor(id, quests, visited);
	useFrame(({ clock, camera }) => {
		const g = ref.current;
		if (!g) return;
		g.position.y = height + Math.sin(clock.elapsedTime * 2.2) * 0.3;
		// keep the marker readable from afar
		const d = camera.position.distanceTo(g.getWorldPosition(new THREE.Vector3()));
		g.scale.setScalar(THREE.MathUtils.clamp(d / 45, 0.6, 2));
	});
	if (!kind) return null;
	return (
		<>
			<group ref={ref} position={[0, height, 0]}>
				{/* objectives use the same golden glyph as the quest givers, so every marker reads alike */}
				<Glyph kind={kind === 'objective' ? '?' : kind} />
			</group>

		</>
	);
}

const MARKER_HEIGHT: Record<string, number> = { raphy: 5.6, tower: 28.5, forge: 11, stones: 9, portal: 26, holo: 5.8, beacon: 24, agents: 16, core: 16, gallery: 10, 'portal-back': 15, race: 9, royal: 12, schoolmouv: 14.5, leasys: 14.5, neochat: 6.4, neosupport: 6.4, neoagent: 6.4, cinema: 18 };

/** One marker per place, in both realms. */
export function QuestMarkers() {
	return (
		<>
			{LANDMARKS.map((l) => (
				<group key={l.id} position={[l.x, l.zone === 'val' ? ground(l.x, l.z) : 0, l.z]}>
					<QuestMarker id={l.id} height={MARKER_HEIGHT[l.id] ?? 12} />
				</group>
			))}
		</>
	);
}

function RaphyNpc() {
	const l = landmark('raphy');
	const y = ground(l.x, l.z);
	const ref = useRef<THREE.Group>(null);
	useFrame(({ clock }) => {
		if (!ref.current) return;
		ref.current.position.y = 2.6 + Math.sin(clock.elapsedTime * 1.6) * 0.2;
		ref.current.rotation.y = Math.sin(clock.elapsedTime * 0.7) * 0.35;
	});
	return (
		<group position={[l.x, y, l.z]}>
			<mesh position={[0, 0.5, 0]} material={stoneDark} castShadow receiveShadow>
				<cylinderGeometry args={[1.7, 2, 1, 8]} />
			</mesh>
			<mesh position={[0, 1.05, 0]} rotation={[-Math.PI / 2, 0, 0]} material={arcane}>
				<ringGeometry args={[1.2, 1.35, 40]} />
			</mesh>
			<group ref={ref} position={[0, 2.6, 0]}>
				<Suspense fallback={null}>
					<RaphyModel scale={1.5} />
				</Suspense>
			</group>
		</group>
	);
}

export function ValleyLandmarks() {
	const portal = landmark('portal');
	return (
		<group>
			<Suspense fallback={null}>
				<Village />
			</Suspense>
			<Stones />
			<RaphyNpc />
			<DarkGate x={portal.x} z={portal.z - 1} y={ground(portal.x, portal.z) - 0.4} />
			<QuestMarkers />
		</group>
	);
}

export { Portal as PortalGate };
