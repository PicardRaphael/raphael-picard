'use client';

import dynamic from 'next/dynamic';

// three.js stays out of the server bundle and off the critical path: the hero text paints first.
const SpaceScene = dynamic(() => import('./SpaceScene'), { ssr: false });

export function SceneLoader() {
	return <SpaceScene />;
}
