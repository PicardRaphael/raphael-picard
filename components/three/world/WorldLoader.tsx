'use client';

import dynamic from 'next/dynamic';

const WorldScene = dynamic(() => import('./WorldScene'), { ssr: false });

export function WorldLoader() {
	return <WorldScene />;
}
