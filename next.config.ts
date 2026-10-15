import type { NextConfig } from 'next';

const legacyRoutes: Record<string, string> = {
	'/a-propos': '/#a-propos',
	'/competences': '/#expertise',
	'/experiences': '/#parcours',
	'/projets': '/#projets',
	'/contact': '/#contact',
	'/studio/:path*': '/',
};

const nextConfig: NextConfig = {
	reactStrictMode: true,
	poweredByHeader: false,
	images: { formats: ['image/avif', 'image/webp'] },
	async redirects() {
		return Object.entries(legacyRoutes).map(([source, destination]) => ({ source, destination, permanent: true }));
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
		];
	},
};

export default nextConfig;
