import { Metadata } from 'next';
import { openGraph, twitter } from './shared-metadata';

export const projetsMetadata: Metadata = {
	title: 'Mes Projets - Raphaël Picard | Développeur Full-Stack & IA',
	description:
		"Découvrez mes projets en développement Full-Stack, incluant des applications web, des intégrations d'IA et des systèmes e-commerce avec React.js, Next.js et Node.js.",
	keywords:
		'Raphaël Picard, projets développement web, portfolio développeur, React.js, Next.js, Node.js, IA, automatisation IA, SaaS, API, intégration Stripe, e-commerce',
	openGraph: {
		...openGraph,
		title: 'Mes Projets - Raphaël Picard',
		description: 'Explorez mes réalisations en développement web et IA : applications web modernes, automatisation et intégrations API.',
		url: 'https://www.raphaelpicard.com/projets',
	},
	twitter: {
		...twitter,
		title: 'Mes Projets - Raphaël Picard',
		description: 'Développement Full-Stack et intégrations IA : découvrez mes réalisations en React.js, Next.js et Node.js.',
	},
};
