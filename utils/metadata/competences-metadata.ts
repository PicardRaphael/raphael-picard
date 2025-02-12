import { Metadata } from 'next';
import { openGraph, twitter } from './shared-metadata';

export const competencesMetadata: Metadata = {
	title: 'Compétences - Raphaël Picard | Développeur Full-Stack & IA',
	description:
		'Explorez mes compétences en développement web avec React.js, Next.js, Node.js, ainsi que mon expertise en intégration et automatisation IA.',
	keywords: 'Raphaël Picard, compétences développeur, React.js, Next.js, Node.js, IA, automatisation IA, technologies web, outils développement',
	openGraph: {
		title: 'Compétences - Raphaël Picard',
		description:
			'Découvrez mes expertises en développement Full-Stack et intelligence artificielle, avec un focus sur React.js, Next.js et Node.js.',
		url: 'https://www.raphaelpicard.com/competences',
		...openGraph,
	},
	twitter: {
		title: 'Compétences - Raphaël Picard',
		description: 'Découvrez mon savoir-faire en développement Full-Stack et en intelligence artificielle.',
		...twitter,
	},
};
