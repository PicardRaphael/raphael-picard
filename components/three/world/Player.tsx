'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

import { game, useGame } from '@/lib/game-store';
import { keymap } from '@/lib/keymap';
import { mobs, nearestMob } from '@/lib/mobs';
import { music } from '@/lib/music';
import { player } from '@/lib/player-state';
import { canopies, vegetationObstacles } from '@/lib/vegetation';
import { HOUSES, LANDMARKS, NEXUS_CENTER, NEXUS_RADIUS, NEXUS_SPAWN, SPAWN, VAL_RADIUS, groundAt, landmark } from '@/lib/world';
import { FpsWeapon } from './FpsWeapon';
import { HeroModel } from './Hero';
import { fireBolt } from './Lasers';

const RUN = 10;
const SPRINT = 15;

export { groundAt };

function resetInput() {
	player.input.forward = 0;
	player.input.turn = 0;
	player.input.strafe = 0;
	player.input.boost = false;
}

/** Opens a landmark panel (and progresses quests). */
export function interact(id: string) {
	player.moveTarget = null;
	game.set({ panel: id });
	game.visit(id);
}

/** Sword swing: hits the nearest bug in front of the player. */
function damage(target: (typeof mobs)[number]) {
	if (target.state === 'dead') return;
	target.hp -= 1;
	music.sfx('hit');
	target.state = 'hit';
	target.t = 0;
	if (target.hp <= 0) {
		game.set((s) => ({ kills: s.kills + 1 }));
		game.toast(`${target.name} vaincu !`, target.lesson);
	}
}

/** Melee for the knight (sword), ranged laser shots for the cyberpunk runner. */
export const attackRange = () => (game.get().hero === 'runner' ? 22 : 3.4);

/** FPS shot: the bug closest to the aiming ray (within 45 m) is hit; otherwise the bolt flies straight ahead. */
function fpsShot() {
	const yaw = player.camera.yaw;
	const dir = player.aim.clone();
	const eye = new THREE.Vector3(player.x, player.y + 1.65, player.z);
	let best: (typeof mobs)[number] | null = null;
	let bestD = 1.8;
	const to = new THREE.Vector3();
	for (const m of mobs) {
		if (m.state === 'dead' || m.zone !== game.get().zone) continue;
		to.set(m.x - eye.x, groundAt(m.x, m.z) + 1.1 - eye.y, m.z - eye.z);
		const along = to.dot(dir);
		if (along < 0 || along > 45) continue;
		const off = to.clone().addScaledVector(dir, -along).length();
		if (off < bestD) {
			bestD = off;
			best = m;
		}
	}
	const muzzle = eye.clone().addScaledVector(dir, 0.9).add(new THREE.Vector3(Math.cos(yaw) * 0.25, -0.2, -Math.sin(yaw) * 0.25));
	const target = best;
	if (target) fireBolt(muzzle, target, () => damage(target));
	else fireBolt(muzzle, eye.clone().addScaledVector(dir, 40), () => undefined);
	window.dispatchEvent(new CustomEvent('fps:recoil'));
}

export function attack() {
	if (player.attack > 0 || !game.get().started || game.get().panel) return;
	const ranged = game.get().hero === 'runner';
	if (ranged) {
		player.attack = 0.18;
		music.sfx('swing');
		fpsShot();
		return;
	}
	player.attack = ranged ? 0.45 : 0.65;
	music.sfx('swing');
	const target = nearestMob(player.x, player.z, attackRange());
	if (!target || target.zone !== game.get().zone) return;
	player.yaw = Math.atan2(-(target.x - player.x), -(target.z - player.z));
	window.dispatchEvent(new CustomEvent('player:face', { detail: player.yaw }));
	if (ranged) {
		const fx = -Math.sin(player.yaw);
		const fz = -Math.cos(player.yaw);
		setTimeout(() => fireBolt({ x: player.x + fx * 0.8, y: player.y + 1.4, z: player.z + fz * 0.8 }, target, () => damage(target)), 120);
	} else setTimeout(() => damage(target), 260);
}

export function jump() {
	if (player.jump.h > 0.01 || !game.get().started || game.get().panel) return;
	player.jump.vy = 9.5;
	game.set((s) => ({ jumps: s.jumps + 1 }));
	music.sfx('jump');
}

/**
 * Keyboard: arrows (and WASD / ZQSD by physical key) — up/down move along the camera,
 * left/right turn the camera like WoW. Space/Shift sprint. E/Enter interact. Escape closes panels.
 */
function useKeyboard() {
	useEffect(() => {
		resetInput();
		const keys = new Set<string>();
		const has = (a: Parameters<typeof keymap.is>[0]) => [...keys].some((k) => keymap.is(a, k));
		const sync = () => {
			player.input.forward = (has('forward') ? 1 : 0) - (has('back') ? 1 : 0);
			const side = (has('left') ? 1 : 0) - (has('right') ? 1 : 0);
			// first person: left/right strafe; third person: they turn the camera like WoW
			if (game.get().hero === 'runner') {
				player.input.turn = 0;
				player.input.strafe = -side;
			} else {
				player.input.turn = side;
				player.input.strafe = 0;
			}
			player.input.boost = has('sprint');
			if (player.input.forward || player.input.turn) player.moveTarget = null;
		};
		const typing = (e: KeyboardEvent) => e.target instanceof Element && e.target.closest('input, textarea, select');
		const down = (e: KeyboardEvent) => {
			if (typing(e)) return;
			const s = game.get();
			if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
			if (!s.started) return;
			if (s.panel) {
				if (e.code === 'Escape') {
					e.stopImmediatePropagation();
					game.set({ panel: null });
				}
				return;
			}
			if (s.overlay) return;
			if (keymap.is('jump', e.code)) {
				jump();
				return;
			}
			if (keymap.is('attack', e.code)) {
				attack();
				return;
			}
			if (keymap.is('interact', e.code) && s.inRange) {
				interact(s.inRange);
				return;
			}
			keys.add(e.code);
			sync();
		};
		const up = (e: KeyboardEvent) => {
			keys.delete(e.code);
			sync();
		};
		const clear = () => {
			keys.clear();
			resetInput();
		};
		window.addEventListener('keydown', down);
		window.addEventListener('keyup', up);
		window.addEventListener('blur', clear);
		document.addEventListener('visibilitychange', clear);
		return () => {
			window.removeEventListener('keydown', down);
			window.removeEventListener('keyup', up);
			window.removeEventListener('blur', clear);
			document.removeEventListener('visibilitychange', clear);
		};
	}, []);
}

/** Ray-marches the camera ray against the height function: no terrain mesh needed for picking. */
function pickGround(ndc: THREE.Vector2, camera: THREE.Camera) {
	const ray = new THREE.Raycaster();
	ray.setFromCamera(ndc, camera);
	const o = ray.ray.origin;
	const d = ray.ray.direction;
	let prev = 0;
	for (let t = 0.5; t < 400; t += 0.75) {
		const x = o.x + d.x * t;
		const y = o.y + d.y * t;
		const z = o.z + d.z * t;
		if (y < groundAt(x, z)) {
			let a = prev;
			let b = t;
			for (let i = 0; i < 8; i++) {
				const m = (a + b) / 2;
				if (o.y + d.y * m < groundAt(o.x + d.x * m, o.z + d.z * m)) b = m;
				else a = m;
			}
			return new THREE.Vector3(o.x + d.x * b, o.y + d.y * b, o.z + d.z * b);
		}
		prev = t;
	}
	return null;
}

/**
 * Mouse & touch, WoW-style: drag to orbit the camera, wheel / pinch to zoom,
 * click / tap on the ground to walk there, on a landmark to walk to it and interact.
 */
function usePointerControls() {
	const { gl, camera } = useThree();
	useEffect(() => {
		const el = gl.domElement;
		el.style.touchAction = 'none';
		const pointers = new Map<number, { x: number; y: number; sx: number; sy: number }>();
		let pinch = 0;
		const ndc = new THREE.Vector2();

		const down = (e: PointerEvent) => {
			if (!game.get().started || game.get().panel || game.get().overlay) return;
			if (game.get().hero === 'runner' && e.pointerType === 'mouse') {
				// first person: the reticle follows the mouse, a click shoots where it points
				attack();
				return;
			}
			el.setPointerCapture(e.pointerId);
			pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY });
			if (pointers.size === 2) {
				const [a, b] = [...pointers.values()];
				pinch = Math.hypot(a.x - b.x, a.y - b.y);
			}
		};
		const move = (e: PointerEvent) => {
			const p = pointers.get(e.pointerId);
			if (!p) return;
			const dx = e.clientX - p.x;
			const dy = e.clientY - p.y;
			p.x = e.clientX;
			p.y = e.clientY;
			if (pointers.size === 2) {
				const [a, b] = [...pointers.values()];
				const d = Math.hypot(a.x - b.x, a.y - b.y);
				player.camera.distance = THREE.MathUtils.clamp(player.camera.distance * (pinch / Math.max(d, 1)), 6, 48);
				pinch = d;
				return;
			}
			if (Math.hypot(e.clientX - p.sx, e.clientY - p.sy) > 6) {
				player.camera.dragging = true;
				player.camera.yaw -= dx * 0.006;
				if (game.get().hero === 'runner') player.camera.fpsPitch = THREE.MathUtils.clamp(player.camera.fpsPitch - dy * 0.004, -1.2, 1.2);
				else player.camera.pitch = THREE.MathUtils.clamp(player.camera.pitch + dy * 0.004, 0.08, 1.25);
			}
		};
		const up = (e: PointerEvent) => {
			const p = pointers.get(e.pointerId);
			pointers.delete(e.pointerId);
			if (!p) return;
			const wasClick = Math.hypot(e.clientX - p.sx, e.clientY - p.sy) <= 6 && pointers.size === 0;
			if (pointers.size === 0) player.camera.dragging = false;
			if (!wasClick) return;
			const r = el.getBoundingClientRect();
			ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
			// clicking a bug: walk to it and strike
			const mp = new THREE.Vector3();
			for (const m of mobs) {
				if (m.state === 'dead' || m.zone !== game.get().zone) continue;
				mp.set(m.x, groundAt(m.x, m.z) + 1.2, m.z).project(camera);
				if (mp.z > 1) continue;
				if (Math.hypot(((mp.x + 1) / 2) * r.width + r.left - e.clientX, ((1 - mp.y) / 2) * r.height + r.top - e.clientY) < 55) {
					player.attackTarget = m.id;
					player.moveTarget = null;
					return;
				}
			}
			const hit = pickGround(ndc, camera);
			if (!hit) return;
			player.attackTarget = null;
			let target: { x: number; z: number; landmark?: string } = { x: hit.x, z: hit.z };
			// a landmark wins if the click lands on it on screen (models stand above the ground)
			let picked: (typeof LANDMARKS)[number] | null = null;
			let bestPx = 80;
			const sp = new THREE.Vector3();
			for (const l of LANDMARKS) {
				sp.set(l.x, groundAt(l.x, l.z) + 2.5, l.z).project(camera);
				if (sp.z > 1) continue;
				const px = Math.hypot(((sp.x + 1) / 2) * r.width + r.left - e.clientX, ((1 - sp.y) / 2) * r.height + r.top - e.clientY);
				if (px < bestPx) {
					bestPx = px;
					picked = l;
				}
			}
			for (const l of picked ? [picked] : LANDMARKS) {
				if (picked || Math.hypot(hit.x - l.x, hit.z - l.z) < Math.max(l.radius, 6)) {
					const dx = player.x - l.x;
					const dz = player.z - l.z;
					const d = Math.hypot(dx, dz) || 1;
					const stop = Math.max(l.solid + 2.2, 3);
					target = { x: l.x + (dx / d) * stop, z: l.z + (dz / d) * stop, landmark: l.id };
					break;
				}
			}
			player.moveTarget = target;
			window.dispatchEvent(new CustomEvent('world:click', { detail: { x: hit.x, y: hit.y, z: hit.z } }));
		};
		const wheel = (e: WheelEvent) => {
			if (!game.get().started) return;
			e.preventDefault();
			player.camera.distance = THREE.MathUtils.clamp(player.camera.distance + e.deltaY * 0.012, 6, 48);
		};
		// free look: the camera follows the mouse without clicking (mouse only, not touch)
		const look = (e: PointerEvent) => {
			if (document.pointerLockElement === el) {
				player.camera.yaw -= e.movementX * 0.0022;
				player.camera.fpsPitch = THREE.MathUtils.clamp(player.camera.fpsPitch - e.movementY * 0.0022, -1.2, 1.2);
				return;
			}
			if (e.pointerType !== 'mouse' || pointers.size > 0) return;
			const r = el.getBoundingClientRect();
			player.camera.lookX = THREE.MathUtils.clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
			player.camera.lookY = THREE.MathUtils.clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1);
		};
		const leave = () => {
			player.camera.lookX = 0;
			player.camera.lookY = 0;
		};
		el.addEventListener('pointermove', look);
		el.addEventListener('pointerleave', leave);
		el.addEventListener('pointerdown', down);
		el.addEventListener('pointermove', move);
		el.addEventListener('pointerup', up);
		el.addEventListener('pointercancel', up);
		el.addEventListener('wheel', wheel, { passive: false });
		const noMenu = (e: Event) => e.preventDefault();
		el.addEventListener('contextmenu', noMenu);
		return () => {
			el.removeEventListener('pointermove', look);
			el.removeEventListener('pointerleave', leave);
			el.removeEventListener('pointerdown', down);
			el.removeEventListener('pointermove', move);
			el.removeEventListener('pointerup', up);
			el.removeEventListener('pointercancel', up);
			el.removeEventListener('wheel', wheel);
			el.removeEventListener('contextmenu', noMenu);
		};
	}, [gl, camera]);
}

/** Static obstacles as circles in the ground plane. */
const OBSTACLES: { x: number; z: number; r: number }[] = [
	...LANDMARKS.filter((l) => l.solid > 0).map((l) => ({ x: l.x, z: l.z, r: l.solid })),
	...HOUSES.map((h) => ({ x: h.x, z: h.z, r: h.c })),
];

/** Ring that flashes where the player clicked. */
function ClickMarker() {
	const ref = useRef<THREE.Mesh>(null);
	const life = useRef(0);
	useEffect(() => {
		const on = (e: Event) => {
			const { x, y, z } = (e as CustomEvent<{ x: number; y: number; z: number }>).detail;
			ref.current?.position.set(x, y + 0.15, z);
			life.current = 1;
		};
		window.addEventListener('world:click', on);
		return () => window.removeEventListener('world:click', on);
	}, []);
	useFrame((_, dt) => {
		const m = ref.current;
		if (!m) return;
		life.current = Math.max(0, life.current - dt * 1.6);
		m.visible = life.current > 0;
		m.scale.setScalar(1 + (1 - life.current) * 1.2);
		(m.material as THREE.MeshBasicMaterial).opacity = life.current;
	});
	return (
		<mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
			<ringGeometry args={[0.5, 0.75, 32]} />
			<meshBasicMaterial color="#ffd100" transparent toneMapped={false} depthWrite={false} />
		</mesh>
	);
}

export function Player() {
	useKeyboard();
	usePointerControls();
	const { camera } = useThree();
	const hero = useGame((s) => s.hero);
	const body = useRef<THREE.Group>(null);
	const [anim, setAnim] = useState('Idle');
	const [animSpeed, setAnimSpeed] = useState(1);
	const v = useMemo(
		() => ({
			camPos: new THREE.Vector3(SPAWN.x, 14, SPAWN.z + 20),
			look: new THREE.Vector3(SPAWN.x, 2, SPAWN.z),
			tmp: new THREE.Vector3(),
			time: 0,
			lastRange: null as string | null,
			intro: 0,
			anim: 'Idle',
			animSpeed: 1,
			facing: 0,
			hurt: 0,
			swing: 0,
			solid: null as null | { x: number; z: number; r: number }[],
			crowns: null as null | { x: number; z: number; r: number; top: number }[],
			lookYaw: 0,
			ray: new THREE.Raycaster(),
			ndc: new THREE.Vector2(),
			lookPitch: 0,
			dist: 13,
			swinging: false,
		}),
		[],
	);

	useEffect(() => {
		// test hooks for the dev browser
		if (process.env.NODE_ENV !== 'production') Object.assign(window, { __player: player, __game: game, __keymap: keymap });
		player.x = SPAWN.x;
		player.z = SPAWN.z;
		player.yaw = SPAWN.yaw;
		player.camera.yaw = SPAWN.yaw;
		player.speed = 0;
		player.moveTarget = null;
		const hit = () => {
			v.hurt = 0.4;
			window.dispatchEvent(new CustomEvent('ui:hurt'));
		};
		const face = (e: Event) => {
			v.facing = (e as CustomEvent<number>).detail;
		};
		window.addEventListener('player:hit', hit);
		window.addEventListener('player:face', face);
		return () => {
			window.removeEventListener('player:hit', hit);
			window.removeEventListener('player:face', face);
		};
	}, [v]);

	useFrame((_, delta) => {
		const b = body.current;
		const dt = Math.min(delta, 1 / 20);
		v.time += dt;
		const g = game.get();
		const canMove = g.started && !g.panel && !g.overlay;

		if (player.teleport) {
			player.x = player.teleport.x;
			player.z = player.teleport.z;
			player.yaw = player.teleport.yaw;
			v.facing = player.teleport.yaw;
			player.camera.yaw = player.teleport.yaw;
			player.speed = 0;
			player.moveTarget = null;
			player.teleport = null;
			v.camPos.set(player.x, groundAt(player.x, player.z) + 8, player.z + 14);
		}

		// keyboard: left/right turn the camera, up/down walk along it
		const inp = player.input;
		if (canMove) player.camera.yaw += inp.turn * 2.2 * dt;
		// free look: the view leans toward the mouse, and keeps turning near the screen edges
		const fps = g.hero === 'runner' && g.started;
		if (fps && (g.panel || g.overlay) && document.pointerLockElement) document.exitPointerLock();
		if (fps && !g.panel && !g.overlay) {
			// turn when the reticle nears the left / right edge, tilt the view toward the top / bottom
			const ax = player.camera.lookX;
			const ay = player.camera.lookY;
			const ex = Math.max(0, Math.abs(ax) - 0.45) / 0.55;
			player.camera.yaw -= Math.sign(ax) * ex * ex * 2.6 * dt;
			const ey = Math.max(0, Math.abs(ay) - 0.55) / 0.45;
			player.camera.fpsPitch = THREE.MathUtils.clamp(player.camera.fpsPitch - Math.sign(ay) * ey * ey * 1.4 * dt, -0.9, 0.9);
		}
		const lx = !fps && g.started && !g.panel && !g.overlay && !player.camera.dragging ? player.camera.lookX : 0;
		const ly = !fps && g.started && !g.panel && !g.overlay && !player.camera.dragging ? player.camera.lookY : 0;
		const edge = Math.max(0, Math.abs(lx) - 0.72) / 0.28;
		player.camera.yaw -= Math.sign(lx) * edge * edge * 1.9 * dt;
		v.lookYaw += (-lx * 0.55 - v.lookYaw) * Math.min(1, dt * 4);
		v.lookPitch += (ly * 0.22 - v.lookPitch) * Math.min(1, dt * 4);
		const viewYaw = player.camera.yaw + v.lookYaw;
		let dirX = 0;
		let dirZ = 0;
		let want = 0;
		if (canMove && (inp.forward || inp.strafe)) {
			// camera-relative movement: arrows / keys (forward) and touch joystick (forward + strafe)
			const fx = -Math.sin(viewYaw);
			const fz = -Math.cos(viewYaw);
			dirX = fx * inp.forward + Math.cos(viewYaw) * inp.strafe;
			dirZ = fz * inp.forward - Math.sin(viewYaw) * inp.strafe;
			const len = Math.hypot(dirX, dirZ);
			const mag = Math.min(1, len);
			if (len > 0) {
				dirX /= len;
				dirZ /= len;
			}
			const base = inp.forward < 0 && !inp.strafe ? RUN * 0.6 : inp.boost ? SPRINT : RUN;
			want = base * mag;
			player.moveTarget = null;
			player.attackTarget = null;
		} else if (canMove && player.attackTarget !== null) {
			const m = mobs[player.attackTarget];
			const dx = m.x - player.x;
			const dz = m.z - player.z;
			const d = Math.hypot(dx, dz);
			if (m.state === 'dead') player.attackTarget = null;
			else if (d < (game.get().hero === 'runner' ? 16 : 2.6)) {
				v.facing = Math.atan2(-dx, -dz);
				attack();
			} else {
				dirX = dx / d;
				dirZ = dz / d;
				want = RUN;
			}
		} else if (canMove && player.moveTarget) {
			const dx = player.moveTarget.x - player.x;
			const dz = player.moveTarget.z - player.z;
			const d = Math.hypot(dx, dz);
			if (d < 0.6) {
				const lm = player.moveTarget.landmark;
				player.moveTarget = null;
				if (lm) interact(lm);
			} else {
				dirX = dx / d;
				dirZ = dz / d;
				want = Math.min(RUN, d * 3 + 2);
			}
		}
		player.speed += (want - player.speed) * Math.min(1, dt * 8);
		let nx = player.x + dirX * player.speed * dt;
		let nz = player.z + dirZ * player.speed * dt;

		// collisions: buildings, trees, rocks and bugs (the push is radial, so the player slides around them)
		v.solid ??= [...OBSTACLES, ...vegetationObstacles()];
		const dyn = mobs.filter((m) => m.zone === g.zone && !(m.state === 'dead' && m.t > 2)).map((m) => ({ x: m.x, z: m.z, r: 0.75 }));
		for (const o of [...v.solid, ...dyn]) {
			if (Math.abs(nx - o.x) > o.r + 1 || Math.abs(nz - o.z) > o.r + 1) continue;
			const dx = nx - o.x;
			const dz = nz - o.z;
			const d = Math.hypot(dx, dz);
			const min = o.r + 0.8;
			if (d < min) {
				const ux = d > 1e-3 ? dx / d : 1;
				const uz = d > 1e-3 ? dz / d : 0;
				nx = o.x + ux * min;
				nz = o.z + uz * min;
			}
		}
		const inNexus = nz < -300;
		const cx = inNexus ? NEXUS_CENTER.x : 0;
		const cz = inNexus ? NEXUS_CENTER.z : -20;
		const R = inNexus ? NEXUS_RADIUS : VAL_RADIUS;
		const rd = Math.hypot(nx - cx, nz - cz);
		if (rd > R) {
			nx = cx + ((nx - cx) / rd) * R;
			nz = cz + ((nz - cz) / rd) * R;
		}
		if (!inNexus && groundAt(nx, nz) < -1.6) {
			// the lake is not walkable
			nx = player.x;
			nz = player.z;
			player.moveTarget = null;
		}
		player.x = nx;
		player.z = nz;
		player.attack = Math.max(0, player.attack - dt);
		if (player.jump.vy !== 0 || player.jump.h > 0) {
			player.jump.vy -= 26 * dt;
			player.jump.h = Math.max(0, player.jump.h + player.jump.vy * dt);
			if (player.jump.h === 0) player.jump.vy = 0;
		}
		player.y = groundAt(nx, nz) + player.jump.h;
		if (g.started && Math.hypot(nx - SPAWN.x, nz - SPAWN.z) > 25) game.flag('left_spawn');

		// face the movement direction
		if (want > 0 && (dirX || dirZ)) {
			const target = Math.atan2(-dirX, -dirZ);
			let diff = target - v.facing;
			diff = Math.atan2(Math.sin(diff), Math.cos(diff));
			v.facing += diff * Math.min(1, dt * 12);
			player.yaw = v.facing;
			// the camera slowly swings behind when walking toward a clicked point
			if (!inp.forward && !player.camera.dragging) {
				let cd = v.facing - player.camera.yaw;
				cd = Math.atan2(Math.sin(cd), Math.cos(cd));
				player.camera.yaw += cd * Math.min(1, dt * 0.9);
			}
		}
		if (fps) v.facing = player.camera.yaw;
		if (b) {
			b.position.set(player.x, player.y, player.z);
			// KayKit models face +Z
			b.rotation.y = v.facing + Math.PI;
		}

		const nextAnim =
			player.attack > 0 ? (g.hero === 'runner' ? '1H_Ranged_Shoot' : '1H_Melee_Attack_Slice_Diagonal') : player.jump.h > 0.05 ? 'Jump_Full_Short' : v.hurt > 0 ? 'Hit_A' : player.speed > 6.5 ? 'Running_A' : player.speed > 0.6 ? 'Walking_A' : 'Idle';
		v.hurt = Math.max(0, v.hurt - dt);
		if (player.attack > 0 && !v.swinging) v.swing++;
		v.swinging = player.attack > 0;
		const animKey = nextAnim.startsWith('1H_') ? `${nextAnim}#${v.swing}` : nextAnim;
		const nextSpeed = nextAnim === 'Running_A' ? player.speed / RUN : nextAnim === 'Walking_A' ? Math.max(player.speed / 4, 0.6) : 1;
		if (animKey !== v.anim) {
			v.anim = animKey;
			setAnim(animKey);
		}
		if (Math.abs(nextSpeed - v.animSpeed) > 0.1) {
			v.animSpeed = nextSpeed;
			setAnimSpeed(nextSpeed);
		}

		// orbit camera
		const c = player.camera;
		if (!g.started) {
			v.intro += dt * 0.1;
			v.tmp.set(player.x + Math.sin(v.intro) * 28, player.y + 17, player.z + Math.cos(v.intro) * 28);
		} else {
			const pitch = THREE.MathUtils.clamp(c.pitch + v.lookPitch, 0.06, 1.3);
			// pull the camera in when a tree crown stands between it and the hero
			let dist = c.distance;
			v.crowns ??= canopies();
			for (let t = 2; t < c.distance; t += 1) {
				const sx = player.x + Math.sin(viewYaw) * Math.cos(pitch) * t;
				const sz = player.z + Math.cos(viewYaw) * Math.cos(pitch) * t;
				const sy = player.y + 1.6 + Math.sin(pitch) * t;
				if (g.zone === 'val' && v.crowns.some((k) => sy < k.top && Math.abs(sx - k.x) < k.r && Math.abs(sz - k.z) < k.r && Math.hypot(sx - k.x, sz - k.z) < k.r)) {
					dist = Math.max(3.5, t - 1);
					break;
				}
			}
			v.dist += (dist - v.dist) * Math.min(1, dt * (dist < v.dist ? 12 : 3));
			v.tmp.set(
				player.x + Math.sin(viewYaw) * Math.cos(pitch) * v.dist,
				player.y + 1.6 + Math.sin(pitch) * v.dist,
				player.z + Math.cos(viewYaw) * Math.cos(pitch) * v.dist,
			);
			v.tmp.y = Math.max(v.tmp.y, groundAt(v.tmp.x, v.tmp.z) + 1.2);
		}
		if (fps) {
			// first person: eyes at 1.65 m, a light head bob while running
			const bob = Math.sin(v.time * 11) * 0.05 * Math.min(player.speed / RUN, 1);
			camera.position.set(player.x, player.y + 1.65 + bob, player.z);
			v.camPos.copy(camera.position);
			const pt = player.camera.fpsPitch;
			camera.lookAt(player.x - Math.sin(player.camera.yaw) * Math.cos(pt) * 10, player.y + 1.65 + Math.sin(pt) * 10, player.z - Math.cos(player.camera.yaw) * Math.cos(pt) * 10);
			v.look.set(player.x, player.y + 1.8, player.z);
			camera.updateMatrixWorld();
			v.ray.setFromCamera(v.ndc.set(player.camera.lookX, -player.camera.lookY), camera);
			player.aim.copy(v.ray.ray.direction);
		} else {
			v.camPos.lerp(v.tmp, 1 - Math.exp(-dt * (g.started ? 10 : 1.5)));
			camera.position.copy(v.camPos);
			v.tmp.set(player.x, player.y + 1.8, player.z);
			v.look.lerp(v.tmp, 1 - Math.exp(-dt * 12));
			camera.lookAt(v.look);
		}

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

		// portals: walking through the gate teleports
		if (g.started) {
			const portal = landmark('portal');
			const back = landmark('portal-back');
			if (Math.hypot(player.x - portal.x, player.z - portal.z) < 2.8) {
				game.visit('portal');
				player.teleport = { ...NEXUS_SPAWN };
				game.set({ zone: 'nexus' });
				game.flag('nexus');
				game.banner('Le Nexus', "L'ère des agents");
			}
			if (Math.hypot(player.x - back.x, player.z - back.z) < 2.4) {
				player.teleport = { x: portal.x, z: portal.z + 10, yaw: Math.PI };
				game.set({ zone: 'val' });
				game.banner('Val des Origines', "L'ère du code");
			}
		}
	});

	return (
		<>
			<Suspense fallback={null}>
				{hero === 'runner' ? <FpsWeapon /> : <HeroModel key={hero} ref={body} kind={hero} animation={anim} speed={animSpeed} />}
			</Suspense>
			<ClickMarker />
		</>
	);
}
