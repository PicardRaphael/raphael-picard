/** Phase of the day from the visitor's local clock, or forced from the options. */
export type Phase = 'day' | 'dusk' | 'night';

export function phaseFor(mode: 'auto' | Phase, date = new Date()): Phase {
	if (mode !== 'auto') return mode;
	const h = date.getHours() + date.getMinutes() / 60;
	if (h >= 7 && h < 18) return 'day';
	if ((h >= 18 && h < 21) || (h >= 5.5 && h < 7)) return 'dusk';
	return 'night';
}

/** 0 = full day, 0.5 = dusk, 1 = night. */
export const NIGHT: Record<Phase, number> = { day: 0, dusk: 0.5, night: 1 };
