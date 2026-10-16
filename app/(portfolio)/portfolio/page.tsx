import type { Metadata } from 'next';

import { About } from '@/components/sections/About';
import { Architecture } from '@/components/sections/Architecture';
import { Contact } from '@/components/sections/Contact';
import { Expertise } from '@/components/sections/Expertise';
import { FailureModes } from '@/components/sections/FailureModes';
import { Hero } from '@/components/sections/Hero';
import { Journey } from '@/components/sections/Journey';
import { Portal } from '@/components/sections/Portal';
import { Projects } from '@/components/sections/Projects';
import { PageJsonLd, VideoJsonLd } from '@/components/ui/JsonLd';
import { pageMetadata } from '@/lib/site';

const page = {
	path: '/portfolio',
	title: 'Ingénieur IA à Lyon, agents LLM, RAG, MCP · Raphaël Picard',
	description:
		'Raphaël Picard, Senior AI Engineer et Responsable IA à Lyon. 7 agents LLM en production avec LangGraph, RAG hybride, serveurs MCP et Claude Code. Parcours, projets et CV.',
};

export const metadata: Metadata = pageMetadata(page);

/** One long journey: each section is a station the ship flies to. Order = route order (see lib/stations.ts). */
export default function PortfolioPage() {
	return (
		<>
			<PageJsonLd type="ProfilePage" path={page.path} name={page.title} description={page.description} />
			<VideoJsonLd />
			<Hero />
			<About />
			<Journey />
			<Portal />
			<Expertise />
			<Architecture />
			<FailureModes />
			<Projects />
			<Contact />
		</>
	);
}
