'use client';

import { useEffect } from 'react';

import { game, useGame } from '@/lib/game-store';
import { mobs } from '@/lib/mobs';

/** "Problem → fix" card shown when a bug is defeated. Stays until closed (or 14 s). */
export function BugCard() {
	const id = useGame((s) => s.bugCard);
	useEffect(() => {
		if (id === null) return;
		const t = setTimeout(() => game.set({ bugCard: null }), 14000);
		return () => clearTimeout(t);
	}, [id]);
	if (id === null) return null;
	const m = mobs[id];
	const nexus = m.zone === 'nexus';
	return (
		<div
			key={id}
			role="status"
			className={`fixed bottom-24 left-1/2 z-30 w-[min(92vw,30rem)] -translate-x-1/2 animate-[zone-in_14s_ease-out_forwards] rounded-2xl border-2 p-5 shadow-2xl backdrop-blur-xl ${
				nexus ? 'border-[#ff4fd8]/60 bg-[#0b0614]/92 shadow-[#ff4fd8]/20' : 'border-[#c8a35a]/70 bg-[#1a1209]/92 shadow-[#c8a35a]/20'
			}`}
		>
			<div className="flex items-start justify-between gap-3">
				<div>
					<p className="font-mono text-[0.65rem] tracking-[0.25em] text-[#a3e635] uppercase">Bug corrigé ✓</p>
					<p className={`font-display mt-1 text-2xl font-bold ${nexus ? 'text-[#ff7ae6]' : 'text-[#ffd100]'}`}>{m.name}</p>
				</div>
				<button onClick={() => game.set({ bugCard: null })} className="rounded-md border border-white/20 px-2 py-0.5 text-sm text-white/80 hover:bg-white/10" aria-label="Fermer la fiche">
					✕
				</button>
			</div>
			<div className="mt-4 grid gap-3 sm:grid-cols-2">
				<div className="rounded-xl bg-[#ef4444]/10 p-3">
					<p className="text-xs font-bold tracking-wider text-[#f87171] uppercase">Le problème</p>
					<p className="mt-1 text-sm leading-relaxed text-white/90">{m.problem}</p>
				</div>
				<div className="rounded-xl bg-[#22c55e]/10 p-3">
					<p className="text-xs font-bold tracking-wider text-[#4ade80] uppercase">La parade de Raphaël</p>
					<p className="mt-1 text-sm leading-relaxed text-white/90">{m.lesson}</p>
				</div>
			</div>
		</div>
	);
}
