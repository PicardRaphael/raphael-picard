import { existsSync, readFileSync } from 'node:fs';

import { defineConfig, devices } from '@playwright/test';

/**
 * Functional tests against `next dev` (the game exposes its test hooks — window.__game, __player… — only in dev).
 *
 * Next 16 refuses a second `next dev` in the same project: when one is already running (.next/dev/lock), the tests
 * reuse it; otherwise Playwright starts one on port 3100. E2E_BASE_URL forces a given server.
 */
function runningDevServer(): string | null {
	try {
		const lock = '.next/dev/lock';
		if (!existsSync(lock)) return null;
		const { pid, appUrl } = JSON.parse(readFileSync(lock, 'utf8')) as { pid: number; appUrl: string };
		process.kill(pid, 0);
		return appUrl;
	} catch {
		return null;
	}
}

const PORT = 3100;
const external = process.env.E2E_BASE_URL ?? runningDevServer();
const baseURL = external ?? `http://localhost:${PORT}`;

/**
 * WebGL in headless Chromium: the real GPU through ANGLE on Windows / macOS (~40 fps, needed by the click-to-move
 * tests), software SwiftShader elsewhere or with E2E_GL=swiftshader (~1 fps: the world renders, the walking tests skip).
 */
const gpu = { win32: 'd3d11', darwin: 'metal' }[process.platform as string];
const webgl =
	gpu && process.env.E2E_GL !== 'swiftshader'
		? [`--use-angle=${gpu}`, '--enable-gpu', '--ignore-gpu-blocklist']
		: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];

export default defineConfig({
	testDir: './e2e',
	timeout: 120_000,
	expect: { timeout: 20_000 },
	retries: 1,
	// one dev server compiling on demand: keep the load reasonable
	workers: 2,
	reporter: [['list']],
	use: {
		baseURL,
		trace: 'retain-on-failure',
		launchOptions: { args: webgl },
	},
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], launchOptions: { args: webgl } } }],
	webServer: external
		? undefined
		: {
				command: `npx next dev --port ${PORT}`,
				url: baseURL,
				reuseExistingServer: true,
				timeout: 180_000,
			},
});
