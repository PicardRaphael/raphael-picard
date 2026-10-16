import * as THREE from 'three';

import { PORTAL_INDEX, STATIONS } from '@/lib/stations';

/** Distance between two stations along the route. */
export const LEG = 70;
const N = STATIONS.length;

/**
 * The flight path: a gently weaving spline heading into -z, with one extra
 * waypoint after the last station so the ship always has somewhere to look.
 */
export function createRoute() {
	const points: THREE.Vector3[] = [];
	for (let i = 0; i <= N; i++) {
		points.push(new THREE.Vector3(Math.sin(i * 1.7) * 9, Math.cos(i * 1.1) * 3.5, -i * LEG));
		// mid-leg control point: a wider swing for some banking
		if (i < N) points.push(new THREE.Vector3(Math.sin(i * 1.7 + 0.9) * 14, Math.cos(i * 1.1 + 0.7) * 5, -(i + 0.5) * LEG));
	}
	const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.5);
	curve.arcLengthDivisions = 2000;
	return curve;
}

/** Where on the curve (0..1, arc-length) the ship sits when the page is centred on station `i`. */
export function stationU(i: number) {
	return i / N;
}

/** Converts the page journey (0 = first station, 1 = last station) into curve space. */
export function travelToU(travel: number) {
	return THREE.MathUtils.clamp(travel, 0, 1) * ((N - 1) / N);
}

const tmpTangent = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);

/** Frenet-like frame without twist: good enough for a gently curving path. */
export function frameAt(curve: THREE.CatmullRomCurve3, u: number, pos: THREE.Vector3, forward: THREE.Vector3, right: THREE.Vector3, up: THREE.Vector3) {
	curve.getPointAt(THREE.MathUtils.clamp(u, 0, 1), pos);
	curve.getTangentAt(THREE.MathUtils.clamp(u, 0, 1), tmpTangent);
	forward.copy(tmpTangent).normalize();
	right.crossVectors(forward, UP).normalize();
	up.crossVectors(right, forward).normalize();
}

/**
 * The stone gate of the portal station, on the flight path (the ship flies through it): centre, a point it faces
 * along the route, and the arch's scale. The particle vortex of the portal station fills it.
 */
export function portalGate(curve: THREE.CatmullRomCurve3) {
	const pos = new THREE.Vector3();
	const f = new THREE.Vector3();
	const r = new THREE.Vector3();
	const u = new THREE.Vector3();
	frameAt(curve, stationU(PORTAL_INDEX) + 22 / curve.getLength(), pos, f, r, u);
	// the arch's circle is centred 0.6 units above its origin (× scale): lifted so the ship passes mid-gate
	const scale = 2.3;
	const at = pos.clone().addScaledVector(u, 0.6 * scale);
	return { at, look: at.clone().add(f), scale };
}

/** Stations sit a little ahead of the ship's resting point, off to the side so the content column stays clear. */
export function stationAnchor(curve: THREE.CatmullRomCurve3, i: number, wide: boolean, out: THREE.Vector3) {
	const pos = new THREE.Vector3();
	const f = new THREE.Vector3();
	const r = new THREE.Vector3();
	const u = new THREE.Vector3();
	const lead = 22 / curve.getLength();
	frameAt(curve, stationU(i) + lead, pos, f, r, u);
	out.copy(pos);
	if (wide) out.addScaledVector(r, 7.5).addScaledVector(u, 1.2);
	else out.addScaledVector(u, 4.2);
	return out;
}
