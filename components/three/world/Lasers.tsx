'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';

import type { Mob } from '@/lib/mobs';
import { groundAt } from '@/lib/world';

/**
 * The runner's energy shots, drawn like a sci-fi FPS tracer: a thin white-hot core in a cyan halo turning violet
 * along a fading trail, leaving the muzzle and converging on the aimed point, then a flash and a spray of sparks where
 * it lands. Damage still lands on arrival (onHit).
 *
 * No light anywhere: everything is additive, unlit and not tone mapped (HDR colours > 1 feed the Bloom pass), in two
 * instanced meshes (velocity-aligned streaks and camera-facing glows) with fixed pools, so no allocation per frame and
 * the shader programs are compiled once with the rest of the world.
 */
type Target = Mob | THREE.Vector3;
type Vec = { x: number; y: number; z: number };

/** Where the first-person rifle's barrel ends in the world, written every frame by FpsWeapon (ok = false when hidden). */
export const fpsMuzzle = { x: 0, y: 0, z: 0, ok: false };

const SPEED = 100;
/** Length of the bright streak behind the head (shorter right after leaving the barrel). */
const TRAIL = 7;
const STREAK_W = 0.24;
const BEAM_W = 0.09;
const SPARK_W = 0.12;

const MAX_BOLTS = 24;
const MAX_SPARKS = 96;
const MAX_FLASHES = 16;
/** Streak instances: the bolts' streaks, then the sparks (the beams back to the muzzle have their own mesh). */
const STREAKS = MAX_BOLTS + MAX_SPARKS;
/** Glow instances: one hot head per bolt, then the impact / muzzle flashes. */
const GLOWS = MAX_BOLTS + MAX_FLASHES;

type Bolt = {
	on: boolean;
	ox: number;
	oy: number;
	oz: number;
	x: number;
	y: number;
	z: number;
	dx: number;
	dy: number;
	dz: number;
	tx: number;
	ty: number;
	tz: number;
	mob: Mob | null;
	onHit: () => void;
	life: number;
	trav: number;
	/** Seconds since arrival, -1 while flying. */
	arrived: number;
	impact: boolean;
	nx: number;
	ny: number;
	nz: number;
	normal: boolean;
};
type Spark = { life: number; max: number; x: number; y: number; z: number; vx: number; vy: number; vz: number; hot: boolean };
/** A glow facing the camera, or lying flat on a surface when it has a normal (n*, unit; flat = true). */
type Flash = {
	life: number;
	max: number;
	x: number;
	y: number;
	z: number;
	size: number;
	r: number;
	g: number;
	b: number;
	roll: number;
	flat: boolean;
	nx: number;
	ny: number;
	nz: number;
};

const bolts: Bolt[] = Array.from({ length: MAX_BOLTS }, () => ({
	on: false,
	ox: 0,
	oy: 0,
	oz: 0,
	x: 0,
	y: 0,
	z: 0,
	dx: 0,
	dy: 0,
	dz: -1,
	tx: 0,
	ty: 0,
	tz: 0,
	mob: null,
	onHit: () => undefined,
	life: 0,
	trav: 0,
	arrived: -1,
	impact: false,
	nx: 0,
	ny: 1,
	nz: 0,
	normal: false,
}));
const sparks: Spark[] = Array.from({ length: MAX_SPARKS }, () => ({ life: 1, max: 1, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, hot: false }));
const flashes: Flash[] = Array.from({ length: MAX_FLASHES }, () => ({
	life: 1,
	max: 1,
	x: 0,
	y: 0,
	z: 0,
	size: 1,
	r: 1,
	g: 1,
	b: 1,
	roll: 0,
	flat: false,
	nx: 0,
	ny: 0,
	nz: 1,
}));
let nextSpark = 0;
let nextFlash = 0;

const isPoint = (t: Target): t is THREE.Vector3 => t instanceof THREE.Vector3;

function aimAt(b: Bolt) {
	if (!b.mob) return;
	b.tx = b.mob.x;
	b.ty = groundAt(b.mob.x, b.mob.z) + 1.2;
	b.tz = b.mob.z;
}

function flash(x: number, y: number, z: number, size: number, max: number, r: number, g: number, b: number, flat = false, nx = 0, ny = 0, nz = 1) {
	const f = flashes[nextFlash];
	nextFlash = (nextFlash + 1) % MAX_FLASHES;
	f.life = 0;
	f.max = max;
	f.x = x;
	f.y = y;
	f.z = z;
	f.size = size;
	f.r = r;
	f.g = g;
	f.b = b;
	f.roll = Math.random() * Math.PI;
	f.flat = flat;
	f.nx = nx;
	f.ny = ny;
	f.nz = nz;
}

/** Flash + sparks thrown around the surface normal (n, unit), reflected away from the incoming direction (d, unit). */
function impact(x: number, y: number, z: number, nx: number, ny: number, nz: number, dx: number, dy: number, dz: number, big: boolean) {
	const ground = !big && ny > 0.6;
	// on the ground: a splash of light lying on it (a camera-facing glow would cut into the terrain)
	if (ground) flash(x + nx * 0.08, y + ny * 0.08, z + nz * 0.08, 2.4, 0.3, 0.6, 2.2, 3.8, true, nx, ny, nz);
	// on a facade (whose shopfronts and awnings only roughly match the trace): the burst is moved back along the shot,
	// which leaves it at the same place on screen but in front of the relief
	const back = big || ground ? 0 : 1;
	x -= dx * back;
	y -= dy * back;
	z -= dz * back;
	if (!ground) flash(x, y, z, big ? 3 : 2.4, 0.22, 0.8, 2.4, 4);
	// the hot core and the sparks start a little out of the surface
	x += nx * 0.25;
	y += ny * 0.25;
	z += nz * 0.25;
	flash(x, y, z, big ? 0.9 : 0.7, 0.1, 4, 3.8, 3.4);
	// mirror of the shot on the surface, blended with the normal: the spray kicks back out of the hit
	const k = 2 * (dx * nx + dy * ny + dz * nz);
	const rx = dx - k * nx + nx;
	const ry = dy - k * ny + ny;
	const rz = dz - k * nz + nz;
	const n = big ? 12 : 9;
	for (let i = 0; i < n; i++) {
		const s = sparks[nextSpark];
		nextSpark = (nextSpark + 1) % MAX_SPARKS;
		let vx = rx + (Math.random() * 2 - 1) * 1.1;
		let vy = ry + (Math.random() * 2 - 1) * 1.1 + 0.35;
		let vz = rz + (Math.random() * 2 - 1) * 1.1;
		const l = Math.hypot(vx, vy, vz) || 1;
		const speed = 5 + Math.random() * 11;
		vx = (vx / l) * speed;
		vy = (vy / l) * speed;
		vz = (vz / l) * speed;
		s.life = 0;
		s.max = 0.16 + Math.random() * 0.3;
		s.x = x;
		s.y = y;
		s.z = z;
		s.vx = vx;
		s.vy = vy;
		s.vz = vz;
		s.hot = Math.random() < 0.6;
	}
}

/**
 * Fires a shot from `from` to a bug (followed until it lands) or to a fixed point. `impact` sparks on the decor at that
 * point (with its surface `normal` when known); a bug always sparks. `flash` adds a muzzle flash at `from` (third person:
 * in first person the rifle draws its own).
 */
export function fireBolt(from: Vec, target: Target, onHit: () => void, opts?: { impact?: boolean; normal?: Vec; flash?: boolean }) {
	let b = bolts.find((x) => !x.on);
	if (!b) {
		// every slot busy: recycle the oldest, landing its damage now
		b = bolts.reduce((a, x) => (x.life > a.life ? x : a));
		if (b.arrived < 0) b.onHit();
	}
	b.on = true;
	b.ox = b.x = from.x;
	b.oy = b.y = from.y;
	b.oz = b.z = from.z;
	b.mob = isPoint(target) ? null : target;
	if (isPoint(target)) {
		b.tx = target.x;
		b.ty = target.y;
		b.tz = target.z;
	} else aimAt(b);
	const l = Math.hypot(b.tx - b.x, b.ty - b.y, b.tz - b.z);
	if (l > 1e-6) {
		b.dx = (b.tx - b.x) / l;
		b.dy = (b.ty - b.y) / l;
		b.dz = (b.tz - b.z) / l;
	}
	b.onHit = onHit;
	b.life = 0;
	b.trav = 0;
	b.arrived = -1;
	b.impact = !!opts?.impact;
	b.normal = !!opts?.normal;
	if (opts?.normal) ({ x: b.nx, y: b.ny, z: b.nz } = opts.normal);
	if (opts?.flash) flash(from.x, from.y, from.z, 0.7, 0.07, 3, 2.7, 2.2);
}

/** Streak texture: across = u (white-hot core in a cyan halo), along = v (0 tail, faded violet; 1 head, brightest). */
function streakTexture() {
	const W = 64;
	const H = 256;
	const c = document.createElement('canvas');
	c.width = W;
	c.height = H;
	const ctx = c.getContext('2d');
	if (!ctx) return new THREE.Texture();
	const img = ctx.createImageData(W, H);
	for (let py = 0; py < H; py++) {
		// canvas top row = texture v 1 = the head
		const v = 1 - (py + 0.5) / H;
		const along = Math.pow(v, 1.7) * (1 - THREE.MathUtils.smoothstep(v, 0.94, 1));
		const cw = 0.06 + 0.05 * v;
		const hw = 0.22 + 0.2 * v;
		for (let px = 0; px < W; px++) {
			const x = ((px + 0.5) / W) * 2 - 1;
			const core = Math.exp(-((x / cw) ** 2));
			const halo = Math.exp(-((x / hw) ** 2)) * 0.7 * (1 - Math.abs(x));
			// halo: violet at the tail, cyan toward the head
			const hr = 0.62 - 0.4 * v;
			const hg = 0.3 + 0.55 * v;
			const r = (core * 1.0 + halo * hr) * along;
			const g = (core * 0.97 + halo * hg) * along;
			const b = (core * 0.92 + halo * 1.0) * along;
			const i = (py * W + px) * 4;
			img.data[i] = Math.min(255, r * 255);
			img.data[i + 1] = Math.min(255, g * 255);
			img.data[i + 2] = Math.min(255, b * 255);
			img.data[i + 3] = 255;
		}
	}
	ctx.putImageData(img, 0, 0);
	const t = new THREE.CanvasTexture(c);
	t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
	return t;
}

/** Beam texture: the same core and halo, even along the length, with soft ends. */
function beamTexture() {
	const W = 64;
	const H = 64;
	const c = document.createElement('canvas');
	c.width = W;
	c.height = H;
	const ctx = c.getContext('2d');
	if (!ctx) return new THREE.Texture();
	const img = ctx.createImageData(W, H);
	for (let py = 0; py < H; py++) {
		const v = (py + 0.5) / H;
		const along = THREE.MathUtils.smoothstep(v, 0, 0.12) * (1 - THREE.MathUtils.smoothstep(v, 0.85, 1));
		for (let px = 0; px < W; px++) {
			const x = ((px + 0.5) / W) * 2 - 1;
			const core = Math.exp(-((x / 0.09) ** 2));
			const halo = Math.exp(-((x / 0.35) ** 2)) * 0.4 * (1 - Math.abs(x));
			const i = (py * W + px) * 4;
			img.data[i] = Math.min(255, (core + halo * 0.3) * along * 255);
			img.data[i + 1] = Math.min(255, (core * 0.98 + halo * 0.85) * along * 255);
			img.data[i + 2] = Math.min(255, (core * 0.95 + halo) * along * 255);
			img.data[i + 3] = 255;
		}
	}
	ctx.putImageData(img, 0, 0);
	return new THREE.CanvasTexture(c);
}

/** Round glow with a hot centre and four faint rays, black (= nothing, additive) at the edges. */
export function glowTexture(rays = 0.35) {
	const S = 64;
	const c = document.createElement('canvas');
	c.width = c.height = S;
	const ctx = c.getContext('2d');
	if (!ctx) return new THREE.Texture();
	const img = ctx.createImageData(S, S);
	for (let py = 0; py < S; py++)
		for (let px = 0; px < S; px++) {
			const x = ((px + 0.5) / S) * 2 - 1;
			const y = ((py + 0.5) / S) * 2 - 1;
			const r2 = x * x + y * y;
			const ax = Math.abs(x);
			const ay = Math.abs(y);
			const spikes = Math.exp(-ax * 30) * Math.exp(-ay * 3.5) + Math.exp(-ay * 30) * Math.exp(-ax * 3.5);
			const edge = 1 - THREE.MathUtils.smoothstep(Math.sqrt(r2), 0.75, 1);
			const val = Math.min(1, (Math.exp(-r2 * 40) + Math.exp(-r2 * 7) * 0.45 + spikes * rays) * edge);
			const i = (py * S + px) * 4;
			img.data[i] = img.data[i + 1] = img.data[i + 2] = val * 255;
			img.data[i + 3] = 255;
		}
	ctx.putImageData(img, 0, 0);
	return new THREE.CanvasTexture(c);
}

function additive(map: THREE.Texture) {
	return new THREE.MeshBasicMaterial({
		map,
		transparent: true,
		blending: THREE.AdditiveBlending,
		depthWrite: false,
		toneMapped: false,
		fog: false,
		side: THREE.DoubleSide,
	});
}

// scratch objects, allocated once
const m = new THREE.Matrix4();
const q = new THREE.Quaternion();
const qRoll = new THREE.Quaternion();
const col = new THREE.Color();
const zAxis = new THREE.Vector3(0, 0, 1);
const camPos = new THREE.Vector3();
const camRight = new THREE.Vector3();
const dir = new THREE.Vector3();
const side = new THREE.Vector3();
const nrm = new THREE.Vector3();
const mid = new THREE.Vector3();
const pos = new THREE.Vector3();
const scl = new THREE.Vector3();
const HIDDEN = new THREE.Matrix4().makeScale(0, 0, 0);

/** A quad stretched from a (tail) to b (head), turned about its axis to face the camera. */
function streak(
	mesh: THREE.InstancedMesh,
	i: number,
	ax: number,
	ay: number,
	az: number,
	bx: number,
	by: number,
	bz: number,
	w: number,
	minAngle = 0,
) {
	dir.set(bx - ax, by - ay, bz - az);
	const len = dir.length();
	if (len < 1e-4 || w <= 0) {
		mesh.setMatrixAt(i, HIDDEN);
		return;
	}
	dir.multiplyScalar(1 / len);
	mid.set((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2);
	// far away (third person), a minimum angular width keeps the line readable
	w = Math.max(w, mid.distanceTo(camPos) * minAngle);
	// across = axis × (to the eye): the quad's front (across × axis) then faces the camera
	side.subVectors(camPos, mid);
	side.crossVectors(dir, side);
	// seen exactly along its axis (a shot straight away from the eye): any direction across the screen will do
	if (side.lengthSq() < 1e-10) side.copy(camRight);
	else side.normalize();
	nrm.crossVectors(side, dir);
	m.makeBasis(side.multiplyScalar(w), dir.multiplyScalar(len), nrm);
	m.setPosition(mid);
	mesh.setMatrixAt(i, m);
}

/** A camera-facing glow of the given size and roll. */
function glow(mesh: THREE.InstancedMesh, i: number, camQ: THREE.Quaternion, x: number, y: number, z: number, size: number, roll: number) {
	if (size <= 0) {
		mesh.setMatrixAt(i, HIDDEN);
		return;
	}
	q.setFromAxisAngle(zAxis, roll).premultiply(camQ);
	m.compose(pos.set(x, y, z), q, scl.set(size, size, size));
	mesh.setMatrixAt(i, m);
}

function instanced(material: THREE.Material, count: number) {
	const mesh = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), material, count);
	mesh.frustumCulled = false;
	mesh.renderOrder = 5;
	// the colour attribute exists from the start, so the program compiled at warm-up is the one used in play
	mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(count * 3), 3);
	for (let i = 0; i < count; i++) mesh.setMatrixAt(i, HIDDEN);
	return mesh;
}

export function Lasers() {
	const { streaks, beams, glows } = useMemo(
		() => ({
			streaks: instanced(additive(streakTexture()), STREAKS),
			beams: instanced(additive(beamTexture()), MAX_BOLTS),
			glows: instanced(additive(glowTexture()), GLOWS),
		}),
		[],
	);
	useEffect(
		() => () => {
			for (const mesh of [streaks, beams, glows]) {
				mesh.geometry.dispose();
				const mat = mesh.material as THREE.MeshBasicMaterial;
				mat.map?.dispose();
				mat.dispose();
				mesh.dispose();
			}
			fpsMuzzle.ok = false;
		},
		[streaks, beams, glows],
	);

	useFrame(({ camera }, delta) => {
		const dt = Math.min(delta, 0.05);
		camera.getWorldPosition(camPos);
		camRight.setFromMatrixColumn(camera.matrixWorld, 0);
		if (camRight.lengthSq() < 1e-10) camRight.set(1, 0, 0);
		else camRight.normalize();
		const camQ = camera.quaternion;

		// bolts: fly, land (damage + impact), then the streak's tail catches up with the hit point
		for (let i = 0; i < MAX_BOLTS; i++) {
			const b = bolts[i];
			if (!b.on) continue;
			b.life += dt;
			if (b.arrived < 0) {
				aimAt(b);
				const ex = b.tx - b.x;
				const ey = b.ty - b.y;
				const ez = b.tz - b.z;
				const d = Math.hypot(ex, ey, ez);
				const step = SPEED * dt;
				if (d <= step || b.life > 1.5) {
					b.x = b.tx;
					b.y = b.ty;
					b.z = b.tz;
					b.trav += Math.min(d, step);
					b.arrived = 0;
					b.onHit();
					if (b.mob || b.impact) {
						// a bug: the spray bursts back toward the shooter, from its front
						const n = b.normal && !b.mob;
						const nx = n ? b.nx : -b.dx;
						const ny = n ? b.ny : -b.dy + 0.3;
						const nz = n ? b.nz : -b.dz;
						const nl = Math.hypot(nx, ny, nz) || 1;
						// a bug is hit on its front, not at its centre (inside its body the flash would be hidden)
						const back = b.mob ? 0.9 : 0;
						impact(b.x - b.dx * back, b.y - b.dy * back, b.z - b.dz * back, nx / nl, ny / nl, nz / nl, b.dx, b.dy, b.dz, !!b.mob);
					}
				} else {
					b.dx = ex / d;
					b.dy = ey / d;
					b.dz = ez / d;
					b.x += b.dx * step;
					b.y += b.dy * step;
					b.z += b.dz * step;
					b.trav += step;
				}
			} else {
				b.arrived += dt;
				if (b.arrived * SPEED > Math.min(TRAIL, b.trav) && b.arrived > 0.12) b.on = false;
			}
		}

		// draw the bolts: streak + beam back to the barrel + hot head
		for (let i = 0; i < MAX_BOLTS; i++) {
			const b = bolts[i];
			if (!b.on) {
				streaks.setMatrixAt(i, HIDDEN);
				beams.setMatrixAt(i, HIDDEN);
				glows.setMatrixAt(i, HIDDEN);
				continue;
			}
			const flying = b.arrived < 0;
			// the tail stays at the muzzle at first, then trails TRAIL metres; after the hit it catches up
			const len = Math.max(0, Math.min(TRAIL, b.trav) - (flying ? 0 : b.arrived * SPEED));
			const fade = flying ? 1 : Math.max(0, 1 - b.arrived / 0.12);
			streak(streaks, i, b.x - b.dx * len, b.y - b.dy * len, b.z - b.dz * len, b.x, b.y, b.z, STREAK_W, 0.012);
			streaks.setColorAt(i, col.setRGB(5 * fade, 5 * fade, 5.4 * fade));
			// the beam from the barrel to the bolt flashes for a few frames, like ionised air, then fades out
			const beam = 3.5 * Math.exp(-b.life * 16);
			streak(beams, i, b.ox, b.oy, b.oz, b.x, b.y, b.z, beam > 0.03 ? BEAM_W : 0, 0.005);
			beams.setColorAt(i, col.setRGB(beam * 0.9, beam, beam * 1.15));
			const dist = Math.hypot(b.x - camPos.x, b.y - camPos.y, b.z - camPos.z);
			glow(glows, i, camQ, b.x, b.y, b.z, flying ? THREE.MathUtils.clamp(dist * 0.05, 0.08, 0.9) : 0, b.life * 20);
			glows.setColorAt(i, col.setRGB(3, 5, 6.5));
		}

		// sparks: gravity, drag, a bounce on the ground, drawn as short streaks along their speed
		for (let i = 0; i < MAX_SPARKS; i++) {
			const p = sparks[i];
			const s = MAX_BOLTS + i;
			if (p.life >= p.max) {
				streaks.setMatrixAt(s, HIDDEN);
				continue;
			}
			p.life += dt;
			const drag = Math.exp(-dt * 3.5);
			p.vx *= drag;
			p.vz *= drag;
			p.vy = p.vy * drag - 20 * dt;
			p.x += p.vx * dt;
			p.y += p.vy * dt;
			p.z += p.vz * dt;
			const ground = groundAt(p.x, p.z);
			if (p.y < ground + 0.02 && p.vy < 0) {
				p.y = ground + 0.02;
				p.vy *= -0.35;
				p.vx *= 0.6;
				p.vz *= 0.6;
			}
			const u = Math.min(1, p.life / p.max);
			const k = (1 - u) * (1 - u) * 5;
			const tl = 0.022 + 0.004 * Math.hypot(p.vx, p.vy, p.vz);
			streak(streaks, s, p.x - p.vx * tl, p.y - p.vy * tl, p.z - p.vz * tl, p.x, p.y, p.z, SPARK_W, 0.006);
			if (p.hot) streaks.setColorAt(s, col.setRGB(k * 1.3, k * 1.15, k * 0.9));
			else streaks.setColorAt(s, col.setRGB(k * 0.5, k * 1.1, k * 1.5));
		}

		// flashes: a quick bloom that swells and dies
		for (let i = 0; i < MAX_FLASHES; i++) {
			const f = flashes[i];
			const g = MAX_BOLTS + i;
			if (f.life >= f.max) {
				glows.setMatrixAt(g, HIDDEN);
				continue;
			}
			f.life += dt;
			const u = Math.min(1, f.life / f.max);
			const k = (1 - u) * (1 - u);
			const size = f.size * (0.55 + 0.45 * Math.sqrt(u));
			if (f.flat) {
				nrm.set(f.nx, f.ny, f.nz);
				q.setFromUnitVectors(zAxis, nrm);
				q.multiply(qRoll.setFromAxisAngle(zAxis, f.roll));
				m.compose(pos.set(f.x, f.y, f.z), q, scl.set(size, size, size));
				glows.setMatrixAt(g, m);
				glows.setColorAt(g, col.setRGB(f.r * k, f.g * k, f.b * k));
				continue;
			}
			// drawn a little toward the eye, so the decor's relief never swallows the glow
			const tx = camPos.x - f.x;
			const ty = camPos.y - f.y;
			const tz = camPos.z - f.z;
			const tl = Math.hypot(tx, ty, tz);
			const pull = tl > 1e-3 ? Math.min(0.7, tl * 0.3) / tl : 0;
			// close up, the burst never fills the screen
			glow(glows, g, camQ, f.x + tx * pull, f.y + ty * pull, f.z + tz * pull, Math.min(size, tl * 0.3), f.roll);
			glows.setColorAt(g, col.setRGB(f.r * k, f.g * k, f.b * k));
		}

		for (const mesh of [streaks, beams, glows]) {
			mesh.instanceMatrix.needsUpdate = true;
			if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
		}
	});

	return (
		<>
			<primitive object={beams} />
			<primitive object={streaks} />
			<primitive object={glows} />
		</>
	);
}
