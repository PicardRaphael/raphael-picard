'use client';

import { useMemo } from 'react';

import { NEXUS_CENTER } from '@/lib/world';

const LIGHT_COLORS = ['#ff2bd6', '#22d3ee', '#ff8a00', '#a855f7'];

/**
 * Ground under the Hong Kong blocks (their own road and pavements sit on top) and neon street light:
 * coloured lights staggered along both pavements of the canyon.
 */
export function Street() {
	const lights = useMemo(() => {
		const list: { x: number; z: number; c: string }[] = [];
		for (let i = 0; i < 8; i++) list.push({ x: i % 2 ? 11 : -11, z: NEXUS_CENTER.z + 76 - i * 21, c: LIGHT_COLORS[i % LIGHT_COLORS.length] });
		return list;
	}, []);
	return (
		<group>
			<mesh position={[NEXUS_CENTER.x, -0.06, NEXUS_CENTER.z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
				<planeGeometry args={[520, 520]} />
				{/* wet asphalt: the joins between the city blocks never show a seam, and the side streets catch the neon */}
				<meshStandardMaterial color="#1b1d24" metalness={0.5} roughness={0.35} />
			</mesh>
			{lights.map((l, i) => (
				<pointLight key={i} position={[l.x, 7, l.z]} color={l.c} intensity={90} distance={34} decay={1.5} />
			))}
		</group>
	);
}
