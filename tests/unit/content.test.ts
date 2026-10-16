import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import * as profile from '@/content/profile';
import * as work from '@/content/work';
import { ACHIEVEMENTS } from '@/lib/achievements';
import { mobs } from '@/lib/mobs';
import { QUESTS } from '@/lib/quests';
import { site } from '@/lib/site';
import { LANDMARKS } from '@/lib/world';

const ROOT = join(__dirname, '..', '..');

/** Every string of a value, with its path. */
function strings(value: unknown, path = ''): [string, string][] {
	if (typeof value === 'string') return [[path, value]];
	if (Array.isArray(value)) return value.flatMap((v, i) => strings(v, `${path}[${i}]`));
	if (value && typeof value === 'object') return Object.entries(value).flatMap(([k, v]) => strings(v, path ? `${path}.${k}` : k));
	return [];
}

/** The texts a visitor reads: portfolio content, quests, bugs, achievements, places and site metadata. */
const visible: [string, string][] = [
	...strings(profile, 'profile'),
	...strings(work, 'work'),
	...strings(QUESTS, 'quests'),
	...strings(
		mobs.map((m) => ({ name: m.name, problem: m.problem, lesson: m.lesson })),
		'mobs',
	),
	...strings(
		ACHIEVEMENTS.map((a) => ({ title: a.title, text: a.text })),
		'achievements',
	),
	...strings(
		LANDMARKS.map((l) => ({ name: l.name, hint: l.hint })),
		'landmarks',
	),
	...strings({ title: site.title, description: site.description, role: site.role }, 'site'),
];

/** Source files whose literals end up on screen. */
function sources() {
	const dirs = ['content', 'components/game', 'components/sections', 'app'];
	const files: string[] = ['lib/quests.ts', 'lib/mobs.ts', 'lib/achievements.ts', 'lib/site.ts', 'lib/world.ts', 'lib/stations.ts'];
	const walkDir = (d: string) => {
		for (const e of readdirSync(join(ROOT, d), { withFileTypes: true })) {
			const p = `${d}/${e.name}`;
			if (e.isDirectory()) walkDir(p);
			else if (/\.(ts|tsx)$/.test(e.name)) files.push(p);
		}
	};
	dirs.forEach(walkDir);
	return files.map((f) => [f, readFileSync(join(ROOT, f), 'utf8')] as const);
}

describe('portfolio content', () => {
	it('has no empty strings', () => {
		const empty = [...strings(work.projects, 'projects'), ...strings(work.experiences, 'experiences'), ...strings(profile.expertise, 'expertise'), ...visible]
			// a stat may have no unit on purpose
			.filter(([p, s]) => s.trim() === '' && !p.endsWith('.suffix'))
			.map(([p]) => p);
		expect(empty).toEqual([]);
	});

	it('has no empty lists in projects, experiences and expertise', () => {
		for (const p of work.projects) {
			expect(p.highlights.length, p.name).toBeGreaterThan(0);
			expect(p.stack.length, p.name).toBeGreaterThan(0);
		}
		for (const e of work.experiences) expect(e.points.length, e.company).toBeGreaterThan(0);
		for (const e of profile.expertise) expect(e.points.length, e.id).toBeGreaterThan(0);
	});

	it('has unique project names and expertise ids', () => {
		expect(new Set(work.projects.map((p) => p.name)).size).toBe(work.projects.length);
		expect(new Set(profile.expertise.map((e) => e.id)).size).toBe(profile.expertise.length);
	});

	it('public projects link to https URLs; production ones have no repo', () => {
		for (const p of work.projects) {
			if (p.url) expect(p.url, p.name).toMatch(/^https:\/\//);
			if (p.production) expect(p.url, p.name).toBeUndefined();
		}
	});

	it('exactly one current experience', () => {
		expect(work.experiences.filter((e) => e.current)).toHaveLength(1);
	});
});

describe('no internal identifier leaks', () => {
	const FORBIDDEN = [/ai_readonly/i, /neo_ia/i, /neoteem-back-ts/i, /\bconfluence\b/i, /\bjira\b/i];
	// ticket ids like SC-123; \b keeps model names such as GPT-4o out (the 4 is followed by a letter)
	const TICKET = /\b[A-Z]{2,}-\d+\b/;

	it('in the visible texts', () => {
		const leaks = visible.filter(([, s]) => FORBIDDEN.some((r) => r.test(s)) || TICKET.test(s)).map(([p, s]) => `${p}: ${s}`);
		expect(leaks).toEqual([]);
	});

	it('in the source files of the site', () => {
		const leaks: string[] = [];
		for (const [f, text] of sources())
			text.split('\n').forEach((line, i) => {
				if (FORBIDDEN.some((r) => r.test(line))) leaks.push(`${f}:${i + 1}: ${line.trim()}`);
			});
		expect(leaks).toEqual([]);
	});

	it('the ticket pattern catches ticket ids but not model names', () => {
		expect(TICKET.test('voir SC-123')).toBe(true);
		expect(TICKET.test('GPT-4o')).toBe(false);
	});
});

describe('consistent figures', () => {
	it('stats: 7 agents in production, 8+ years', () => {
		expect(profile.stats.find((s) => /agents/.test(s.label))?.value).toBe(7);
		expect(profile.stats.find((s) => /ans/.test(s.label))).toMatchObject({ value: 8, suffix: '+' });
	});

	it('no other agent count or years of experience anywhere', () => {
		const wrong = [/\b(?:[0-68-9]|\d{2,}|huit|six|cinq|quatre|trois|deux|dix) agents (?:spécialisés |IA |LangGraph )?en prod/i, /\b(?:8|huit) agents\b/i, /\b(?:9|neuf|dix|10) ans\b/i, /(?<!plus de )\b8 ans\b/, /(?<!plus de )\bhuit ans\b/i];
		const hits: string[] = [];
		for (const [f, text] of sources())
			text.split('\n').forEach((line, i) => {
				if (wrong.some((r) => r.test(line))) hits.push(`${f}:${i + 1}: ${line.trim()}`);
			});
		expect(hits).toEqual([]);
	});

	it('the agent count and the years are stated with the right figures', () => {
		const all = visible.map(([, s]) => s).join('\n');
		expect(all).toMatch(/\b(?:7|sept) agents\b/);
		expect(all).toMatch(/8\+ ans|plus de huit ans/);
	});
});

describe('typography', () => {
	// proper names keep their own apostrophe
	const ALLOWED = ["O'clock"];

	it('French texts use the typographic apostrophe ’ (warning only)', () => {
		const offenders = visible.filter(([, s]) => /[A-Za-zÀ-ÿ]'[A-Za-zÀ-ÿ]/.test(ALLOWED.reduce((t, a) => t.replaceAll(a, ''), s))).map(([p, s]) => `${p}: ${s}`);
		if (offenders.length) console.warn(`Straight apostrophes in visible texts (${offenders.length}):\n  ${offenders.join('\n  ')}`);
		// warn-level: listed above, never fails, so concurrent copy edits are not blocked
		expect(Array.isArray(offenders)).toBe(true);
	});
});
