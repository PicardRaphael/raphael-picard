'use client';

import { useFrame } from '@react-three/fiber';
import { Suspense, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

import { projects } from '@/content/work';
import { useGame } from '@/lib/game-store';
import { player } from '@/lib/player-state';
import { NEXUS_CENTER, landmark } from '@/lib/world';
import { constellation, knot, mulberry32 } from '../shapes';
import { Street } from './Street';
import { NexusCity } from './NexusCity';
import { SfModel } from './SfModel';
import { EventHorizon, Stargate } from './Stargate';
import { HoloPad, PAD_TIME } from './HoloPad';
import { RaphyModel } from './Raphy';

/**
 * The Nexus: a neon city floor, holographic towers and three AI "systems",
 * with the giant Raphy hologram as contact beacon.
 */

const pointsVertex = /* glsl */ `
uniform float uTime;
uniform float uPixelRatio;
attribute float aRand;
varying float vR;
void main() {
	vec4 mv = modelViewMatrix * vec4(position, 1.0);
	gl_Position = projectionMatrix * mv;
	gl_PointSize = (40.0 + aRand * 60.0) * uPixelRatio * (0.7 + 0.3 * sin(uTime * 2.0 + aRand * 30.0)) / -mv.z;
	vR = aRand;
}
`;
const pointsFragment = /* glsl */ `
uniform vec3 uA;
uniform vec3 uB;
varying float vR;
void main() {
	float d = length(gl_PointCoord - 0.5);
	if (d > 0.5) discard;
	gl_FragColor = vec4(mix(uA, uB, vR) * 1.8, pow(smoothstep(0.5, 0.0, d), 2.0));
}
`;

function Hologram({ positions, a, b, pixelRatio, ...props }: { positions: Float32Array; a: string; b: string; pixelRatio: number } & Record<string, unknown>) {
	const ref = useRef<THREE.Points>(null);
	const rand = useMemo(() => new Float32Array(positions.length / 3).map((_, i) => ((i * 9301 + 49297) % 233280) / 233280), [positions]);
	const uniforms = useMemo(() => ({ uTime: { value: 0 }, uPixelRatio: { value: pixelRatio }, uA: { value: new THREE.Color(a) }, uB: { value: new THREE.Color(b) } }), [a, b, pixelRatio]);
	useFrame((_, dt) => {
		uniforms.uTime.value += dt;
		if (ref.current) ref.current.rotation.y += dt * 0.15;
	});
	return (
		<points ref={ref} {...props}>
			<bufferGeometry>
				<bufferAttribute attach="attributes-position" args={[positions, 3]} />
				<bufferAttribute attach="attributes-aRand" args={[rand, 1]} />
			</bufferGeometry>
			<shaderMaterial vertexShader={pointsVertex} fragmentShader={pointsFragment} uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
		</points>
	);
}

const pedestalMat = new THREE.MeshStandardMaterial({ color: '#2c3247', metalness: 0.6, roughness: 0.45 });
/** Under the side wings of the return gate (x offsets from its centre); Player.tsx makes them solid. */
const GATE_PEDESTALS = [{ x: -9.6 }, { x: 9.6 }];


/** A holographic kiosk presenting one production agent: a lit pillar and a floating title panel. */
function Kiosk({ id, title, subtitle, color }: { id: string; title: string; subtitle: string; color: string }) {
	const l = landmark(id);
	const tex = useMemo(() => {
		const c = document.createElement('canvas');
		c.width = 512;
		c.height = 256;
		const ctx = c.getContext('2d');
		if (ctx) {
			ctx.fillStyle = 'rgba(8,10,24,0.82)';
			ctx.fillRect(0, 0, 512, 256);
			ctx.strokeStyle = color;
			ctx.lineWidth = 8;
			ctx.strokeRect(4, 4, 504, 248);
			ctx.fillStyle = color;
			ctx.font = '600 26px monospace';
			ctx.fillText('EN PRODUCTION · NEOTEEM', 32, 62);
			ctx.fillStyle = '#ffffff';
			ctx.font = '800 76px sans-serif';
			ctx.fillText(title, 32, 150);
			ctx.fillStyle = '#d6e4ff';
			ctx.font = '400 28px sans-serif';
			ctx.fillText(subtitle, 32, 206);
		}
		const t = new THREE.CanvasTexture(c);
		t.colorSpace = THREE.SRGBColorSpace;
		return t;
	}, [title, subtitle, color]);
	const panel = useRef<THREE.Mesh>(null);
	useFrame(({ clock }) => {
		if (panel.current) panel.current.position.y = 3.6 + Math.sin(clock.elapsedTime * 1.3 + l.x) * 0.12;
	});
	// panels face the middle of the avenue
	const face = l.x < 0 ? Math.PI / 2 : -Math.PI / 2;
	return (
		<group position={[l.x, 0, l.z]}>
			<HoloPad r={1.8} color={color} label={`${title.toUpperCase()} // EN PRODUCTION`} />
			{/* holo totem: a steel column with glowing edges carries the panel */}
			<mesh position={[0, 1.55, 0]} castShadow>
				<boxGeometry args={[0.5, 2.4, 0.5]} />
				<meshStandardMaterial color="#1c2030" metalness={0.4} roughness={0.45} />
			</mesh>
			{[
				[-0.26, -0.26],
				[0.26, -0.26],
				[-0.26, 0.26],
				[0.26, 0.26],
			].map(([ex, ez]) => (
				<mesh key={`${ex}${ez}`} position={[ex, 1.55, ez]}>
					<boxGeometry args={[0.04, 2.4, 0.04]} />
					<meshBasicMaterial color={color} toneMapped={false} />
				</mesh>
			))}
			<mesh ref={panel} position={[0, 3.6, 0]} rotation={[0, face, 0]}>
				<planeGeometry args={[3.6, 1.8]} />
				<meshBasicMaterial map={tex} transparent side={THREE.DoubleSide} toneMapped={false} />
			</mesh>
			<pointLight position={[0, 3.2, 0]} color={color} intensity={18} distance={10} />
		</group>
	);
}

/** Holographic project cards arranged in an arc, drawn on canvas textures (no font download). */
function Gallery() {
	const l = landmark('gallery');
	const cards = useMemo(
		() =>
			projects.map((p, i) => {
				const c = document.createElement('canvas');
				c.width = 512;
				c.height = 320;
				const ctx = c.getContext('2d');
				if (ctx) {
					const g = ctx.createLinearGradient(0, 0, 512, 320);
					g.addColorStop(0, 'rgba(101,31,255,0.55)');
					g.addColorStop(1, 'rgba(197,14,255,0.35)');
					ctx.fillStyle = g;
					ctx.fillRect(0, 0, 512, 320);
					ctx.strokeStyle = i === 0 ? '#ff8000' : '#e879f9';
					ctx.lineWidth = 6;
					ctx.strokeRect(3, 3, 506, 314);
					ctx.fillStyle = '#7dd3fc';
					ctx.font = '600 22px monospace';
					ctx.fillText(p.kind.toUpperCase(), 28, 52);
					ctx.fillStyle = '#ffffff';
					ctx.font = '800 48px sans-serif';
					ctx.fillText(p.name, 28, 120);
					ctx.fillStyle = '#e9e5ff';
					ctx.font = '400 22px sans-serif';
					// word-wrap the pitch on 5 lines; one too long for the card ends with an ellipsis, never mid-sentence
					const lines: string[] = [''];
					for (const w of p.pitch.split(' ')) {
						const last = lines[lines.length - 1];
						if (last && ctx.measureText(`${last} ${w}`).width > 450) lines.push(w);
						else lines[lines.length - 1] = last ? `${last} ${w}` : w;
					}
					const shown = lines.slice(0, 5);
					if (lines.length > 5) shown[4] = `${shown[4].replace(/[\s,;:.]*\S*$/, '')}…`;
					shown.forEach((t, k) => ctx.fillText(t, 28, 170 + k * 30));
				}
				const tex = new THREE.CanvasTexture(c);
				tex.colorSpace = THREE.SRGBColorSpace;
				// a tight arc that fits the side street
				// three stacked rows on a tight arc: every card readable, none overlapping, all inside the side street
				// read like a page: the production agents first, top row, left to right
				const perRow = Math.ceil(projects.length / 3);
				const row = Math.floor(i / perRow);
				const inRow = Math.min(perRow, projects.length - row * perRow);
				const a = ((i % perRow) - (inRow - 1) / 2) * 0.42;
				return { tex, x: Math.sin(a) * 9, y: 7.2 - row * 2.5, z: -Math.cos(a) * 9 + 4, rot: -a };
			}),
		[],
	);
	const ref = useRef<THREE.Group>(null);
	useFrame(({ clock }) => {
		ref.current?.children.forEach((c, i) => {
			c.position.y = cards[i].y + Math.sin(clock.elapsedTime * 1.2 + i) * 0.12;
		});
	});
	return (
		// the arc opens toward the avenue: visitors come in from the main street
		<group position={[l.x, 0, l.z]} rotation={[0, -Math.PI / 2, 0]}>
			<HoloPad r={6} color="#e879f9" color2="#f5d0fe" label="GALERIE // PROJETS" beam={2.2} />
			<group ref={ref}>
				{cards.map((c, i) => (
					<mesh key={i} position={[c.x, c.y, c.z]} rotation={[0, c.rot, 0]}>
						<planeGeometry args={[3.5, 2.19]} />
						<meshBasicMaterial map={c.tex} transparent opacity={0.92} side={THREE.DoubleSide} toneMapped={false} />
					</mesh>
				))}
			</group>
		</group>
	);
}

function Beacon() {
	const l = landmark('beacon');
	const ref = useRef<THREE.Group>(null);
	useFrame(({ clock }) => {
		if (!ref.current) return;
		ref.current.rotation.y = clock.elapsedTime * 0.25;
		ref.current.position.y = 11 + Math.sin(clock.elapsedTime) * 0.6;
	});
	return (
		<group position={[l.x, 0, l.z]}>
			<HoloPad r={8} color="#c50eff" color2="#38bdf8" label="BALISE // CONTACT" beam={2.6} />
			<mesh position={[0, 30, 0]}>
				<cylinderGeometry args={[0.6, 2.4, 60, 24, 1, true]} />
				<meshBasicMaterial color="#c50eff" transparent opacity={0.18} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
			</mesh>
			<group ref={ref} position={[0, 11, 0]}>
				<Suspense fallback={null}>
					<RaphyModel hologram scale={9} />
				</Suspense>
			</group>
		</group>
	);
}

function HoloNpc() {
	const l = landmark('holo');
	const ref = useRef<THREE.Group>(null);
	useFrame(({ clock }) => {
		if (ref.current) ref.current.position.y = 2.8 + Math.sin(clock.elapsedTime * 1.6) * 0.2;
	});
	return (
		<group position={[l.x, 0, l.z]}>
			<HoloPad r={2.4} color="#38bdf8" color2="#c4b5fd" label="RAPHY.OS" beam={1.4} />
			<group ref={ref} position={[0, 2.8, 0]}>
				<Suspense fallback={null}>
					<RaphyModel hologram scale={1.5} />
				</Suspense>
			</group>
		</group>
	);
}

export function Nexus({ pixelRatio }: { pixelRatio: number; reflect?: boolean }) {
	const agents = landmark('agents');
	const core = landmark('core');
	const back = landmark('portal-back');
	const shapes = useMemo(() => ({ agents: constellation(5000, mulberry32(3)), core: knot(4500, mulberry32(4)) }), []);
	const uniforms = useMemo(() => ({ uTime: { value: 0 }, uCenter: { value: new THREE.Vector2(NEXUS_CENTER.x, NEXUS_CENTER.z) } }), []);
	const zone = useGame((s) => s.zone);
	const heading = useGame((s) => s.quests.portail === 'active' || s.quests.portail === 'ready');
	const [near, setNear] = useState(false);
	// the heavy city (6 MB, hundreds of meshes) is fetched only when the visitor heads for the portal,
	// never during the first minute in the val where it froze the game
	useFrame(() => {
		if (!near && player.z < -55) setNear(true);
	});
	const loadCity = heading || near || zone === 'nexus';
	useFrame((_, dt) => {
		uniforms.uTime.value += dt;
		PAD_TIME.value += dt;
	});
	return (
		<group>
			<Suspense fallback={null}>
				<Street />
			</Suspense>
			{/* the city is heavy: fetched once the game runs, never on the start screen */}
			{loadCity && (
				<Suspense fallback={null}>
					<NexusCity />
				</Suspense>
			)}
			<group position={[agents.x, 0, agents.z]}>
				<HoloPad r={6} color="#38bdf8" color2="#c50eff" label="CONSTELLATION // AGENTS" beam={2.2} />
				<Hologram positions={shapes.agents} a="#38bdf8" b="#c50eff" pixelRatio={pixelRatio} position={[0, 7, 0]} scale={1.7} />
			</group>
			<group position={[core.x, 0, core.z]}>
				<HoloPad r={6} color="#e879f9" color2="#a78bfa" label="NOYAU // ORCHESTRATION" beam={2.2} />
				<Hologram positions={shapes.core} a="#e879f9" b="#651fff" pixelRatio={pixelRatio} position={[0, 7, 0]} scale={1.8} />
			</group>
			<Gallery />
			<Kiosk id="neochat" title="NeoChat" subtitle="42 vues · 5 outils · validation humaine" color="#5ef2ff" />
			<Kiosk id="neosupport" title="NeoSupport" subtitle="RAG hybride · support autonome" color="#e879f9" />
			<Kiosk id="neoagent" title="NeoAgent" subtitle="Devis · annonces · documents" color="#ffb45c" />
			<Beacon />
			<HoloNpc />
			<Suspense fallback={<Stargate x={back.x} z={back.z} rotation={Math.PI} />}>
				{/* seated on the street (measured): its own foot plate on the road (-0.06), the ring 21 cm into it */}
				<SfModel file="scifi_gate" height={13} hide={['Object_6']} position={[back.x, -0.275, back.z]} rotation={[0, Math.PI, 0]} />
				{/* the event horizon sits in the plane of the ring (measured centre: 6.225 m up, on the gate's own z) */}
				<EventHorizon radius={5.15} position={[back.x, 6.225, back.z]} rotation={[0, Math.PI, 0]} />
			</Suspense>
			{/* the gate model's side wings hover 4.2 m up: steel pedestals carry them to the street, inside its outer box */}
			{GATE_PEDESTALS.map((p) => (
				<group key={p.x} position={[back.x + p.x, -0.06, back.z]}>
					<mesh position={[0, 2.1, 0]} material={pedestalMat} castShadow receiveShadow>
						<boxGeometry args={[5.2, 4.2, 4.6]} />
					</mesh>
				</group>
			))}
		</group>
	);
}
