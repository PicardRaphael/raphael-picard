import { type Page, expect, test } from '@playwright/test';

import { LAKE, SPAWN, landmark } from '../lib/world';

/** The dev-only test hooks published by components/three/world/Player.tsx. */
type Hooks = {
	__game: {
		get: () => { started: boolean; panel: string | null; quests: Record<string, string>; tracked: string | null };
		set: (p: object) => void;
		accept: (id: string) => void;
		visit: (id?: string) => void;
		complete: (id: string) => void;
	};
	__player: { x: number; y: number; z: number; moveTarget: null | { x: number; z: number; landmark?: string }; teleport: null | { x: number; z: number; yaw: number } };
};

const Q = { origines: 'Les origines du développeur' };

async function start(page: Page) {
	await page.goto('/');
	await expect(page.getByRole('heading', { level: 1, name: 'Raphaël Picard' })).toBeVisible();
	await page.getByRole('button', { name: 'Jouer' }).click();
	await expect(page.getByRole('button', { name: 'Menu' })).toBeVisible();
}

/** Waits for the 3D world to mount its dev hooks; skips the test on a production server (no hooks there). */
async function hooks(page: Page) {
	const ok = await page
		.waitForFunction(() => '__game' in window && '__player' in window, null, { timeout: 90_000 })
		.then(() => true)
		.catch(() => false);
	test.skip(!ok, 'dev hooks (window.__game / __player) not exposed: production build or WebGL unavailable');
}

test.describe('/ (the game)', () => {
	test('start screen: title, hero choice, play button, link to the classic portfolio, 3D canvas', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('heading', { level: 1, name: 'Raphaël Picard' })).toBeVisible();
		await expect(page.locator('h1')).toHaveCount(1);
		const heroes = page.getByRole('radiogroup', { name: 'Choix du personnage' }).getByRole('radio');
		await expect(heroes).toHaveCount(2);
		await expect(heroes.first()).toHaveAttribute('aria-checked', 'true');
		await heroes.nth(1).click();
		await expect(heroes.nth(1)).toHaveAttribute('aria-checked', 'true');
		await expect(page.getByRole('button', { name: 'Jouer' })).toBeVisible();
		await expect(page.getByRole('link', { name: /Version classique du portfolio/ })).toHaveAttribute('href', '/portfolio');
		// the world renders behind the start screen (intro orbit)
		await expect(page.locator('canvas').first()).toBeAttached({ timeout: 60_000 });
	});

	test('playing shows the HUD and hides the start screen', async ({ page }) => {
		await start(page);
		await expect(page.getByRole('button', { name: 'Carte' })).toBeVisible();
		await expect(page.getByRole('complementary', { name: 'Suivi des quêtes' })).toBeVisible();
		await expect(page.getByRole('link', { name: 'Version classique' })).toBeVisible();
		await expect(page.getByRole('button', { name: /Son (activé|coupé)/ })).toBeVisible();
		// the start screen is aria-hidden once playing
		await expect(page.getByRole('button', { name: 'Jouer' })).toHaveCount(0);
		// the quests open from the start are offered in the tracker
		await expect(page.getByText(Q.origines)).toBeVisible();
		await expect(page.locator('canvas').first()).toBeVisible();
	});

	test('Enter also starts the game', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('button', { name: 'Jouer' })).toBeVisible();
		await page.keyboard.press('Enter');
		await expect(page.getByRole('button', { name: 'Menu' })).toBeVisible();
	});

	test('accepting a quest through the dev hooks updates the tracker, then completing it', async ({ page }) => {
		await start(page);
		await hooks(page);
		const tracker = page.getByRole('complementary', { name: 'Suivi des quêtes' });
		await page.evaluate(() => (window as unknown as Hooks).__game.accept('origines'));
		await expect(tracker.getByText('Examiner la Forge du Code 0/1')).toBeVisible();
		await expect(tracker.getByText('Visiter la Tour du Savoir 0/1')).toBeVisible();
		await page.evaluate(() => (window as unknown as Hooks).__game.visit('forge'));
		await expect(tracker.getByText('Examiner la Forge du Code 1/1')).toBeVisible();
		await page.evaluate(() => ['tower', 'stones'].forEach((id) => (window as unknown as Hooks).__game.visit(id)));
		await expect(tracker.getByText(/À rendre : Raphy/)).toBeVisible();
		await page.evaluate(() => (window as unknown as Hooks).__game.complete('origines'));
		await expect(page.getByRole('status').getByText(/Artisan du code/)).toBeVisible();
		// the next quest, from the same NPC, starts right away and is followed
		await expect(tracker.getByText('Au-delà du portail')).toBeVisible();
		await expect(tracker.getByText('Traverser le Portail arcanique 0/1')).toBeVisible();
		expect(await page.evaluate(() => (window as unknown as Hooks).__game.get().tracked)).toBe('portail');
	});

	test('opening a landmark panel through the store shows its dialog with the quest offer', async ({ page }) => {
		await start(page);
		await hooks(page);
		await page.evaluate(() => (window as unknown as Hooks).__game.set({ panel: 'raphy' }));
		await expect(page.getByRole('button', { name: 'Accepter la quête' })).toBeVisible();
		await page.getByRole('button', { name: 'Accepter la quête' }).click();
		expect(await page.evaluate(() => (window as unknown as Hooks).__game.get().quests.origines)).toBe('active');
	});

	test('landscape phone: touch controls after starting (the app has no rotate hint)', async ({ browser }) => {
		const ctx = await browser.newContext({ viewport: { width: 812, height: 375 }, isMobile: true, hasTouch: true });
		const page = await ctx.newPage();
		await page.goto('/');
		await expect(page.getByRole('button', { name: 'Jouer' })).toBeVisible();
		// joystick only for coarse pointers, once playing
		await expect(page.getByRole('application', { name: 'Joystick de déplacement' })).toHaveCount(0);
		await page.getByRole('button', { name: 'Jouer' }).tap();
		await expect(page.getByRole('application', { name: 'Joystick de déplacement' })).toBeVisible();
		await expect(page.getByRole('button', { name: '⚔' })).toBeVisible();
		await expect(page.getByRole('button', { name: '⤒' })).toBeVisible();
		const { scroll, inner } = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, inner: window.innerWidth }));
		expect(scroll).toBeLessThanOrEqual(inner);
		await ctx.close();
	});

	test('desktop: no touch controls', async ({ page }) => {
		await start(page);
		await expect(page.getByRole('application', { name: 'Joystick de déplacement' })).toHaveCount(0);
	});
});

/**
 * Click-to-move in the real game loop (dev hooks): confirms the routing bugs found by tests/unit/world.test.ts.
 * Headless WebGL runs at a few frames per second and dt is capped at 1/20 s, so the hero is slow: generous waits.
 */
test.describe('click-to-move in the running game', () => {
	test.describe.configure({ retries: 0 });

	/** Teleports the hero, waits for the frame that applies it (it clears moveTarget), then clicks the target. */
	async function walkTo(page: Page, from: { x: number; z: number }, target: { x: number; z: number; landmark?: string }) {
		await page.evaluate((f) => ((window as unknown as Hooks).__player.teleport = { x: f.x, z: f.z, yaw: 0 }), from);
		await page.waitForFunction(() => (window as unknown as Hooks).__player.teleport === null, null, { timeout: 30_000 });
		await page.evaluate((t) => ((window as unknown as Hooks).__player.moveTarget = t), target);
	}

	/** The hero moves RUN · dt per frame with dt capped at 1/20 s: a software-rendered page is too slow to walk. */
	async function needsFrames(page: Page) {
		const fps = await page.evaluate(
			() =>
				new Promise<number>((resolve) => {
					let n = 0;
					const t0 = performance.now();
					const tick = () => (++n, performance.now() - t0 < 2000 ? requestAnimationFrame(tick) : resolve(n / 2));
					requestAnimationFrame(tick);
				}),
		);
		test.skip(fps < 12, `only ${fps.toFixed(1)} fps (software WebGL?): run with a GPU (default on Windows/macOS, or E2E_GL=gpu)`);
	}

	test.beforeEach(async ({ page }) => {
		await start(page);
		await hooks(page);
		await needsFrames(page);
	});

	const stopPoint = (from: { x: number; z: number }, id: string, solid = landmark(id).solid) => {
		const l = landmark(id);
		const d = Math.hypot(from.x - l.x, from.z - l.z);
		const stop = Math.max(solid + 2.2, 3);
		return { x: l.x + ((from.x - l.x) / d) * stop, z: l.z + ((from.z - l.z) / d) * stop, landmark: id };
	};

	test('control: clicking the stone circle walks there and opens its panel', async ({ page }) => {
		await walkTo(page, SPAWN, stopPoint(SPAWN, 'stones'));
		await expect.poll(() => page.evaluate(() => (window as unknown as Hooks).__game.get().panel), { timeout: 90_000 }).toBe('stones');
	});

	// regression: the career houses had solid 0 on top of a house collider, so the stop point was inside the house
	test('clicking the Comptoir Royal Canin walks to its door and opens its panel', async ({ page }) => {
		await walkTo(page, SPAWN, stopPoint(SPAWN, 'royal'));
		await expect.poll(() => page.evaluate(() => (window as unknown as Hooks).__game.get().panel), { timeout: 60_000 }).toBe('royal');
	});

	// Regression: walking head-on through the centre of a solid used to push the hero straight back every frame
	// (spawn x = 0 → portal x = 0, through Raphy at x = 0); Player.tsx now slides along the tangent.
	test('clicking the portal from the spawn walks past Raphy', async ({ page }) => {
		await walkTo(page, SPAWN, stopPoint(SPAWN, 'portal'));
		await expect.poll(() => page.evaluate(() => (window as unknown as Hooks).__player.z), { timeout: 60_000 }).toBeLessThan(-20);
	});

	test('control: the same click from slightly off the axis walks past Raphy', async ({ page }) => {
		const from = { x: SPAWN.x + 0.5, z: SPAWN.z };
		await walkTo(page, from, stopPoint(from, 'portal'));
		await expect.poll(() => page.evaluate(() => (window as unknown as Hooks).__player.z), { timeout: 90_000 }).toBeLessThan(-20);
	});

	// Regression: the ground used to stay under the water plane past the lake collision on the south side;
	// valHeight now keeps a dry shore up to the edge of the water disc and the lake is a solid in Player.tsx,
	// so going round the lake from the south stays above the water.
	test('walking round the lake from the south stays above the water', async ({ page }) => {
		await walkTo(page, { x: LAKE.x, z: 50 }, { x: SPAWN.x, z: SPAWN.z });
		let lowest = Infinity;
		let arrived = false;
		const end = Date.now() + 90_000;
		while (!arrived && Date.now() < end) {
			const p = await page.evaluate(() => ({ y: (window as unknown as Hooks).__player.y, x: (window as unknown as Hooks).__player.x, z: (window as unknown as Hooks).__player.z }));
			lowest = Math.min(lowest, p.y);
			arrived = Math.hypot(p.x - SPAWN.x, p.z - SPAWN.z) < 3;
			await page.waitForTimeout(250);
		}
		expect(arrived, 'the hero reached the spawn').toBe(true);
		expect(lowest, 'lowest height of the hero on the way').toBeGreaterThanOrEqual(LAKE.level);
	});
});
