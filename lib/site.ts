import type { Metadata } from 'next';

export const site = {
	url: 'https://www.raphaelpicard.com',
	name: 'Raphaël Picard',
	role: 'Senior AI Engineer & Responsable IA',
	jobTitle: 'Senior AI Engineer & Responsable IA',
	/** Last content update (sitemap, structured data); the CV PDF has its own date. */
	updatedAt: '2026-10-15',
	cvUpdatedAt: '2026-10-16',
	/** ≤ 60 characters: the search result title. */
	title: 'Raphaël Picard · Senior AI Engineer & Responsable IA, Lyon',
	/** ≤ 155 characters: the search result snippet. */
	description:
		'Senior AI Engineer & Responsable IA à Lyon : 7 agents LangGraph en production, RAG hybride, serveurs MCP, évals DeepEval et Langfuse. 8+ ans d’ingénierie.',
	employer: { name: 'Neoteem', url: 'https://www.neoteem.fr' },
	locale: 'fr_FR',
	location: 'Lyon, France',
	email: 'raphaelpicard@outlook.fr',
	cv: '/raphael-picard-cv-senior-ai-engineer-responsable-ia.pdf',
	social: {
		linkedin: 'https://www.linkedin.com/in/raphael-picard/',
		github: 'https://github.com/PicardRaphael',
		x: 'https://x.com/RPRaphaelPicard',
	},
	keywords: [
		'Raphaël Picard',
		'ingénieur IA',
		'AI engineer',
		'lead IA',
		'Lead AI Engineer',
		'Head of AI',
		'Senior AI Engineer',
		'IA générative',
		'GenAI',
		'LLM',
		'LLMOps',
		'chatbot IA',
		'agents conversationnels',
		'responsable IA',
		'agents IA',
		'IA agentique',
		'multi-agents',
		'LangGraph',
		'RAG',
		'pgvector',
		'MCP',
		'Model Context Protocol',
		'Claude Code',
		'Anthropic',
		'Gemini',
		'Vertex AI',
		'Langfuse',
		'DeepEval',
		'Python',
		'FastAPI',
		'TypeScript',
		'Next.js',
		'Lyon',
	],
} as const;

/**
 * Per-page metadata. Next.js replaces (it does not deep-merge) a layout's openGraph and twitter objects,
 * so each page gets complete ones: its own URL, title and description plus the shared fields.
 * The share image is app/opengraph-image.tsx; it is named explicitly because a nested route that sets
 * its own openGraph does not inherit the root's file-based image.
 */
export function pageMetadata({ path, title, description }: { path: string; title: string; description: string }): Metadata {
	const images = [{ url: '/opengraph-image', width: 1200, height: 630, alt: `${site.name}, ${site.role} à Lyon` }];
	return {
		title: { absolute: title },
		description,
		alternates: { canonical: path },
		openGraph: {
			type: 'profile',
			locale: site.locale,
			url: path,
			siteName: site.name,
			title,
			description,
			firstName: 'Raphaël',
			lastName: 'Picard',
			username: 'PicardRaphael',
			images,
		},
		twitter: { card: 'summary_large_image', title, description, creator: '@RPRaphaelPicard', images },
	};
}
