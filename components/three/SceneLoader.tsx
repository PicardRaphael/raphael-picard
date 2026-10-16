'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// three.js stays out of the server bundle and off the critical path: the hero text paints first.
const SpaceScene = dynamic(() => import('./SpaceScene'), { ssr: false });

/**
 * The space background is a bonus: never on small CPUs or data saver (the CSS backdrop stays). Computers load it once
 * the page is idle or the visitor interacts; phones (6 cores or more) only on the first touch or scroll, in their light
 * version, so the text always paints and responds first.
 */
export function SceneLoader() {
	const [ready, setReady] = useState(false);
	useEffect(() => {
		const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
		const phone = window.matchMedia('(max-width: 767px)').matches;
		const cores = navigator.hardwareConcurrency ?? 8;
		if (cores <= 4 || (phone && cores < 6) || conn?.saveData) return;
		let done = false;
		const go = () => {
			if (done) return;
			done = true;
			setReady(true);
		};
		const events = ['pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'] as const;
		events.forEach((e) => window.addEventListener(e, go, { once: true, passive: true }));
		const idle = !phone && 'requestIdleCallback' in window;
		const id = idle ? window.requestIdleCallback(go, { timeout: 6000 }) : 0;
		const t = idle ? 0 : globalThis.setTimeout(go, phone ? 8000 : 3000);
		return () => {
			events.forEach((e) => window.removeEventListener(e, go));
			if (id) window.cancelIdleCallback(id);
			if (t) clearTimeout(t);
		};
	}, []);
	return ready ? <SpaceScene /> : null;
}
