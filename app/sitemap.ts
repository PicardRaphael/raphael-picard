import type { MetadataRoute } from 'next';

import { site } from '@/lib/site';

/** Both routes are distinct, indexable pages; the CV PDF is indexable too (Google reads PDFs). */
export default function sitemap(): MetadataRoute.Sitemap {
	const lastModified = new Date(site.updatedAt);
	return [
		{ url: site.url, lastModified, changeFrequency: 'monthly', priority: 1 },
		{ url: `${site.url}/portfolio`, lastModified, changeFrequency: 'monthly', priority: 0.9 },
		{ url: `${site.url}${site.cv}`, lastModified: new Date(site.cvUpdatedAt), changeFrequency: 'yearly', priority: 0.5 },
	];
}
