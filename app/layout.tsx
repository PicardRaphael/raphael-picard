import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono, Sora } from 'next/font/google';

import { JsonLd } from '@/components/ui/JsonLd';
import { site } from '@/lib/site';

import './globals.css';

const sora = Sora({ subsets: ['latin'], variable: '--font-sora', display: 'swap', weight: ['400', '600', '700', '800'] });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains', display: 'swap', weight: ['400', '500'] });

export const metadata: Metadata = {
	metadataBase: new URL(site.url),
	title: { default: site.title, template: `%s — ${site.name}` },
	description: site.description,
	applicationName: site.name,
	keywords: [...site.keywords],
	authors: [{ name: site.name, url: site.url }],
	creator: site.name,
	alternates: { canonical: '/' },
	openGraph: {
		type: 'profile',
		locale: site.locale,
		url: site.url,
		siteName: site.name,
		title: site.title,
		description: site.description,
		firstName: 'Raphaël',
		lastName: 'Picard',
	},
	twitter: {
		card: 'summary_large_image',
		title: site.title,
		description: site.description,
		creator: '@RPRaphaelPicard',
	},
	robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
	category: 'technology',
};

export const viewport: Viewport = {
	themeColor: '#05040c',
	colorScheme: 'dark',
	width: 'device-width',
	initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="fr" className={`${sora.variable} ${inter.variable} ${mono.variable}`}>
			<body className="min-h-screen">
				{children}
				<JsonLd />
				<Analytics />
				<SpeedInsights />
			</body>
		</html>
	);
}
