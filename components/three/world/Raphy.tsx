'use client';

import { type ThreeElements, useLoader } from '@react-three/fiber';
import { useMemo } from 'react';
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';

/**
 * The "Raphy" R logo, extruded in 3D from the brand SVG: violet → magenta body, two white eyes.
 * Used as the quest giver in the valley and as a giant hologram in the Nexus.
 */
export function useRaphyGeometry() {
	const svg = useLoader(SVGLoader, '/logo/logo-sombre.svg');
	return useMemo(() => {
		const body: THREE.BufferGeometry[] = [];
		const eyes: THREE.BufferGeometry[] = [];
		svg.paths.forEach((path) => {
			const style = (path.userData?.style ?? {}) as { fill?: string; opacity?: number; fillOpacity?: number };
			const fill = String(style.fill ?? '');
			const opacity = Number(style.opacity ?? 1) * Number(style.fillOpacity ?? 1);
			const isEye = /#fff|white|rgb\(255,\s*255,\s*255\)/i.test(fill);
			if (!isEye && opacity < 1) return; // skip the multiply shadow layer
			const shapes = SVGLoader.createShapes(path);
			shapes.forEach((shape) => {
				const g = new THREE.ExtrudeGeometry(shape, { depth: isEye ? 14 : 22, bevelEnabled: true, bevelThickness: 2, bevelSize: 1.5, bevelSegments: 2, curveSegments: 10 });
				(isEye ? eyes : body).push(g);
			});
		});
		const merge = (list: THREE.BufferGeometry[]) => {
			const positions: number[] = [];
			const normals: number[] = [];
			list.forEach((g) => {
				const ng = g.index ? g.toNonIndexed() : g;
				positions.push(...(ng.attributes.position.array as Float32Array));
				normals.push(...(ng.attributes.normal.array as Float32Array));
			});
			const m = new THREE.BufferGeometry();
			m.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
			m.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
			return m;
		};
		const b = merge(body);
		const e = merge(eyes);
		// SVG space: y down, ~150 x 165 units → centre, flip, scale to ~1 unit
		const fix = (g: THREE.BufferGeometry) => {
			g.translate(-76, -84, -11);
			g.scale(1 / 82, -1 / 82, 1 / 82);
			g.computeVertexNormals();
		};
		fix(b);
		fix(e);
		e.translate(0, 0, 0.06);
		// vertical gradient baked as vertex colours (violet bottom-left → magenta top-right)
		const pos = b.attributes.position;
		const colors = new Float32Array(pos.count * 3);
		const a = new THREE.Color('#651fff');
		const c = new THREE.Color('#c50eff');
		const t = new THREE.Color();
		for (let i = 0; i < pos.count; i++) {
			const k = THREE.MathUtils.clamp((pos.getX(i) + pos.getY(i)) * 0.5 + 0.5, 0, 1);
			t.copy(a).lerp(c, k);
			colors.set([t.r, t.g, t.b], i * 3);
		}
		b.setAttribute('color', new THREE.BufferAttribute(colors, 3));
		return { body: b, eyes: e };
	}, [svg]);
}

type Props = { hologram?: boolean } & ThreeElements['group'];

export function RaphyModel({ hologram = false, ...props }: Props) {
	const g = useRaphyGeometry();
	return (
		<group {...props}>
			<mesh geometry={g.body} castShadow={!hologram}>
				{hologram ? (
					<meshBasicMaterial vertexColors transparent opacity={0.55} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
				) : (
					<meshStandardMaterial vertexColors metalness={0.35} roughness={0.35} emissive="#3b0a66" emissiveIntensity={0.5} />
				)}
			</mesh>
			<mesh geometry={g.eyes}>
				<meshBasicMaterial color="#ffffff" toneMapped={false} />
			</mesh>
		</group>
	);
}
