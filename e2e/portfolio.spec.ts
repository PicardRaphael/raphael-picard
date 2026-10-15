import { type ConsoleMessage, type Page, expect, test } from '@playwright/test';

import { site } from '../lib/site';
import { STATIONS } from '../lib/stations';

/** Errors of the headless GPU stack only (SwiftShader / WebGL), never React, hydration or network errors. */
const GPU_NOISE = /swiftshader|webgl|GL_|GPU stall|gpu process|THREE\.WebGLRenderer|WebGL context/i;

function collectErrors(page: Page) {
	const errors: string[] = [];
	page.on('console', (m: ConsoleMessage) => {
		if (m.type() === 'error' && !GPU_NOISE.test(m.text())) errors.push(`console: ${m.text()}`);
	});
	page.on('pageerror', (e) => {
		if (!GPU_NOISE.test(e.message)) errors.push(`pageerror: ${e.message}`);
	});
	return errors;
}

async function scrollThrough(page: Page) {
	await page.evaluate(async () => {
		for (let y = 0; y < document.documentElement.scrollHeight; y += window.innerHeight / 2) {
			window.scrollTo(0, y);
			await new Promise((r) => setTimeout(r, 40));
		}
		window.scrollTo(0, document.documentElement.scrollHeight);
	});
	await page.waitForTimeout(300);
}

test.describe('/portfolio', () => {
	test('loads with one h1, every section and no console error', async ({ page }) => {
		const errors = collectErrors(page);
		const res = await page.goto('/portfolio');
		expect(res?.status()).toBe(200);
		await expect(page.locator('h1')).toHaveCount(1);
		await expect(page.locator('h1')).toBeVisible();
		await expect(page).toHaveTitle(/Raphaël Picard/);
		for (const s of STATIONS) await expect(page.locator(`section#${s.id}`), s.id).toHaveCount(1);
		// header links point at existing sections
		const hrefs = await page.locator('nav[aria-label="Navigation principale"] a[href^="#"]').evaluateAll((as) => as.map((a) => a.getAttribute('href')!));
		expect(hrefs.length).toBeGreaterThan(0);
		for (const h of hrefs) await expect(page.locator(h), h).toHaveCount(1);
		await scrollThrough(page);
		// the Next dev error overlay would mean a runtime error
		await expect(page.locator('nextjs-portal [data-nextjs-dialog], [data-nextjs-toast-errors-parent]')).toHaveCount(0);
		expect(errors, errors.join('\n')).toEqual([]);
	});

	test('the CV is served as a PDF and linked from the page', async ({ page, request }) => {
		await page.goto('/portfolio');
		await expect(page.locator(`a[href="${site.cv}"]`).first()).toBeAttached();
		const res = await request.get(site.cv);
		expect(res.status()).toBe(200);
		expect(res.headers()['content-type']).toContain('pdf');
	});

	test('legacy routes redirect to their section', async ({ page }) => {
		await page.goto('/projets');
		await expect(page).toHaveURL(/\/portfolio#projets$/);
	});

	for (const viewport of [
		{ width: 375, height: 812 },
		{ width: 812, height: 375 },
	])
		test(`no horizontal scroll at ${viewport.width}×${viewport.height}`, async ({ browser }) => {
			const ctx = await browser.newContext({ viewport, isMobile: true, hasTouch: true });
			const page = await ctx.newPage();
			await page.goto('/portfolio');
			await expect(page.locator('h1')).toBeVisible();
			await scrollThrough(page);
			const { scroll, inner, culprits } = await page.evaluate(() => ({
				scroll: document.documentElement.scrollWidth,
				inner: window.innerWidth,
				culprits: [...document.querySelectorAll('body *')]
					.filter((el) => el.getBoundingClientRect().right > window.innerWidth + 1 && getComputedStyle(el).position !== 'fixed')
					.slice(0, 5)
					.map((el) => `${el.tagName.toLowerCase()}.${String((el as HTMLElement).className).slice(0, 60)}`),
			}));
			expect(scroll, `wider than the viewport: ${culprits.join(', ')}`).toBeLessThanOrEqual(inner);
			await ctx.close();
		});
});
