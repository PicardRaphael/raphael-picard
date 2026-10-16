'use client';

import { useSyncExternalStore } from 'react';

import { keymap } from '@/lib/keymap';
import { useLayoutLabels } from './StartScreen';

/** Row of small keycaps showing the visitor's own bindings (rendered after mount: bindings live in localStorage). */
export function KeyHints({ className = '', withMouse = false }: { className?: string; withMouse?: boolean }) {
	const label = useLayoutLabels();
	const client = useSyncExternalStore(
		() => () => undefined,
		() => true,
		() => false,
	);
	if (!client) return null;
	const k = keymap.get();
	const items: [string, string][] = [
		[`${label(k.forward[0])}${label(k.left[0])}${label(k.back[0])}${label(k.right[0])}`, 'bouger'],
		[label(k.jump[0]), 'saut'],
		[label(k.attack[0]), 'attaque'],
		[label(k.interact[0]), 'parler'],
		[label(k.map[0]), 'carte'],
		[label(k.menu[0]), 'menu'],
	];
	if (withMouse) items.unshift(['🖱', 'clic : aller · glisser : caméra']);
	return (
		<ul className={`flex flex-wrap items-center gap-x-3 gap-y-1.5 ${className}`} aria-label="Raccourcis">
			{items.map(([key, what]) => (
				<li key={what} className="flex items-center gap-1.5 text-xs text-white/85 drop-shadow">
					<kbd className="min-w-7 rounded-md border border-b-2 border-white/35 bg-black/65 px-1.5 py-0.5 text-center font-mono text-xs font-semibold text-white">
						{key}
					</kbd>
					{what}
				</li>
			))}
		</ul>
	);
}

/**
 * First steps: a large controls card at the bottom right, so nobody wonders which key to press. It stays until the
 * hero has walked away from the start and opened a first place, then gives way to the compact row.
 */
export function ControlsCard({ className = '' }: { className?: string }) {
	const label = useLayoutLabels();
	const client = useSyncExternalStore(
		() => () => undefined,
		() => true,
		() => false,
	);
	if (!client) return null;
	const k = keymap.get();
	const rows: [string[], string][] = [
		[[label(k.forward[0]), label(k.left[0]), label(k.back[0]), label(k.right[0])], 'se déplacer (ou les flèches)'],
		[['clic'], 'aller là où tu cliques · glisser : caméra'],
		[[label(k.interact[0])], 'parler, entrer dans un lieu (ou clic sur la bulle)'],
		[[label(k.attack[0])], 'attaquer un bug (ou clic dessus)'],
		[[label(k.map[0]), label(k.menu[0])], 'carte · menu'],
	];
	return (
		<section
			className={`rounded-2xl border border-[#f5c451]/40 bg-black/70 p-4 shadow-[0_0_30px_-6px_rgba(245,196,81,0.45)] backdrop-blur-md ${className}`}
			aria-label="Commandes"
		>
			<p className="mb-2.5 font-mono text-[11px] tracking-[0.2em] text-[#f5c451] uppercase">Commandes</p>
			<ul className="space-y-2">
				{rows.map(([keys, what]) => (
					<li key={what} className="flex items-center gap-3 text-sm text-white/90">
						<span className="flex min-w-[7.5rem] gap-1">
							{keys.map((key) => (
								<kbd
									key={key}
									className="min-w-8 rounded-lg border border-b-[3px] border-white/40 bg-white/10 px-2 py-1 text-center font-mono text-sm font-bold text-white"
								>
									{key}
								</kbd>
							))}
						</span>
						{what}
					</li>
				))}
			</ul>
		</section>
	);
}
