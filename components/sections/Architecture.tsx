'use client';

import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

import { Reveal } from '@/components/ui/Reveal';

type Node = { id: string; label: string; sub: string; x: number; y: number; detail: string };

const NODES: Node[] = [
	{ id: 'user', label: 'Utilisateur', sub: 'question métier', x: 60, y: 170, detail: 'Une question en langage naturel arrive, avec son contexte : utilisateur authentifié, quota, historique de conversation.' },
	{ id: 'router', label: 'Routeur hybride', sub: 'embeddings + RRF', x: 230, y: 170, detail: 'Un classifieur par embeddings choisit les outils et l’agent ; un LLM n’est appelé qu’en repli. Rapide, peu coûteux, explicable.' },
	{ id: 'agents', label: 'Agents spécialisés', sub: 'ReAct · LangGraph', x: 410, y: 80, detail: 'Chatbot métier, support, devis, recherche web : chaque agent a son graphe, ses outils et ses garde-fous, plutôt qu’un généraliste qui fait tout.' },
	{ id: 'tools', label: 'Outils & MCP', sub: 'tools · serveurs MCP', x: 410, y: 260, detail: 'Les chiffres et les données viennent d’outils déterministes et testés, exposés aussi via MCP. Le modèle ne calcule jamais.' },
	{ id: 'rag', label: 'RAG hybride', sub: 'pgvector + rerank', x: 590, y: 80, detail: 'Recherche vectorielle et lexicale fusionnée, reranking cross-encoder, extraction verbatim : chaque réponse cite sa source.' },
	{ id: 'llm', label: 'LLM', sub: 'Gemini 2.5 · Claude', x: 590, y: 260, detail: 'Le bon modèle pour la bonne tâche, context caching activé : −33 % de coûts d’inférence.' },
	{ id: 'obs', label: 'Évals & traces', sub: 'Langfuse · DeepEval', x: 760, y: 170, detail: 'Chaque appel est tracé ; chaque agent passe des évaluations LLM-as-judge et des tests de non-régression avant la mise en production.' },
];

const EDGES: [string, string][] = [
	['user', 'router'],
	['router', 'agents'],
	['router', 'tools'],
	['agents', 'rag'],
	['agents', 'llm'],
	['tools', 'llm'],
	['rag', 'obs'],
	['llm', 'obs'],
	['tools', 'agents'],
];

const TRACE = [
	{ t: '00.000', s: 'info', m: 'POST /agents/chat  user=gestionnaire  quota=ok' },
	{ t: '00.041', s: 'route', m: 'HybridToolSelector → rrf_top3=[search_contacts, list_records, web_search]' },
	{ t: '00.044', s: 'route', m: 'confiance=0.91  → repli LLM inutile' },
	{ t: '00.212', s: 'tool', m: 'search_contacts(name="Durand")  → 3 résultats  [déterministe]' },
	{ t: '00.389', s: 'rag', m: 'pgvector k=20 ⨝ bm25 k=20 → rerank cross-encoder → 4 passages' },
	{ t: '01.104', s: 'llm', m: 'gemini-2.5-flash  cache=HIT  tokens in=3.1k out=412' },
	{ t: '01.390', s: 'eval', m: 'faithfulness=0.97  sources=4/4 citées' },
	{ t: '01.392', s: 'ok', m: 'stream SSE terminé · trace envoyée à Langfuse' },
];

const tone: Record<string, string> = {
	info: 'text-mist',
	route: 'text-signal',
	tool: 'text-orchid',
	rag: 'text-[#c77dff]',
	llm: 'text-[#ffd100]',
	eval: 'text-ok',
	ok: 'text-ok',
};

function pos(id: string) {
	const n = NODES.find((x) => x.id === id);
	return n ? { x: n.x, y: n.y } : { x: 0, y: 0 };
}

export function Architecture() {
	const [active, setActive] = useState('router');
	const [lines, setLines] = useState(0);
	const ref = useRef<HTMLDivElement>(null);
	const current = NODES.find((n) => n.id === active) ?? NODES[1];

	// Stream the trace line by line once the terminal is visible, then loop.
	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		let timer: ReturnType<typeof setInterval> | undefined;
		const io = new IntersectionObserver(
			([e]) => {
				clearInterval(timer);
				if (!e.isIntersecting) return;
				timer = setInterval(() => setLines((l) => (l >= TRACE.length + 4 ? 0 : l + 1)), 650);
			},
			{ threshold: 0.3 },
		);
		io.observe(el);
		return () => {
			io.disconnect();
			clearInterval(timer);
		};
	}, []);

	return (
		<section id="architecture" data-station="5" aria-labelledby="archi-title" className="relative py-28 sm:py-36">
			<div className="mx-auto max-w-7xl px-4 sm:px-6">
				<Reveal>
					<p className="eyebrow">VI — Noyau d’orchestration</p>
					<h2 id="archi-title" className="font-display mt-4 max-w-3xl text-4xl leading-tight font-bold text-balance sm:text-5xl">
						Anatomie d’un agent IA <span className="text-gradient">en production</span>.
					</h2>
					<p className="text-mist mt-4 max-w-2xl">Le schéma que je déploie : cliquez sur un composant pour voir son rôle, et regardez une requête traverser le système en direct.</p>
				</Reveal>

				<div className="mt-12 grid gap-6 xl:grid-cols-[1.45fr_1fr]">
					<Reveal className="glass rounded-3xl p-3 sm:p-5">
						<div className="overflow-x-auto">
							<svg viewBox="0 0 820 340" className="min-w-[640px]" role="group" aria-label="Schéma d’architecture d’un agent IA">
								<defs>
									<linearGradient id="edge" x1="0" x2="1">
										<stop offset="0" stopColor="#651fff" />
										<stop offset="1" stopColor="#c50eff" />
									</linearGradient>
									<filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
										<feGaussianBlur stdDeviation="4" result="b" />
										<feMerge>
											<feMergeNode in="b" />
											<feMergeNode in="SourceGraphic" />
										</feMerge>
									</filter>
								</defs>
								{EDGES.map(([a, b]) => {
									const p = pos(a);
									const q = pos(b);
									const mx = (p.x + q.x) / 2;
									const d = `M${p.x},${p.y} C${mx},${p.y} ${mx},${q.y} ${q.x},${q.y}`;
									const lit = a === active || b === active;
									return (
										<g key={`${a}-${b}`}>
											<path d={d} fill="none" stroke="url(#edge)" strokeOpacity={lit ? 0.9 : 0.25} strokeWidth={lit ? 2 : 1.2} />
											<path d={d} fill="none" stroke="#e879f9" strokeWidth={2} strokeDasharray="4 36" className="animate-flow" strokeOpacity={lit ? 1 : 0.4} filter="url(#glow)" />
										</g>
									);
								})}
								{NODES.map((n) => {
									const selected = n.id === active;
									return (
										<g
											key={n.id}
											transform={`translate(${n.x},${n.y})`}
											role="button"
											tabIndex={0}
											aria-pressed={selected}
											aria-label={`${n.label} — ${n.sub}`}
											onClick={() => setActive(n.id)}
											onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setActive(n.id)}
											className="cursor-pointer outline-none"
										>
											<rect x={-68} y={-30} width={136} height={60} rx={14} fill={selected ? '#1d1240' : '#0d0a1f'} stroke={selected ? '#e879f9' : '#ffffff22'} strokeWidth={selected ? 1.6 : 1} filter={selected ? 'url(#glow)' : undefined} />
											<text textAnchor="middle" y={-3} className="fill-white font-sans text-[13px] font-semibold">
												{n.label}
											</text>
											<text textAnchor="middle" y={15} className="fill-[#a39fc4] font-mono text-[10px]">
												{n.sub}
											</text>
										</g>
									);
								})}
							</svg>
						</div>
						<motion.div key={current.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="border-t border-white/5 px-2 pt-4 pb-1 sm:px-4">
							<p className="font-display text-orchid font-semibold">{current.label}</p>
							<p className="text-mist mt-1 text-sm leading-relaxed">{current.detail}</p>
						</motion.div>
					</Reveal>

					<Reveal delay={0.1}>
						<div ref={ref} className="h-full overflow-hidden rounded-3xl border border-white/10 bg-[#07060f]/90 font-mono text-[12.5px] shadow-[0_0_80px_-30px_#651fff] backdrop-blur-xl">
							<div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
								<span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
								<span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
								<span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
								<span className="text-dim ml-3 text-xs">trace · agent-chat · run #4812</span>
							</div>
							<ol className="space-y-1.5 p-4 leading-relaxed" aria-label="Exemple de trace d’exécution d’un agent">
								{TRACE.map((l, i) => (
									<li key={i} className={`flex gap-3 transition-opacity duration-300 ${i < lines ? 'opacity-100' : 'opacity-0'}`}>
										<span className="text-dim shrink-0">{l.t}</span>
										<span className={`${tone[l.s]} w-11 shrink-0 uppercase`}>{l.s}</span>
										<span className="text-ink/85 break-all">{l.m}</span>
									</li>
								))}
								<li className="text-signal" aria-hidden>
									<span className="animate-blink">▋</span>
								</li>
							</ol>
							<p className="text-dim border-t border-white/5 px-4 py-3 text-[11px]">Trace illustrative — données fictives, architecture réelle.</p>
						</div>
					</Reveal>
				</div>
			</div>
		</section>
	);
}
