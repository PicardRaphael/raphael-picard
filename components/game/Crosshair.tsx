'use client';

import { useEffect, useState } from 'react';

import { useGame } from '@/lib/game-store';
import { keymap } from '@/lib/keymap';

/** First-person reticle, fixed at the centre of the screen like any FPS. */
export function Crosshair() {
	const hero = useGame((s) => s.hero);
	const started = useGame((s) => s.started);
	const busy = useGame((s) => Boolean(s.panel || s.overlay));
	const [locked, setLocked] = useState(false);
	const [free, setFree] = useState(false);
	const active = hero === 'runner' && started && !busy;

	useEffect(() => {
		const on = () => setLocked(Boolean(document.pointerLockElement));
		document.addEventListener('pointerlockchange', on);
		const onFree = (e: Event) => setFree((e as CustomEvent<boolean>).detail);
		window.addEventListener('fps:cursor', onFree);
		const canvas = document.querySelector('canvas');
		if (canvas && active && !free) canvas.style.cursor = 'none';
		return () => {
			document.removeEventListener('pointerlockchange', on);
			window.removeEventListener('fps:cursor', onFree);
			if (canvas) canvas.style.cursor = '';
		};
	}, [active, free]);

	if (!active) return null;
	const keyName = keymap.get().cursor[0] === 'AltLeft' ? 'Alt' : keymap.get().cursor[0].replace('Key', '');
	return (
		<>
			<div className="pointer-events-none fixed top-1/2 left-1/2 z-20 h-6 w-6 -translate-x-1/2 -translate-y-1/2" aria-hidden>
				<span className="absolute top-1/2 left-0 h-px w-2 bg-[#5ef2ff] shadow-[0_0_6px_#5ef2ff]" />
				<span className="absolute top-1/2 right-0 h-px w-2 bg-[#5ef2ff] shadow-[0_0_6px_#5ef2ff]" />
				<span className="absolute top-0 left-1/2 h-2 w-px bg-[#5ef2ff] shadow-[0_0_6px_#5ef2ff]" />
				<span className="absolute bottom-0 left-1/2 h-2 w-px bg-[#5ef2ff] shadow-[0_0_6px_#5ef2ff]" />
				<span className="absolute top-1/2 left-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff4fd8]" />
			</div>
			{(free || !locked) && (
				<p className="pointer-events-none fixed top-[57%] left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/60 px-4 py-1.5 font-mono text-xs text-[#5ef2ff] pointer-coarse:hidden">
					{free ? `Souris libre · ${keyName} pour reprendre la visée` : `Souris = visée · ${keyName} pour libérer la souris`}
				</p>
			)}
		</>
	);
}
