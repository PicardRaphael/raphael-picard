'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

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
			{/* the lighthouse spire sits off the model's centre: shift the model so the spire stands on the landmark */}
			<CareerSigns />
			<SfModel file="v_tower_house" height={26} position={[tower.x + 5.0, valHeight(tower.x, tower.z) - 0.3, tower.z + 2.4]} rotation={[0, 0.3, 0]} />
		</group>
	);
}

/** The three career houses, in the order the road reads them: each wears a dated sign, so walking north reads the CV. */
const CAREER = [
	{ id: 'leasys', title: 'Garage Leasys', years: '2018 – 2022' },
	{ id: 'schoolmouv', title: 'Atelier Schoolmouv', years: '2022' },
	{ id: 'royal', title: 'Comptoir Royal Canin', years: '2022 – 2025' },
];

/** A painted wooden board: name in gold, years below. Lit by the scene like the houses, with a faint glow for the night. */
function signTexture(title: string, years: string) {
	const c = document.createElement('canvas');
	c.width = 512;
	c.height = 192;
	const ctx = c.getContext('2d');
	if (ctx) {
		const wood = ctx.createLinearGradient(0, 0, 0, 192);
		wood.addColorStop(0, '#6b4424');
		wood.addColorStop(1, '#4a2d16');
		ctx.fillStyle = wood;
		ctx.fillRect(0, 0, 512, 192);
		ctx.strokeStyle = '#2a170a';
		ctx.lineWidth = 12;
		ctx.strokeRect(6, 6, 500, 180);
		ctx.fillStyle = 'rgba(0,0,0,0.12)';
		for (let y = 22; y < 192; y += 26) ctx.fillRect(12, y, 488, 3);
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.shadowColor = 'rgba(0,0,0,0.6)';
		ctx.shadowBlur = 6;
		ctx.fillStyle = '#ffd36b';
		let px = 54;
		do ctx.font = `700 ${px--}px Georgia, serif`;
		while (ctx.measureText(title).width > 460 && px > 20);
		ctx.fillText(title, 256, 78);
		ctx.fillStyle = '#f5e6c8';
		ctx.font = '600 40px Georgia, serif';
		ctx.fillText(years, 256, 140);
	}
	const t = new THREE.CanvasTexture(c);
	t.colorSpace = THREE.SRGBColorSpace;
	t.anisotropy = 4;
	return t;
}

export function CareerSigns() {
	const signs = useMemo(
		() =>
			CAREER.map((c) => {
				const l = landmark(c.id);
				// on the side of the house that faces the north road (x = 0)
				const dx = -l.x;
				const len = Math.max(Math.abs(dx), 1e-3);
				const x = l.x + (dx / len) * (l.solid + 2.2);
				const z = l.z + 1.5;
				const map = signTexture(c.title, c.years);
				return {
					...c,
					x,
					z,
					y: valHeight(x, z),
					yaw: Math.sign(dx) * (Math.PI / 2),
					mat: new THREE.MeshStandardMaterial({ map, emissiveMap: map, emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.35, roughness: 0.8, side: THREE.DoubleSide }),
				};
			}),
		[],
	);
	const post = useMemo(() => new THREE.MeshStandardMaterial({ color: '#3d2614', roughness: 0.9 }), []);
	return (
		<>
			{signs.map((s) => (
				<group key={s.id} position={[s.x, s.y, s.z]} rotation={[0, s.yaw, 0]}>
					{[-1.15, 1.15].map((px) => (
						<mesh key={px} position={[px, 1.4, 0]} material={post} castShadow>
							<boxGeometry args={[0.18, 2.8, 0.18]} />
						</mesh>
					))}
					<mesh position={[0, 2.35, 0.02]} material={s.mat} castShadow>
						<planeGeometry args={[2.7, 1.0]} />
					</mesh>
				</group>
			))}
		</>
	);
}
