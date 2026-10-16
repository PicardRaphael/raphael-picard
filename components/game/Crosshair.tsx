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
	const [firstPerson, setFirstPerson] = useState(true);
	const active = hero === 'runner' && firstPerson && started && !busy;

	useEffect(() => {
		const on = () => setLocked(Boolean(document.pointerLockElement));
		document.addEventListener('pointerlockchange', on);
		const onFree = (e: Event) => setFree((e as CustomEvent<boolean>).detail);
		window.addEventListener('fps:cursor', onFree);
		const onView = (e: Event) => setFirstPerson((e as CustomEvent<boolean>).detail);
		window.addEventListener('fps:view', onView);
		const canvas = document.querySelector('canvas');
		if (canvas && active && !free) canvas.style.cursor = 'none';
		return () => {
			document.removeEventListener('pointerlockchange', on);
			window.removeEventListener('fps:cursor', onFree);
			window.removeEventListener('fps:view', onView);
			if (canvas) canvas.style.cursor = '';
		};
	}, [active, free]);

	if (!active) return null;
	const keyName = keymap.get().cursor[0] === 'AltLeft' ? 'Alt' : keymap.get().cursor[0].replace('Key', '');
	return (
		<>
			{/* one SVG, drawn on whole pixels around the exact centre: the dot sits right between the four ticks */}
			<svg className="pointer-events-none fixed top-1/2 left-1/2 z-20 -mt-[12.5px] -ml-[12.5px] drop-shadow-[0_0_4px_#5ef2ff]" width="25" height="25" viewBox="0 0 25 25" aria-hidden>
				<g stroke="#5ef2ff" strokeWidth="1" shapeRendering="crispEdges">
					<line x1="0" y1="12.5" x2="8" y2="12.5" />
					<line x1="17" y1="12.5" x2="25" y2="12.5" />
					<line x1="12.5" y1="0" x2="12.5" y2="8" />
					<line x1="12.5" y1="17" x2="12.5" y2="25" />
				</g>
				<circle cx="12.5" cy="12.5" r="2" fill="#ff4fd8" />
			</svg>
			{(free || !locked) && (
				<p className="pointer-events-none fixed top-[57%] left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/60 px-4 py-1.5 font-mono text-xs text-[#5ef2ff] pointer-coarse:hidden">
					{free ? `Souris libre · ${keyName} pour reprendre la visée` : `Souris = visée · ${keyName} pour libérer la souris`}
				</p>
			)}
		</>
	);
}
