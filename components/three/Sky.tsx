'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useMemo } from 'react';
import * as THREE from 'three';

import { sceneState } from '@/lib/scene-state';
import { PORTAL_INDEX, STATIONS } from '@/lib/stations';

/**
 * Blends the atmosphere between the two realms as the ship crosses the portal:
 * a violet dusk with amber haze, then the deep black of space.
 */
export function Sky() {
	const { scene } = useThree();
	const c = useMemo(
		() => ({
			dusk: new THREE.Color('#1a0d2e'),
			duskFog: new THREE.Color('#2b1340'),
			space: new THREE.Color('#05040c'),
			spaceFog: new THREE.Color('#05040c'),
			bg: new THREE.Color(),
			fog: new THREE.Color(),
		}),
		[],
	);

	useFrame(() => {
		const portal = PORTAL_INDEX / (STATIONS.length - 1);
		const span = 0.6 / (STATIONS.length - 1);
		const t = THREE.MathUtils.smoothstep(sceneState.travel, portal - span * 0.2, portal + span);
		sceneState.realm = t;
		c.bg.copy(c.dusk).lerp(c.space, t);
		c.fog.copy(c.duskFog).lerp(c.spaceFog, t);
		if (scene.background instanceof THREE.Color) scene.background.copy(c.bg);
		if (scene.fog instanceof THREE.Fog) {
			scene.fog.color.copy(c.fog);
			scene.fog.near = THREE.MathUtils.lerp(40, 120, t);
			scene.fog.far = THREE.MathUtils.lerp(190, 330, t);
		}
	});

	return null;
}
