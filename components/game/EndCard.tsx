'use client';

import { useEffect, useRef } from 'react';

import { openPitch30 } from '@/components/ui/Pitch30';
import { ACHIEVEMENTS, unlocked } from '@/lib/achievements';
import { game, useGame } from '@/lib/game-store';
import { mobs } from '@/lib/mobs';
import { QUESTS } from '@/lib/quests';
import { site } from '@/lib/site';
import { LANDMARKS } from '@/lib/world';

const share = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(site.url)}`;

/**
 * The end of the adventure, once the last main quest is handed in at the beacon: what the visitor did, and the three
 * things to do next (CV, contact, share). A card made to be screenshotted.
 */
export function EndCard() {
	const show = useGame((s) => s.ending && s.panel === null && s.overlay === null);
	const g = useGame((s) => s);
	const first = useRef<HTMLAnchorElement>(null);

	useEffect(() => {
		if (!show) return;
		if (document.pointerLockElement) document.exitPointerLock();
		first.current?.focus();
		const key = (e: KeyboardEvent) => {
			if (e.key !== 'Escape') return;
			e.stopImmediatePropagation();
			game.set({ ending: false });
		};
		window.addEventListener('keydown', key, true);
		return () => window.removeEventListener('keydown', key, true);
	}, [show]);

	if (!show) return null;
	const done = QUESTS.filter((q) => g.quests[q.id] === 'done').length;
	const feats = unlocked(g).length;
	const stats = [
		{ value: `${done}/${QUESTS.length}`, label: 'quêtes accomplies' },
		// bugs if the visitor hunted, otherwise the places explored: never a bare « 0/19 »
		g.kills > 0
			? { value: `${Math.min(g.kills, mobs.length)}/${mobs.length}`, label: 'pannes d’IA corrigées' }
			: { value: `${LANDMARKS.filter((l) => g.visited.includes(l.id)).length}/${LANDMARKS.length}`, label: 'lieux explorés' },
		{ value: `${feats}/${ACHIEVEMENTS.length}`, label: 'hauts faits' },
	];
	const close = () => game.set({ ending: false });

	return (
		<div role="dialog" aria-modal="true" aria-labelledby="end-title" className="fixed inset-0 z-[65] flex items-center justify-center bg-black/60 p-3 backdrop-blur-[2px]">
			<div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-[#c50eff]/50 bg-[#0b0920]/95 p-5 text-center text-white shadow-[0_0_90px_-15px_rgb(197_14_255_/_0.85)] sm:p-7 [@media(max-height:500px)]:p-4">
				<div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#651fff] via-[#c50eff] to-[#5ef2ff]" />
				<p className="font-mono text-[11px] tracking-[0.22em] text-[#7dd3fc] uppercase">Aventure terminée</p>
				<h2 id="end-title" className="font-display mt-2 text-2xl font-extrabold sm:text-3xl [@media(max-height:500px)]:text-xl">
					Tu connais maintenant Raphaël.
				</h2>
				<p className="mx-auto mt-2 max-w-md text-sm text-white/80">
					Du val des origines aux agents en production : 8+ ans de code, 7 agents IA en service, et chaque panne apprivoisée. Le prochain chapitre peut s’écrire avec ton équipe.
				</p>
				<ul className="mt-4 grid grid-cols-3 gap-2 [@media(max-height:500px)]:mt-2">
					{stats.map((s) => (
						<li key={s.label} className="rounded-xl border border-white/10 bg-white/5 px-2 py-2.5">
							<span className="font-display block text-xl font-extrabold text-[#e879f9] sm:text-2xl">{s.value}</span>
							<span className="text-[11px] leading-tight text-white/70">{s.label}</span>
						</li>
					))}
				</ul>
				<div className="mt-5 flex flex-wrap justify-center gap-2 text-sm [@media(max-height:500px)]:mt-3">
					<a ref={first} href="/raphael-picard-cv-senior-ai-engineer-responsable-ia.pdf" download className="rounded-full bg-gradient-to-r from-[#651fff] to-[#c50eff] px-5 py-2.5 font-semibold">
						Télécharger le CV
					</a>
					<a href="/portfolio#ecrire" target="_blank" rel="noopener" className="rounded-full border border-white/25 px-4 py-2.5 hover:bg-white/10">
						Écrire à Raphaël
					</a>
					<a href={share} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/25 px-4 py-2.5 hover:bg-white/10">
						Partager sur LinkedIn
					</a>
				</div>
				<div className="mt-3 flex flex-wrap justify-center gap-4 text-sm text-white/70">
					<button type="button" onClick={openPitch30} className="underline-offset-4 hover:text-white hover:underline">
						Revoir le résumé en 30 s
					</button>
					<button type="button" onClick={close} className="underline-offset-4 hover:text-white hover:underline">
						Continuer à explorer
					</button>
				</div>
			</div>
		</div>
	);
}
