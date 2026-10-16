'use client';

import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';

import { KINDS, type Placement, placements as scatterAll } from '@/lib/vegetation';
import { bakeGeometry } from './bake';

/**
 * Hand-painted vegetation (rudolfs' tree pack, ashkan.fancy's stones — Sketchfab, CC BY 4.0), instanced.
 * Each model is split into its sub-meshes (bark, leaves…), one InstancedMesh per sub-mesh: a constant, small
 * number of draw calls. What each one draws is rebuilt on the CPU when the camera moves: the placements are
 * sorted into 30 m cells, only the cells in view are copied into the instance buffer (three.js would otherwise
 * draw the whole valley, ~1.8 M triangles, every frame), and grass, flowers, bushes and small stones stop at a
 * short distance, shrinking into the ground over the last metres instead of popping.
 * The placements themselves (and so the collisions) never change: phones only draw part of the small plants.
 */

const URL = '/models/sf/painted_nature.glb';
useGLTF.preload(URL);

type KindName = keyof typeof KINDS;

type Part = { geometry: THREE.BufferGeometry; material: THREE.Material };
type Model = { parts: Part[]; height: number; minY: number };

const CELL = 30;
/** Small things only drawn near the camera (metres), with a shrink band before the limit. */
const NEAR: Partial<Record<KindName, number>> = { grass: 50, flower: 50, bush: 60, rock: 80 };
const FADE = 10;
/** On phones, one small plant in two is drawn (grass, flowers, bushes). */
const THINNED: KindName[] = ['grass', 'flower', 'bush'];
/** The view is tested a little wider than the screen (the buffer is rebuilt a few times a second, not every frame). */
const VIEW_MARGIN = 5;
/** Shadow casters just outside the view still throw their shadow into it: their cells are tested wider. */
const SHADOW_MARGIN = 16;

/** For every model name: its sub-meshes, with the model's height so instances can be scaled to a target size. */
function useModels() {
	const { scene } = useGLTF(URL);
	return useMemo(() => {
		scene.updateMatrixWorld(true);
		const models: Record<string, Model> = {};
		for (const child of scene.children) {
			const box = new THREE.Box3().setFromObject(child);
			const height = Math.max(box.max.y - box.min.y, 0.01);
			// world-aligned (the packs are Z-up exports), trunk on the placement point whatever the pivot
			const centre = box.getCenter(new THREE.Vector3());
			const parts: Part[] = [];
			child.traverse((o) => {
				const m = o as THREE.Mesh;
				if (!m.isMesh) return;
				const g = bakeGeometry(m.geometry, m.matrixWorld);
				g.translate(-centre.x, 0, -centre.z);
				// the packs export MeshPhysicalMaterial (specular / IOR extensions) on fully rough surfaces: the
				// standard shader looks the same here and costs less per pixel
				const mat = new THREE.MeshStandardMaterial().copy(m.material as THREE.MeshStandardMaterial);
				mat.roughness = 1;
				// leaf cards and grass tufts are alpha-cut textures
				if (mat.transparent || mat.alphaTest > 0 || mat.map?.format === THREE.RGBAFormat) {
					mat.transparent = false;
					mat.alphaTest = 0.45;
					mat.side = THREE.DoubleSide;
				}
				parts.push({ geometry: g, material: mat });
			});
			models[child.name] = { parts, height, minY: box.min.y };
		}
		return models;
	}, [scene]);
}

type Cell = { x: number; y: number; z: number; r: number; start: number; end: number };

/** One model of one kind: its instances sorted by cell, a shared instance buffer, one mesh per sub-mesh. */
type Batch = {
	kind: KindName;
	/** Every instance's matrix, cell after cell. */
	all: Float32Array;
	/** Instance positions (x, z), same order. */
	pos: Float32Array;
	cells: Cell[];
	attr: THREE.InstancedBufferAttribute;
	meshes: THREE.InstancedMesh[];
	near: number | undefined;
	margin: number;
};

function buildBatch(kind: KindName, items: Placement[], model: Model, shadow: boolean): Batch | null {
	if (items.length === 0 || model.parts.length === 0) return null;
	// bucket by 30 m cell (from x/z only: the placements are untouched)
	const buckets = new Map<string, Placement[]>();
	for (const it of items) {
		const key = `${Math.floor(it.x / CELL)},${Math.floor(it.z / CELL)}`;
		const list = buckets.get(key);
		if (list) list.push(it);
		else buckets.set(key, [it]);
	}
	const n = items.length;
	const all = new Float32Array(n * 16);
	const pos = new Float32Array(n * 2);
	const cells: Cell[] = [];
	const m = new THREE.Matrix4();
	const q = new THREE.Quaternion();
	const s = new THREE.Vector3();
	const p = new THREE.Vector3();
	const up = new THREE.Vector3(0, 1, 0);
	let i = 0;
	for (const list of buckets.values()) {
		const box = new THREE.Box3();
		const start = i;
		for (const it of list) {
			const k = it.h / model.height;
			m.compose(p.set(it.x, it.y - model.minY * k - 0.15, it.z), q.setFromAxisAngle(up, it.rot), s.setScalar(k));
			m.toArray(all, i * 16);
			pos[i * 2] = it.x;
			pos[i * 2 + 1] = it.z;
			// a crown is wider than its trunk: half its height around the placement point
			box.expandByPoint(p.set(it.x - it.h * 0.5, it.y - 0.5, it.z - it.h * 0.5));
			box.expandByPoint(p.set(it.x + it.h * 0.5, it.y + it.h, it.z + it.h * 0.5));
			i++;
		}
		const sphere = box.getBoundingSphere(new THREE.Sphere());
		cells.push({ x: sphere.center.x, y: sphere.center.y, z: sphere.center.z, r: sphere.radius, start, end: i });
	}
	const attr = new THREE.InstancedBufferAttribute(new Float32Array(n * 16), 16);
	attr.setUsage(THREE.DynamicDrawUsage);
	const meshes = model.parts.map((part) => {
		const mesh = new THREE.InstancedMesh(part.geometry, part.material, n);
		mesh.instanceMatrix = attr;
		mesh.count = 0;
		mesh.castShadow = shadow;
		mesh.receiveShadow = true;
		// culled here, cell by cell (the whole-valley bounding sphere would always be in view)
		mesh.frustumCulled = false;
		return mesh;
	});
	return { kind, all, pos, cells, attr, meshes, near: NEAR[kind], margin: VIEW_MARGIN + (shadow ? SHADOW_MARGIN : 0) };
}

const frustum = new THREE.Frustum();
const viewProj = new THREE.Matrix4();
const sphere = new THREE.Sphere();

/** Copies the instances in view into the batch's buffer; returns the instance count. */
function fill(b: Batch, cam: THREE.Vector3, thin: boolean) {
	const out = b.attr.array as Float32Array;
	let count = 0;
	const near = b.near;
	for (const c of b.cells) {
		sphere.center.set(c.x, c.y, c.z);
		sphere.radius = c.r + b.margin;
		if (near !== undefined && Math.hypot(c.x - cam.x, c.z - cam.z) - c.r > near) continue;
		if (!frustum.intersectsSphere(sphere)) continue;
		if (near === undefined && !thin) {
			out.set(b.all.subarray(c.start * 16, c.end * 16), count * 16);
			count += c.end - c.start;
			continue;
		}
		for (let i = c.start; i < c.end; i++) {
			if (thin && i % 2 === 1) continue;
			let k = 1;
			if (near !== undefined) {
				const d = Math.hypot(b.pos[i * 2] - cam.x, b.pos[i * 2 + 1] - cam.z);
				if (d >= near) continue;
				k = Math.min(1, (near - d) / FADE);
			}
			const o = count * 16;
			out.set(b.all.subarray(i * 16, i * 16 + 16), o);
			if (k < 1) {
				// shrink toward the ground: scale the rotation-scale columns, keep the base point
				for (let j = 0; j < 12; j++) if (j % 4 !== 3) out[o + j] *= k;
			}
			count++;
		}
	}
	return count;
}

export function Nature() {
	const models = useModels();
	const placements = useMemo(() => scatterAll(), []);
	const thin = useMemo(() => typeof window !== 'undefined' && (window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768), []);
	const batches = useMemo(() => {
		const list: Batch[] = [];
		for (const kind of Object.keys(KINDS) as KindName[]) {
			const cfg = KINDS[kind];
			cfg.names.forEach((name, variant) => {
				const model = models[name];
				if (!model) return;
				const b = buildBatch(
					kind,
					placements[kind].filter((p) => p.variant === variant),
					model,
					cfg.shadow,
				);
				if (b) list.push(b);
			});
		}
		return list;
	}, [models, placements]);
	useEffect(
		() => () => {
			for (const b of batches) for (const m of b.meshes) m.dispose();
		},
		[batches],
	);

	// rebuilt when the camera has moved or turned enough (and at most 20 times a second while it does)
	const last = useMemo(() => ({ pos: new THREE.Vector3(1e9, 0, 0), dir: new THREE.Vector3(), t: -1 }), []);
	const dir = useMemo(() => new THREE.Vector3(), []);
	useFrame(({ camera, clock }) => {
		camera.getWorldDirection(dir);
		const moved = last.pos.distanceToSquared(camera.position) > 0.6 || last.dir.dot(dir) < 0.9995;
		if (!moved || clock.elapsedTime - last.t < 1 / 20) return;
		last.t = clock.elapsedTime;
		last.pos.copy(camera.position);
		last.dir.copy(dir);
		camera.updateMatrixWorld();
		frustum.setFromProjectionMatrix(viewProj.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
		for (const b of batches) {
			const count = fill(b, camera.position, thin && THINNED.includes(b.kind));
			b.attr.clearUpdateRanges();
			if (count > 0) {
				b.attr.addUpdateRange(0, count * 16);
				b.attr.needsUpdate = true;
			}
			for (const m of b.meshes) m.count = count;
		}
	});

	return (
		<group>
			{batches.flatMap((b) => b.meshes.map((m) => <primitive key={m.uuid} object={m} />))}
		</group>
	);
}
