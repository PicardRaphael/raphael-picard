import type { Metadata } from 'next';

import { cvExperiences, cvExtraTraining, cvHeader, cvLanguages, cvProjectNotes, cvSkills, cvStats, cvSummary } from '@/content/cv';
import { certifications, education, projects } from '@/content/work';
import { site } from '@/lib/site';

/**
 * The CV, built from the site content (content/profile.ts, content/work.ts) plus the CV-only details of content/cv.ts:
 * printed to public/cv-RaphaelPICARD-IA.pdf by scripts/cv/print.mjs, so the PDF never contradicts the site.
 */
export const metadata: Metadata = {
	title: `CV — ${site.name}, ${site.role}`,
	robots: { index: false, follow: false },
};

const accent = '#651fff';
const muted = '#57506f';

const display = (url: string) => url.replace(/^https:\/\/(www\.)?/, '').replace(/\/$/, '');

function Title({ children }: { children: React.ReactNode }) {
	return (
		<h2 className="cv-title mt-[14px] mb-[6px] flex items-center gap-2 text-[10.5px] font-bold tracking-[0.16em] uppercase" style={{ color: accent }}>
			{children}
			<span aria-hidden className="h-px flex-1" style={{ background: '#ddd3ff' }} />
		</h2>
	);
}

/** Renders **bold** spans of a CV string. */
function Rich({ text }: { text: string }) {
	return text.split('**').map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : part));
}

function Bullets({ points }: { points: string[] }) {
	return (
		<ul className="cv-bullets mt-[2px] space-y-[1.5px]">
			{points.map((p) => (
				<li key={p}>
					<Rich text={p} />
				</li>
			))}
		</ul>
	);
}

export default function CvPage() {
	const openSource = projects.filter((p) => p.url && p.name in cvProjectNotes);
	const anthropic = certifications.filter((c) => c.issuer === 'Anthropic Academy');
	const others = certifications.filter((c) => c.issuer !== 'Anthropic Academy' && !c.name.includes('RNCP'));
	const contact = [
		{ label: site.email, href: `mailto:${site.email}` },
		{ label: cvHeader.phone.label, href: cvHeader.phone.href },
		{ label: display(site.url), href: site.url },
		{ label: display(site.social.linkedin), href: site.social.linkedin },
		{ label: display(site.social.github), href: site.social.github },
	];

	return (
		<main className="cv mx-auto max-w-[210mm] bg-white px-[13mm] py-[12mm] text-[10.9px] leading-[1.42] text-[#1b1530]">
			<style>{`
				@page { size: A4; margin: 11mm 13mm 12mm; }
				html, body { background: #fff !important; color-scheme: light; }
				body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
				nextjs-portal { display: none !important; }
				@media print { .cv { padding: 0 !important; max-width: none !important; } }
				.cv, .cv * { cursor: auto !important; }
				.cv a { color: inherit; text-decoration: none; }
				.cv h2, .cv h3, .cv h4 { break-after: avoid; }
				.cv li, .cv .avoid { break-inside: avoid; }
				.cv-bullets { padding-left: 11px; }
				.cv-bullets > li { position: relative; }
				.cv-bullets > li::before { content: ''; position: absolute; left: -9px; top: 0.6em; width: 4px; height: 4px; border-radius: 9999px; background: ${accent}; }
			`}</style>

			<header className="flex items-start justify-between gap-6 border-b-2 pb-[10px]" style={{ borderColor: accent }}>
				<div>
					<h1 className="font-display text-[27px] leading-none font-extrabold tracking-tight">{site.name}</h1>
					<p className="mt-[6px] text-[13.5px] font-semibold" style={{ color: accent }}>
						{site.role}
					</p>
					<p className="mt-[3px] text-[10px]" style={{ color: muted }}>
						{cvHeader.keywords}
					</p>
					<p className="mt-[2px] text-[10px]" style={{ color: muted }}>
						{cvHeader.location}
					</p>
				</div>
				<ul className="shrink-0 space-y-[1px] text-right text-[10px]">
					{contact.map((c) => (
						<li key={c.href}>
							<a href={c.href}>{c.label}</a>
						</li>
					))}
				</ul>
			</header>

			<Title>Profil</Title>
			<p className="text-[10.8px]">{cvSummary}</p>

			<ul className="avoid mt-[8px] grid grid-cols-4 gap-[6px]">
				{cvStats.map((s) => (
					<li key={s.label} className="rounded-[5px] border px-[8px] py-[5px]" style={{ borderColor: '#e4defc', background: '#f7f5ff' }}>
						<span className="block text-[15px] leading-none font-extrabold" style={{ color: accent }}>
							{s.value}
						</span>
						<span className="text-[9px] leading-[1.25]" style={{ color: muted }}>
							{s.label}
						</span>
					</li>
				))}
			</ul>

			<Title>Compétences clés</Title>
			<ul className="cv-bullets space-y-[1.5px]">
				{cvSkills.map((s) => (
					<li key={s.label}>
						<strong>{s.label}</strong> : {s.items}
					</li>
				))}
			</ul>

			<Title>Expérience professionnelle</Title>
			<div className="space-y-[9px]">
				{cvExperiences.map((e) => (
					<section key={e.company + e.period} className={e.blocks.length === 1 ? 'avoid' : undefined}>
						<div className="flex items-baseline justify-between gap-4">
							<h3 className="text-[11.6px] font-bold">
								{e.role} · <span style={{ color: accent }}>{e.company}</span>
							</h3>
							<span className="shrink-0 text-[10px] font-semibold" style={{ color: muted }}>
								{e.period}
							</span>
						</div>
						<p className="text-[10px] italic" style={{ color: muted }}>
							{e.context}
						</p>
						{e.blocks.map((b, i) => (
							<div key={b.title ?? e.company} className={b.title ? 'avoid mt-[4px]' : 'mt-[1px]'}>
								{b.title && <h4 className="text-[10.6px] font-semibold">{b.title}</h4>}
								<Bullets points={b.points} />
								{/* the stack line stays with the last block, never alone at the top of a page */}
								{i === e.blocks.length - 1 && (
									<p className="mt-[2px] text-[9.5px]" style={{ color: muted }}>
										<span className="font-semibold">Stack : </span>
										{e.stack}
									</p>
								)}
							</div>
						))}
					</section>
				))}
			</div>

			<Title>Projets open source</Title>
			<ul className="space-y-[3px]">
				{openSource.map((p) => (
					<li key={p.name}>
						<div className="flex items-baseline justify-between gap-4">
							<a href={p.url} className="font-bold" style={{ color: accent }}>
								{p.name}
							</a>
							<a href={p.url} className="shrink-0 text-[9.5px]" style={{ color: muted }}>
								{p.url && display(p.url)}
							</a>
						</div>
						<p>{cvProjectNotes[p.name]}</p>
					</li>
				))}
			</ul>

			<div className="avoid">
				<div>
					<Title>Formation & certifications</Title>
					<ul className="cv-bullets space-y-[1.5px]">
						{education.map((d) => (
							<li key={d.name}>
								<span className="font-semibold">{d.name}</span> · {d.school}, <span className="whitespace-nowrap">{d.years}</span>
							</li>
						))}
						<li>
							<span className="font-semibold">Anthropic Academy</span> : {anthropic.map((c) => c.name).join(' · ')}
						</li>
						{others.map((c) => (
							<li key={c.name}>
								<span className="font-semibold">{c.name}</span> · {c.issuer}
							</li>
						))}
						<li>{cvExtraTraining}</li>
					</ul>
				</div>
				<div>
					<Title>Langues</Title>
					<p>{cvLanguages.join(' · ')}</p>
				</div>
			</div>
		</main>
	);
}
