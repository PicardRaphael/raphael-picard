import { Metadata } from 'next';
import { openGraph, twitter } from './shared-metadata';

export const contactMetadata: Metadata = {
	title: 'Contact - Raphaël Picard | Développeur Full-Stack & IA',
	description:
		"Besoin d'un développeur Full-Stack expert en React.js, Next.js, Node.js et IA ? Contactez-moi pour discuter de votre projet ou toute collaboration.",
	keywords:
		'contact Raphaël Picard, freelance développement web, React.js, Next.js, Node.js, intégration IA, automatisation, recrutement développeur, projet web',
	openGraph: {
		...openGraph,
		title: 'Contact - Raphaël Picard',
		description: 'Vous avez un projet web ou IA ? Contactez-moi pour en discuter et collaborons ensemble.',
		url: 'https://www.raphaelpicard.com/contact',
	},
	twitter: {
		...twitter,
		title: 'Contact - Raphaël Picard',
		description: 'Développeur Full-Stack freelance, disponible pour vos projets React.js, Next.js, Node.js et IA. Discutons ensemble !',
	},
};
