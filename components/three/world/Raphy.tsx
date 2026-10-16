'use client';

import { type ThreeElements, useFrame, useLoader } from '@react-three/fiber';
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

/**
 * Hologram look: a faint body, a bright rim where the surface turns away from the eye, scanlines rolling upward and a
 * light flicker. Additive, no lighting, guarded against NaN (zero-length vectors) because the bloom spreads them.
 */
const holoMaterial = new THREE.ShaderMaterial({
	uniforms: { uTime: { value: 0 } },
	vertexColors: true,
	transparent: true,
	depthWrite: false,
	blending: THREE.AdditiveBlending,
	toneMapped: false,
	vertexShader: /* glsl */ `
		varying vec3 vColor;
		varying vec3 vNormalW;
		varying vec3 vWorld;
		void main() {
			vColor = color;
			vec4 w = modelMatrix * vec4(position, 1.0);
			vWorld = w.xyz;
			vNormalW = mat3(modelMatrix) * normal;
			gl_Position = projectionMatrix * viewMatrix * w;
		}
	`,
	fragmentShader: /* glsl */ `
		uniform float uTime;
		varying vec3 vColor;
		varying vec3 vNormalW;
		varying vec3 vWorld;
		void main() {
			vec3 toEye = cameraPosition - vWorld;
			vec3 v = toEye / max(length(toEye), 1e-4);
			vec3 n = vNormalW / max(length(vNormalW), 1e-4);
			float rim = pow(1.0 - clamp(abs(dot(n, v)), 0.0, 1.0), 2.0);
			float scan = 0.55 + 0.45 * sin(vWorld.y * 3.2 - uTime * 2.4);
			float fine = 0.85 + 0.15 * sin(vWorld.y * 40.0 + uTime * 6.0);
			float flicker = 0.92 + 0.08 * sin(uTime * 13.0) * sin(uTime * 7.3);
			vec3 col = vColor * (0.22 * scan * fine + 1.4 * rim) * flicker;
			gl_FragColor = vec4(col, clamp(0.25 + rim, 0.0, 1.0));
		}
	`,
});

type Props = { hologram?: boolean } & ThreeElements['group'];

export function RaphyModel({ hologram = false, ...props }: Props) {
	const g = useRaphyGeometry();
	useFrame((_, dt) => {
		if (hologram) holoMaterial.uniforms.uTime.value += Math.min(dt, 0.05);
	});
	return (
		<group {...props}>
			{hologram ? (
				<mesh geometry={g.body} material={holoMaterial} />
			) : (
				<mesh geometry={g.body} castShadow>
					<meshStandardMaterial vertexColors metalness={0.35} roughness={0.35} emissive="#3b0a66" emissiveIntensity={0.5} />
				</mesh>
			)}
			<mesh geometry={g.eyes}>
				<meshBasicMaterial color="#ffffff" toneMapped={false} />
			</mesh>
		</group>
	);
}
