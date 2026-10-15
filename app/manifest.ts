import type { MetadataRoute } from 'next';

import { site } from '@/lib/site';

export default function manifest(): MetadataRoute.Manifest {
	return {
		id: '/',
		name: `${site.name} — ${site.role}`,
		short_name: 'R. Picard',
		description: site.description,
		lang: 'fr',
		dir: 'ltr',
		start_url: '/',
		scope: '/',
		display: 'standalone',
		background_color: '#05040c',
		theme_color: '#05040c',
		categories: ['portfolio', 'technology'],
		icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
	};
}
