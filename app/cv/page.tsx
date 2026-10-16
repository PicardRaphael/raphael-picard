import type { Metadata } from 'next';
import localFont from 'next/font/local';

import { cvExperiences, cvHeader, cvLanguages, cvProjectNotes, cvSkills, cvStats, cvSummary } from '@/content/cv';
import { certifications, education, projects } from '@/content/work';
import { site } from '@/lib/site';

/**
 * The CV, built from the site content (content/profile.ts, content/work.ts) plus the CV-only details of content/cv.ts:
 * printed to public/raphael-picard-cv-senior-ai-engineer-responsable-ia.pdf by scripts/cv/print.mjs, so the PDF never contradicts the site.
 *
 * Built for applicant tracking systems as much as for people: real words in the titles (no letter-spacing that splits
 * them), list markers drawn by the browser (no positioned pseudo-elements, which Chrome paints and extracts after the
 * text), every link a real link, static fonts (a variable font is written as Type3 glyphs that extractors misread),
 * straight apostrophes (the curly one is extracted as a letter, U+02BC, gluing « d’IA » into one word).
 */
const inter = localFont({
	src: [
		{ path: './fonts/inter-latin-400-normal.woff2', weight: '400', style: 'normal' },
		{ path: './fonts/inter-latin-400-italic.woff2', weight: '400', style: 'italic' },
		{ path: './fonts/inter-latin-600-normal.woff2', weight: '600', style: 'normal' },
		{ path: './fonts/inter-latin-700-normal.woff2', weight: '700', style: 'normal' },
		{ path: './fonts/inter-latin-800-normal.woff2', weight: '800', style: 'normal' },
	],
	display: 'block',
});
const sora = localFont({ src: [{ path: './fonts/sora-latin-800-normal.woff2', weight: '800', style: 'normal' }], display: 'block' });

export const metadata: Metadata = {
	title: { absolute: `${site.name} — CV Senior AI Engineer & Responsable IA` },
	description: 'CV de Raphaël Picard : Senior AI Engineer & Responsable IA, agents LLM en production, RAG, LLMOps, Python, TypeScript.',
	robots: { index: false, follow: false },
};

const accent = '#651fff';
const muted = '#4b4466';
const rule = '#c9bdfc';

const display = (url: string) => url.replace(/^https:\/\/(www\.)?/, '').replace(/\/$/, '');

/**
 * French typography: no-break space before « : », thin no-break space before « ; % × → » and inside « 7 000 »,
 * so a line never starts with a colon or splits a number from its unit.
 */
function typo(text: string) {
	return text
		.replace(/’/g, "'")
		// product names and the job title never break across lines
		.replace(/Claude Code/g, 'Claude\u00a0Code')
		.replace(/ :/g, ' :')
		.replace(/ ([;%×→])/g, ' $1')
		.replace(/([×→]) /g, '$1 ')
		.replace(/(\d) (\d{3})\b/g, '$1 $2');
}

function Title({ children }: { children: React.ReactNode }) {
	return (
		<h2 className="mt-[15px] mb-[6px] flex items-center gap-2 text-[11px] font-bold tracking-[0.06em] uppercase" style={{ color: accent }}>
			{children}
			<span aria-hidden className="h-px flex-1" style={{ background: rule }} />
		</h2>
	);
}

/** Renders the **bold** spans and [links](url) of a CV string (links in bold accent), with French typography. */
function Rich({ text }: { text: string }) {
	return typo(text)
		.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/)
		.map((part, i) => {
			const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
			if (link)
				return (
					<a key={i} href={link[2]} className="font-bold" style={{ color: accent }}>
						{link[1]}
					</a>
				);
			return part.startsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : part;
		});
}

/** Every bullet and description is a sentence: it ends with a period. */
const sentence = (t: string) => (/[.!?…]$/.test(t.trim()) ? t : `${t.trim()}.`);

function Bullets({ points }: { points: string[] }) {
	return (
		<ul className="cv-list mt-[2px] space-y-[2px]">
			{points.map((p) => (
				<li key={p}>
					<Rich text={sentence(p)} />
				</li>
			))}
		</ul>
	);
}

export default function CvPage() {
	const order = Object.keys(cvProjectNotes);
	const openSource = projects.filter((p) => p.url && p.name in cvProjectNotes).sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));
	const anthropic = certifications.filter((c) => c.issuer === 'Anthropic Academy');
	const others = certifications.filter((c) => c.issuer !== 'Anthropic Academy' && !c.name.includes('RNCP'));
	const contact = [
		{ label: site.email, href: `mailto:${site.email}` },
		site.phone,
		{ label: display(site.url), href: site.url },
		{ label: display(site.social.linkedin), href: site.social.linkedin },
		{ label: display(site.social.github), href: site.social.github },
	];

	return (
		<main lang="fr" className={`${inter.className} cv mx-auto max-w-[210mm] bg-white px-[13mm] py-[12mm] text-[11.5px] leading-[1.4] text-[#1b1530]`}>
			<style>{`
				@page { size: A4; margin: 11mm 13mm 13mm; }
				html, body { background: #fff !important; color-scheme: light; }
				body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
				nextjs-portal { display: none !important; }
				@media print { .cv { padding: 0 !important; max-width: none !important; } }
				.cv, .cv * { cursor: auto !important; }
				.cv a { color: inherit; text-decoration: none; }
				.cv h2, .cv h3, .cv h4, .cv .keep { break-after: avoid; }
				.cv li, .cv .avoid { break-inside: avoid; }
				.cv-list { list-style: disc; padding-left: 13px; }
				.cv-list > li { padding-left: 1px; }
				.cv-list > li::marker { color: ${accent}; font-size: 0.85em; }
			`}</style>

			<header className="flex items-start justify-between gap-6 border-b-2 pb-[10px]" style={{ borderColor: accent }}>
				<div>
					<h1 className={`${sora.className} text-[27px] leading-none font-extrabold`}>{site.name}</h1>
					<p className="mt-[6px] text-[14px] font-semibold" style={{ color: accent }}>
						{site.role}
					</p>
					<p className="mt-[4px] text-[10.5px]" style={{ color: muted }}>
						{cvHeader.keywords}
					</p>
				</div>
				<ul className="shrink-0 space-y-[1px] text-right text-[10.5px]">
					<li className="font-semibold">{cvHeader.location}</li>
					{contact.map((c) => (
						<li key={c.href}>
							<a href={c.href}>{c.label}</a>
						</li>
					))}
				</ul>
			</header>

			<Title>Profil</Title>
			<p>{typo(cvSummary)}</p>

			<ul className="avoid mt-[8px] grid grid-cols-4 gap-[6px]">
				{cvStats.map((s) => (
					<li key={s.label} className="rounded-[5px] border px-[8px] py-[6px]" style={{ borderColor: '#cfc6f5', background: '#f7f5ff' }}>
						<span className="block text-[17px] leading-none font-extrabold tabular-nums" style={{ color: accent }}>
							{typo(s.value)}
						</span>
						<span className="mt-[3px] block text-[10px] leading-[1.3]" style={{ color: muted }}>
							{typo(s.label)}
						</span>
					</li>
				))}
			</ul>

			<Title>Compétences clés</Title>
			<ul className="cv-list space-y-[2px]">
				{cvSkills.map((s) => (
					<li key={s.label}>
						<strong>{s.label}</strong>
						{'\u00a0'}: {typo(sentence(s.items))}
					</li>
				))}
			</ul>

			<Title>Expérience professionnelle</Title>
			<div className="space-y-[11px]">
				{cvExperiences.map((e) => (
					<section key={e.company + e.period}>
						<div className="keep flex items-baseline justify-between gap-4">
							<h3 className="text-[12.5px] font-bold">
								{e.role} · <span style={{ color: accent }}>{e.company}</span>
								{e.client && <span className="font-semibold"> ({e.client})</span>}
							</h3>
							<span className="shrink-0 text-[10.5px] font-semibold tabular-nums">{typo(e.period)}</span>
						</div>
						<p className="keep text-[10.5px] italic" style={{ color: muted }}>
							{typo(sentence(e.context))}
						</p>
						{e.blocks.map((b) => (
							// a short group never splits across the page break (no lone bullet at the top of page 2)
							<div key={b.title ?? e.company} className={`${b.title ? 'mt-[5px]' : 'mt-[2px]'} ${b.points.length <= 3 ? 'avoid' : ''}`}>
								{b.title && (
									<div className="keep flex items-baseline justify-between gap-4">
										<h4 className="text-[11.5px] font-bold">{typo(b.title)}</h4>
										{b.period && (
											<span className="shrink-0 text-[10.5px] tabular-nums" style={{ color: muted }}>
												{typo(b.period)}
											</span>
										)}
									</div>
								)}
								<Bullets points={b.points} />
							</div>
						))}
					</section>
				))}
			</div>

			<Title>Veille et open source (2026)</Title>
			<ul className="cv-list space-y-[2px]">
				{openSource.map((p) => (
					<li key={p.name}>
						<a href={p.url} className="font-bold" style={{ color: accent }}>
							{p.name}
						</a>{' '}
						: {typo(sentence(cvProjectNotes[p.name]))}
					</li>
				))}
			</ul>

			<div className="avoid">
				<Title>Formation et certificats</Title>
				<ul className="cv-list space-y-[2px]">
					{education.map((d) => (
						<li key={d.name}>
							<span className="font-semibold">{d.name}</span>, {typo(d.title)} · {typo(d.school)}, <span className="whitespace-nowrap">{d.years}</span>.
						</li>
					))}
					<li>
						<span className="font-semibold">Anthropic Academy</span>
						{' '}:{' '}
						{anthropic.map((c, i) => (
							<span key={c.name}>
								{i > 0 && ', '}
								<em className="whitespace-nowrap">{typo(c.name)}</em>
							</span>
						))}
						.
					</li>
					{others.map((c) => (
						<li key={c.name}>
							<span className="font-semibold">{c.issuer}</span>
							{' '}: <em>{typo(c.name)}</em>.
						</li>
					))}
				</ul>
				<Title>Langues</Title>
				<ul className="cv-list space-y-[2px]">
					{cvLanguages.map((l) => (
						<li key={l.label}>
							<strong>{l.label}</strong>
							{'\u00a0'}: {typo(sentence(l.level))}
						</li>
					))}
				</ul>
			</div>
		</main>
	);
}
