import { stack } from '@/content/profile';
import { certifications } from '@/content/work';
import { site } from '@/lib/site';

const PERSON_ID = `${site.url}/#person`;
const WEBSITE_ID = `${site.url}/#website`;

/** Concepts first (what recruiters search for), then the concrete stack shown on the site. */
const knowsAbout = [
	...new Set([
		'Intelligence artificielle',
		'IA générative',
		'IA agentique',
		'Agents IA',
		'Systèmes multi-agents',
		'RAG (Retrieval-Augmented Generation)',
		'Model Context Protocol (MCP)',
		'LLMOps',
		'Évaluation de LLM',
		...stack,
	]),
];

function Script({ data }: { data: object }) {
	// escape "<" so no string in the data can close the script tag
	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />;
}

/** Site-wide structured data (root layout): who the site is about, and the site itself. */
export function SiteJsonLd() {
	const person = {
		'@type': 'Person',
		'@id': PERSON_ID,
		name: site.name,
		alternateName: ['Raphael Picard'],
		givenName: 'Raphaël',
		familyName: 'Picard',
		jobTitle: [site.jobTitle, 'Senior AI Engineer', 'Responsable IA', 'Ingénieur IA'],
		description: site.description,
		url: site.url,
		email: `mailto:${site.email}`,
		telephone: site.phone.href.replace('tel:', ''),
		image: { '@type': 'ImageObject', url: `${site.url}/images/raphael-picard.jpg`, width: 450, height: 450, caption: site.name },
		address: { '@type': 'PostalAddress', addressLocality: 'Lyon', addressCountry: 'FR' },
		worksFor: { '@type': 'Organization', name: site.employer.name, url: site.employer.url },
		hasOccupation: {
			'@type': 'Occupation',
			name: site.jobTitle,
			occupationLocation: { '@type': 'City', name: 'Lyon' },
			skills: stack.join(', '),
		},
		alumniOf: { '@type': 'EducationalOrganization', name: 'O’clock' },
		knowsLanguage: ['fr', 'en'],
		knowsAbout,
		hasCredential: certifications.map((c) => ({
			'@type': 'EducationalOccupationalCredential',
			name: c.name,
			recognizedBy: { '@type': 'Organization', name: c.issuer },
		})),
		sameAs: [site.social.linkedin, site.social.github, site.social.x],
	};
	const website = {
		'@type': 'WebSite',
		'@id': WEBSITE_ID,
		url: site.url,
		name: site.name,
		description: site.description,
		inLanguage: 'fr-FR',
		publisher: { '@id': PERSON_ID },
	};
	return <Script data={{ '@context': 'https://schema.org', '@graph': [person, website] }} />;
}

/** The 30-second summary shown on the page: a VideoObject, so search engines can list it as a video result. */
export function VideoJsonLd() {
	return (
		<Script
			data={{
				'@context': 'https://schema.org',
				'@type': 'VideoObject',
				name: 'Raphaël Picard en 30 secondes',
				description:
					'Ce portfolio est un jeu vidéo. Raphaël Picard, Senior AI Engineer et Responsable IA à Lyon : 7 agents IA en production, 5 points de contrôle humain, −33 % de coût d’inférence.',
				thumbnailUrl: [`${site.url}/video/resume-30s.jpg`],
				uploadDate: site.video.uploadedAt,
				duration: 'PT30S',
				contentUrl: `${site.url}/video/resume-30s.mp4`,
				embedUrl: `https://www.youtube.com/embed/${site.video.youtubeId}`,
				inLanguage: 'fr-FR',
				author: { '@id': PERSON_ID },
			}}
		/>
	);
}

/** Page-level structured data: "/portfolio" is a ProfilePage about the Person; "/" a WebPage about them. */
export function PageJsonLd({ type, path, name, description }: { type: 'ProfilePage' | 'WebPage'; path: string; name: string; description: string }) {
	const url = path === '/' ? `${site.url}/` : `${site.url}${path}`;
	return (
		<Script
			data={{
				'@context': 'https://schema.org',
				'@type': type,
				'@id': `${url}#page`,
				url,
				name,
				description,
				inLanguage: 'fr-FR',
				dateModified: site.updatedAt,
				isPartOf: { '@id': WEBSITE_ID },
				about: { '@id': PERSON_ID },
				...(type === 'ProfilePage' ? { mainEntity: { '@type': 'Person', '@id': PERSON_ID, name: site.name, url: site.url } } : {}),
			}}
		/>
	);
}
