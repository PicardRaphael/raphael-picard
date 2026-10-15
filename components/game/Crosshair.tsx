'use client';

import { useEffect, useRef } from 'react';

import { useGame } from '@/lib/game-store';

/** First-person reticle that follows the mouse (the system cursor is hidden while aiming). */
export function Crosshair() {
	const hero = useGame((s) => s.hero);
	const started = useGame((s) => s.started);
	const busy = useGame((s) => Boolean(s.panel || s.overlay));
	const ref = useRef<HTMLDivElement>(null);
	const active = hero === 'runner' && started && !busy;

	useEffect(() => {
		if (!active) return;
		const canvas = document.querySelector('canvas');
		if (canvas) canvas.style.cursor = 'none';
		const move = (e: PointerEvent) => {
			if (e.pointerType !== 'mouse' || !ref.current) return;
			ref.current.style.transform = `translate(${e.clientX - 12}px, ${e.clientY - 12}px)`;
		};
		window.addEventListener('pointermove', move);
		return () => {
			window.removeEventListener('pointermove', move);
			if (canvas) canvas.style.cursor = '';
		};
	}, [active]);

	if (!active) return null;
	return (
		<div
			ref={ref}
			className="pointer-events-none fixed top-0 left-0 z-20 h-6 w-6 pointer-coarse:top-1/2 pointer-coarse:left-1/2 pointer-coarse:-translate-1/2"
			style={{ transform: 'translate(calc(50vw - 12px), calc(50vh - 12px))' }}
			aria-hidden
		>
			<span className="absolute top-1/2 left-0 h-px w-2 bg-[#5ef2ff] shadow-[0_0_6px_#5ef2ff]" />
			<span className="absolute top-1/2 right-0 h-px w-2 bg-[#5ef2ff] shadow-[0_0_6px_#5ef2ff]" />
			<span className="absolute top-0 left-1/2 h-2 w-px bg-[#5ef2ff] shadow-[0_0_6px_#5ef2ff]" />
			<span className="absolute bottom-0 left-1/2 h-2 w-px bg-[#5ef2ff] shadow-[0_0_6px_#5ef2ff]" />
			<span className="absolute top-1/2 left-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff4fd8]" />
		</div>
	);
}
