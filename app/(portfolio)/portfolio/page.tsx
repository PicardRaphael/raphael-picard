import type { Metadata } from 'next';

import { About } from '@/components/sections/About';
import { Architecture } from '@/components/sections/Architecture';
import { Contact } from '@/components/sections/Contact';
import { Expertise } from '@/components/sections/Expertise';
import { Hero } from '@/components/sections/Hero';
import { Journey } from '@/components/sections/Journey';
import { Portal } from '@/components/sections/Portal';
import { Projects } from '@/components/sections/Projects';
import { PageJsonLd } from '@/components/ui/JsonLd';
import { pageMetadata } from '@/lib/site';

const page = {
	path: '/portfolio',
	title: 'Raphaël Picard, ingénieur IA à Lyon : agents, RAG, MCP',
	description:
		'Raphaël Picard, ingénieur IA à Lyon : 7 agents IA LangGraph en production, RAG hybride, serveurs MCP, Claude Code. Parcours, projets, CV et contact.',
};

export const metadata: Metadata = pageMetadata(page);

/** One long journey: each section is a station the ship flies to. Order = route order (see lib/stations.ts). */
export default function PortfolioPage() {
	return (
		<>
			<PageJsonLd type="ProfilePage" path={page.path} name={page.title} description={page.description} />
			<Hero />
			<About />
			<Journey />
			<Portal />
			<Expertise />
			<Architecture />
			<Projects />
			<Contact />
		</>
	);
}
