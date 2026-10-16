import type { Metadata } from 'next';
import Link from 'next/link';

import { GameUI } from '@/components/game/GameUI';
import { WorldLoader } from '@/components/three/world/WorldLoader';
import { PageJsonLd } from '@/components/ui/JsonLd';
import { about, expertise, hero } from '@/content/profile';
import { projects } from '@/content/work';
import { pageMetadata, site } from '@/lib/site';

const page = {
	path: '/',
	title: site.title,
	description:
		'Raphaël Picard, Senior AI Engineer et Responsable IA à Lyon. 7 agents IA en production chez Neoteem, −33 % de coûts d’inférence. CV, résumé vidéo ou portfolio 3D jouable.',
};

export const metadata: Metadata = pageMetadata(page);

/**
 * Text alternative to the WebGL world, for screen readers and crawlers: same facts as the game and /portfolio,
 * visually hidden so the game screen stays untouched. The start screen already renders the page's h1.
 */
function WorldSummary() {
	return (
		<section className="sr-only" aria-labelledby="resume-title">
			<h2 id="resume-title">
				{site.role} à Lyon : {hero.headline}
			</h2>
			<p>{hero.lead}</p>
			<p>{about.paragraphs[1]}</p>
			<h3>Agents IA en production</h3>
			<ul>
				{projects
					.filter((p) => p.production)
					.map((p) => (
						<li key={p.name}>
							{p.name} ({p.kind}) : {p.pitch}
						</li>
					))}
			</ul>
			<h3>Expertises</h3>
			<ul>
				{expertise.map((e) => (
					<li key={e.id}>
						{e.title} : {e.pitch}
					</li>
				))}
			</ul>
			<ul>
				<li>
					<Link href="/portfolio">Lire le portfolio complet</Link>
				</li>
				<li>
					<Link href="/portfolio#parcours">Parcours</Link>
				</li>
				<li>
					<Link href="/portfolio#projets">Projets</Link>
				</li>
				<li>
					<Link href="/portfolio#contact">Contact</Link>
				</li>
				<li>
					<a href={site.cv}>Télécharger le CV (PDF)</a>
				</li>
				<li>
					<a href={site.social.linkedin} rel="me noopener">
						LinkedIn
					</a>
				</li>
				<li>
					<a href={site.social.github} rel="me noopener">
						GitHub
					</a>
				</li>
			</ul>
		</section>
	);
}

/** Landing: the explorable world. The full readable portfolio lives at /portfolio. */
export default function Home() {
	return (
		<main className="fixed inset-0 overflow-hidden bg-[#1a0d2e]">
			<PageJsonLd type="WebPage" path={page.path} name={page.title} description={page.description} />
			<WorldLoader />
			<GameUI />
			<WorldSummary />
			<noscript>
				<p className="fixed inset-x-0 top-0 z-50 bg-black/85 px-4 py-3 text-center text-sm text-white">
					Le monde 3D a besoin de JavaScript.{' '}
					<a href="/portfolio" className="underline">
						Lire le portfolio classique
					</a>
				</p>
			</noscript>
		</main>
	);
}
