import type { MetadataRoute } from 'next';

import { site } from '@/lib/site';

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: `${site.name} — ${site.role}`,
		short_name: 'R. Picard',
		description: site.description,
		start_url: '/',
		display: 'standalone',
		background_color: '#05040c',
		theme_color: '#05040c',
		icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
	};
}
