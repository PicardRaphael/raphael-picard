'use client';

import { useEffect, useState } from 'react';

import { game, useGame, useScreenFree } from '@/lib/game-store';
import { mobs } from '@/lib/mobs';

/** « Bornée, pas vaincue : les chiffres viennent… ; … » → the verdict and the first measure, for a glance mid-fight. */
function gist(lesson: string) {
	const clip = (t: string) => (t.length > 130 ? `${t.slice(0, 127).trimEnd()}…` : t);
	const [head, ...rest] = lesson.split(' : ');
	if (!rest.length) return { head: '', first: clip(lesson.split(/ ; |\. /)[0] ?? lesson) };
	return { head, first: clip(rest.join(' : ').split(/ ; |\. /)[0] ?? '') };
}

/**
 * "Problem → fix" card when a bug is defeated: a compact note in the top-left corner (never over the crosshair or the
 * touch controls) that fades after 7 s; « Détails » unfolds the full problem and fix and keeps it open.
 */
export function BugCard() {
	const id = useGame((s) => s.bugCard);
	const [open, setOpen] = useState<number | null>(null);
	const expanded = open !== null && open === id;
	// a bug beaten just before the portal waits for the zone banner
	const free = useScreenFree(id);
	useEffect(() => {
		if (id === null || expanded || !free) return;
		const t = setTimeout(() => game.set({ bugCard: null }), 7000);
		return () => clearTimeout(t);
	}, [id, expanded, free]);
	if (id === null || !free) return null;
	const m = mobs[id];
	const nexus = m.zone === 'nexus';
	const g = gist(m.lesson);
	return (
		<div
			key={id}
			role="status"
			className={`fixed top-16 left-3 z-30 w-[min(88vw,24rem)] rounded-xl border p-3 shadow-2xl backdrop-blur-xl max-sm:top-14 pointer-coarse:top-14 pointer-coarse:left-[104px] pointer-coarse:w-[min(38vw,20rem)] [@media(max-height:500px)]:p-2.5 ${
				expanded ? 'max-h-[70vh] overflow-y-auto' : 'animate-[zone-in_7s_ease-out_forwards]'
			} ${nexus ? 'border-[#ff4fd8]/60 bg-[#0b0614]/90' : 'border-[#c8a35a]/70 bg-[#1a1209]/90'}`}
		>
			<div className="flex items-start justify-between gap-2">
				<p className="min-w-0">
					<span className="font-mono text-[0.6rem] tracking-[0.22em] text-[#a3e635] uppercase">Bug corrigé ✓</span>
					<span className={`font-display block text-lg leading-tight font-bold ${nexus ? 'text-[#ff7ae6]' : 'text-[#ffd100]'}`}>{m.name}</span>
				</p>
				<button onClick={() => game.set({ bugCard: null })} className="shrink-0 rounded-md border border-white/20 px-2 py-0.5 text-sm text-white/80 hover:bg-white/10" aria-label="Fermer la fiche">
					✕
				</button>
			</div>
			{expanded ? (
				<div className="mt-2 space-y-2 text-sm leading-relaxed text-white/90">
					<p>
						<b className="text-[#f87171]">Le problème : </b>
						{m.problem}
					</p>
					<p>
						<b className="text-[#4ade80]">La parade de Raphaël : </b>
						{m.lesson}
					</p>
				</div>
			) : (
				<p className="mt-1.5 text-sm leading-snug text-white/90 [@media(max-height:500px)]:text-xs">
					{g.head && <b className="text-[#4ade80]">{g.head}. </b>}
					{g.first}
				</p>
			)}
			{!expanded && (
				<button onClick={() => setOpen(id)} className="mt-1.5 text-xs text-[#7dd3fc] underline-offset-4 hover:underline">
					Détails (aussi dans le Bestiaire du menu)
				</button>
			)}
		</div>
	);
}
