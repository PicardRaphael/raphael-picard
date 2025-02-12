import { Metadata } from 'next';
import { openGraph, twitter } from './shared-metadata';

export const experiencesMetadata: Metadata = {
	title: {
		default: 'Expériences - Raphaël Picard | Développeur Full-Stack Freelance',
		template: '%s - Raphaël Picard',
	},
	applicationName: 'Raphaël Picard - Développeur Full-Stack Freelance',
	description:
		'Explorez mon parcours professionnel en tant que Développeur Full-Stack Freelance. Découvrez mes expériences en React.js, Next.js, Node.js et intégration IA.',
	keywords:
		'Raphaël Picard, expériences développeur, freelance, React.js, Next.js, Node.js, Typescript, intégration IA, automatisation IA, parcours professionnel, projets IT',
	authors: [
		{
			name: 'Raphaël Picard',
			url: 'https://www.raphaelpicard.com',
		},
	],
	openGraph: {
		...openGraph,
		title: 'Expériences - Raphaël Picard | Développeur Full-Stack Freelance',
		description:
			'Découvrez mon parcours en entreprise et mes projets en tant que Développeur Full-Stack Freelance, expert en React.js, Next.js, Node.js et IA.',
		url: 'https://www.raphaelpicard.com/experiences',
	},
	twitter: {
		...twitter,
		title: 'Expériences - Raphaël Picard | Développeur Full-Stack Freelance',
		description: 'Découvrez mon parcours en entreprise et mes projets en tant que Développeur Full-Stack Freelance.',
	},
};
