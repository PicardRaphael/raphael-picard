'use client';

import Lenis from 'lenis';
import { useEffect } from 'react';

import { sceneState } from '@/lib/scene-state';

/**
 * Global client behaviours: smooth scroll, pointer tracking for the 3D scene
 * and the spotlight borders of `.spotlight` cards.
 */
export function Experience() {
	useEffect(() => {
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const lenis = reduced ? null : new Lenis({ lerp: 0.09, anchors: { offset: -72 }, autoRaf: true });

		const onPointer = (e: PointerEvent) => {
			sceneState.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
			sceneState.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
			const card = (e.target as Element | null)?.closest?.<HTMLElement>('.spotlight');
			if (card) {
				const r = card.getBoundingClientRect();
				card.style.setProperty('--mx', `${e.clientX - r.left}px`);
				card.style.setProperty('--my', `${e.clientY - r.top}px`);
			}
		};
		const onLeave = () => {
			sceneState.pointer.x = 9;
			sceneState.pointer.y = 9;
		};
		window.addEventListener('pointermove', onPointer, { passive: true });
		document.documentElement.addEventListener('pointerleave', onLeave);
		return () => {
			lenis?.destroy();
			window.removeEventListener('pointermove', onPointer);
			document.documentElement.removeEventListener('pointerleave', onLeave);
		};
	}, []);

	return null;
}
