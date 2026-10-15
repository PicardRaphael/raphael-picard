import type { Metadata } from 'next';

import { About } from '@/components/sections/About';
import { Architecture } from '@/components/sections/Architecture';
import { Contact } from '@/components/sections/Contact';
import { Expertise } from '@/components/sections/Expertise';
import { Hero } from '@/components/sections/Hero';
import { Journey } from '@/components/sections/Journey';
import { Portal } from '@/components/sections/Portal';
import { Projects } from '@/components/sections/Projects';

export const metadata: Metadata = {
	title: 'Portfolio — agents IA, RAG, MCP, parcours et projets',
	description:
		"Le portfolio complet de Raphaël Picard, ingénieur IA à Lyon : agents LangGraph en production, RAG hybrides, serveurs MCP, outillage Claude Code, parcours de 8 ans en développement et projets open source.",
	alternates: { canonical: '/portfolio' },
};

/** One long journey: each section is a station the ship flies to. Order = route order (see lib/stations.ts). */
export default function PortfolioPage() {
	return (
		<>
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
