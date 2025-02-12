import { Metadata } from 'next';
import { openGraph, twitter } from './shared-metadata';

export const homeMetadata: Metadata = {
	title: {
		default: 'Raphaël Picard - Développeur Full-Stack Freelance | React.js, Next.js, Node.js, IA & ChatGPT',
		template: '%s - Raphaël Picard',
	},
	applicationName: 'Raphaël Picard - Développeur Full-Stack Freelance',
	description:
		"Développeur Full-Stack freelance spécialisé en React.js, Next.js et Node.js, avec une expertise en intégration et automatisation IA, ainsi qu'en Prompt Engineering. J'accompagne les entreprises dans la création d’applications performantes et évolutives. Découvrez mon portfolio, mes compétences et mes projets. Disponible en France et en télétravail.",
	keywords:
		'Raphaël Picard, développeur full-stack, freelance, React.js, Next.js, Node.js, Typescript, intégration IA, automatisation IA, développement web, portfolio développeur, recrutement IT, API, SaaS, ChatGPT, Prompt Engineering',
	authors: [
		{
			name: 'Raphaël Picard',
			url: 'https://www.raphaelpicard.com',
		},
	],
	openGraph: {
		title: 'Raphaël Picard - Développeur Full-Stack Freelance',
		description:
			'Développeur Full-Stack expert en React.js, Next.js, Node.js, Typescript, IA & ChatGPT. J’aide les entreprises à développer des solutions performantes et évolutives. Découvrez mon portfolio et contactez-moi pour vos projets.',
		url: 'https://www.raphaelpicard.com',
		...openGraph,
	},
	facebook: {
		appId: '1234567890',
	},
	twitter: {
		title: 'Raphaël Picard - Développeur Full-Stack Freelance',
		description:
			'Développeur Full-Stack freelance expert en React.js, Next.js, Node.js, Typescript, IA & ChatGPT. Découvrez mon portfolio et contactez-moi.',
		...twitter,
	},
	publisher: 'Vercel',
	icons: 'https://cdn.sanity.io/images/awd9ns3x/production/63d9b0602eb31c85e2fd6a32c315a55538a215b5-148x164.svg',
};
