'use client';

import { useGLTF } from '@react-three/drei';
import { Suspense, useEffect, useMemo } from 'react';
import * as THREE from 'three';

import { HOUSES, LAKE, LANDMARKS, PATHS, landmark, valHeight } from '@/lib/world';
import { bakeGeometry } from './bake';
import { addRigLights } from './LightRig';
import { preloadSf } from './SfModel';
import { Warmup } from './Warmup';

// fetched with the rest of the val, not once the lanterns render
preloadSf('street_lamp');

/**
 * Street lamps along the roads ("Stylized Street Lamp" by lazarys, Sketchfab, CC BY 4.0: a timber post with a
 * hanging lantern, the arm reaching over the road) and warm lights on the key buildings.
 */
const LAMP_H = 4.4;
// the hanging lantern, relative to the model's centred base (model units scaled to LAMP_H)
const LANTERN: [number, number, number] = [0.5, 2.95, 0.08];

/** Soft round halo drawn once, shared by every lantern. */
let haloTex: THREE.Texture | null = null;
function halo() {
	if (haloTex) return haloTex;
	const c = document.createElement('canvas');
	c.width = c.height = 64;
	const ctx = c.getContext('2d');
	if (ctx) {
		const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
		g.addColorStop(0, 'rgba(255,220,150,1)');
		g.addColorStop(0.3, 'rgba(255,170,70,0.45)');
		g.addColorStop(1, 'rgba(255,140,40,0)');
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, 64, 64);
	}
	haloTex = new THREE.CanvasTexture(c);
	return haloTex;
}

type Spot = { x: number; z: number; rot: number };

/**
 * Every lamp post of the val in a handful of draw calls: one InstancedMesh per sub-mesh of the model (normalised
 * exactly like SfModel: LAMP_H tall, centred, standing on its base), one for the glowing bulbs, and the halos as
 * a single cloud of point sprites. The model's MeshPhysicalMaterial becomes a standard one (same look on painted
 * timber, cheaper per pixel).
 */
function LampPosts({ spots, bulbs, lampMat, haloMat }: { spots: Spot[]; bulbs: THREE.Vector3[]; lampMat: THREE.Material; haloMat: THREE.PointsMaterial }) {
	const { scene } = useGLTF('/models/sf/street_lamp.glb');
	const meshes = useMemo(() => {
		scene.updateMatrixWorld(true);
		const box = new THREE.Box3();
		scene.traverseVisible((o) => {
			if ((o as THREE.Mesh).isMesh) box.expandByObject(o, true);
		});
		const size = box.getSize(new THREE.Vector3());
		const k = LAMP_H / Math.max(size.y, 0.001);
		const centre = box.getCenter(new THREE.Vector3());
		const m = new THREE.Matrix4();
		const q = new THREE.Quaternion();
		const up = new THREE.Vector3(0, 1, 0);
		const one = new THREE.Vector3(1, 1, 1);
		const at = spots.map((s) => m.clone().compose(new THREE.Vector3(s.x, valHeight(s.x, s.z) - 0.1, s.z), q.setFromAxisAngle(up, s.rot), one));
		const list: THREE.InstancedMesh[] = [];
		scene.traverseVisible((o) => {
			const mesh = o as THREE.Mesh;
			if (!mesh.isMesh) return;
			const g = bakeGeometry(mesh.geometry, mesh.matrixWorld);
			g.translate(-centre.x, -box.min.y, -centre.z);
			g.scale(k, k, k);
			const src = mesh.material as THREE.MeshStandardMaterial;
			const mat = new THREE.MeshStandardMaterial().copy(src);
			if (src.transparent && src.map) {
				mat.transparent = false;
				mat.depthWrite = true;
				mat.alphaTest = 0.5;
			}
			const inst = new THREE.InstancedMesh(g, mat, at.length);
			at.forEach((mm, i) => inst.setMatrixAt(i, mm));
			inst.castShadow = true;
			inst.receiveShadow = true;
			inst.computeBoundingSphere();
			list.push(inst);
		});
		const bulb = new THREE.InstancedMesh(new THREE.SphereGeometry(0.13, 10, 8), lampMat, bulbs.length);
		bulbs.forEach((b, i) => bulb.setMatrixAt(i, m.makeTranslation(b.x, b.y, b.z)));
		bulb.computeBoundingSphere();
		list.push(bulb);
		return list;
	}, [scene, spots, bulbs, lampMat]);
	const halos = useMemo(() => {
		const g = new THREE.BufferGeometry().setFromPoints(bulbs);
		const pts = new THREE.Points(g, haloMat);
		pts.frustumCulled = false;
		return pts;
	}, [bulbs, haloMat]);
	useEffect(
		() => () => {
			meshes.forEach((m) => m.dispose());
			halos.geometry.dispose();
		},
		[meshes, halos],
	);
	return (
		<>
			{meshes.map((m) => (
				<primitive key={m.uuid} object={m} />
			))}
			<primitive object={halos} />
		</>
	);
}

/**
 * The lanterns' lights are candidates of the shared light pool (LightRig): the light count never changes here.
 */
export function Lanterns({ night, on = true }: { night: number; on?: boolean }) {
	const spots = useMemo(() => {
		const list: Spot[] = [];
		for (const line of PATHS) {
			for (let i = 0; i < line.length - 1; i++) {
				const [ax, az] = line[i];
				const [bx, bz] = line[i + 1];
				const len = Math.hypot(bx - ax, bz - az);
				const n = Math.floor(len / 14);
				for (let k = 1; k <= n; k++) {
					const t = k / (n + 1);
					// offset to the side of the road
					const nx = -(bz - az) / len;
					const nz = (bx - ax) / len;
					// the arm (model +X) points back over the road
					list.push({ x: ax + (bx - ax) * t + nx * 3.2, z: az + (bz - az) * t + nz * 3.2, rot: Math.atan2(nz, -nx) });
				}
			}
		}
		// never inside a house, a landmark or the lake
		return list.filter(
			(p) =>
				HOUSES.every((h) => Math.hypot(p.x - h.x, p.z - h.z) > h.c + 2.5) &&
				LANDMARKS.every((l) => l.zone !== 'val' || Math.hypot(p.x - l.x, p.z - l.z) > l.radius + (l.id === 'portal' ? 10 : 3)) &&
				Math.hypot(p.x - LAKE.x, p.z - LAKE.z) > LAKE.r + 2,
		);
	}, []);

	// a few real lights on the places that matter; the rest are emissive only
	const keyLights = useMemo(() => {
		const ids = ['forge', 'tower', 'raphy', 'stones'];
		const pts = ids.map((id) => {
			const l = landmark(id);
			return { x: l.x + 3, z: l.z + 3 };
		});
		const tavern = HOUSES[1];
		if (tavern) pts.push({ x: tavern.x + 4, z: tavern.z + 4 });
		return pts;
	}, []);

	const lampMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ffd59a', emissive: '#ffb347', toneMapped: false }), []);
	// the 2.2 m sprites of before: a point sprite's size is divided by the distance only, a sprite's also by the
	// tangent of half the field of view (55°: tan 27.5° ≈ 0.52)
	const haloMat = useMemo(() => new THREE.PointsMaterial({ map: halo(), size: 2.2 / 0.52, sizeAttenuation: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }), []);
	useEffect(() => {
		lampMat.emissiveIntensity = 0.6 + night * 3.4;
		haloMat.opacity = 0.25 + night * 0.75;
	}, [lampMat, haloMat, night]);

	// world position of every hanging lantern
	const bulbs = useMemo(
		() =>
			spots.map((s) => {
				const c = Math.cos(s.rot);
				const sn = Math.sin(s.rot);
				return new THREE.Vector3(s.x + LANTERN[0] * c + LANTERN[2] * sn, valHeight(s.x, s.z) - 0.1 + LANTERN[1], s.z - LANTERN[0] * sn + LANTERN[2] * c);
			}),
		[spots],
	);
	// every lantern and key building is a candidate of the shared light pool (LightRig), which lights the nearest
	const lit = useMemo(
		() => ({
			bulbs: bulbs.map((b) => ({ pos: b.clone(), color: new THREE.Color('#ffb45c'), intensity: 0, distance: 14, decay: 1.5 })),
			keys: keyLights.map((p) => ({ pos: new THREE.Vector3(p.x, valHeight(p.x, p.z) + 4, p.z), color: new THREE.Color('#ffb347'), intensity: 0, distance: 22, decay: 1.6 })),
		}),
		[bulbs, keyLights],
	);
	useEffect(() => addRigLights([...lit.bulbs, ...lit.keys]), [lit]);
	useEffect(() => {
		for (const b of lit.bulbs) b.intensity = on ? 6 + night * 34 : 0;
		for (const k of lit.keys) k.intensity = on && night > 0.2 ? 40 * night : 0;
	}, [lit, on, night]);

	return (
		<group>
			<Suspense fallback={null}>
				<LampPosts spots={spots} bulbs={bulbs} lampMat={lampMat} haloMat={haloMat} />
				<Warmup />
			</Suspense>
		</group>
	);
}
