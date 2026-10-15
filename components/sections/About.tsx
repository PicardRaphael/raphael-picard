import { Reveal } from '@/components/ui/Reveal';
import { about } from '@/content/profile';

const sheet = [
	{ k: 'Classe', v: 'Ingénieur IA' },
	{ k: 'Spécialisation', v: 'Agents · RAG · MCP' },
	{ k: 'Rôle', v: 'Senior AI Engineer & Responsable IA chez Neoteem' },
	{ k: 'Expérience', v: '8+ ans d’ingénierie' },
	{ k: 'Base', v: 'Lyon · télétravail' },
	{ k: 'Langages', v: 'Python · TypeScript' },
	{ k: 'Langues', v: 'Français natif · anglais B1 (technique)' },
];

/** Concrete proofs rather than self-rated skill bars (figures from content/work.ts and content/profile.ts). */
const attributes = [
	{ k: 'Agents & orchestration', v: '7 agents LangGraph en production' },
	{ k: 'RAG & données', v: 'RAG hybride (RRF), 42 vues métier en lecture seule' },
	{ k: 'Architecture backend', v: '41 endpoints OpenAPI, 496 schémas Zod' },
	{ k: 'Outillage Claude Code', v: '13 sous-agents, 38 skills, 27 hooks' },
	{ k: 'Leadership & formation', v: 'Pôle IA de 2 à 3 personnes, 3 à 5 formations' },
];

/** `principles` off in the game: there the stone circle carries the manifesto. */
export function About({ principles = true }: { principles?: boolean }) {
	return (
		<section id="a-propos" data-station="1" aria-labelledby="about-title" className="relative py-28 sm:py-36">
			<div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
				<div>
					<Reveal>
						<p className="eyebrow">{about.eyebrow}</p>
						<h2 id="about-title" className="font-display mt-4 text-4xl leading-tight font-bold text-balance sm:text-5xl">
							{about.title}
						</h2>
					</Reveal>
					<div className="mt-8 space-y-5">
						{about.paragraphs.map((p, i) => (
							<Reveal key={i} delay={0.08 * i}>
								<p className={`leading-relaxed ${i === about.paragraphs.length - 1 ? 'text-ink text-lg font-medium' : 'text-mist'}`}>
									{p}
								</p>
							</Reveal>
						))}
					</div>
					{principles && (
						<ul className="mt-10 grid gap-3 sm:grid-cols-2">
							{about.principles.map((p, i) => (
								<Reveal as="li" key={p.title} delay={0.06 * i} className="glass spotlight rounded-2xl p-5">
									<p className="font-display flex items-center gap-2 font-semibold">
										<span className="text-signal font-mono text-xs">0{i + 1}</span>
										{p.title}
									</p>
									<p className="text-mist mt-2 text-sm leading-relaxed">{p.text}</p>
								</Reveal>
							))}
						</ul>
					)}
				</div>

				<Reveal delay={0.15} className="lg:pt-24">
					<aside aria-label="Fiche de personnage" className="glass relative overflow-hidden rounded-3xl p-6">
						<div className="from-violet/20 to-magenta/10 pointer-events-none absolute inset-0 bg-gradient-to-br" aria-hidden />
						<p className="eyebrow eyebrow-keep relative">Fiche de personnage</p>
						<dl className="relative mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
							{sheet.map((s) => (
								<div key={s.k}>
									<dt className="text-dim text-xs tracking-wider uppercase">{s.k}</dt>
									<dd className="font-medium">{s.v}</dd>
								</div>
							))}
						</dl>
						<dl className="relative mt-7 space-y-3.5 border-t border-white/10 pt-5">
							{attributes.map((a) => (
								<div key={a.k}>
									<dt className="text-mist text-xs">{a.k}</dt>
									<dd className="mt-0.5 flex gap-2 text-sm font-medium">
										<span className="text-signal font-mono" aria-hidden>
											▸
										</span>
										{a.v}
									</dd>
								</div>
							))}
						</dl>
					</aside>
				</Reveal>
			</div>
		</section>
	);
}
