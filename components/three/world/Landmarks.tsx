'use client';

import { useFrame } from '@react-three/fiber';
import { Suspense, useMemo, useRef } from 'react';
import * as THREE from 'three';

import { useGame } from '@/lib/game-store';
import { markerFor } from '@/lib/quests';
import { LANDMARKS, landmark, valHeight } from '@/lib/world';
import { Village } from './Buildings';
import { DarkGate } from './DarkGate';
import { RigLight } from './LightRig';
import { PaintedRock } from './PaintedRock';
import { RaphyModel } from './Raphy';

const stone = new THREE.MeshStandardMaterial({ color: '#9a9184', roughness: 0.95, flatShading: true });
const arcane = new THREE.MeshBasicMaterial({ color: '#8fb0ff', toneMapped: false });

const ground = (x: number, z: number) => valHeight(x, z);

/** Menhirs carved from the painted stone pack, so the circle matches the rest of the valley. */
export const STONES = Array.from({ length: 9 }, (_, i) => ({
	a: (i / 9) * Math.PI * 2,
	h: 4.2 + (i % 3) * 1.1,
	name: ['RockTall', 'RockBig_3', 'RockTall'][i % 3],
}));

function Stones() {
	const l = landmark('stones');
	const y = ground(l.x, l.z);
	return (
		<group position={[l.x, y, l.z]}>
			<Suspense fallback={null}>
				{STONES.map((st, i) => (
					<PaintedRock
						key={i}
						name={st.name}
						position={[Math.cos(st.a) * 6.8, 0, Math.sin(st.a) * 6.8]}
						rotation={-st.a}
						size={[1.6, st.h, 2]}
					/>
				))}
				<PaintedRock name="RockBig_1" position={[0, 0, 0]} size={[3.6, 1.3, 3.6]} />
			</Suspense>
			<mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]} material={arcane}>
				<ringGeometry args={[4.6, 4.85, 64]} />
			</mesh>
			<RigLight position={[0, 3, 0]} color="#7c9bff" intensity={14} distance={14} />
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
	const mat = back
		? new THREE.MeshStandardMaterial({ color: '#1e1b3a', metalness: 0.8, roughness: 0.3, emissive: '#38bdf8', emissiveIntensity: 0.25 })
		: stone;
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
				<shaderMaterial
					vertexShader={portalVertex}
					fragmentShader={portalFragment}
					uniforms={uniforms}
					transparent
					side={THREE.DoubleSide}
					depthWrite={false}
					toneMapped={false}
				/>
			</mesh>
			{[-1, 1].map((s) => (
				<mesh key={s} position={[s * 6.4, 0.6, 0]} material={mat} castShadow>
					<boxGeometry args={[2.2, 1.2, 2.4]} />
				</mesh>
			))}
			<RigLight position={[0, 6.4, 2]} color="#b06bff" intensity={40} distance={22} />
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

const MARKER_HEIGHT: Record<string, number> = {
	raphy: 6.3,
	tower: 28.5,
	forge: 11,
	stones: 9,
	portal: 26,
	holo: 5.8,
	beacon: 24,
	agents: 16,
	core: 16,
	gallery: 10,
	'portal-back': 15,
	race: 9,
	royal: 12,
	schoolmouv: 14.5,
	leasys: 14.5,
	neochat: 6.4,
	neosupport: 6.4,
	neoagent: 6.4,
	cinema: 18,
};

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

/** Carved runes on a band of stone, glowing violet in the grooves: the side of Raphy's plinth. */
function runeBand() {
	const c = document.createElement('canvas');
	c.width = 1024;
	c.height = 128;
	const ctx = c.getContext('2d');
	if (ctx) {
		ctx.fillStyle = '#000';
		ctx.fillRect(0, 0, 1024, 128);
		ctx.strokeStyle = '#c9a2ff';
		ctx.shadowColor = '#b26bff';
		ctx.shadowBlur = 10;
		ctx.lineWidth = 5;
		ctx.lineCap = 'round';
		// a band line above and below, and sixteen runes between
		for (const y of [16, 112]) {
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(1024, y);
			ctx.stroke();
		}
		let seed = 7;
		const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
		for (let i = 0; i < 16; i++) {
			const cx = 32 + i * 64;
			ctx.beginPath();
			ctx.moveTo(cx, 34);
			ctx.lineTo(cx, 94);
			for (let k = 0; k < 2; k++) {
				const y0 = 38 + rnd() * 44;
				ctx.moveTo(cx, y0);
				ctx.lineTo(cx + (rnd() > 0.5 ? 1 : -1) * (10 + rnd() * 10), y0 + (rnd() - 0.5) * 30);
			}
			ctx.stroke();
		}
	}
	const t = new THREE.CanvasTexture(c);
	t.wrapS = THREE.RepeatWrapping;
	t.colorSpace = THREE.SRGBColorSpace;
	return t;
}

/** The arcane circle inlaid on top of the plinth: two rings and a ring of small runes, drawn once. */
function runeCircle() {
	const c = document.createElement('canvas');
	c.width = c.height = 512;
	const ctx = c.getContext('2d');
	if (ctx) {
		ctx.translate(256, 256);
		ctx.strokeStyle = '#d7c2ff';
		ctx.shadowColor = '#9d5cff';
		ctx.shadowBlur = 14;
		ctx.lineWidth = 6;
		for (const r of [236, 188]) {
			ctx.beginPath();
			ctx.arc(0, 0, r, 0, Math.PI * 2);
			ctx.stroke();
		}
		ctx.lineWidth = 4;
		for (let i = 0; i < 24; i++) {
			ctx.save();
			ctx.rotate((i / 24) * Math.PI * 2);
			ctx.beginPath();
			ctx.moveTo(0, -226);
			ctx.lineTo(0, -198);
			if (i % 2) {
				ctx.moveTo(-7, -218);
				ctx.lineTo(7, -206);
			} else ctx.arc(0, -212, 5, 0, Math.PI * 2);
			ctx.stroke();
			ctx.restore();
		}
		// a six-pointed star inside
		ctx.lineWidth = 3;
		for (const off of [0, Math.PI / 3]) {
			ctx.beginPath();
			for (let i = 0; i <= 3; i++) {
				const a = off + (i / 3) * Math.PI * 2 - Math.PI / 2;
				ctx[i ? 'lineTo' : 'moveTo'](Math.cos(a) * 180, Math.sin(a) * 180);
			}
			ctx.stroke();
		}
	}
	const t = new THREE.CanvasTexture(c);
	t.colorSpace = THREE.SRGBColorSpace;
	return t;
}

const plinthStone = new THREE.MeshStandardMaterial({ color: '#8a8173', roughness: 0.95, flatShading: true });
const plinthMoss = new THREE.MeshStandardMaterial({ color: '#5d6b45', roughness: 1, flatShading: true });
const shard = new THREE.MeshStandardMaterial({
	color: '#7c3aed',
	emissive: '#a855f7',
	emissiveIntensity: 1.6,
	roughness: 0.25,
	metalness: 0.1,
	flatShading: true,
});

/** Raphy's plinth: a mossy stepped base, a carved drum whose runes glow, an inlaid turning circle and four floating shards. */
function RaphyPlinth() {
	const band = useMemo(() => {
		const map = runeBand();
		map.repeat.set(2, 1);
		return new THREE.MeshStandardMaterial({
			color: '#77705f',
			roughness: 0.9,
			flatShading: true,
			emissive: '#ffffff',
			emissiveMap: map,
			emissiveIntensity: 1.2,
		});
	}, []);
	const circle = useMemo(
		() =>
			new THREE.MeshBasicMaterial({
				map: runeCircle(),
				transparent: true,
				blending: THREE.AdditiveBlending,
				depthWrite: false,
				toneMapped: false,
			}),
		[],
	);
	const disc = useRef<THREE.Mesh>(null);
	const shards = useRef<THREE.Group>(null);
	useFrame(({ clock }, dt) => {
		const t = clock.elapsedTime;
		if (disc.current) disc.current.rotation.z += Math.min(dt, 0.05) * 0.25;
		circle.opacity = 0.75 + Math.sin(t * 2) * 0.2;
		shards.current?.children.forEach((c, i) => {
			c.position.y = 1.7 + Math.sin(t * 1.3 + i * 1.6) * 0.18;
			c.rotation.y = t * 0.8 + i;
		});
	});
	return (
		<group>
			{/* stepped base, moss creeping on the lowest step */}
			<mesh position={[0, 0.15, 0]} material={plinthMoss} receiveShadow>
				<cylinderGeometry args={[2.55, 2.75, 0.4, 8]} />
			</mesh>
			<mesh position={[0, 0.48, 0]} material={plinthStone} castShadow receiveShadow>
				<cylinderGeometry args={[2.15, 2.35, 0.3, 8]} />
			</mesh>
			{/* the carved drum */}
			<mesh position={[0, 0.88, 0]} material={band} castShadow receiveShadow>
				<cylinderGeometry args={[1.8, 1.8, 0.5, 8, 1, true]} />
			</mesh>
			{/* the top slab, wider than the drum */}
			<mesh position={[0, 1.22, 0]} material={plinthStone} castShadow receiveShadow>
				<cylinderGeometry args={[2.05, 1.9, 0.2, 8]} />
			</mesh>
			<mesh ref={disc} position={[0, 1.335, 0]} rotation={[-Math.PI / 2, 0, 0]} material={circle}>
				<planeGeometry args={[3.6, 3.6]} />
			</mesh>
			<group ref={shards}>
				{[0, 1, 2, 3].map((i) => {
					const a = Math.PI / 4 + (i * Math.PI) / 2;
					return (
						<mesh key={i} position={[Math.cos(a) * 2.35, 1.7, Math.sin(a) * 2.35]} material={shard} scale={[0.16, 0.34, 0.16]}>
							<octahedronGeometry args={[1, 0]} />
						</mesh>
					);
				})}
			</group>
		</group>
	);
}

function RaphyNpc() {
	const l = landmark('raphy');
	const y = ground(l.x, l.z);
	const ref = useRef<THREE.Group>(null);
	useFrame(({ clock }) => {
		if (!ref.current) return;
		ref.current.position.y = 3.25 + Math.sin(clock.elapsedTime * 1.6) * 0.2;
		ref.current.rotation.y = Math.sin(clock.elapsedTime * 0.7) * 0.35;
	});
	return (
		<group position={[l.x, y, l.z]}>
			<RaphyPlinth />
			<group ref={ref} position={[0, 3.25, 0]}>
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
