'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

import { PITCH_POSTER, PITCH_VIDEO } from '@/components/ui/Pitch30';
import { useGame } from '@/lib/game-store';
import { player } from '@/lib/player-state';
import { NEXUS_STREET_END, landmark } from '@/lib/world';

const SCREEN_W = 12;
const SCREEN_H = (SCREEN_W * 9) / 16;
const SCREEN_Y = 8.5;

/** Writes a centred line, shrinking the font until it fits the given width. */
function fit(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, max: number, weight: number, size: number) {
	let px = size;
	do ctx.font = `${weight} ${px--}px sans-serif`;
	while (ctx.measureText(text).width > max && px > 10);
	ctx.fillText(text, x, y);
}

/** Marquee of the cinema: « CINÉ NEXUS » in neon, with the film on the bill. Unlit, glows through the bloom. */
function marqueeTexture() {
	const c = document.createElement('canvas');
	c.width = 1024;
	c.height = 256;
	const ctx = c.getContext('2d');
	if (ctx) {
		ctx.fillStyle = '#0a0612';
		ctx.fillRect(0, 0, 1024, 256);
		ctx.strokeStyle = '#ff4fd8';
		ctx.lineWidth = 10;
		ctx.strokeRect(14, 14, 996, 228);
		ctx.textAlign = 'center';
		ctx.fillStyle = '#ffe9fb';
		ctx.shadowColor = '#ff4fd8';
		ctx.shadowBlur = 24;
		ctx.textBaseline = 'middle';
		fit(ctx, 'CINÉ NEXUS', 512, 100, 900, 800, 112);
		ctx.shadowColor = '#5ef2ff';
		ctx.fillStyle = '#c9fbff';
		fit(ctx, '▶ Raphaël en 30 secondes', 512, 192, 880, 600, 50);
	}
	const t = new THREE.CanvasTexture(c);
	t.colorSpace = THREE.SRGBColorSpace;
	return t;
}

/** The screen's light on the ground: strong at the foot of the screen, fading toward the seats and the sides. */
function spillTexture() {
	const c = document.createElement('canvas');
	c.width = c.height = 128;
	const ctx = c.getContext('2d');
	if (ctx) {
		const g = ctx.createRadialGradient(0, 64, 0, 0, 64, 128);
		g.addColorStop(0, 'rgba(255,255,255,0.9)');
		g.addColorStop(0.5, 'rgba(255,255,255,0.25)');
		g.addColorStop(1, 'rgba(255,255,255,0)');
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, 128, 128);
	}
	return new THREE.CanvasTexture(c);
}

/** What the screen shows before the film plays (or when there is no film): the bill, in the cinema's colours. */
function idleTexture() {
	const c = document.createElement('canvas');
	c.width = 512;
	c.height = 288;
	const ctx = c.getContext('2d');
	if (ctx) {
		const g = ctx.createLinearGradient(0, 0, 512, 288);
		g.addColorStop(0, '#1a0b3d');
		g.addColorStop(1, '#3a0b4d');
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, 512, 288);
		ctx.textAlign = 'center';
		ctx.fillStyle = '#ffffff';
		ctx.textBaseline = 'middle';
		fit(ctx, 'Raphaël en 30 secondes', 256, 120, 440, 800, 40);
		ctx.fillStyle = '#7dd3fc';
		fit(ctx, 'Approche-toi pour lancer le film', 256, 175, 400, 500, 24);
	}
	const t = new THREE.CanvasTexture(c);
	t.colorSpace = THREE.SRGBColorSpace;
	return t;
}

/**
 * Stadium seating facing the screen: 3 rising rows of padded armchairs (violet leather, dark metal, a neon strip under
 * each seat and along each backrest), two blocks around a central aisle. Instanced: one draw call per part.
 */
function Seats({ wall, z }: { wall: number; z: number }) {
	const meshes = useMemo(() => {
		// lit by the screen: a faint violet glow of their own, the street has no lamp here
		const leather = new THREE.MeshStandardMaterial({ color: '#3b1d55', roughness: 0.45, metalness: 0.15, emissive: '#2a1060', emissiveIntensity: 0.35 });
		const metal = new THREE.MeshStandardMaterial({ color: '#1c1f2a', roughness: 0.35, metalness: 0.8 });
		const step = new THREE.MeshStandardMaterial({ color: '#12131b', roughness: 0.7, metalness: 0.3 });
		const neon = (c: string) => new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(1.6), toneMapped: false });
		// seat-local frame: the seat faces -x (the screen), its back is toward +x
		const parts: { geo: THREE.BufferGeometry; mat: THREE.Material; at: [number, number, number]; tilt?: number }[] = [
			{ geo: new THREE.CylinderGeometry(0.09, 0.14, 0.42, 10), mat: metal, at: [0.05, 0.21, 0] },
			{ geo: new RoundedBoxGeometry(0.62, 0.17, 0.58, 3, 0.07), mat: leather, at: [0, 0.5, 0] },
			{ geo: new RoundedBoxGeometry(0.15, 0.86, 0.58, 3, 0.06), mat: leather, at: [0.33, 0.94, 0], tilt: -0.17 },
			{ geo: new THREE.BoxGeometry(0.62, 0.02, 0.6), mat: neon('#5ef2ff'), at: [0, 0.405, 0] },
			{ geo: new THREE.BoxGeometry(0.04, 0.03, 0.58), mat: neon('#ff4fd8'), at: [0.43, 1.38, 0], tilt: -0.17 },
			{ geo: new THREE.BoxGeometry(0.62, 0.07, 0.07), mat: metal, at: [0.02, 0.72, 0.33] },
			{ geo: new THREE.BoxGeometry(0.62, 0.07, 0.07), mat: metal, at: [0.02, 0.72, -0.33] },
		];
		const seats: [number, number, number][] = [];
		const risers: { x: number; y: number }[] = [];
		for (let row = 0; row < 3; row++) {
			const x = wall + 10 + row * 2.1;
			const y = row * 0.38;
			risers.push({ x, y });
			for (const block of [-1, 1]) for (let k = 0; k < 5; k++) seats.push([x, y, z + block * (1.2 + k * 0.76)]);
		}
		const o = new THREE.Object3D();
		const local = new THREE.Matrix4();
		const out = parts.map((p) => {
			const mesh = new THREE.InstancedMesh(p.geo, p.mat, seats.length);
			local.compose(new THREE.Vector3(...p.at), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, p.tilt ?? 0)), new THREE.Vector3(1, 1, 1));
			seats.forEach((st, i) => {
				o.position.set(...st);
				o.updateMatrix();
				mesh.setMatrixAt(i, o.matrix.clone().multiply(local));
			});
			mesh.castShadow = p.mat !== parts[3].mat && p.mat !== parts[4].mat;
			mesh.frustumCulled = false;
			return mesh;
		});
		// the rising steps under the rows, each lit along its nose
		const riser = new THREE.InstancedMesh(new THREE.BoxGeometry(2.1, 1, 9.4), step, risers.length);
		const nose = new THREE.InstancedMesh(new THREE.BoxGeometry(0.05, 0.03, 9.4), neon('#b18cff'), risers.length);
		risers.forEach((r, i) => {
			const h = Math.max(0.02, r.y);
			o.position.set(r.x + 0.1, h / 2 - 0.01, z);
			o.scale.set(1, h, 1);
			o.updateMatrix();
			riser.setMatrixAt(i, o.matrix.clone());
			o.position.set(r.x - 0.95, h + 0.005, z);
			o.scale.set(1, 1, 1);
			o.updateMatrix();
			nose.setMatrixAt(i, o.matrix.clone());
		});
		return [...out, riser, nose];
	}, [wall, z]);
	return (
		<>
			{meshes.map((m, i) => (
				<primitive key={i} object={m} />
			))}
		</>
	);
}

/**
 * The Nexus cinema, at the end of the first side street by the arrival gate: a marquee, rows of armchairs and a big
 * screen on the facade. The film plays on the screen (muted, looped) while the hero stands in the street; E opens it
 * in full with sound. The video is only fetched once the hero comes near.
 */
export function Cinema() {
	const at = landmark('cinema');
	const zone = useGame((s) => s.zone);
	const wall = -(NEXUS_STREET_END + 0.05);
	const marquee = useMemo(() => marqueeTexture(), []);
	const spill = useMemo(() => spillTexture(), []);
	const idle = useMemo(() => idleTexture(), []);
	const screen = useMemo(() => new THREE.MeshBasicMaterial({ map: idle, toneMapped: false }), [idle]);
	const [near, setNear] = useState(false);
	const nearRef = useRef(false);
	const video = useRef<HTMLVideoElement | null>(null);

	useFrame(() => {
		const n = zone === 'nexus' && Math.hypot(player.x - at.x, player.z - at.z) < 45;
		if (n !== nearRef.current) {
			nearRef.current = n;
			setNear(n);
		}
	});

	useEffect(() => {
		if (!near) {
			video.current?.pause();
			return;
		}
		let v = video.current;
		if (!v) {
			v = document.createElement('video');
			v.src = PITCH_VIDEO;
			v.poster = PITCH_POSTER;
			v.muted = true;
			v.loop = true;
			v.playsInline = true;
			v.crossOrigin = 'anonymous';
			v.preload = 'auto';
			v.addEventListener('loadeddata', () => {
				const t = new THREE.VideoTexture(v as HTMLVideoElement);
				t.colorSpace = THREE.SRGBColorSpace;
				screen.map = t;
				screen.needsUpdate = true;
			});
			// no film yet (or it failed): the bill stays on the screen
			v.addEventListener('error', () => {
				screen.map = idle;
				screen.needsUpdate = true;
			});
			video.current = v;
		}
		void v.play().catch(() => {});
	}, [near, screen, idle]);

	useEffect(
		() => () => {
			video.current?.pause();
			video.current?.removeAttribute('src');
			video.current?.load();
		},
		[],
	);

	return (
		<group>
			{/* the screen, its dark frame and the glow it throws on the street (additive, no light) */}
			<mesh position={[wall + 0.3, SCREEN_Y, at.z]} rotation={[0, Math.PI / 2, 0]}>
				<planeGeometry args={[SCREEN_W + 0.8, SCREEN_H + 0.8]} />
				<meshBasicMaterial color="#020205" />
			</mesh>
			<mesh position={[wall + 0.35, SCREEN_Y, at.z]} rotation={[0, Math.PI / 2, 0]} material={screen}>
				<planeGeometry args={[SCREEN_W, SCREEN_H]} />
			</mesh>
			<mesh position={[wall + 7, 0.03, at.z]} rotation={[-Math.PI / 2, 0, 0]}>
				<planeGeometry args={[14, SCREEN_W + 2]} />
				<meshBasicMaterial map={spill} color="#7f8cff" transparent opacity={0.35} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
			</mesh>
			{/* marquee above the screen */}
			<mesh position={[wall + 0.6, SCREEN_Y + SCREEN_H / 2 + 2.2, at.z]} rotation={[0, Math.PI / 2, 0]}>
				<planeGeometry args={[11, 2.75]} />
				<meshBasicMaterial map={marquee} toneMapped={false} />
			</mesh>
			<Seats wall={wall} z={at.z} />
		</group>
	);
}
