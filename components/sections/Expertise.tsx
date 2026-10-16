'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';

import { Icon } from '@/components/ui/Icon';
import { Reveal } from '@/components/ui/Reveal';
import { expertise } from '@/content/profile';

/** WoW-style talent tree: pick a talent, read its tooltip. All tooltips are in the DOM for crawlers. */
export function Expertise() {
	const [active, setActive] = useState(expertise[0].id);
	const current = expertise.find((e) => e.id === active) ?? expertise[0];

	return (
		<section id="expertise" data-station="4" aria-labelledby="expertise-title" className="relative py-28 sm:py-36">
			<div className="mx-auto max-w-7xl px-4 sm:px-6">
				<Reveal>
					<p className="eyebrow">V — Arbre de talents</p>
					<h2 id="expertise-title" className="font-display mt-4 max-w-3xl text-4xl leading-tight font-bold text-balance sm:text-5xl">
						Expertise IA : agents, RAG, sécurité et <span className="text-gradient">LLMOps</span>.
					</h2>
					<p className="text-mist mt-4 max-w-2xl">Six domaines pratiqués au quotidien, chacun avec sa preuve. Sélectionnez-en un pour le détail.</p>
				</Reveal>

				<div className="mt-12 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
					<div role="tablist" aria-label="Talents" aria-orientation="vertical" className="glass relative grid grid-cols-2 gap-3 rounded-3xl p-4 sm:grid-cols-3 sm:p-6">
						{expertise.map((e, i) => {
							const selected = e.id === active;
							return (
								<button
									key={e.id}
									role="tab"
									id={`tab-${e.id}`}
									aria-selected={selected}
									aria-controls={`panel-${e.id}`}
									onClick={() => setActive(e.id)}
									onMouseEnter={() => setActive(e.id)}
									className={`group relative flex flex-col items-center gap-3 rounded-2xl border p-4 text-center transition-all duration-300 ${
										selected ? 'border-magenta/70 bg-magenta/10 shadow-[0_0_30px_-6px_rgb(197_14_255_/_0.7)]' : 'border-white/10 hover:border-white/25 hover:bg-white/5'
									}`}
								>
									<span
										className={`grid h-14 w-14 place-items-center rounded-xl border transition-colors ${
											selected ? 'border-orchid text-orchid bg-black/40' : 'text-mist border-white/15 bg-black/30 group-hover:text-white'
										}`}
									>
										<Icon name={e.id} className="h-7 w-7" />
									</span>
									<span className="text-sm leading-tight font-semibold">{e.title}</span>
									<span className="text-ok mt-auto font-mono text-[0.65rem] leading-tight">{e.metric}</span>
									{i < expertise.length - 1 && <span className="sr-only">,</span>}
								</button>
							);
						})}
					</div>

					<div className="relative min-h-[23rem]">
						<AnimatePresence mode="wait">
							<motion.div
								key={current.id}
								initial={{ opacity: 0, x: 24, filter: 'blur(6px)' }}
								animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
								exit={{ opacity: 0, x: -16, filter: 'blur(6px)' }}
								transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
								className="rounded-3xl border border-[#a335ee]/50 bg-[#0b0718]/85 p-6 shadow-[0_0_60px_-20px_#a335ee] backdrop-blur-xl sm:p-8"
								aria-hidden
							>
								<div className="flex items-start justify-between gap-4">
									<div>
										<p className="font-display text-2xl font-bold text-[#c77dff]">{current.title}</p>
										<p className="text-dim mt-1 font-mono text-xs">{current.id === 'claude-code' ? 'Pratiqué au quotidien' : 'Pratiqué en production'}</p>
									</div>
									{current.metric && <span className="bg-ok/10 text-ok rounded-full px-3 py-1 font-mono text-xs whitespace-nowrap">{current.metric}</span>}
								</div>
								<p className="mt-5 text-lg leading-relaxed text-[#ffd100]">« {current.pitch} »</p>
								<ul className="mt-5 space-y-2.5">
									{current.points.map((p) => (
										<li key={p} className="text-ok flex gap-3 text-sm leading-relaxed">
											<span aria-hidden>+</span>
											<span className="text-ink/90">{p}</span>
										</li>
									))}
								</ul>
								<p className="text-mist mt-6 flex flex-wrap gap-2">
									{current.tags.map((t) => (
										<span key={t} className="rounded-md border border-white/10 bg-white/5 px-2 py-1 font-mono text-xs">
											{t}
										</span>
									))}
								</p>
							</motion.div>
						</AnimatePresence>

						{/* Full, static version of every talent for screen readers and search engines. */}
						<div className="sr-only">
							{expertise.map((e) => (
								<div key={e.id} role="tabpanel" id={`panel-${e.id}`} aria-labelledby={`tab-${e.id}`} hidden={e.id !== active}>
									<h3>{e.title}</h3>
									<p>{e.pitch}</p>
									<ul>
										{e.points.map((p) => (
											<li key={p}>{p}</li>
										))}
									</ul>
									<p>Technologies : {e.tags.join(', ')}</p>
								</div>
							))}
						</div>
					</div>
				</div>

			</div>
		</section>
	);
}
