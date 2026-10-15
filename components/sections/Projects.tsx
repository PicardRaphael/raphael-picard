import { Reveal } from '@/components/ui/Reveal';
import { projects } from '@/content/work';

/** WoW loot colours: the inventory sorts projects by rarity. */
const RARITY = {
	legendary: { label: 'Légendaire', color: '#ff8000' },
	epic: { label: 'Épique', color: '#a335ee' },
	rare: { label: 'Rare', color: '#0070dd' },
} as const;

function rarityOf(i: number): keyof typeof RARITY {
	if (i === 0) return 'legendary';
	if (i < 3) return 'epic';
	return 'rare';
}

export function Projects() {
	return (
		<section id="projets" data-station="6" aria-labelledby="projects-title" className="relative py-28 sm:py-36">
			<div className="mx-auto max-w-7xl px-4 sm:px-6">
				<Reveal>
					<p className="eyebrow">VII — Inventaire</p>
					<h2 id="projects-title" className="font-display mt-4 max-w-3xl text-4xl leading-tight font-bold text-balance sm:text-5xl">
						Agents en <span className="text-gradient">production</span> et labo open source.
					</h2>
					<p className="text-mist mt-4 max-w-2xl">D’abord les agents qui tournent chaque jour chez Neoteem, puis mon labo personnel, open source sur GitHub. Ouvrez un objet pour l’inspecter.</p>
				</Reveal>

				<ul className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
					{projects.map((p, i) => {
						const r = RARITY[rarityOf(i)];
						return (
							<Reveal as="li" key={p.name} delay={0.05 * i} className={i === 0 ? 'md:col-span-2 lg:col-span-2' : ''}>
								<article
									className="spotlight group relative h-full rounded-3xl border bg-[#0b0718]/80 p-6 backdrop-blur-xl transition-transform duration-500 hover:-translate-y-1"
									style={{ borderColor: `${r.color}55`, boxShadow: `0 0 50px -28px ${r.color}` }}
								>
									<div className="flex items-start justify-between gap-3">
										<div>
											<p className="font-mono text-[0.7rem] tracking-widest uppercase" style={{ color: r.color }}>
												{r.label} · {p.kind}
											</p>
											<h3 className="font-display mt-2 text-2xl font-bold" style={{ color: i === 0 ? r.color : undefined }}>
												{p.name}
											</h3>
										</div>
										{p.badge && <span className="text-mist shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-xs">{p.badge}</span>}
									</div>
									<p className="text-ink/85 mt-4 leading-relaxed">{p.pitch}</p>

									<details className="group/d mt-5">
										<summary className="text-signal flex cursor-pointer list-none items-center gap-2 text-sm font-semibold select-none [&::-webkit-details-marker]:hidden">
											<span className="transition-transform group-open/d:rotate-90">▸</span> Inspecter l’objet
										</summary>
										<ul className="mt-3 space-y-2 border-l border-white/10 pl-4">
											{p.highlights.map((h) => (
												<li key={h} className="text-ok text-sm leading-relaxed">
													<span className="text-ink/85">{h}</span>
												</li>
											))}
										</ul>
									</details>

									<div className="mt-6 flex flex-wrap items-center justify-between gap-3">
										<p className="flex flex-wrap gap-1.5">
											{p.stack.map((s) => (
												<span key={s} className="text-mist rounded-md bg-white/5 px-2 py-0.5 font-mono text-[0.7rem]">
													{s}
												</span>
											))}
										</p>
										{p.url ? (
											<a href={p.url} target="_blank" rel="noopener" className="text-ink text-sm font-semibold underline-offset-4 hover:underline" aria-label={`Voir ${p.name} sur GitHub`}>
												GitHub ↗
											</a>
										) : (
											<span className="text-ok font-mono text-xs">● en production</span>
										)}
									</div>
								</article>
							</Reveal>
						);
					})}
				</ul>
			</div>
		</section>
	);
}
