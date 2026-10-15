import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

/** Unit tests of the pure game / content modules (Playwright specs live in e2e/ and are run by `npm run test:e2e`). */
export default defineConfig({
	resolve: {
		alias: { '@': fileURLToPath(new URL('./', import.meta.url)) },
	},
	test: {
		environment: 'node',
		include: ['tests/unit/**/*.test.ts'],
		exclude: ['e2e/**', 'old/**', '.next/**', 'node_modules/**'],
	},
});
