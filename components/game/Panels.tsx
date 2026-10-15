'use client';

import Link from 'next/link';

import { about, expertise, leadership } from '@/content/profile';
import { certifications, experiences, projects, testimonials } from '@/content/work';
import { game, useGame } from '@/lib/game-store';
import { QUESTS } from '@/lib/quests';
import { site } from '@/lib/site';
import { landmark } from '@/lib/world';

const h3 = 'font-display text-lg font-bold text-[#ffd100]';

function QuestBlock({ id }: { id: string }) {
	const quests = useGame((s) => s.quests);
	const offer = QUESTS.find((q) => q.giver === id && quests[q.id] === 'available');
	const ready = QUESTS.find((q) => q.turnIn === id && quests[q.id] === 'ready');
	const active = QUESTS.find((q) => q.giver === id && quests[q.id] === 'active');
	if (ready)
		return (
			<div className="rounded-xl border border-[#ffd100]/40 bg-black/30 p-4">
				<p className="font-mono text-xs tracking-widest text-[#ffd100] uppercase">Quête terminée · {ready.title}</p>
				<p className="mt-2 leading-relaxed text-[#f3e9cf]">{ready.outro}</p>
				<button onClick={() => game.complete(ready.id)} className="mt-4 rounded-lg bg-[#ffd100] px-4 py-2 font-semibold text-black hover:brightness-110">
					Terminer la quête
				</button>
			</div>
		);
	if (offer)
		return (
			<div className="rounded-xl border border-[#ffd100]/40 bg-black/30 p-4">
				<p className="font-mono text-xs tracking-widest text-[#ffd100] uppercase">Nouvelle quête · {offer.title}</p>
				<p className="mt-2 leading-relaxed text-[#f3e9cf]">{offer.intro}</p>
				<ul className="mt-3 space-y-1 text-sm text-[#e8dcc0]">
					{offer.objectives.map((o) => (
						<li key={o.id}>◆ {o.label}</li>
					))}
				</ul>
				<button onClick={() => game.accept(offer.id)} className="mt-4 rounded-lg bg-[#ffd100] px-4 py-2 font-semibold text-black hover:brightness-110">
					Accepter
				</button>
			</div>
		);
	if (active) return <p className="text-[#e8dcc0]">« {active.intro} »</p>;
	return null;
}

function Body({ id }: { id: string }) {
	switch (id) {
		case 'raphy':
			return (
				<>
					<p className="leading-relaxed">
						Je suis Raphy, la mascotte de Raphaël Picard. Lui, c’est un ingénieur IA basé à Lyon : il conçoit des agents qui tournent en production et forme les équipes à
						l’IA.
					</p>
					<QuestBlock id="raphy" />
				</>
			);
		case 'holo':
			return (
				<>
					<p className="leading-relaxed">Raphy·OS en ligne. Depuis novembre 2025, Raphaël est Senior AI Engineer & Responsable IA chez Neoteem.</p>
					<QuestBlock id="holo" />
				</>
			);
		case 'forge':
			return (
				<>
					<p className="leading-relaxed">Neuf ans à forger du code : chaque projet a laissé une compétence.</p>
					<ol className="space-y-4">
						{experiences.map((e) => (
							<li key={e.company + e.period} className="border-l-2 border-[#c8a35a]/50 pl-4">
								<p className="font-mono text-xs text-[#c8a35a]">{e.period}</p>
								<p className="font-semibold text-[#ffd100]">
									{e.role} · {e.company}
								</p>
								<p className="text-sm text-[#bfae8a]">{e.context}</p>
								<ul className="mt-1.5 space-y-1 text-sm">
									{e.points.map((p) => (
										<li key={p}>— {p}</li>
									))}
								</ul>
							</li>
						))}
					</ol>
				</>
			);
		case 'tower':
			return (
				<>
					<h3 className={h3}>Certifications</h3>
					<ul className="grid gap-2 sm:grid-cols-2">
						{certifications.map((c) => (
							<li key={c.name} className="rounded-lg bg-black/30 p-2.5 text-sm">
								<span className="text-[#ffd100]">★</span> {c.name} <span className="block text-xs text-[#bfae8a]">{c.issuer}</span>
							</li>
						))}
					</ul>
					<h3 className={h3}>Ce qu’en disent ses coéquipiers</h3>
					{testimonials.map((t) => (
						<blockquote key={t.author} className="rounded-lg bg-black/30 p-3 text-sm italic">
							“{t.quote}” <span className="mt-1 block text-xs text-[#bfae8a] not-italic">— {t.author}, {t.context}</span>
						</blockquote>
					))}
				</>
			);
		case 'stones':
			return (
				<>
					{about.paragraphs.map((p) => (
						<p key={p} className="leading-relaxed">
							{p}
						</p>
					))}
					<h3 className={h3}>Les quatre pierres</h3>
					<ul className="grid gap-2 sm:grid-cols-2">
						{about.principles.map((p) => (
							<li key={p.title} className="rounded-lg bg-black/30 p-3 text-sm">
								<p className="font-semibold text-[#ffd100]">{p.title}</p>
								<p className="mt-1">{p.text}</p>
							</li>
						))}
					</ul>
				</>
			);
		case 'portal':
			return <p className="leading-relaxed">Une arche ancienne parcourue d’énergie arcanique. Fonce dedans pour rejoindre le Nexus : l’ère des agents.</p>;
		case 'portal-back':
			return <p className="leading-relaxed">Ce portail te ramène au Val des Origines.</p>;
		case 'agents':
			return (
				<>
					<p className="leading-relaxed">Six domaines d’expertise, tous en production.</p>
					<ul className="space-y-3">
						{expertise.map((e) => (
							<li key={e.id} className="rounded-lg bg-black/30 p-3">
								<p className="flex items-center justify-between gap-2 font-semibold text-[#7dd3fc]">
									{e.title} {e.metric && <span className="font-mono text-xs text-[#34d399]">{e.metric}</span>}
								</p>
								<p className="mt-1 text-sm">{e.pitch}</p>
								<p className="mt-1 text-xs text-[#a39fc4]">{e.tags.join(' · ')}</p>
							</li>
						))}
					</ul>
					<p className="text-sm">
						<span className="font-semibold text-[#7dd3fc]">{leadership.title} :</span> {leadership.points.join(' · ')}
					</p>
				</>
			);
		case 'core':
			return (
				<>
					<p className="leading-relaxed">Le schéma qu’il déploie pour un agent en production :</p>
					<ol className="space-y-2 text-sm">
						<li>1. Routeur hybride : embeddings + RRF, un LLM seulement en repli.</li>
						<li>2. Agents spécialisés LangGraph (ReAct), plutôt qu’un généraliste qui fait tout.</li>
						<li>3. Outils déterministes et serveurs MCP : le modèle ne calcule jamais.</li>
						<li>4. RAG hybride pgvector + reranking : chaque réponse cite sa source.</li>
						<li>5. Gemini 2.5 / Claude avec context caching : −33 % de coûts.</li>
						<li>6. Traces Langfuse et évaluations DeepEval avant chaque mise en production.</li>
					</ol>
				</>
			);
		case 'gallery':
			return (
				<ul className="space-y-3">
					{projects.map((p) => (
						<li key={p.name} className="rounded-lg bg-black/30 p-3">
							<p className="flex items-center justify-between gap-2">
								<span className="font-semibold text-[#e879f9]">{p.name}</span>
								<a href={p.url} target="_blank" rel="noopener" className="text-xs text-[#7dd3fc] hover:underline">
									GitHub ↗
								</a>
							</p>
							<p className="mt-1 text-sm">{p.pitch}</p>
						</li>
					))}
				</ul>
			);
		case 'beacon':
			return (
				<>
					<QuestBlock id="beacon" />
					<p className="text-lg leading-relaxed">Un projet d’agent ou de RAG, une équipe à former, un poste ? Parlons-en.</p>
					<ul className="space-y-2">
						<li>
							<a className="text-[#7dd3fc] hover:underline" href={`mailto:${site.email}`}>
								{site.email}
							</a>
						</li>
						<li>
							<a className="text-[#7dd3fc] hover:underline" href={site.social.linkedin} target="_blank" rel="noopener">
								LinkedIn
							</a>{' '}
							·{' '}
							<a className="text-[#7dd3fc] hover:underline" href={site.social.github} target="_blank" rel="noopener">
								GitHub
							</a>{' '}
							·{' '}
							<a className="text-[#7dd3fc] hover:underline" href={site.cv} download>
								CV (PDF)
							</a>
						</li>
						<li>
							<Link className="text-[#7dd3fc] hover:underline" href="/portfolio#contact">
								Formulaire de contact →
							</Link>
						</li>
					</ul>
				</>
			);
		case 'race':
			return <p className="leading-relaxed">La course du Nexus arrive bientôt : anneaux, chrono et classement.</p>;
		default:
			return null;
	}
}

export function Panel() {
	const id = useGame((s) => s.panel);
	if (!id) return null;
	const l = landmark(id);
	const nexus = l.zone === 'nexus';
	return (
		<div className="fixed inset-0 z-40 flex items-end justify-center p-3 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="panel-title">
			<button className="absolute inset-0 bg-black/40" aria-label="Fermer" onClick={() => game.set({ panel: null })} />
			<div
				className={`relative max-h-[82vh] w-full max-w-2xl overflow-y-auto rounded-2xl border-2 p-5 shadow-2xl sm:p-7 ${
					nexus ? 'border-[#8b5cf6]/70 bg-[#0b0718]/95 text-[#e9e5ff] shadow-[#651fff]/30' : 'border-[#c8a35a]/70 bg-[linear-gradient(160deg,#2a1d10f5,#140d07f8)] text-[#efe4c8]'
				}`}
				data-lenis-prevent
			>
				<div className="flex items-start justify-between gap-4">
					<h2 id="panel-title" className={`font-display text-2xl font-bold ${nexus ? 'text-[#e879f9]' : 'text-[#ffd100]'}`}>
						{l.name}
					</h2>
					<button onClick={() => game.set({ panel: null })} className="rounded-md border border-white/20 px-2 py-0.5 font-mono text-sm hover:bg-white/10" autoFocus>
						Échap ✕
					</button>
				</div>
				<div className="mt-4 space-y-4">
					<Body id={id} />
				</div>
			</div>
		</div>
	);
}
