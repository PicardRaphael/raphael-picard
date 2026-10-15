'use client';

/** Rebindable controls, stored per visitor in localStorage (falls back to defaults when storage is unavailable). */
export type Action = 'forward' | 'back' | 'left' | 'right' | 'jump' | 'attack' | 'interact' | 'sprint' | 'map' | 'menu';

export const ACTIONS: { id: Action; label: string }[] = [
	{ id: 'forward', label: 'Avancer' },
	{ id: 'back', label: 'Reculer' },
	{ id: 'left', label: 'Tourner à gauche' },
	{ id: 'right', label: 'Tourner à droite' },
	{ id: 'jump', label: 'Sauter' },
	{ id: 'attack', label: 'Attaquer' },
	{ id: 'interact', label: 'Interagir' },
	{ id: 'sprint', label: 'Sprinter' },
	{ id: 'map', label: 'Carte' },
	{ id: 'menu', label: 'Menu / options' },
];

/** Two keys per action: a primary (editable) and a fixed secondary so arrows always work. */
const DEFAULTS: Record<Action, [string, string]> = {
	forward: ['KeyW', 'ArrowUp'],
	back: ['KeyS', 'ArrowDown'],
	left: ['KeyA', 'ArrowLeft'],
	right: ['KeyD', 'ArrowRight'],
	jump: ['Space', 'Space'],
	attack: ['KeyF', 'Digit1'],
	interact: ['KeyE', 'Enter'],
	sprint: ['ShiftLeft', 'ShiftRight'],
	// M sits on the Semicolon key of an AZERTY keyboard
	map: ['KeyM', 'Semicolon'],
	menu: ['KeyO', 'Escape'],
};

const STORAGE = 'rp-keymap-v1';
let map: Record<Action, [string, string]> = { ...DEFAULTS };

try {
	const saved = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE) : null;
	if (saved) map = { ...DEFAULTS, ...(JSON.parse(saved) as Partial<Record<Action, [string, string]>>) };
} catch {
	// storage blocked: keep defaults
}

export const keymap = {
	get: () => map,
	is(action: Action, code: string) {
		return map[action][0] === code || map[action][1] === code;
	},
	bind(action: Action, code: string) {
		map = { ...map, [action]: [code, map[action][1]] };
		try {
			window.localStorage.setItem(STORAGE, JSON.stringify(map));
		} catch {
			// ignore
		}
	},
	reset() {
		map = { ...DEFAULTS };
		try {
			window.localStorage.removeItem(STORAGE);
		} catch {
			// ignore
		}
	},
};

/** Human label for a KeyboardEvent.code, as printed on an AZERTY or QWERTY keyboard. */
export function keyLabel(code: string) {
	const special: Record<string, string> = {
		ArrowUp: '↑',
		ArrowDown: '↓',
		ArrowLeft: '←',
		ArrowRight: '→',
		Space: 'Espace',
		ShiftLeft: 'Maj',
		ShiftRight: 'Maj D',
		Enter: 'Entrée',
		Escape: 'Échap',
		ControlLeft: 'Ctrl',
		Tab: 'Tab',
	};
	if (special[code]) return special[code];
	if (code.startsWith('Key')) return code.slice(3);
	if (code.startsWith('Digit')) return code.slice(5);
	return code;
}
