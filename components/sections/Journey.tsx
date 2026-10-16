'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';

import { Reveal } from '@/components/ui/Reveal';
import { certifications, experiences, testimonials } from '@/content/work';
import { site } from '@/lib/site';

/** Career as a WoW quest log: pick a quest on the left, read it on the right. */
export function Journey() {
	const [active, setActive] = useState(0);
	const q = experiences[active];

	return (
		<section id="parcours" data-station="2" aria-labelledby="journey-title" className="relative py-28 sm:py-36">
			<div className="mx-auto max-w-7xl px-4 sm:px-6">
				<Reveal>
					<p className="eyebrow">III — Journal de quêtes</p>
					<h2 id="journey-title" className="font-display mt-4 max-w-3xl text-4xl leading-tight font-bold text-balance sm:text-5xl">
						Parcours : 8+ ans d’ingénierie logicielle, <span className="text-gradient">dont une première intégration d’IA en production dès 2018</span>.
					</h2>
					<p className="text-mist mt-4 max-w-2xl">Chaque quête accomplie a laissé une compétence. Sélectionnez-en une pour lire son journal.</p>
				</Reveal>

				<div className="mt-12 grid gap-5 lg:grid-cols-[0.9fr_1.4fr]">
					<Reveal className="rounded-3xl border border-[#c8a35a]/30 bg-[#140d07]/70 p-3 backdrop-blur-xl">
						<ol className="space-y-1.5" aria-label="Expériences professionnelles">
							{experiences.map((e, i) => (
								<li key={e.company + e.period}>
									<button
										onClick={() => setActive(i)}
										aria-pressed={i === active}
										className={`flex w-full items-start gap-3 rounded-2xl px-4 py-3 text-left transition-colors ${i === active ? 'bg-[#c8a35a]/15' : 'hover:bg-white/5'}`}
									>
										<span className={`mt-1 font-mono text-sm ${e.current ? 'text-[#ffd100]' : 'text-ok'}`} aria-hidden>
											{e.current ? '!' : '✓'}
										</span>
										<span className="min-w-0">
											<span className={`block font-semibold ${i === active ? 'text-[#ffd100]' : 'text-ink'}`}>{e.role}</span>
											<span className="text-mist block text-sm">
												{e.company} · {e.period}
											</span>
										</span>
										<span className={`ml-auto shrink-0 rounded-full px-2 py-0.5 font-mono text-[0.65rem] ${e.current ? 'bg-[#ffd100]/15 text-[#ffd100]' : 'bg-ok/10 text-ok'}`}>
											{e.current ? 'En cours' : 'Terminée'}
										</span>
									</button>
								</li>
							))}
						</ol>
					</Reveal>

					<div className="relative min-h-[24rem]">
						<AnimatePresence mode="wait">
							<motion.article
								key={active}
								initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
								animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
								exit={{ opacity: 0, y: -10, filter: 'blur(6px)' }}
								transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
								className="h-full rounded-3xl border border-[#c8a35a]/40 bg-[linear-gradient(160deg,#2a1d10f0,#120c08f2)] p-6 shadow-[0_0_60px_-25px_#c8a35a] sm:p-8"
							>
								<p className="font-mono text-xs tracking-[0.2em] text-[#c8a35a] uppercase">{q.period}</p>
								<h3 className="font-display mt-2 text-2xl font-bold text-[#ffd100] sm:text-3xl">{q.role}</h3>
								<p className="mt-1 text-[#e8d9b5]">
									{q.company} — <span className="text-[#bfae8a]">{q.context}</span>
								</p>
								<p className="mt-6 font-semibold text-[#ffd100]">Objectifs accomplis</p>
								<ul className="mt-3 space-y-2.5">
									{q.points.map((p) => (
										<li key={p} className="flex gap-3 leading-relaxed text-[#efe4c8]">
											<span className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-[#c8a35a]" aria-hidden />
											{p}
										</li>
									))}
								</ul>
								<p className="mt-6 font-semibold text-[#ffd100]">Récompenses</p>
								<p className="mt-3 flex flex-wrap gap-2">
									{q.stack.map((s) => (
										<span key={s} className="rounded-md border border-[#c8a35a]/40 bg-black/30 px-2.5 py-1 font-mono text-xs text-[#e8d9b5]">
											{s}
										</span>
									))}
								</p>
							</motion.article>
						</AnimatePresence>
					</div>
				</div>

				{/* Static version of the whole log for crawlers and assistive tech */}
				<div className="sr-only">
					{experiences.map((e) => (
						<div key={e.company + e.period}>
							<h3>
								{e.role} — {e.company} ({e.period})
							</h3>
							<p>{e.context}</p>
							<ul>
								{e.points.map((p) => (
									<li key={p}>{p}</li>
								))}
							</ul>
						</div>
					))}
				</div>

				<div className="mt-16 grid gap-6 lg:grid-cols-2">
					<Reveal>
						<h3 className="font-display text-2xl font-bold">Hauts faits</h3>
						<p className="text-mist mt-1 text-sm">Certifications IA et diplômes.</p>
						<ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
							{certifications.map((c) => (
								<li key={c.name} className="glass flex items-center gap-3 rounded-2xl p-3">
									<span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#ffd100]/40 bg-[#ffd100]/10 text-[#ffd100]" aria-hidden>
										★
									</span>
									<span className="min-w-0">
										<span className="block text-sm leading-tight font-semibold">{c.name}</span>
										<span className="text-dim block text-xs">{c.issuer}</span>
									</span>
								</li>
							))}
						</ul>
					</Reveal>
					<Reveal delay={0.1}>
						<h3 className="font-display text-2xl font-bold">Ce qu’en disent mes coéquipiers</h3>
						<p className="text-mist mt-1 text-sm">Extraits de recommandations LinkedIn (mission Royal Canin).</p>
						<div className="mt-5 space-y-4">
							{testimonials.map((t) => (
								// each quote opens the full recommendation on LinkedIn, in a new tab
								<a
									key={t.author}
									href={`${site.social.linkedin.replace(/\/$/, '')}/details/recommendations/`}
									target="_blank"
									rel="noopener noreferrer"
									aria-label={`Lire la recommandation de ${t.author} sur LinkedIn (nouvel onglet)`}
									className="group block"
								>
									<figure className="glass spotlight hover:border-signal/40 rounded-2xl p-6 transition-colors">
										<blockquote className="text-ink/90 text-lg leading-relaxed">« {t.quote} »</blockquote>
										<figcaption className="text-mist mt-4 text-sm">
											<span className="text-ink font-semibold">{t.author}</span> · {t.context}
											<span className="text-signal ml-2 opacity-0 transition-opacity group-hover:opacity-100">Voir sur LinkedIn ↗</span>
										</figcaption>
									</figure>
								</a>
							))}
						</div>
					</Reveal>
				</div>
			</div>
		</section>
	);
}
