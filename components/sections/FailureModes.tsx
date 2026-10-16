import { Reveal } from '@/components/ui/Reveal';
import { mobs } from '@/lib/mobs';

/**
 * The bestiary of the game, readable without playing: every way an agent breaks in production,
 * and the fix applied (the same texts as the bug cards, lib/mobs.ts).
 */
export function FailureModes() {
	return (
		<section id="pannes" aria-labelledby="pannes-title" className="relative py-20 sm:py-28">
			<div className="mx-auto max-w-7xl px-4 sm:px-6">
				<Reveal>
					<p className="eyebrow">VI bis — Bestiaire</p>
					<h2 id="pannes-title" className="font-display mt-4 max-w-3xl text-4xl leading-tight font-bold text-balance sm:text-5xl">
						Ce qui casse un agent en production, <span className="text-gradient">et comment je l’en empêche</span>.
					</h2>
					<p className="text-mist mt-4 max-w-2xl">
						{mobs.length} pannes réelles, chacune avec sa parade. Dans le monde 3D, ce sont les bugs à corriger. Ici, la fiche complète.
					</p>
				</Reveal>
				<ul className="mt-10 grid gap-3 md:grid-cols-2">
					{mobs.map((m) => (
						<li key={m.id}>
							<details className="group glass h-full rounded-2xl p-4 open:border-[#a335ee]/50 sm:p-5">
								<summary className="flex cursor-pointer list-none items-start justify-between gap-3">
									<span>
										<span className="font-display block font-semibold text-white">{m.name}</span>
										<span className="text-mist mt-1 block text-sm leading-relaxed">{m.problem}</span>
									</span>
									<span className="text-orchid mt-0.5 shrink-0 font-mono text-xs transition-transform group-open:rotate-45" aria-hidden>
										＋
									</span>
								</summary>
								<p className="text-ok mt-3 border-t border-white/10 pt-3 text-sm leading-relaxed">{m.lesson}</p>
							</details>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}
