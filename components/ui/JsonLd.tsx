import { certifications } from '@/content/work';
import { site } from '@/lib/site';

/** Structured data: Person + WebSite + ProfilePage, so search engines understand who the site is about. */
export function JsonLd() {
	const person = {
		'@type': 'Person',
		'@id': `${site.url}/#person`,
		name: site.name,
		givenName: 'Raphaël',
		familyName: 'Picard',
		jobTitle: site.jobTitle,
		description: site.description,
		url: site.url,
		email: `mailto:${site.email}`,
		image: `${site.url}/opengraph-image`,
		address: { '@type': 'PostalAddress', addressLocality: 'Lyon', addressCountry: 'FR' },
		worksFor: { '@type': 'Organization', name: 'Neoteem', url: 'https://www.neoteem.fr' },
		alumniOf: { '@type': 'EducationalOrganization', name: "O'clock" },
		knowsLanguage: ['fr', 'en'],
		knowsAbout: ['Intelligence artificielle', 'Agents IA', 'Systèmes multi-agents', 'RAG', 'Model Context Protocol', 'LangGraph', 'Claude Code', 'LLMOps', 'Python', 'TypeScript', 'FastAPI', 'Next.js'],
		hasCredential: certifications.map((c) => ({ '@type': 'EducationalOccupationalCredential', name: c.name, recognizedBy: { '@type': 'Organization', name: c.issuer } })),
		sameAs: [site.social.linkedin, site.social.github, site.social.x],
	};
	const data = {
		'@context': 'https://schema.org',
		'@graph': [
			person,
			{ '@type': 'WebSite', '@id': `${site.url}/#website`, url: site.url, name: site.name, inLanguage: 'fr-FR', publisher: { '@id': `${site.url}/#person` } },
			{ '@type': 'ProfilePage', '@id': `${site.url}/#profile`, url: site.url, name: site.title, inLanguage: 'fr-FR', mainEntity: { '@id': `${site.url}/#person` }, isPartOf: { '@id': `${site.url}/#website` } },
		],
	};
	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\u003c') }} />;
}
