'use client';

import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

import { Reveal } from '@/components/ui/Reveal';

type Node = { id: string; label: string; sub: string; x: number; y: number; detail: string };

const NODES: Node[] = [
	{ id: 'user', label: 'Gestionnaire', sub: 'question métier', x: 76, y: 170, detail: 'Une question sur ses données, ses mails ou ses documents, posée comme à un collègue ; la réponse arrive en streaming (SSE).' },
	{ id: 'agent', label: 'Agent ReAct', sub: 'LangGraph · Gemini', x: 242, y: 170, detail: 'Un moteur déclaratif : l’agent est décrit (état, prompt, outils, interruptions), son graphe LangGraph en est dérivé. 5 outils de données et 8 outils mail et documents, toujours chargés ; des invariants sont vérifiés avant chaque appel d’outil, et un outil manquant fait échouer l’agent explicitement.' },
	{ id: 'catalog', label: 'Catalogue sémantique', sub: 'outil · pgvector HNSW', x: 410, y: 70, detail: 'Recherche sémantique dans le catalogue, l’un des 5 outils génériques servis par la passerelle : l’agent y trouve la vue ou le rapport pertinent. Couvrir un nouveau sujet = publier une vue documentée, pas écrire un outil.' },
	{ id: 'hitl', label: 'Contrôle humain', sub: '5 points de contrôle', x: 410, y: 280, detail: 'Interruptions LangGraph : choix entre homonymes, destinataire, rédaction, aperçu avant envoi, confirmation de suppression. Aucun mail ne part sans validation humaine.' },
	{ id: 'gateway', label: 'Passerelle IA', sub: 'Hono · Zod · OpenAPI', x: 578, y: 170, detail: 'Seule porte d’accès aux données, en lecture seule par construction : identité tirée du jeton vérifié, vues découvertes par introspection d’un schéma dédié, colonnes validées, opérateurs en liste fermée, paramètres liés, SELECT uniquement, rapports en liste blanche. Délais bornés, erreurs RFC 9457 sans SQL, client HTTP généré depuis l’OpenAPI.' },
	{ id: 'data', label: 'Vues métier', sub: '42 vues SQL', x: 744, y: 90, detail: 'Un schéma de vues SQL dédié à l’IA, une base par client choisie par le déploiement, jamais par la requête. Résultats paginés par curseur opaque : jamais de liste tronquée présentée comme complète.' },
	{ id: 'obs', label: 'Traces & évals', sub: 'Langfuse · DeepEval', x: 744, y: 260, detail: 'En production : chaque étape tracée dans Langfuse sous un nom lisible par le métier, coût et latence par agent, retours utilisateurs. Avant chaque release : golden set de 64 cas × 5 tirages avec DeepEval — Answer Relevancy, Faithfulness (fidélité aux données récupérées), critères métier G-Eval, contrôle déterministe des outils appelés.' },
];

const EDGES: [string, string][] = [
	['user', 'agent'],
	['agent', 'hitl'],
	['agent', 'gateway'],
	['gateway', 'catalog'],
	['gateway', 'data'],
	['agent', 'obs'],
];

const TRACE = [
	{ t: '00.000', s: 'info', m: 'question="Quels sont les impayés de Mme Martin ?" · identité ← jeton vérifié' },
	{ t: '00.940', s: 'llm', m: 'raisonnement → appel resoudre_nom("Martin")' },
	{ t: '00.941', s: 'route', m: 'invariants vérifiés avant l’appel d’outil ✓' },
	{ t: '01.180', s: 'tool', m: 'resoudre_nom → 2 homonymes' },
	{ t: '01.182', s: 'hitl', m: 'interruption LangGraph → « Laquelle ? » [lot 12 · lot 31]' },
	{ t: '07.905', s: 'hitl', m: 'reprise → Mme Martin, lot 12' },
	{ t: '08.770', s: 'llm', m: 'appel rechercher_catalogue("impayés locataire")' },
	{ t: '08.960', s: 'tool', m: 'catalogue (pgvector) → vue « impayés »' },
	{ t: '09.880', s: 'llm', m: 'appel lire_vue(impayés, filtre=locataire, tri=échéance, limite=50)' },
	{ t: '10.140', s: 'tool', m: 'lire_vue → 3 lignes · liste complète (aucun curseur suivant) [SELECT seul]' },
	{ t: '11.020', s: 'llm', m: 'réponse en streaming SSE : montants lus dans la vue, aucun calcul par le modèle' },
	{ t: '12.310', s: 'ok', m: 'trace Langfuse : 4 appels LLM, 3 outils · coût et latence par agent' },
];

const tone: Record<string, string> = {
	info: 'text-mist',
	route: 'text-signal',
	hitl: 'text-[#ffb45c]',
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
	const [active, setActive] = useState('agent');
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
					<p className="text-mist mt-4 max-w-2xl">L’architecture de NeoChat, en production : cliquez sur un composant pour voir son rôle, et suivez une question type traverser le système.</p>
				</Reveal>

				<div className="mt-12 grid gap-6 xl:grid-cols-[1.45fr_1fr] [&>*]:min-w-0">
					<Reveal className="glass rounded-3xl p-3 sm:p-5">
						<p className="text-dim mb-2 font-mono text-[11px] sm:hidden" aria-hidden>← faites glisser le schéma →</p>
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
											<rect x={-74} y={-30} width={148} height={60} rx={14} fill={selected ? '#1d1240' : '#0d0a1f'} stroke={selected ? '#e879f9' : '#ffffff22'} strokeWidth={selected ? 1.6 : 1} filter={selected ? 'url(#glow)' : undefined} />
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
								<span className="text-dim ml-3 text-xs">trace · NeoChat · exemple</span>
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
