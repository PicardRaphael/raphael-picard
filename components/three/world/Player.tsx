'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

import { game } from '@/lib/game-store';
import { player } from '@/lib/player-state';
import { HOUSES, LANDMARKS, NEXUS_CENTER, NEXUS_RADIUS, NEXUS_SPAWN, SPAWN, VAL_RADIUS, landmark, valHeight } from '@/lib/world';
import { EngineTrail } from '../Cosmos';
import { Ship } from '../Ship';

const MAX_SPEED = 26;
const BOOST_SPEED = 40;
const HOVER = 1.5;

export function groundAt(x: number, z: number) {
	return z < -300 ? 0 : valHeight(x, z);
}

/** Keyboard: arrows first (also WASD / ZQSD through physical key codes), Space/Shift boost, E/Enter interact. */
function useKeyboard() {
	useEffect(() => {
		const keys = new Set<string>();
		const sync = () => {
			const f = (keys.has('ArrowUp') || keys.has('KeyW') ? 1 : 0) - (keys.has('ArrowDown') || keys.has('KeyS') ? 1 : 0);
			const t = (keys.has('ArrowLeft') || keys.has('KeyA') ? 1 : 0) - (keys.has('ArrowRight') || keys.has('KeyD') ? 1 : 0);
			player.input.forward = f;
			player.input.turn = t;
			player.input.boost = keys.has('Space') || keys.has('ShiftLeft') || keys.has('ShiftRight');
		};
		const typing = (e: KeyboardEvent) => e.target instanceof Element && e.target.closest('input, textarea, select');
		const down = (e: KeyboardEvent) => {
			if (typing(e)) return;
			const s = game.get();
			if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
			if (!s.started && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyS', 'KeyA', 'KeyD', 'Enter', 'Space'].includes(e.code)) game.set({ started: true });
			if (s.panel) {
				if (e.code === 'Escape') game.set({ panel: null });
				return;
			}
			if ((e.code === 'KeyE' || e.code === 'Enter') && s.inRange && s.started) {
				game.set({ panel: s.inRange });
				game.visit(s.inRange);
				return;
			}
			keys.add(e.code);
			sync();
		};
		const up = (e: KeyboardEvent) => {
			keys.delete(e.code);
			sync();
		};
		const blur = () => {
			keys.clear();
			sync();
		};
		window.addEventListener('keydown', down);
		window.addEventListener('keyup', up);
		window.addEventListener('blur', blur);
		return () => {
			window.removeEventListener('keydown', down);
			window.removeEventListener('keyup', up);
			window.removeEventListener('blur', blur);
		};
	}, []);
}

/** Static obstacles as circles in the ground plane. */
const OBSTACLES: { x: number; z: number; r: number }[] = [
	...LANDMARKS.filter((l) => l.solid > 0).map((l) => ({ x: l.x, z: l.z, r: l.solid })),
	...HOUSES.map((h) => ({ x: h.x, z: h.z, r: 4.2 * h.s })),
];

export function Player({ pixelRatio }: { pixelRatio: number }) {
	useKeyboard();
	const { camera } = useThree();
	const ship = useRef<THREE.Group>(null);
	const flames = useRef<THREE.Group>(null);
	const emitters = useRef<THREE.Object3D[]>([]);
	const v = useMemo(
		() => ({
			bank: 0,
			pitch: 0,
			camPos: new THREE.Vector3(SPAWN.x, 12, SPAWN.z + 18),
			look: new THREE.Vector3(SPAWN.x, 2, SPAWN.z - 6),
			tmp: new THREE.Vector3(),
			time: 0,
			lastRange: null as string | null,
			intro: 0,
		}),
		[],
	);
	const emitterNodes = useMemo(
		() =>
			[0.45, -0.45].map((x) => {
				const o = new THREE.Object3D();
				o.position.set(x, -0.02, 1.3);
				return o;
			}),
		[],
	);

	useEffect(() => {
		// test hooks for the dev browser, stripped from production behaviour
		if (process.env.NODE_ENV !== 'production') Object.assign(window, { __player: player, __game: game });
		player.x = SPAWN.x;
		player.z = SPAWN.z;
		player.yaw = SPAWN.yaw;
		player.speed = 0;
	}, []);

	useFrame((_, delta) => {
		const s = ship.current;
		if (!s) return;
		const dt = Math.min(delta, 1 / 20);
		v.time += dt;
		const g = game.get();
		const canDrive = g.started && !g.panel;

		if (player.teleport) {
			player.x = player.teleport.x;
			player.z = player.teleport.z;
			player.yaw = player.teleport.yaw;
			player.speed = 0;
			player.teleport = null;
			v.camPos.set(player.x, groundAt(player.x, player.z) + 8, player.z + 14);
		}

		// arcade physics
		const inp = canDrive ? player.input : { forward: 0, turn: 0, boost: false };
		const max = inp.boost ? BOOST_SPEED : MAX_SPEED;
		const accel = inp.forward > 0 ? 30 : inp.forward < 0 ? -40 : 0;
		player.speed += accel * dt;
		player.speed = THREE.MathUtils.clamp(player.speed, -10, max);
		if (!inp.forward) player.speed *= Math.pow(0.35, dt);
		if (inp.boost && inp.forward > 0) player.speed += 20 * dt;
		const grip = THREE.MathUtils.clamp(Math.abs(player.speed) / 8, 0.35, 1);
		player.yaw += inp.turn * 2.1 * grip * dt * (player.speed < -0.5 ? -1 : 1);

		const fx = -Math.sin(player.yaw);
		const fz = -Math.cos(player.yaw);
		let nx = player.x + fx * player.speed * dt;
		let nz = player.z + fz * player.speed * dt;

		// collisions: push out of obstacles
		for (const o of OBSTACLES) {
			const dx = nx - o.x;
			const dz = nz - o.z;
			const d = Math.hypot(dx, dz);
			const min = o.r + 1.2;
			if (d < min && d > 1e-3) {
				nx = o.x + (dx / d) * min;
				nz = o.z + (dz / d) * min;
				player.speed *= 0.6;
			}
		}
		// world bounds: soft walls
		const inNexus = nz < -300;
		const cx = inNexus ? NEXUS_CENTER.x : 0;
		const cz = inNexus ? NEXUS_CENTER.z : -20;
		const R = inNexus ? NEXUS_RADIUS : VAL_RADIUS;
		const rd = Math.hypot(nx - cx, nz - cz);
		if (rd > R) {
			nx = cx + ((nx - cx) / rd) * R;
			nz = cz + ((nz - cz) / rd) * R;
			player.speed *= 0.5;
		}
		player.x = nx;
		player.z = nz;
		const gy = groundAt(nx, nz);
		player.y += (gy + HOVER + Math.sin(v.time * 2) * 0.12 - player.y) * Math.min(1, dt * 10);

		// orientation: yaw, pitch along the slope, bank into turns
		const ahead = groundAt(nx + fx * 2, nz + fz * 2);
		const pitchTarget = Math.atan2(ahead - gy, 2) * 0.8;
		v.pitch += (pitchTarget - v.pitch) * 0.15;
		v.bank += (inp.turn * 0.45 * grip - v.bank) * 0.1;
		s.position.set(player.x, player.y, player.z);
		s.rotation.set(v.pitch, player.yaw, v.bank, 'YXZ');

		if (flames.current) flames.current.scale.set(1, 1, 0.3 + (Math.max(player.speed, 0) / MAX_SPEED) * 1.4 + (inp.boost ? 0.8 : 0));

		// chase camera
		const dist = 12 + Math.max(player.speed, 0) * 0.12;
		v.tmp.set(player.x - fx * dist, Math.max(player.y + 7, groundAt(player.x - fx * dist, player.z - fz * dist) + 2.5), player.z - fz * dist);
		if (!g.started) {
			// idle intro orbit around the spawn
			v.intro += dt * 0.12;
			v.tmp.set(player.x + Math.sin(v.intro) * 26, player.y + 16, player.z + Math.cos(v.intro) * 26);
		}
		v.camPos.lerp(v.tmp, 1 - Math.exp(-dt * (g.started ? 4 : 1.5)));
		camera.position.copy(v.camPos);
		v.tmp.set(player.x + fx * 6, player.y + 1.2, player.z + fz * 6);
		if (!g.started) v.tmp.set(player.x, player.y + 1, player.z);
		v.look.lerp(v.tmp, 1 - Math.exp(-dt * 6));
		camera.lookAt(v.look);

		// interactions: nearest landmark in range
		let range: string | null = null;
		let best = Infinity;
		for (const l of LANDMARKS) {
			const d = Math.hypot(player.x - l.x, player.z - l.z);
			if (d < l.radius && d < best) {
				best = d;
				range = l.id;
			}
		}
		if (range !== v.lastRange) {
			v.lastRange = range;
			game.set({ inRange: range });
		}

		// portals: driving through the gate teleports
		const portal = landmark('portal');
		const back = landmark('portal-back');
		if (Math.hypot(player.x - portal.x, player.z - portal.z) < 3 && g.started) {
			game.visit('portal');
			player.teleport = { ...NEXUS_SPAWN };
			game.set({ zone: 'nexus' });
			game.banner('Le Nexus', "L'ère des agents");
		}
		if (Math.hypot(player.x - back.x, player.z - back.z) < 2.6 && g.started) {
			player.teleport = { x: portal.x, z: portal.z + 10, yaw: Math.PI };
			game.set({ zone: 'val' });
			game.banner('Val des Origines', "L'ère du code");
		}
	});

	return (
		<>
			<Ship
				ref={(gr) => {
					ship.current = gr;
					if (gr && emitterNodes[0].parent !== gr) emitterNodes.forEach((e) => gr.add(e));
					emitters.current = emitterNodes;
				}}
				flameRef={flames}
			/>
			<EngineTrail emitters={emitters} pixelRatio={pixelRatio} />
		</>
	);
}
