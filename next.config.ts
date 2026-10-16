import type { NextConfig } from 'next';

const legacyRoutes: Record<string, string> = {
	'/a-propos': '/portfolio#a-propos',
	'/competences': '/portfolio#expertise',
	'/experiences': '/portfolio#parcours',
	'/projets': '/portfolio#projets',
	'/contact': '/portfolio#contact',
	'/studio/:path*': '/',
};

const nextConfig: NextConfig = {
	reactStrictMode: true,
	poweredByHeader: false,
	images: { formats: ['image/avif', 'image/webp'] },
	async redirects() {
		return [
			// one canonical host: the bare domain answers with a permanent redirect to www
			{ source: '/:path*', has: [{ type: 'host', value: 'raphaelpicard.com' }], destination: 'https://www.raphaelpicard.com/:path*', permanent: true },
			...Object.entries(legacyRoutes).map(([source, destination]) => ({ source, destination, permanent: true })),
			// the CV's old file name (links already shared) leads to the named one
			{ source: '/cv-RaphaelPICARD-IA.pdf', destination: '/raphael-picard-cv-senior-ai-engineer-responsable-ia.pdf', permanent: true },
		];
	},
	async headers() {
		return [
			{
				source: '/(.*)',
				headers: [
					{ key: 'X-Content-Type-Options', value: 'nosniff' },
					{ key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
					{ key: 'X-Frame-Options', value: 'DENY' },
					{ key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
				],
			},
			{
				// heavy game assets (models, audio, textures): cached a day, refreshed in the background for a week
				source: '/:dir(models|audio|textures)/:path*',
				headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }],
			},
		];
	},
};

export default nextConfig;
