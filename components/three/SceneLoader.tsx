'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// three.js stays out of the server bundle and off the critical path: the hero text paints first.
const SpaceScene = dynamic(() => import('./SpaceScene'), { ssr: false });

/** The space background starts once the browser is idle, so the page is readable and interactive first. */
export function SceneLoader() {
	const [ready, setReady] = useState(false);
	useEffect(() => {
		const go = () => setReady(true);
		if ('requestIdleCallback' in window) {
			const id = window.requestIdleCallback(go, { timeout: 2500 });
			return () => window.cancelIdleCallback(id);
		}
		const t = setTimeout(go, 1200);
		return () => clearTimeout(t);
	}, []);
	return ready ? <SpaceScene /> : null;
}
