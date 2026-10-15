'use client';

import { HOUSES, landmark, valHeight } from '@/lib/world';
import { SfModel, preloadSf } from './SfModel';

/**
 * Every building of the valley comes from the same hand-painted village pack (CC BY 4.0), split per house,
 * so roofs, timber and stone share one palette. Heights keep the pack's own proportions.
 */
const MODELS: Record<string, { file: string; height: number }> = {
	house_a: { file: 'v_house_a', height: 12.2 },
	house_c: { file: 'v_house_c', height: 9.5 },
};
preloadSf('v_house_a', 'v_house_c', 'v_tower_house', 'blacksmith');

export function Village() {
	const forge = landmark('forge');
	const tower = landmark('tower');
	return (
		<group>
			{HOUSES.map((h, i) => {
				const m = MODELS[h.type];
				return <SfModel key={i} file={m.file} height={m.height * h.s} position={[h.x, valHeight(h.x, h.z) - 0.3, h.z]} rotation={[0, h.r, 0]} />;
			})}
			<SfModel file="blacksmith" height={9} position={[forge.x, valHeight(forge.x, forge.z) - 0.2, forge.z]} rotation={[0, 0.6, 0]} />
			<SfModel file="v_tower_house" height={26} position={[tower.x, valHeight(tower.x, tower.z) - 0.3, tower.z]} rotation={[0, 0.3, 0]} />
		</group>
	);
}
