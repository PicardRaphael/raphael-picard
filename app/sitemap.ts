import type { MetadataRoute } from 'next';

import { site } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
	return [
		{ url: site.url, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
		{ url: `${site.url}/portfolio`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
	];
}
