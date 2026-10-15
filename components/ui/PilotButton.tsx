'use client';

import { game } from '@/lib/game-store';

export function PilotButton() {
	return (
		<button
			type="button"
			onClick={() => game.set({ mode: 'pilot' })}
			className="group border-signal/40 text-signal hover:bg-signal/10 flex items-center gap-2 rounded-full border px-5 py-3 font-mono text-sm font-medium transition-colors"
		>
			<span className="grid h-5 w-5 place-items-center rounded border border-current text-[0.6rem]" aria-hidden>
				▲
			</span>
			Mode pilote
		</button>
	);
}
