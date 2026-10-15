'use client';

import { About } from '@/components/sections/About';
import { Architecture } from '@/components/sections/Architecture';
import { Contact } from '@/components/sections/Contact';
import { Expertise } from '@/components/sections/Expertise';
import { Journey } from '@/components/sections/Journey';
import { Portal } from '@/components/sections/Portal';
import { Projects } from '@/components/sections/Projects';
import { MotionProvider } from '@/components/ui/MotionProvider';
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

const NPC_TEXT: Record<string, string> = {
	raphy: 'Je suis Raphy, la mascotte de Raphaël Picard : ingénieur IA à Lyon, il conçoit des agents qui tournent en production et forme les équipes à l’IA.',
	holo: 'Raphy·OS en ligne. Depuis novembre 2025, Raphaël est Senior AI Engineer & Responsable IA chez Neoteem.',
	portal: 'Une arche ancienne parcourue d’énergie arcanique. Marche dedans pour rejoindre le Nexus : l’ère des agents.',
	'portal-back': 'Ce portail te ramène au Val des Origines.',
	race: 'Le défi du Nexus arrive bientôt.',
};

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
					{NPC_TEXT[id] && <p className="text-xl leading-relaxed text-white/90">{NPC_TEXT[id]}</p>}
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
