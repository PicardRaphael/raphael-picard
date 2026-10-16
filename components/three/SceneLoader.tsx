'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// three.js stays out of the server bundle and off the critical path: the hero text paints first.
const SpaceScene = dynamic(() => import('./SpaceScene'), { ssr: false });

/**
 * The space background is a bonus: never on phones, small CPUs or data saver (the CSS backdrop stays), and on other
 * devices only once the page is idle or the visitor interacts, so the text paints and responds first.
 */
export function SceneLoader() {
	const [ready, setReady] = useState(false);
	useEffect(() => {
		const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
		if (window.matchMedia('(max-width: 767px)').matches || (navigator.hardwareConcurrency ?? 8) <= 4 || conn?.saveData) return;
		let done = false;
		const go = () => {
			if (done) return;
			done = true;
			setReady(true);
		};
		const events = ['pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'] as const;
		events.forEach((e) => window.addEventListener(e, go, { once: true, passive: true }));
		const id = 'requestIdleCallback' in window ? window.requestIdleCallback(go, { timeout: 6000 }) : 0;
		const t = 'requestIdleCallback' in window ? 0 : globalThis.setTimeout(go, 3000);
		return () => {
			events.forEach((e) => window.removeEventListener(e, go));
			if (id) window.cancelIdleCallback(id);
			if (t) clearTimeout(t);
		};
	}, []);
	return ready ? <SpaceScene /> : null;
}
