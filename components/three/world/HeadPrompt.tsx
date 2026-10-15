'use client';

import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type * as THREE from 'three';

import { game, useGame } from '@/lib/game-store';
import { keymap } from '@/lib/keymap';
import { player } from '@/lib/player-state';
import { landmark } from '@/lib/world';
import { isFps } from './Player';

/** The "E — interact" bubble floats above the hero's head, like an MMO interaction prompt. */
export function HeadPrompt() {
	const id = useGame((s) => s.inRange);
	const panel = useGame((s) => s.panel);
	const ref = useRef<THREE.Group>(null);
	useFrame(() => {
		ref.current?.position.set(player.x, player.y + 2.9, player.z);
	});
	if (!id || panel || isFps()) return null;
	const key = keymap.get().interact[0]?.replace('Key', '') ?? 'E';
	return (
		<group ref={ref}>
			<Html center zIndexRange={[20, 0]} style={{ pointerEvents: 'auto' }}>
				<button
					onClick={() => {
						game.set({ panel: id });
						game.visit(id);
					}}
					className="rounded-xl border border-[#f5c451]/50 bg-black/75 px-3.5 py-1.5 text-sm whitespace-nowrap text-white shadow-[0_0_18px_rgba(245,196,81,0.25)] backdrop-blur-md transition-transform hover:scale-105"
				>
					<span className="mr-2 inline-grid h-6 w-6 place-items-center rounded-md border border-[#f5c451]/70 font-mono text-xs text-[#f5c451]">{key}</span>
					{landmark(id).hint}
				</button>
			</Html>
		</group>
	);
}
