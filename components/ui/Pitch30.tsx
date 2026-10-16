'use client';

import { useEffect, useRef, useState } from 'react';

import { pitch30 } from '@/content/profile';
import { site } from '@/lib/site';

const OPEN = 'pitch30:open';
export const PITCH_VIDEO = '/video/resume-30s.mp4';
export const PITCH_POSTER = '/video/resume-30s.jpg';
export const PITCH_CAPTIONS = '/video/resume-30s.fr.vtt';

/** Opens the « Raphaël en 30 secondes » window from anywhere (start screen, game menu, /portfolio). */
export const openPitch30 = () => window.dispatchEvent(new Event(OPEN));

export function Pitch30Button({ className, children }: { className?: string; children?: React.ReactNode }) {
	return (
		<button type="button" onClick={openPitch30} className={className}>
			{children ?? '▶ Résumé en 30 s'}
		</button>
	);
}

/**
 * The summary itself, mounted once for the whole site: the 30-second video (loaded only when the window opens)
 * and the same story in five lines, readable without sound on a phone.
 */
/** The address itself, copied in one click (no mail client needed). */
function CopyEmail() {
	const [done, setDone] = useState(false);
	return (
		<button
			type="button"
			onClick={() => {
				void navigator.clipboard?.writeText(site.email).then(() => setDone(true));
			}}
			className="rounded-full px-3 py-2 font-mono text-xs text-white/70 hover:text-white"
		>
			{done ? 'Adresse copiée ✓' : site.email}
		</button>
	);
}

export function Pitch30Dialog() {
	const [open, setOpen] = useState(false);
	const [video, setVideo] = useState(true);
	const close = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		const on = () => setOpen(true);
		window.addEventListener(OPEN, on);
		return () => window.removeEventListener(OPEN, on);
	}, []);

	useEffect(() => {
		if (!open) return;
		const back = document.activeElement as HTMLElement | null;
		// a captured mouse (first-person view) could not reach the buttons; the game pauses its hero underneath
		if (document.pointerLockElement) document.exitPointerLock();
		document.documentElement.dataset.modal = '1';
		close.current?.focus();
		// the window owns the keyboard: Escape closes it, and no key reaches the game or the menu underneath
		const key = (e: KeyboardEvent) => {
			if (e.key === 'Tab') return;
			e.stopImmediatePropagation();
			if (e.key === 'Escape') setOpen(false);
		};
		window.addEventListener('keydown', key, true);
		return () => {
			window.removeEventListener('keydown', key, true);
			delete document.documentElement.dataset.modal;
			back?.focus?.();
		};
	}, [open]);

	if (!open) return null;
	return (
		<div role="dialog" aria-modal="true" aria-labelledby="pitch30-title" className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-6" onClick={() => setOpen(false)}>
			<div
				className="relative max-h-full w-full max-w-4xl overflow-y-auto rounded-2xl border border-white/15 bg-[#0b0920]/95 p-4 text-left text-white shadow-[0_0_80px_-20px_rgb(197_14_255_/_0.7)] sm:p-6"
				onClick={(e) => e.stopPropagation()}
			>
				<button ref={close} type="button" onClick={() => setOpen(false)} aria-label="Fermer" className="absolute top-2 right-2 z-10 grid h-10 w-10 place-items-center rounded-full bg-black/60 text-xl text-white hover:bg-black/90">
					×
				</button>
				<h2 id="pitch30-title" className="font-display pr-10 text-xl font-extrabold sm:text-2xl">
					{pitch30.title}
				</h2>
				<div className="mt-3 grid gap-4 md:grid-cols-[1.35fr_1fr] md:gap-6">
					{video && (
						<video
							className="aspect-video w-full rounded-xl border border-white/10 bg-black"
							src={PITCH_VIDEO}
							poster={PITCH_POSTER}
							controls
							autoPlay
							muted
							playsInline
							preload="metadata"
							onError={() => setVideo(false)}
						>
							<track kind="captions" src={PITCH_CAPTIONS} srcLang="fr" label="Français" default />
						</video>
					)}
					<dl className={`space-y-2.5 text-sm leading-snug ${video ? '' : 'md:col-span-2'}`}>
						{pitch30.points.map((p) => (
							<div key={p.label}>
								<dt className="font-mono text-[11px] tracking-[0.18em] text-[#7dd3fc] uppercase">{p.label}</dt>
								<dd className="text-white/90">{p.text}</dd>
							</div>
						))}
					</dl>
				</div>
				<div className="mt-4 flex flex-wrap gap-2 text-sm">
					<a href="/cv-RaphaelPICARD-IA.pdf" download className="rounded-full bg-gradient-to-r from-[#651fff] to-[#c50eff] px-4 py-2 font-semibold">
						Télécharger le CV
					</a>
					<a href="/portfolio#ecrire" target="_blank" rel="noopener" className="rounded-full border border-white/25 px-4 py-2 hover:bg-white/10">
						Écrire à Raphaël
					</a>
					<a href={site.social.linkedin} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/25 px-4 py-2 hover:bg-white/10">
						LinkedIn
					</a>
					<CopyEmail />
				</div>
			</div>
		</div>
	);
}
