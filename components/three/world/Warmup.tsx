'use client';

import { useThree } from '@react-three/fiber';
import { useLayoutEffect } from 'react';
import * as THREE from 'three';

import { game } from '@/lib/game-store';

/**
 * Set by the scene from the quality level: true when the frame goes through post-processing. The scene is then drawn
 * into its offscreen buffer, where three builds other programs (no tone mapping, linear output) than for the screen:
 * compiling the screen ones would leave the real ones to the first frame.
 */
export const warmupSettings = { offscreen: false };
/** Stand-in for the post-processing input buffer: only "a render target is bound" matters to the program keys. */
let offscreenTarget: THREE.WebGLRenderTarget | null = null;
/** Warmups currently holding the frames (several boundaries can resolve together). */
let holding = 0;

/**
 * Compiles the shaders of what a Suspense boundary just mounted, all at once and off the main thread
 * (KHR_parallel_shader_compile), before anything of it is drawn.
 *
 * Drawing a material for the first time compiles its shader synchronously: under Windows (ANGLE → D3D11) about
 * half a second per program, one after the other, which froze the start screen ~10 s on a first visit. Placed in
 * the same boundary as the models, its layout effect runs in their commit, before the next frame can draw them.
 * Hidden objects are compiled too (three prepares every material of the scene, visible or not).
 *
 * - `pause`: no frame is drawn until the programs are ready, so the main thread stays free (a frame drawn meanwhile
 *   waits for them). Always the case on the start screen, where the world behind the menu can freeze a moment;
 *   in play, a boundary resolving far away (culled) must not stop the game.
 * - `onReady`: called once they are (or after 45 s, a failing compile must never lock the visitor out).
 */
export function Warmup({ pause = false, onReady }: { pause?: boolean; onReady?: () => void }) {
	const gl = useThree((s) => s.gl);
	const scene = useThree((s) => s.scene);
	const camera = useThree((s) => s.camera);
	const setFrameloop = useThree((s) => s.setFrameloop);
	const get = useThree((s) => s.get);

	useLayoutEffect(() => {
		let done = false;
		const compile = (): Promise<unknown> => {
			const bound = gl.getRenderTarget();
			try {
				if (warmupSettings.offscreen) gl.setRenderTarget((offscreenTarget ??= new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType })));
				// the programs are created (and their compilation started) synchronously; the promise waits for the GPU
				return gl.compileAsync(scene, camera);
			} catch (e) {
				return Promise.reject(e);
			} finally {
				if (warmupSettings.offscreen) gl.setRenderTarget(bound);
			}
		};
		const hold = pause || !game.get().started;
		if (hold && holding++ === 0) setFrameloop('never');
		// the commit has already requested a frame (its new objects invalidate the view): dropped, it would draw them uncompiled
		if (hold) get().internal.frames = 0;
		const release = () => {
			if (hold && --holding === 0) setFrameloop('always');
		};
		let start = 0;
		let timer = 0;
		const finish = () => {
			if (done) return;
			done = true;
			window.clearTimeout(timer);
			release();
			onReady?.();
		};
		timer = window.setTimeout(finish, 45000);
		// frames held: compile once the commit's passive effects have run too (fog, lights… are set in effects)
		if (hold) start = window.setTimeout(() => compile().then(finish, finish), 0);
		else compile().then(finish, finish);
		return () => {
			// re-suspended (or unmounted) before the end: never leave the world frozen; the effect runs again on reveal
			if (done) return;
			done = true;
			window.clearTimeout(timer);
			window.clearTimeout(start);
			release();
		};
	}, [gl, scene, camera, setFrameloop, get, pause, onReady]);
	return null;
}
