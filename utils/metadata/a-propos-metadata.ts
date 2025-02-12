import { Metadata } from 'next';
import { openGraph, twitter } from './shared-metadata';

export const aProposMetadata: Metadata = {
	title: {
		default: 'À propos - Raphaël Picard | Développeur Full-Stack Freelance',
		template: '%s - Raphaël Picard',
	},
	description:
		"Découvrez mon parcours en tant que Développeur Full-Stack freelance spécialisé en React.js, Next.js, Node.js et IA. 8 ans d'expérience dans le développement web et mobile.",
	keywords:
		'Raphaël Picard, développeur full-stack, freelance, React.js, Next.js, Node.js, Typescript, automatisation IA, intégration IA, parcours développeur, compétences IT',
	openGraph: {
		...openGraph,
		title: 'À Propos - Raphaël Picard | Développeur Full-Stack Freelance',
		description:
			"Apprenez-en plus sur mon parcours et mes compétences en développement web Full-Stack. 8 ans d'expérience en React.js, Next.js, Node.js et IA.",
		url: 'https://www.raphaelpicard.com/a-propos',
		type: 'profile',
	},
	twitter: {
		...twitter,
		title: 'À Propos - Raphaël Picard | Développeur Full-Stack Freelance',
		description: 'Découvrez mon parcours, mon expertise en développement Full-Stack et mon expérience en intégration et automatisation IA.',
	},
};
