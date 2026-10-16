/**
 * Location scouting: still frames of the val and the Nexus, to frame the shots of shots.mjs.
 * node scripts/video/probe.mjs <outDir> [timeMode] [set]
 *   set = "scout" (default: hand-picked places) or "shots" (first / middle / last frame of every shot of shots.mjs)
 */
import { launch, openGame, placeHero, settle, saveDataUrl, still, hideHero } from './lib.mjs';
import { SHOTS } from './shots.mjs';

const out = process.argv[2] ?? 'probe';
const timeMode = process.argv[3] ?? 'day';
const set = process.argv[4] ?? 'scout';
const only = process.argv[5]?.split(',');
const NZ = -600;

const SCOUT = [
	{ name: 'val-overview', hero: { x: 0, z: -40 }, pos: [60, 40, 40], look: [0, 0, -40] },
	{ name: 'val-portal', hero: { x: 0, z: -70 }, pos: [6, 4, -70], look: [0, 6, -92] },
	{ name: 'val-village', hero: { x: 0, z: -10 }, pos: [-20, 8, 20], look: [10, 3, -30] },
	{ name: 'nexus-holo', hero: { x: 0, z: NZ - 10 }, pos: [-3, 3, NZ - 14], look: [-10, 4, NZ - 22] },
	{ name: 'nexus-agents', hero: { x: -20, z: NZ - 80 }, pos: [-18, 6, NZ - 78], look: [-32, 7, NZ - 86] },
	{ name: 'nexus-gallery', hero: { x: 20, z: NZ - 110 }, pos: [18, 5, NZ - 108], look: [34, 5, NZ - 118] },
	{ name: 'nexus-beacon-far', hero: { x: 0, z: NZ - 80 }, pos: [0, 3, NZ - 70], look: [0, 12, NZ - 125] },
	{ name: 'nexus-street-low', hero: { x: 0, z: NZ - 30 }, pos: [2, 0.6, NZ - 20], look: [0, 2.5, NZ - 70] },
];

const list =
	set === 'shots'
		? SHOTS.filter((s) => !only || only.includes(s.name)).flatMap((s) =>
				[0, 0.5, 1].map((u) => ({ name: `${s.name}-${u}`, hero: s.hero, shot: s.camera(u), timeMode: s.timeMode })),
			)
		: SCOUT.map((s) => ({ ...s, shot: { pos: s.pos, look: s.look, fov: 55 } }));

const { browser, page } = await launch();
await openGame(page, { timeMode });
let zone = 'val';
for (const s of list) {
	if (s.timeMode) await page.evaluate((t) => window.__game.set({ timeMode: t }), s.timeMode);
	await placeHero(page, s.hero);
	const z = s.hero.z < -300 ? 'nexus' : 'val';
	await settle(page, z !== zone ? 15000 : 1500);
	zone = z;
	await hideHero(page);
	await page.evaluate((shot) => window.__cine.setCamera(shot), s.shot);
	await settle(page, 600);
	saveDataUrl(`${out}/${set}-${s.name}.jpg`, await still(page, s.shot));
	console.log('ok', s.name);
}
await browser.close();
