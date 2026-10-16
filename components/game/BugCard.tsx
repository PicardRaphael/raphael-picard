'use client';

import { useEffect, useState } from 'react';

import { game, useGame, useScreenFree } from '@/lib/game-store';
import { bugVoiceText, lessonGist, mobs } from '@/lib/mobs';
import { useVoice, voice, voiceClip } from '@/lib/voice';

/** « Bornée, pas vaincue : les chiffres viennent… » → the verdict and the first measure, for a glance mid-fight. */
function gist(lesson: string) {
	const clip = (t: string) => (t.length > 130 ? `${t.slice(0, 127).trimEnd()}…` : t);
	const g = lessonGist(lesson);
	return { head: g.head, first: clip(g.first) };
}

/**
 * "Problem → fix" card when a bug is defeated: a compact speech bubble centred above the hero (about a fifth of the way
 * down the screen, never over the FPS crosshair at the centre nor the touch controls in the corners) that fades after
 * 7 s; « Détails » unfolds the full problem and fix and keeps it open, still above the crosshair.
 * With the sound on, the verdict and the first measure are read aloud, unless a quest line is playing (never over it);
 * closing the card, or the next bug, cuts the reading.
 */
export function BugCard() {
	const id = useGame((s) => s.bugCard);
	const [open, setOpen] = useState<number | null>(null);
	const expanded = open !== null && open === id;
	// a bug beaten just before the portal waits for the zone banner
	const free = useScreenFree(id);
	const clip = id === null ? null : voiceClip(`bug-${id}`, bugVoiceText(mobs[id]));
	const playing = useVoice();
	useEffect(() => {
		if (id === null || expanded || !free) return;
		const t = setTimeout(() => game.set({ bugCard: null }), 7000);
		return () => clearTimeout(t);
	}, [id, expanded, free]);
	useEffect(() => {
		if (!clip || !free) return;
		voice.offer(clip);
		return () => {
			if (voice.current() === clip) voice.stop();
		};
	}, [clip, free]);
	if (id === null || !free) return null;
	const m = mobs[id];
	const nexus = m.zone === 'nexus';
	const g = gist(m.lesson);
	return (
		<div
			key={id}
			role="status"
			className={`fixed top-[19vh] left-1/2 z-30 w-[min(86vw,23rem)] -translate-x-1/2 rounded-xl border p-3 shadow-2xl backdrop-blur-xl [@media(max-height:500px)]:top-[15vh] [@media(max-height:500px)]:w-[min(56vw,20rem)] [@media(max-height:500px)]:p-2 ${
				expanded ? '' : 'animate-[zone-in_7s_ease-out_forwards]'
			} ${nexus ? 'border-[#ff4fd8]/60 bg-[#0b0614]/90' : 'border-[#c8a35a]/70 bg-[#1a1209]/90'}`}
		>
			{/* the tail of the bubble, pointing down at the hero */}
			<span
				aria-hidden
				className={`absolute -bottom-[7px] left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-r border-b ${nexus ? 'border-[#ff4fd8]/60 bg-[#0b0614]' : 'border-[#c8a35a]/70 bg-[#1a1209]'}`}
			/>
			<div className="flex items-start justify-between gap-2">
				<p className="min-w-0">
					<span className="font-mono text-[0.6rem] tracking-[0.22em] text-[#a3e635] uppercase">Bug corrigé ✓</span>
					<span className={`font-display block text-lg leading-tight font-bold [@media(max-height:500px)]:text-base ${nexus ? 'text-[#ff7ae6]' : 'text-[#ffd100]'}`}>{m.name}</span>
				</p>
				<div className="flex shrink-0 gap-1">
					{clip && playing === clip && (
						<button onClick={() => voice.stop()} className="rounded-md border border-white/20 px-2 py-0.5 text-sm text-white/80 hover:bg-white/10" aria-label="Arrêter la lecture">
							■
						</button>
					)}
					<button onClick={() => game.set({ bugCard: null })} className="rounded-md border border-white/20 px-2 py-0.5 text-sm text-white/80 hover:bg-white/10" aria-label="Fermer la fiche">
						✕
					</button>
				</div>
			</div>
			{expanded ? (
				// scrolls inside the bubble: it never grows down to the crosshair
				<div className="mt-2 max-h-[20vh] space-y-2 overflow-y-auto text-sm leading-relaxed text-white/90 [@media(max-height:500px)]:max-h-[11vh] [@media(max-height:500px)]:text-xs">
					<p>
						<b className="text-[#f87171]">Le problème : </b>
						{m.problem}
					</p>
					<p>
						<b className="text-[#4ade80]">La parade de Raphaël : </b>
						{m.lesson}
					</p>
				</div>
			) : (
				<p className="mt-1.5 line-clamp-3 text-sm [@media(max-height:500px)]:mt-1 leading-snug text-white/90 [@media(max-height:500px)]:line-clamp-2 [@media(max-height:500px)]:text-xs">
					{g.head && <b className="text-[#4ade80]">{g.head}. </b>}
					{g.first}
				</p>
			)}
			{!expanded && (
				<button onClick={() => setOpen(id)} className="mt-1.5 text-xs text-[#7dd3fc] underline-offset-4 hover:underline [@media(max-height:500px)]:hidden">
					Détails (aussi dans le Bestiaire du menu)
				</button>
			)}
		</div>
	);
}
