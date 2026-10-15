/** Live player state, mutated every frame by the 3D world and read by the minimap / HUD (no React re-render). */
export const player = {
	x: 0,
	z: 10,
	y: 0,
	yaw: 0,
	speed: 0,
	/** Inputs, written by keyboard listeners and the touch joystick. */
	input: { forward: 0, turn: 0, boost: false },
	/** Set to teleport the player on the next frame. */
	teleport: null as null | { x: number; z: number; yaw: number },
};
