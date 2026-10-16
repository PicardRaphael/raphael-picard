import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { bugVoiceText, lessonGist, mobs } from '@/lib/mobs';
import { PLACE_LINES } from '@/lib/place-lines';
import { QUESTS } from '@/lib/quests';
import clips from '@/lib/voice-clips.json';
import { voiceClip, voiceGender } from '@/lib/voice';
import { LANDMARKS } from '@/lib/world';

const ROOT = join(__dirname, '..', '..');
const manifest = clips as unknown as Record<string, { default: 'f' | 'm'; f?: { seconds: number }; m?: { seconds: number } }>;

/** Every line of the game that is read aloud, with the text its clip must have been recorded from. */
const LINES: [string, string][] = [
	...QUESTS.flatMap((q) => [[`${q.id}-intro`, q.intro] as [string, string], [`${q.id}-outro`, q.outro] as [string, string]]),
	...Object.entries(PLACE_LINES).map(([id, line]) => [`place-${id}`, line] as [string, string]),
	...mobs.map((m) => [`bug-${m.id}`, bugVoiceText(m)] as [string, string]),
];

describe('voice-over', () => {
	it.each(LINES)('%s is recorded from the current text, in both voices', (id, text) => {
		// a text edited without running scripts/voices/generate.py is silently not played: catch it here
		expect(voiceClip(id, text), `${id}: regenerate the clips (scripts/voices/README.md)`).toBe(id);
		for (const g of ['f', 'm'] as const) {
			expect(manifest[id][g], `${id}-${g}`).toBeDefined();
			expect(existsSync(join(ROOT, 'public', 'audio', 'voice', `${id}-${g}.mp3`)), `${id}-${g}.mp3`).toBe(true);
		}
	});

	it('bug cards are short: they fade after 7 s', () => {
		for (const m of mobs) for (const g of ['f', 'm'] as const) expect(manifest[`bug-${m.id}`][g]!.seconds, `${m.name} (${g})`).toBeLessThanOrEqual(7);
	});

	it('every place with a panel has a line', () => {
		const panels = LANDMARKS.filter((l) => l.id !== 'cinema').map((l) => l.id);
		expect(Object.keys(PLACE_LINES).sort()).toEqual([...panels].sort());
	});

	it('the options pick the voice: auto keeps the character, femme / homme force it', () => {
		expect(voiceGender('place-holo', 'auto')).toBe('f');
		expect(voiceGender('place-forge', 'auto')).toBe('m');
		expect(voiceGender('place-forge', 'f')).toBe('f');
		expect(voiceGender('place-holo', 'm')).toBe('m');
		expect(voiceGender('nope', 'auto')).toBeNull();
	});

	it('no semicolon in what is read aloud', () => {
		expect(LINES.filter(([, t]) => t.includes(';')).map(([id]) => id)).toEqual([]);
	});
});

describe('lessonGist', () => {
	it('splits the verdict from the first measure, whatever space precedes the colon', () => {
		expect(lessonGist('Bloquée : une mesure, une autre. Une phrase de plus.')).toEqual({ head: 'Bloquée', first: 'une mesure, une autre' });
		expect(lessonGist('Bloquée : une mesure')).toEqual({ head: 'Bloquée', first: 'une mesure' });
		expect(lessonGist('Pas de verdict. Puis la suite.')).toEqual({ head: '', first: 'Pas de verdict' });
	});

	it('every bug has a verdict', () => {
		for (const m of mobs) expect(lessonGist(m.lesson).head, m.name).not.toBe('');
	});
});
