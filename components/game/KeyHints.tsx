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
				<li key={what} className="flex items-center gap-1 text-[11px] text-white/75 drop-shadow">
					<kbd className="min-w-6 rounded-md border border-b-2 border-white/30 bg-black/55 px-1.5 py-0.5 text-center font-mono text-[10px] font-semibold text-white">{key}</kbd>
					{what}
				</li>
			))}
		</ul>
	);
}
