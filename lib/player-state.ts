import { Vector3 } from 'three';

/** Live player state, mutated every frame by the 3D world and read by the minimap / HUD (no React re-render). */
export const player = {
	x: 0,
	z: 10,
	y: 0,
	yaw: 0,
	speed: 0,
	/** Inputs, written by keyboard listeners and the touch joystick. */
	input: { forward: 0, turn: 0, strafe: 0, boost: false },
	/** Click / tap to move: walk to this point, then open the landmark if set. */
	moveTarget: null as null | { x: number; z: number; landmark?: string },
	/** Orbit camera, driven by mouse drag / touch / wheel / pinch. */
	camera: { yaw: 0, pitch: 0.42, distance: 13, dragging: false, lookX: 0, lookY: 0, fpsPitch: 0, swayX: 0, swayY: 0, free: false, firstPerson: true },
	/** First-person aiming direction (through the reticle). */
	aim: new Vector3(0, 0, -1),
	/** Jump: vertical offset and velocity. */
	jump: { h: 0, vy: 0 },
	/** Seconds left in the current sword swing (0 = ready). */
	attack: 0,
	/** Mob the player clicked: walk to it, then strike. */
	attackTarget: null as null | number,
	/** Set to teleport the player on the next frame. */
	teleport: null as null | { x: number; z: number; yaw: number },
};
