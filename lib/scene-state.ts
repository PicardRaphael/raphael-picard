/**
 * Shared mutable state between the DOM (scroll, pointer, HUD) and the WebGL scene.
 * Mutated outside React on purpose: render loops read it every frame without re-rendering.
 */
export const sceneState = {
	/** Pointer in normalized device coordinates (-1..1); 9 when the pointer left the window. */
	pointer: { x: 0, y: 0 },
	/** Journey progress along the route, 0 = first station, 1 = last station (smoothed). */
	travel: 0,
	/** Normalized flight speed, 0 at rest. */
	speed: 0,
	/** Index of the station the ship is currently closest to. */
	station: 0,
	/** 0..1 while the visitor holds the boost (Space key or HUD button). */
	boost: 0,
	/** 0 = fantasy realm, 1 = futuristic realm. */
	realm: 0,
};
