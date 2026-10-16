/**
 * The takes of the vertical viral cut (and the fight of the 16:9 film), played in the running game and filmed as page
 * screenshots, so the game's own UI (bug card, crosshair, orchestration-core panel) is in the picture; the rest of the
 * HUD is hidden. Virtual clock and virtual timers: the 620 ms portal teleport, the shots and the card happen on time.
 *   node scripts/video/viral.mjs <outDir> [--landscape] [--only cross,fight,core]
 * Writes <outDir>/<take>/0000.jpg… and <outDir>/viral-takes.json (frame of the teleport, of each shot, of the card).
 */
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';

import { launch, openGame, placeHero, settle, pixelRatio } from './lib.mjs';

const args = process.argv.slice(2);
const outDir = args[0] ?? 'viral';
const landscape = args.includes('--landscape');
const onlyArg = args.indexOf('--only');
const only = onlyArg > 0 ? args[onlyArg + 1].split(',') : ['cross', 'fight', 'core'];
const NZ = -600;
const PROMPT_INJECTION = 11;
const size = landscape ? { width: 1920, height: 1080 } : { width: 1080, height: 1920 };
const metaFile = `${outDir}/viral-takes${landscape ? '-landscape' : ''}.json`;
// a partial run (--only) keeps what the other takes measured
const meta = existsSync(metaFile) ? JSON.parse(readFileSync(metaFile, 'utf8')) : {};

const { browser, page } = await launch(size);
await openGame(page, { timeMode: 'dusk', hero: 'knight' });
await page.evaluate(() => window.__game.set({ started: true, sound: false }));
const step = (n = 1) =>
	page.evaluate((n) => {
		for (let i = 0; i < n; i++) window.__cine.step(1000 / 30);
	}, n);
const frame = async (take, i) => {
	const file = `${outDir}/${take}/${String(i).padStart(4, '0')}.jpg`;
	writeFileSync(file, await page.screenshot({ type: 'jpeg', quality: 90 }));
};
const begin = (take) => {
	rmSync(`${outDir}/${take}`, { recursive: true, force: true });
	mkdirSync(`${outDir}/${take}`, { recursive: true });
	console.log(`▶ ${take}`);
	pixelRatio(page).then((r) => console.log('  pixel ratio', r));
};

// the city of the Nexus is downloaded once, before the takes
await placeHero(page, { x: 0, z: NZ - 20 });
await settle(page, 20000);
await page.evaluate(() => {
	window.__cine.virtualTimers = true;
	window.__cine.clean(true, 1);
});

if (only.includes('cross')) {
	// the knight runs into the arcane portal, the game's own warp takes him to the Nexus, he walks out into the rain
	const take = 'v-cross';
	begin(take);
	await page.evaluate(() => window.__game.set({ hero: 'knight', zone: 'val' }));
	await placeHero(page, { x: 0, z: -78, yaw: 0 });
	await settle(page, 3000);
	await page.evaluate(() => {
		window.__player.moveTarget = { x: 0, z: -96 };
	});
	const N = 160;
	let teleport = null;
	for (let i = 0; i < N; i++) {
		const z = await page.evaluate(() => window.__player.z);
		if (teleport === null && z < -300) {
			teleport = i;
			await page.evaluate((NZ) => {
				window.__player.moveTarget = { x: 0, z: NZ - 60 };
			}, NZ);
		}
		const after = teleport === null ? 0 : i - teleport;
		const u = Math.min(i / 60, 1);
		// behind the shoulder, pushing in on the swirl; then in front of him, walking out of the gate (fov left to the game: its warp widens it)
		const cam =
			teleport === null
				? { rel: true, pos: [1.4 - 0.6 * u, 1.9 + 0.3 * u, 6.2 - 1.8 * u], look: [0, 3.4, -14] }
				: { rel: true, pos: [-2.4 + Math.min(after / 90, 1) * 0.8, 1.7, -6.8 - Math.min(after / 90, 1) * 0.6], look: [0, 2.1, 1], fov: 55 };
		await page.evaluate((cam) => window.__cine.setCamera(cam), cam);
		await step(1);
		await frame(take, i);
	}
	meta.cross = { frames: N, teleport };
	console.log('teleport at frame', teleport);
}

if (only.includes('fight')) {
	// the runner, first person: « Prompt injection » charges, three shots, the bug is fixed, its card opens
	const take = landscape ? 'h-fight' : 'v-fight';
	begin(take);
	await page.evaluate(() => {
		window.__cine.setCamera(null);
		window.__game.set({ hero: 'runner', bugCard: null, panel: null });
	});
	await placeHero(page, { x: 4.5, z: NZ - 19, yaw: 0 });
	await settle(page, 2500);
	await page.evaluate(
		({ id, zoom }) => {
			window.__cine.keepMob = id;
			const m = window.__mobs[id];
			Object.assign(m, { state: 'idle', t: 0, hp: m.maxHp, x: m.homeX, z: m.homeZ });
			window.__cine.clean(true, zoom);
		},
		{ id: PROMPT_INJECTION, zoom: landscape ? 1.6 : 2.2 },
	);
	const SHOTS = [22, 34, 46];
	const N = 216;
	let card = null;
	for (let i = 0; i < N; i++) {
		const state = await page.evaluate((id) => {
			const p = window.__player;
			const m = window.__mobs[id];
			const dx = m.x - p.x;
			const dz = m.z - p.z;
			const d = Math.hypot(dx, dz);
			// the reticle tracks the bug (a little ahead of a steady hand: no jitter)
			const yaw = Math.atan2(-dx, -dz);
			p.camera.yaw += (yaw - p.camera.yaw) * 0.35;
			p.camera.fpsPitch += (Math.atan2(1.0 - 1.65, d) - p.camera.fpsPitch) * 0.35;
			return { card: window.__game.get().bugCard };
		}, PROMPT_INJECTION);
		if (card === null && state.card === PROMPT_INJECTION) card = i;
		if (SHOTS.includes(i)) await page.evaluate(() => window.__attack());
		await step(1);
		await frame(take, i);
	}
	meta[landscape ? 'fightLandscape' : 'fight'] = { frames: N, shots: SHOTS, card };
	console.log('card at frame', card);
}

if (only.includes('core')) {
	// the orchestration core: its panel, the trace of an agent answering a question, streaming line by line
	const take = 'v-core';
	begin(take);
	await page.evaluate(() => {
		window.__cine.keepMob = null;
		window.__game.set({ bugCard: null, panel: null });
	});
	await placeHero(page, { x: 22, z: NZ - 34, yaw: -Math.PI / 2 });
	await step(10);
	await page.evaluate(() => window.__game.set({ panel: 'core' }));
	await step(5);
	// bigger text, and the trace terminal brought into view
	await page.evaluate(
		(zoom) => {
			const term = document.querySelector('[role="dialog"] ol[aria-label^="Exemple de trace"]')?.parentElement;
			if (term) {
				term.style.zoom = zoom;
				term.scrollIntoView({ block: 'center' });
			}
		},
		landscape ? '1.5' : '2.3',
	);
	await step(60);
	const N = 100;
	for (let i = 0; i < N; i++) {
		await step(1);
		await frame(take, i);
	}
	meta.core = { frames: N };
}

writeFileSync(metaFile, JSON.stringify(meta, null, 1));
await browser.close();
