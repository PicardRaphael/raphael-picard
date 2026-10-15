'use client';

import { About } from '@/components/sections/About';
import { Architecture } from '@/components/sections/Architecture';
import { Contact } from '@/components/sections/Contact';
import { Expertise } from '@/components/sections/Expertise';
import { Journey } from '@/components/sections/Journey';
import { Portal } from '@/components/sections/Portal';
import { Projects } from '@/components/sections/Projects';
import { MotionProvider } from '@/components/ui/MotionProvider';
import { experiences, projects } from '@/content/work';
import { game, useGame } from '@/lib/game-store';
import { QUESTS } from '@/lib/quests';
import { landmark } from '@/lib/world';

/** Quest dialog of an NPC: offer, progress or turn-in. */
function QuestBlock({ id }: { id: string }) {
	const quests = useGame((s) => s.quests);
	const visited = useGame((s) => s.visited);
	const offer = QUESTS.find((q) => q.giver === id && quests[q.id] === 'available');
	const ready = QUESTS.find((q) => q.turnIn === id && quests[q.id] === 'ready');
	const active = QUESTS.find((q) => (q.giver === id || q.turnIn === id) && quests[q.id] === 'active');
	const q = ready ?? offer ?? active;
	if (!q) return null;
	return (
		<div className="rounded-2xl border border-[#ffd100]/40 bg-black/40 p-5 sm:p-6">
			<p className="font-mono text-xs tracking-widest text-[#ffd100] uppercase">
				{ready ? 'Quête terminée' : offer ? 'Nouvelle quête' : 'Quête en cours'} · {q.title}
			</p>
			<p className="mt-3 text-lg leading-relaxed text-[#f3e9cf]">{ready ? q.outro : q.intro}</p>
			{!ready && (
				<ul className="mt-4 space-y-1.5">
					{q.objectives.map((o) => (
						<li key={o.id} className={visited.includes(o.id) ? 'text-white/45 line-through' : 'text-[#e8dcc0]'}>
							◆ {o.label}
						</li>
					))}
				</ul>
			)}
			{ready && (
				<p className="mt-4 flex items-center gap-3 text-[#ffd100]">
					<span className="grid h-10 w-10 place-items-center rounded-lg border border-[#ffd100] bg-[#ffd100]/15">★</span>
					Récompense : {q.reward.title}
				</p>
			)}
			{(offer || ready) && (
				<button
					onClick={() => (ready ? game.complete(ready.id) : offer && game.accept(offer.id))}
					className="mt-5 rounded-xl bg-[#ffd100] px-5 py-2.5 font-semibold text-black transition hover:brightness-110"
				>
					{ready ? 'Terminer la quête' : 'Accepter la quête'}
				</button>
			)}
		</div>
	);
}

/** Raphy reacts to where the visitor stands in the story instead of repeating the same line. */
const RAPHY_TIPS = [
	'Astuce : les bugs du val ont chacun une fiche « problème / parade ». Retrouve-les toutes dans le Bestiaire du menu.',
	'Neuf ans de développement web avant de mettre des agents IA en production : la Forge raconte ce chemin.',
	'La Tour du Savoir garde ses compétences : agents, RAG, MCP, évaluation, FinOps.',
	'Le Cercle de pierres porte son manifeste : des agents utiles, mesurés et sûrs.',
	'Tu préfères lire tranquillement ? La « Version classique » en haut à gauche ouvre le portfolio en une page.',
];
function raphyLine(g: ReturnType<typeof game.get>) {
	const intro = 'Je suis Raphy, la mascotte de Raphaël Picard, ingénieur IA à Lyon : il conçoit des agents qui tournent en production et forme les équipes à l’IA.';
	if (g.quests.origines === 'available') return intro + ' Bienvenue dans le Val des Origines !';
	if (g.quests.origines === 'active') {
		const left = ['forge', 'tower', 'stones'].filter((id) => !g.visited.includes(id)).map((id) => landmark(id).name);
		return left.length ? `Il te reste à voir : ${left.join(', ')}. Suis les « ? » dorés.` : 'Tu as tout vu ! Reviens me parler pour terminer la quête.';
	}
	if (g.quests.parcours === 'active') {
		const left = ['leasys', 'schoolmouv', 'royal'].filter((id) => !g.visited.includes(id)).map((id) => landmark(id).name);
		return left.length ? `Les maisons du val t’attendent : ${left.join(', ')}.` : 'Tu connais tout son parcours ! Reviens me parler pour terminer la quête.';
	}
	if (g.flags.includes('nexus')) return `De retour du Nexus ! ${g.kills} bug${g.kills > 1 ? 's' : ''} corrigé${g.kills > 1 ? 's' : ''} jusqu’ici. Raphy·OS t’attend là-bas pour la suite.`;
	if (g.quests.portail === 'active' || g.quests.portail === 'available') return 'Le Portail arcanique t’attend au bout du chemin, au nord : de l’autre côté, l’ère des agents.';
	return RAPHY_TIPS[(g.kills + g.visited.length) % RAPHY_TIPS.length];
}

const NPC_TEXT: Record<string, string> = {
	holo: 'Raphy·OS en ligne. Depuis novembre 2025, Raphaël est Senior AI Engineer & Responsable IA chez Neoteem.',
	portal: 'Une arche ancienne parcourue d’énergie arcanique. Marche dedans pour rejoindre le Nexus : l’ère des agents.',
	'portal-back': 'Ce portail te ramène au Val des Origines.',
	race: 'Le défi du Nexus arrive bientôt.',
};

/** A chapter of the career (an entry of the CV), shown in a career house of the val. */
const CAREER: Record<string, string> = { royal: 'Royal Canin', schoolmouv: 'Schoolmouv', leasys: 'Aixia' };
function CareerChapter({ id }: { id: string }) {
	const e = experiences.find((x) => x.company.includes(CAREER[id]));
	if (!e) return null;
	return (
		<div className="mx-auto max-w-3xl space-y-5 px-4 sm:px-6">
			<p className="font-mono text-xs tracking-widest text-[#ffd100] uppercase">{e.period}</p>
			<h3 className="font-display text-3xl font-bold text-white">
				{e.role} · <span className="text-[#ffd100]">{e.company}</span>
			</h3>
			<p className="text-white/70">{e.context}</p>
			<ul className="space-y-2">
				{e.points.map((pt) => (
					<li key={pt} className="text-lg leading-relaxed text-white/90">
						◆ {pt}
					</li>
				))}
			</ul>
			<p className="flex flex-wrap gap-1.5">
				{e.stack.map((t) => (
					<span key={t} className="rounded-md bg-white/10 px-2 py-0.5 font-mono text-xs text-white/80">
						{t}
					</span>
				))}
			</p>
			<QuestBlock id={id} />
		</div>
	);
}

/** A production agent presented by its kiosk in the Nexus. */
function ProductionAgent({ id }: { id: string }) {
	const p = projects.find((x) => x.name.toLowerCase() === id);
	if (!p) return null;
	return (
		<div className="mx-auto max-w-3xl space-y-5 px-4 sm:px-6">
			<p className="font-mono text-xs tracking-widest text-[#5ef2ff] uppercase">{p.kind}</p>
			<h3 className="font-display text-3xl font-bold text-white">{p.name}</h3>
			<p className="text-xl leading-relaxed text-white/90">{p.pitch}</p>
			<ul className="space-y-2">
				{p.highlights.map((h) => (
					<li key={h} className="text-lg leading-relaxed text-white/85">
						<span className="text-[#5ef2ff]">▸</span> {h}
					</li>
				))}
			</ul>
			<p className="flex flex-wrap gap-1.5">
				{p.stack.map((t) => (
					<span key={t} className="rounded-md bg-white/10 px-2 py-0.5 font-mono text-xs text-white/80">
						{t}
					</span>
				))}
			</p>
			<QuestBlock id={id} />
		</div>
	);
}

/** Each place opens the matching visual section of the classic portfolio. */
function Body({ id }: { id: string }) {
	switch (id) {
		case 'forge':
			return <Journey />;
		case 'tower':
			return <About />;
		case 'stones':
			return <Portal />;
		case 'agents':
			return <Expertise />;
		case 'core':
			return <Architecture />;
		case 'gallery':
			return <Projects />;
		case 'royal':
		case 'schoolmouv':
		case 'leasys':
			return <CareerChapter id={id} />;
		case 'neochat':
		case 'neodoc':
		case 'neomail':
			return <ProductionAgent id={id} />;
		case 'beacon':
			return (
				<>
					<div className="mx-auto max-w-7xl px-4 sm:px-6">
						<QuestBlock id="beacon" />
					</div>
					<Contact />
				</>
			);
		default:
			return (
				<div className="mx-auto max-w-3xl space-y-5 px-4 sm:px-6">
					{(id === 'raphy' || NPC_TEXT[id]) && <p className="text-xl leading-relaxed text-white/90">{id === 'raphy' ? raphyLine(game.get()) : NPC_TEXT[id]}</p>}
					<QuestBlock id={id} />
				</div>
			);
	}
}

export function Panel() {
	const id = useGame((s) => s.panel);
	if (!id) return null;
	const l = landmark(id);
	const nexus = l.zone === 'nexus';
	return (
		<div className="fixed inset-0 z-40 flex items-center justify-center p-2 sm:p-5" role="dialog" aria-modal="true" aria-label={l.name}>
			<button className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" aria-label="Fermer" onClick={() => game.set({ panel: null })} />
			<div
				className={`panel-sections relative flex max-h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-3xl border-2 shadow-2xl ${
					nexus ? 'border-[#8b5cf6]/70 bg-[#07050f]/95 shadow-[#651fff]/40' : 'border-[#c8a35a]/70 bg-[#0d0a18]/95 shadow-[#c8a35a]/20'
				}`}
			>
				<div className={`flex items-center justify-between gap-4 border-b px-5 py-3 ${nexus ? 'border-[#8b5cf6]/30' : 'border-[#c8a35a]/30'}`}>
					<p className={`font-display text-lg font-bold ${nexus ? 'text-[#e879f9]' : 'text-[#ffd100]'}`}>{l.name}</p>
					<button onClick={() => game.set({ panel: null })} className="rounded-lg border border-white/20 px-3 py-1 font-mono text-sm text-white hover:bg-white/10" autoFocus>
						Échap ✕
					</button>
				</div>
				<div className="overflow-y-auto py-8" data-lenis-prevent>
					<MotionProvider>
						<Body id={id} />
					</MotionProvider>
				</div>
			</div>
		</div>
	);
}
