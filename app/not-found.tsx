import type { Metadata } from 'next';
import Link from 'next/link';

import { site } from '@/lib/site';

export const metadata: Metadata = { title: 'Page introuvable', robots: { index: false, follow: true } };

/** French 404: the visitor lands on one of the real entry points instead of a dead end. */
export default function NotFound() {
	const link = 'rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-white transition-colors hover:bg-white/10';
	return (
		<main className="grid min-h-[100svh] place-items-center bg-[#05040c] px-6 text-center">
			<div>
				<p className="font-mono text-sm tracking-[0.3em] text-[#ffd9a0] uppercase">Erreur 404</p>
				<h1 className="font-display mt-4 text-4xl font-bold text-white sm:text-5xl">Cette page n’existe pas.</h1>
				<p className="mx-auto mt-4 max-w-md text-white/70">Le lien est peut-être ancien. Voici les vraies portes d’entrée du portfolio de {site.name}.</p>
				<nav aria-label="Liens utiles" className="mt-8 flex flex-wrap justify-center gap-3 text-sm">
					<Link href="/" className={link}>
						Monde 3D
					</Link>
					<Link href="/portfolio" className={link}>
						Version classique
					</Link>
					<Link href="/portfolio#projets" className={link}>
						Projets
					</Link>
					<a href={site.cv} download className={link}>
						Télécharger le CV
					</a>
				</nav>
			</div>
		</main>
	);
}
