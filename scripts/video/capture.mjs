/**
 * Films every shot of shots.mjs, frame by frame, into <outDir>/<shot>/0000.jpg…
 *   node scripts/video/capture.mjs <outDir> [--portrait] [--only shot1,shot2]
 * Needs the dev server (`npm run dev`: the dev hooks window.__game / __player / __camera only exist in dev) and a GPU.
 */
import { rmSync } from 'node:fs';

import { launch, openGame, placeHero, settle, hideHero, shoot, pixelRatio } from './lib.mjs';
import { SHOTS, FPS } from './shots.mjs';

const args = process.argv.slice(2);
const outDir = args[0] ?? 'frames';
const portrait = args.includes('--portrait');
const onlyArg = args.indexOf('--only');
const only = onlyArg > 0 ? args[onlyArg + 1].split(',') : null;
/** Extra frames after each shot, so the edit can breathe. */
const HANDLE = 6;

const size = portrait ? { width: 1080, height: 1920 } : { width: 1920, height: 1080 };
/** Portrait keeps about 70 % of the landscape horizontal field: a taller vertical field of view. */
const fovFor = (fov) => {
	if (!portrait) return fov;
	const h = 2 * Math.atan(Math.tan((fov * Math.PI) / 360) * (16 / 9)) * 0.7;
	return (2 * Math.atan(Math.tan(h / 2) / (9 / 16)) * 180) / Math.PI;
};

// val shots first, then the Nexus: one realm switch only
const list = SHOTS.filter((s) => !only || only.includes(s.name)).sort((a, b) => (a.hero.z < -300) - (b.hero.z < -300));

const t0 = Date.now();
const { browser, page } = await launch(size);
await openGame(page, { timeMode: 'dusk' });
let zone = 'val';
for (const s of list) {
	console.log(`▶ ${s.name} (${s.frames} frames, pixel ratio ${await pixelRatio(page)})`);
	if (s.timeMode) await page.evaluate((t) => window.__game.set({ timeMode: t }), s.timeMode);
	await placeHero(page, s.hero);
	const z = s.hero.z < -300 ? 'nexus' : 'val';
	await settle(page, z !== zone ? 20000 : 2500);
	zone = z;
	await hideHero(page);
	const camera = (u) => {
		const c = s.camera(Math.min(u * ((s.frames + HANDLE - 1) / Math.max(s.frames - 1, 1)), 1.08));
		return { ...c, fov: fovFor(c.fov) };
	};
	await page.evaluate((shot) => window.__cine.setCamera(shot), camera(0));
	await settle(page, 800);
	rmSync(`${outDir}/${s.name}`, { recursive: true, force: true });
	await shoot(page, { name: s.name, frames: s.frames + HANDLE, fps: FPS, camera, outDir, warmup: 15 });
}
await browser.close();
console.log(`done in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
