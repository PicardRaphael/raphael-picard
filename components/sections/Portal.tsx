import { Reveal } from '@/components/ui/Reveal';

const steps = [
	{ year: '2018', text: 'Première IA en production : Google Vision analyse des documents dans une PWA React.' },
	{ year: '2024', text: 'Agents autonomes, multi-agents et premier serveur MCP en indépendant.' },
	{ year: '2025', text: 'Responsable IA chez Neoteem : le code devient le socle, les agents deviennent le métier.' },
];

/** Interlude between the two realms: the pivot from software craft to AI engineering. */
export function Portal() {
	return (
		<section id="portail" data-station="3" aria-labelledby="portal-title" className="relative flex min-h-[90svh] items-center py-28">
			<div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
				<Reveal className="max-w-2xl">
					<p className="eyebrow !text-[#ffb35c]">IV — Le Portail</p>
					<h2 id="portal-title" className="font-display mt-4 text-4xl leading-tight font-bold text-balance sm:text-6xl">
						Un pied dans le code, <span className="text-gradient">l’autre dans les agents</span>.
					</h2>
					<p className="text-mist mt-6 text-lg leading-relaxed">
						Je n’ai pas quitté le développement pour l’IA : je l’ai emporté avec moi. Neuf ans d’architecture, de tests et de production, c’est exactement ce qui manque à la plupart
						des projets d’IA générative.
					</p>
				</Reveal>
				<ol className="mt-12 grid max-w-4xl gap-4 sm:grid-cols-3">
					{steps.map((s, i) => (
						<Reveal as="li" key={s.year} delay={0.1 * i} className="glass rounded-2xl p-5">
							<p className="font-display text-3xl font-bold text-[#ffb35c]">{s.year}</p>
							<p className="text-mist mt-2 text-sm leading-relaxed">{s.text}</p>
						</Reveal>
					))}
				</ol>
				<p className="text-dim mt-12 font-mono text-xs tracking-[0.25em] uppercase">Continuez : traversée vers le Nexus ↓</p>
			</div>
		</section>
	);
}
