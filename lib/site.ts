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
	phone: { label: '06 50 93 15 73', href: 'tel:+33650931573' },
	cv: '/raphael-picard-cv-senior-ai-engineer-responsable-ia.pdf',
	social: {
		linkedin: 'https://www.linkedin.com/in/raphael-picard/',
		github: 'https://github.com/PicardRaphael',
		x: 'https://x.com/RPRaphaelPicard',
		youtube: 'https://www.youtube.com/channel/UC0CCPnM-ft5SSLM1dHSAymQ',
	},
	/** The 30-second summary, hosted on the site and mirrored on YouTube (plus the vertical Short). */
	video: {
		youtubeId: 'lee1768htbM',
		youtube: 'https://youtu.be/lee1768htbM',
		short: 'https://www.youtube.com/shorts/eM1wb6f5u4A',
		uploadedAt: '2026-10-16',
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
 * The share image is public/og-raphael-picard.jpg (the poster of the video, « Ce portfolio est un jeu vidéo »);
 * it is named explicitly on every page so a nested route never loses it.
 */
export function pageMetadata({ path, title, description }: { path: string; title: string; description: string }): Metadata {
	const images = [
		{ url: '/og-raphael-picard.jpg', width: 1200, height: 630, alt: `${site.name}, ${site.role} à Lyon : ce portfolio est un jeu vidéo` },
	];
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
