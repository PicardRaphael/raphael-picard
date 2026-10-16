'use client';

import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

import { NEXUS_CENTER, nexusWalkable } from '@/lib/world';
import { SfModel } from './SfModel';

/**
 * The Nexus streets: "Full Gameready City Buildings III [HongKong]" by abhayexe (Sketchfab, CC BY 4.0), a whole
 * Hong Kong corner block with its road, laid out twice face to face to form a neon canyon. At night the windows
 * and shop fronts glow; real brand panels are tinted into anonymous neon.
 */
const URL = '/models/sf/hk_block.glb';

/** Block placements around the Nexus centre (x, z, rotation). Tuned live in dev through window.__city. */
export const CITY_BLOCKS: { x: number; z: number; r: number }[] = [
	// the block's main road runs along its X axis at z 10–27 m, buildings on the −z side:
	// turned a quarter so the road follows the Nexus axis, and mirrored across the road for the far side
	{ x: -18.5, z: 42, r: Math.PI / 2 },
	{ x: 18.5, z: 42, r: (3 * Math.PI) / 2 },
	{ x: -18.5, z: -42, r: Math.PI / 2 },
	{ x: 18.5, z: -42, r: (3 * Math.PI) / 2 },
];

/**
 * Night facades: only the bright parts of the daylight photo texture (windows, shop fronts, signs) glow;
 * walls stay dark instead of the whole facade being lit like a lightbox.
 */
function litWindowsOnly(shader: { fragmentShader: string }) {
	shader.fragmentShader = shader.fragmentShader.replace(
		'#include <emissivemap_fragment>',
		`#ifdef USE_EMISSIVEMAP
			vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
			float lit = mix( 0.05, 1.25, smoothstep( 0.5, 0.78, dot( emissiveColor.rgb, vec3( 0.299, 0.587, 0.114 ) ) ) );
			totalEmissiveRadiance *= emissiveColor.rgb * lit;
		#endif`,
	);
}

export function NexusCity() {
	const { scene } = useGLTF(URL);
	const blocks = useMemo(() => {
		// night city: every lit window and shop front glows from its own texture; one glowing material per source
		// material, shared by the four blocks
		const glow = new Map<THREE.Material, THREE.Material>();
		const night = (src: THREE.MeshStandardMaterial) => {
			let mat = glow.get(src);
			if (!mat) {
				const m = src.clone();
				// the city's normal maps yield NaN pixels on some GPUs (ANGLE/D3D11) that bloom spreads over the whole frame:
				// dropped, invisible at night and cheaper anyway
				m.normalMap = null;
				if (m.map) {
					m.emissiveMap = m.map;
					m.emissive = new THREE.Color('#ffd9b0');
					m.emissiveIntensity = 0.85;
					// the daylight photo walls sink into the night: only windows, shop fronts and the neon read
					m.color.multiplyScalar(0.42);
					m.onBeforeCompile = litWindowsOnly;
					m.customProgramCacheKey = () => 'nexus-lit-windows';
				}
				glow.set(src, (mat = m));
			}
			return mat;
		};
		return CITY_BLOCKS.map(() => {
			const clone = scene.clone(true);
			clone.traverse((o) => {
				const m = o as THREE.Mesh;
				if (!m.isMesh) return;
				m.castShadow = false;
				m.receiveShadow = true;
				// zero-length tangents on some facades (NaN under bloom): three derives them in the shader instead
				if (m.geometry.attributes.tangent) m.geometry.deleteAttribute('tangent');
				m.material = night(m.material as THREE.MeshStandardMaterial);
			});
			return clone;
		});
	}, [scene]);
	// compile the city's shaders in parallel as soon as it arrives, long before the visitor walks in
	const root = useRef<THREE.Group>(null);
	const { gl, camera, scene: world } = useThree();
	useEffect(() => {
		if (root.current) gl.compileAsync(root.current, camera, world).catch(() => {});
	}, [gl, camera, world]);
	const refs = useRef<(THREE.Group | null)[]>([]);
	useFrame(() => {
		CITY_BLOCKS.forEach((b, i) => {
			const g = refs.current[i];
			if (!g) return;
			// mirrored blocks share the road: sink them a hair so the two road surfaces never fight
			g.position.set(NEXUS_CENTER.x + b.x, i % 2 ? -0.03 : 0, NEXUS_CENTER.z + b.z);
			g.rotation.y = b.r;
		});
	});
	if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') Object.assign(window, { __city: CITY_BLOCKS });
	return (
		<group ref={root}>
			<NexusSigns />
			{blocks.map((obj, i) => (
				<group
					key={i}
					ref={(g) => {
						refs.current[i] = g;
					}}
				>
					<primitive object={obj} />
				</group>
			))}
		</group>
	);
}

/**
 * Neon blade signs and panels hung on both facades of the avenue (alexbescg and mcmanusmedia, Sketchfab,
 * CC BY 4.0), skipping the mouths of the side streets.
 */
const SIGNS = (() => {
	const list: { x: number; y: number; z: number; r: number; file: string; h: number }[] = [];
	let i = 0;
	for (let z = NEXUS_CENTER.z + 80; z > NEXUS_CENTER.z - 84; z -= 11) {
		for (const side of [-1, 1]) {
			i++;
			// no sign where a side street opens
			if (nexusWalkable(side * 22, z)) continue;
			const blade = i % 3 !== 0;
			list.push({
				x: side * (blade ? 15.2 : 15.9),
				y: 4.5 + ((i * 7) % 4) * 2.2,
				z: z + ((i * 5) % 3) - 1,
				r: side < 0 ? Math.PI / 2 : -Math.PI / 2,
				file: blade ? 'neon_sign' : 'neon_sign2',
				h: blade ? 5.5 : 2.6,
			});
		}
	}
	return list;
})();

/** The same sign model repeats along the avenue: each copy glows in its own colour. */
const SIGN_TINTS = ['#ff2bd6', '#22d3ee', '#ffb45c', '#a855f7', '#ffffff'];

export function NexusSigns() {
	return (
		<>
			{SIGNS.map((g, i) => (
				<SfModel key={i} file={g.file} height={g.h} glow={4} tint={SIGN_TINTS[i % SIGN_TINTS.length]} shadows={false} position={[g.x, g.y, g.z]} rotation={[0, g.r, 0]} />
			))}
		</>
	);
}
