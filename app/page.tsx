import type { Metadata } from 'next';

import { GameUI } from '@/components/game/GameUI';
import { WorldLoader } from '@/components/three/world/WorldLoader';
import { site } from '@/lib/site';

export const metadata: Metadata = {
	title: { absolute: 'Raphaël Picard — Ingénieur IA · un portfolio à explorer en 3D' },
	description: `${site.description} Un monde 3D à explorer au clavier : quêtes, portail et Nexus des agents.`,
	alternates: { canonical: '/' },
};

/** Landing: the explorable world. The full readable portfolio lives at /portfolio. */
export default function Home() {
	return (
		<main className="fixed inset-0 overflow-hidden bg-[#1a0d2e]">
			<WorldLoader />
			<GameUI />
		</main>
	);
}
