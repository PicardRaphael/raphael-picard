/**
 * Cinematic capture of the 3D game (/) with Playwright: the real GPU through ANGLE (same flags as playwright.config.ts),
 * a virtual clock (requestAnimationFrame + performance.now) so every frame is rendered on demand at an exact time step,
 * and a camera override applied just before three.js renders. Only the WebGL canvas is grabbed: no HUD, no DOM.
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';

import { chromium } from '@playwright/test';

export const BASE_URL = process.env.VIDEO_BASE_URL ?? devServer() ?? 'http://localhost:3000';

function devServer() {
	try {
		const lock = '.next/dev/lock';
		if (!existsSync(lock)) return null;
		return JSON.parse(readFileSync(lock, 'utf8')).appUrl;
	} catch {
		return null;
	}
}

const GPU = { win32: 'd3d11', darwin: 'metal' }[process.platform];
const ARGS = GPU
	? [`--use-angle=${GPU}`, '--enable-gpu', '--ignore-gpu-blocklist']
	: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'];

/** Injected before any page script: a clock that only moves when __cine.step() is called, once enabled. */
const CLOCK = () => {
	const rRAF = window.requestAnimationFrame.bind(window);
	const rCAF = window.cancelAnimationFrame.bind(window);
	const rNow = performance.now.bind(performance);
	let on = false;
	let t = 0;
	let seq = 1e9;
	const queue = new Map();
	window.requestAnimationFrame = (cb) => {
		if (!on) return rRAF(cb);
		const id = ++seq;
		queue.set(id, cb);
		return id;
	};
	window.cancelAnimationFrame = (id) => {
		if (queue.has(id)) queue.delete(id);
		else rCAF(id);
	};
	performance.now = () => (on ? t : rNow());
	const cam = { shot: null, patched: false };
	window.__cine = {
		enable() {
			t = rNow();
			on = true;
		},
		get time() {
			return t;
		},
		/** Advances the virtual clock and runs one frame (R3F renders synchronously inside its rAF callback). */
		hideMobs: true,
		step(ms) {
			// the roaming "bugs" (and their name tags) stay out of the shots: dead and sunk, never respawned
			if (this.hideMobs && window.__mobs) for (const m of window.__mobs) Object.assign(m, { state: 'dead', t: 6 });
			t += ms;
			const cbs = [...queue.values()];
			queue.clear();
			for (const cb of cbs) cb(t);
		},
		/** {pos:[x,y,z], look:[x,y,z], fov, roll} or null to give the camera back to the game. */
		setCamera(shot) {
			cam.shot = shot;
			const c = window.__camera;
			if (!c || cam.patched) return;
			cam.patched = true;
			const update = c.updateMatrixWorld.bind(c);
			let busy = false;
			c.updateMatrixWorld = (force) => {
				if (cam.shot && !busy) {
					busy = true;
					const s = cam.shot;
					c.position.set(s.pos[0], s.pos[1], s.pos[2]);
					c.up.set(Math.sin(s.roll ?? 0), Math.cos(s.roll ?? 0), 0);
					c.lookAt(s.look[0], s.look[1], s.look[2]);
					if (s.fov && Math.abs(c.fov - s.fov) > 1e-4) {
						c.fov = s.fov;
						c.updateProjectionMatrix();
					}
					busy = false;
				}
				update(force);
			};
		},
		grab(quality = 0.93) {
			const canvas = document.querySelector('canvas');
			return canvas.toDataURL('image/jpeg', quality);
		},
	};
};

export async function launch({ width = 1920, height = 1080 } = {}) {
	const browser = await chromium.launch({ headless: true, args: ARGS });
	const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
	const page = await context.newPage();
	await page.addInitScript(CLOCK);
	// next dev pushes hot reloads through this socket: an edit elsewhere in the repo must not reload the page mid-shot
	// (the dev runtime needs the socket to boot: messages flow until the world is ready, then the server side goes silent)
	await page.routeWebSocket(
		() => true,
		(ws) => {
			const server = ws.connectToServer();
			server.onMessage((m) => {
				if (!page.__frozen) ws.send(m);
			});
			ws.onMessage((m) => server.send(m));
		},
	);
	page.on('framenavigated', (f) => {
		if (f === page.mainFrame()) console.log('[navigated]', f.url());
	});
	page.on('pageerror', (e) => console.warn('[page error]', e.message));
	return { browser, context, page };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Opens the game, waits for the world, its dev hooks and the shader warm-up; the start screen is never dismissed. */
export async function openGame(page, { timeMode = 'day', hero = 'knight' } = {}) {
	await page.goto(BASE_URL + '/', { waitUntil: 'domcontentloaded' });
	await page.waitForFunction(() => '__game' in window && '__player' in window && '__camera' in window, null, { timeout: 180_000 });
	await page.evaluate(({ timeMode, hero }) => window.__game.set({ timeMode, hero, sound: false }), { timeMode, hero });
	await page.waitForFunction(() => window.__game.get().ready === true, null, { timeout: 180_000 });
	await sleep(1500);
	await page.evaluate(() => window.__cine.enable());
	page.__frozen = true;
}

/** Moves the (unseen) hero: the realm, the fog, the shadows and the city loading all follow him. */
export async function placeHero(page, p) {
	await page.evaluate((p) => {
		window.__player.teleport = { x: p.x, z: p.z, yaw: p.yaw ?? 0 };
	}, p);
}

/** Hides (or shows) the hero model: the scene-level group that sits exactly on the player. */
export async function hideHero(page, hidden = true) {
	return page.evaluate((hidden) => {
		const p = window.__player;
		let n = 0;
		for (const o of window.__scene.children) {
			if (o.isGroup && Math.abs(o.position.x - p.x) < 1e-3 && Math.abs(o.position.z - p.z) < 1e-3 && Math.abs(o.position.y - p.y) < 1e-3) {
				o.visible = !hidden;
				n++;
			}
		}
		return n;
	}, hidden);
}

/** Runs frames in (roughly) real time while downloads and shader compiles finish. */
export async function settle(page, ms = 4000) {
	const t0 = Date.now();
	while (Date.now() - t0 < ms) {
		await page.evaluate(() => window.__cine.step(1000 / 30));
		await sleep(25);
	}
}

/** One frame at the given camera, grabbed in the same task as its render (the WebGL buffer is not preserved). */
export async function still(page, shot, quality = 0.92) {
	return page.evaluate(
		({ shot, quality }) => {
			window.__cine.setCamera(shot);
			window.__cine.step(1000 / 30);
			return window.__cine.grab(quality);
		},
		{ shot, quality },
	);
}

export function ensureDir(file) {
	mkdirSync(dirname(file), { recursive: true });
}

export function saveDataUrl(file, dataUrl) {
	ensureDir(file);
	writeFileSync(file, Buffer.from(dataUrl.slice(dataUrl.indexOf(',') + 1), 'base64'));
}

/** Smooth interpolation helpers for camera paths. */
export const ease = {
	inOut: (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2),
	out: (u) => 1 - Math.pow(1 - u, 3),
	in: (u) => u * u * u,
	sine: (u) => -(Math.cos(Math.PI * u) - 1) / 2,
	linear: (u) => u,
};
export const lerp = (a, b, u) => a + (b - a) * u;
export const lerp3 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];

/** Catmull-Rom through control points, u in [0, 1]. */
export function spline(points, u) {
	const n = points.length - 1;
	const x = Math.min(Math.max(u, 0), 1) * n;
	const i = Math.min(Math.floor(x), n - 1);
	const t = x - i;
	const p0 = points[Math.max(i - 1, 0)];
	const p1 = points[i];
	const p2 = points[i + 1];
	const p3 = points[Math.min(i + 2, n)];
	return p1.map((_, k) => {
		const a = p0[k];
		const b = p1[k];
		const c = p2[k];
		const d = p3[k];
		return 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);
	});
}

/**
 * Renders one shot frame by frame: `camera(u)` returns {pos, look, fov, roll} for u in [0, 1].
 * `warmup` frames are rendered first (not saved) so motion blur-free effects, fades and the camera start settled.
 */
export async function shoot(page, { name, frames, fps = 30, camera, outDir, warmup = 20, startIndex = 0 }) {
	const dt = 1000 / fps;
	await page.evaluate((s) => window.__cine.setCamera(s), camera(0));
	for (let i = 0; i < warmup; i++) await page.evaluate((dt) => window.__cine.step(dt), dt);
	for (let i = 0; i < frames; i++) {
		const u = frames === 1 ? 0 : i / (frames - 1);
		const shot = camera(u);
		const data = await page.evaluate(
			({ shot, dt }) => {
				window.__cine.setCamera(shot);
				window.__cine.step(dt);
				return window.__cine.grab();
			},
			{ shot, dt },
		);
		saveDataUrl(`${outDir}/${name}/${String(i + startIndex).padStart(4, '0')}.jpg`, data);
		if (i % 30 === 0) process.stdout.write(`  ${name} ${i}/${frames}\n`);
	}
}
