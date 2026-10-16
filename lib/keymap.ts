'use client';

/** Rebindable controls, stored per visitor in localStorage (falls back to defaults when storage is unavailable). */
export type Action = 'forward' | 'back' | 'left' | 'right' | 'jump' | 'attack' | 'interact' | 'sprint' | 'map' | 'menu' | 'cursor';

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
	{ id: 'cursor', label: 'Libérer / reprendre la souris (FPS)' },
];

/** Two keys per action: a primary (editable) and a fixed secondary so arrows always work. */
const DEFAULTS: Record<Action, [string, string]> = {
	forward: ['KeyW', 'ArrowUp'],
	back: ['KeyS', 'ArrowDown'],
	left: ['KeyA', 'ArrowLeft'],
	right: ['KeyD', 'ArrowRight'],
	jump: ['Space', 'Space'],
	// the A of an AZERTY keyboard (physical Q key of a QWERTY one)
	attack: ['KeyQ', 'Digit1'],
	interact: ['KeyE', 'Enter'],
	sprint: ['ShiftLeft', 'ShiftRight'],
	// C for the map (same key on AZERTY and QWERTY), M kept as a second key (Semicolon on AZERTY)
	map: ['KeyC', 'Semicolon'],
	// the W of an AZERTY keyboard (physical Z key of a QWERTY one), Escape always works
	menu: ['KeyZ', 'Escape'],
	cursor: ['AltLeft', 'KeyX'],
};

// v2: new defaults (menu W, map C); bindings saved under v1 are dropped
const STORAGE = 'rp-keymap-v2';
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

/** The visitor's real layout (letter printed on each physical key), when the browser exposes it (Chrome, Edge). */
let layout: Map<string, string> | null = null;
if (typeof navigator !== 'undefined') {
	const kb = (navigator as Navigator & { keyboard?: { getLayoutMap?: () => Promise<Map<string, string>> } }).keyboard;
	kb?.getLayoutMap?.()
		.then((m) => {
			layout = m;
		})
		.catch(() => undefined);
}

/** Human label for a KeyboardEvent.code, as printed on the visitor's keyboard (AZERTY or QWERTY). */
export function keyLabel(code: string) {
	const printed = layout?.get(code);
	if (printed && /^[a-z0-9]$/i.test(printed)) return printed.toUpperCase();
	const special: Record<string, string> = {
		ArrowUp: '↑',
		ArrowDown: '↓',
		ArrowLeft: '←',
		ArrowRight: '→',
		Space: 'Espace',
		ShiftLeft: 'Maj',
		ShiftRight: 'Maj D',
		AltLeft: 'Alt',
		Enter: 'Entrée',
		Escape: 'Échap',
		ControlLeft: 'Ctrl',
		Tab: 'Tab',
	};
	if (special[code]) return special[code];
	const fr = typeof navigator !== 'undefined' && navigator.language?.startsWith('fr');
	const azerty: Record<string, string> = { KeyZ: 'W', KeyW: 'Z', KeyQ: 'A', KeyA: 'Q', Semicolon: 'M' };
	if (fr && azerty[code]) return azerty[code];
	if (code.startsWith('Key')) return code.slice(3);
	if (code.startsWith('Digit')) return code.slice(5);
	return code;
}
