'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

import { sceneState } from '@/lib/scene-state';
import { STATIONS } from '@/lib/stations';
import { EngineTrail } from './Cosmos';
import { frameAt, travelToU } from './route';
import { Ship } from './Ship';

/** Maps the page scroll to the journey: section i centred in the viewport ⇒ travel = i / (n - 1). */
function readTravel() {
	const sections = document.querySelectorAll<HTMLElement>('[data-station]');
	if (sections.length < 2) return 0;
	const y = window.scrollY + window.innerHeight / 2;
	const centers: number[] = [];
	sections.forEach((el) => {
		const r = el.getBoundingClientRect();
		centers.push(r.top + window.scrollY + Math.min(r.height, window.innerHeight) / 2);
	});
	const n = centers.length;
	if (y <= centers[0]) return 0;
	if (y >= centers[n - 1]) return 1;
	let i = 0;
	while (i < n - 2 && y > centers[i + 1]) i++;
	const f = (y - centers[i]) / (centers[i + 1] - centers[i]);
	return (i + THREE.MathUtils.clamp(f, 0, 1)) / (n - 1);
}

type Props = { route: THREE.CatmullRomCurve3; wide: boolean; pixelRatio: number; reducedMotion: boolean };

export function Flight({ route, wide, pixelRatio, reducedMotion }: Props) {
	const { camera } = useThree();
	const ship = useRef<THREE.Group>(null);
	const flames = useRef<THREE.Group>(null);
	const emitters = useRef<THREE.Object3D[]>([]);

	const v = useMemo(
		() => ({
			pos: new THREE.Vector3(),
			f: new THREE.Vector3(),
			r: new THREE.Vector3(),
			u: new THREE.Vector3(),
			camTarget: new THREE.Vector3(),
			look: new THREE.Vector3(),
			lookTarget: new THREE.Vector3(),
			m: new THREE.Matrix4(),
			q: new THREE.Quaternion(),
			roll: new THREE.Quaternion(),
			steer: new THREE.Vector2(),
			lastU: 0,
			bank: 0,
			fov: 55,
			time: 0,
		}),
		[],
	);

	// two invisible emitters at the engine nozzles, in ship space
	const emitterNodes = useMemo(
		() =>
			[0.45, -0.45].map((x) => {
				const o = new THREE.Object3D();
				o.position.set(x, -0.02, 1.3);
				return o;
			}),
		[],
	);

	useFrame((_, delta) => {
		const s = ship.current;
		if (!s) return;
		const dt = Math.min(delta, 1 / 20);
		v.time += dt;

		// journey: smoothed so the ship glides between sectors
		const target = readTravel();
		const k = 1 - Math.exp(-dt * (reducedMotion ? 4 : 2.4));
		const prev = sceneState.travel;
		sceneState.travel += (target - sceneState.travel) * k;
		sceneState.station = Math.round(sceneState.travel * (STATIONS.length - 1));
		const travelSpeed = Math.abs(sceneState.travel - prev) / Math.max(dt, 1e-3);
		const boost = sceneState.boost;
		const speedTarget = Math.min(travelSpeed * 2.2, 1) + boost * 0.9;
		sceneState.speed += (speedTarget - sceneState.speed) * (1 - Math.exp(-dt * 4));

		const u = travelToU(sceneState.travel);
		frameAt(route, u, v.pos, v.f, v.r, v.u);

		// pointer steering inside the flight lane
		const px = Math.abs(sceneState.pointer.x) > 2 ? 0 : sceneState.pointer.x;
		const py = Math.abs(sceneState.pointer.y) > 2 ? 0 : sceneState.pointer.y;
		v.steer.x += (px - v.steer.x) * 0.05;
		v.steer.y += (py - v.steer.y) * 0.05;

		const lateral = (wide ? 2.6 : 0) + v.steer.x * 1.4;
		const bob = Math.sin(v.time * 1.3) * 0.12;
		s.position
			.copy(v.pos)
			.addScaledVector(v.r, lateral)
			.addScaledVector(v.u, (wide ? -0.6 : -1.1) + v.steer.y * 0.7 + bob)
			.addScaledVector(v.f, boost * 3);

		// orientation: along the tangent, banking into turns and toward the pointer
		const du = u - v.lastU;
		v.lastU = u;
		const turn = route.getTangentAt(THREE.MathUtils.clamp(u + 0.01, 0, 1)).dot(v.r);
		const bankTarget = THREE.MathUtils.clamp(-turn * 1.2 * Math.sign(du || 1) - (px - v.steer.x) * 1.5 - v.steer.x * 0.25 + Math.sin(v.time * 0.9) * 0.04, -0.5, 0.5);
		v.bank += (bankTarget - v.bank) * 0.06;
		v.m.makeBasis(v.r, v.u, v.f.clone().negate());
		v.q.setFromRotationMatrix(v.m);
		v.roll.setFromAxisAngle(new THREE.Vector3(0, 0, 1), v.bank);
		s.quaternion.copy(v.q).multiply(v.roll);
		s.rotateX(v.steer.y * 0.15);

		if (flames.current) {
			const fl = 0.35 + sceneState.speed * 1.4 + Math.sin(v.time * 40) * 0.05;
			flames.current.scale.set(1, 1, fl);
		}

		// chase camera
		v.camTarget
			.copy(v.pos)
			.addScaledVector(v.f, -7.5 + boost * 1.5)
			.addScaledVector(v.u, 2.1)
			.addScaledVector(v.r, wide ? 1.2 : 0);
		camera.position.lerp(v.camTarget, 0.08);
		v.lookTarget.copy(v.pos).addScaledVector(v.f, 14).addScaledVector(v.u, wide ? 0.6 : 1.6).addScaledVector(v.r, wide ? 2.2 : 0);
		v.look.lerp(v.lookTarget, 0.1);
		camera.lookAt(v.look);

		const persp = camera as THREE.PerspectiveCamera;
		const fovTarget = (wide ? 55 : 68) + sceneState.speed * 14;
		v.fov += (fovTarget - v.fov) * 0.08;
		if (Math.abs(persp.fov - v.fov) > 0.01) {
			persp.fov = v.fov;
			persp.updateProjectionMatrix();
		}
	});

	return (
		<>
			<Ship
				ref={(g) => {
					ship.current = g;
					if (g && emitterNodes[0].parent !== g) emitterNodes.forEach((e) => g.add(e));
					emitters.current = emitterNodes;
				}}
				flameRef={flames}
			/>
			<EngineTrail emitters={emitters} pixelRatio={pixelRatio} />
		</>
	);
}
