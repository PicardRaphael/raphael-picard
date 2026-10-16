'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useActionState, useEffect, useState } from 'react';

import { type ContactState, sendContact } from '@/app/actions/contact';
import { Reveal } from '@/components/ui/Reveal';
import { site } from '@/lib/site';

const field = 'w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-ink placeholder:text-dim outline-none transition focus:border-magenta/70 focus:bg-black/60';

const channels = [
	{ href: `mailto:${site.email}`, glyph: '@', label: site.email, external: false },
	{ href: site.phone.href, glyph: 'tel', label: site.phone.label, external: false },
	{ href: site.social.linkedin, glyph: 'in', label: 'LinkedIn · Raphaël Picard', external: true },
	{ href: site.social.github, glyph: 'gh', label: 'GitHub · PicardRaphael', external: true },
];

export function Contact() {
	const [state, action, pending] = useActionState<ContactState, FormData>(sendContact, {});
	const [open, setOpen] = useState(false);
	// « Écrire à Raphaël » (résumé 30 s, fin du jeu) lands on /portfolio#ecrire: the form opens by itself
	useEffect(() => {
		const on = () => {
			if (window.location.hash === '#ecrire' || window.location.hash === '#contact') setOpen(true);
		};
		const t = setTimeout(on, 0);
		window.addEventListener('hashchange', on);
		return () => {
			clearTimeout(t);
			window.removeEventListener('hashchange', on);
		};
	}, []);

	return (
		<section id="contact" data-station="7" aria-labelledby="contact-title" className="relative py-28 sm:py-40">
			<div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
				<Reveal>
					<p className="eyebrow">VIII — Balise de contact</p>
					<h2 id="contact-title" className="font-display mt-4 text-4xl leading-tight font-bold text-balance sm:text-6xl">
						Un poste IA à pourvoir ? Parlons <span className="text-gradient">production</span>, pas POC.
					</h2>
					<p className="text-mist mt-6 max-w-lg text-lg leading-relaxed">
						Poste de Senior AI Engineer ou de Responsable IA à Lyon ou en télétravail, projet d’agents LLM ou de RAG, équipe à former à Claude Code : écrivez-moi.
					</p>
					<ul className="mt-8 space-y-3">
						{channels.map((c) => (
							<li key={c.href}>
								<a href={c.href} {...(c.external ? { target: '_blank', rel: 'me noopener' } : {})} className="group flex items-center gap-3 text-lg font-semibold">
									<span className="glass grid h-11 w-11 place-items-center rounded-xl font-mono text-sm" aria-hidden>
										{c.glyph}
									</span>
									<span className="group-hover:text-orchid break-all transition-colors">{c.label}</span>
								</a>
							</li>
						))}
					</ul>
				</Reveal>

				<Reveal delay={0.1}>
					<div id="ecrire" className="relative scroll-mt-24 overflow-hidden rounded-3xl border border-white/10 bg-[#0a0716]/85 p-6 shadow-[0_0_90px_-30px_#c50eff] backdrop-blur-xl sm:p-8">
						<AnimatePresence initial={false} mode="wait">
							{!open ? (
								<motion.div key="gate" exit={{ opacity: 0, scale: 1.08, filter: 'blur(10px)' }} transition={{ duration: 0.5 }} className="flex flex-col items-center py-10 text-center">
									<button onClick={() => setOpen(true)} className="group relative grid h-44 w-44 place-items-center rounded-full" aria-label="Activer la balise et ouvrir le formulaire de contact">
										<span className="border-magenta/40 absolute inset-0 animate-[spin_12s_linear_infinite] rounded-full border border-dashed" />
										<span className="border-signal/40 absolute inset-4 animate-[spin_8s_linear_infinite_reverse] rounded-full border" />
										<span className="from-violet to-magenta absolute inset-9 rounded-full bg-gradient-to-br opacity-80 blur-md transition-all duration-500 group-hover:inset-6 group-hover:opacity-100" />
										<span className="font-display relative text-sm font-bold tracking-widest uppercase">Activer</span>
									</button>
									<p className="text-mist mt-6 text-sm">Activez la balise pour m’écrire.</p>
								</motion.div>
							) : state.ok ? (
								<motion.div key="ok" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="py-14 text-center" role="status">
									<p className="font-display text-ok text-3xl font-bold">Transmission reçue ✓</p>
									<p className="text-mist mt-3">{state.message}</p>
								</motion.div>
							) : (
								<motion.form key="form" action={action} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4" noValidate>
									<div className="grid gap-4 sm:grid-cols-2">
										<label className="block">
											<span className="text-mist mb-1.5 block text-sm">Nom</span>
											<input name="name" autoComplete="name" defaultValue={state.values?.name} className={field} required />
											{state.errors?.name && <span className="mt-1 block text-xs text-red-400">{state.errors.name[0]}</span>}
										</label>
										<label className="block">
											<span className="text-mist mb-1.5 block text-sm">E-mail</span>
											<input name="email" type="email" autoComplete="email" defaultValue={state.values?.email} className={field} required />
											{state.errors?.email && <span className="mt-1 block text-xs text-red-400">{state.errors.email[0]}</span>}
										</label>
									</div>
									<label className="block">
										<span className="text-mist mb-1.5 block text-sm">Sujet</span>
										<input name="subject" defaultValue={state.values?.subject} className={field} required />
										{state.errors?.subject && <span className="mt-1 block text-xs text-red-400">{state.errors.subject[0]}</span>}
									</label>
									<label className="block">
										<span className="text-mist mb-1.5 block text-sm">Message</span>
										<textarea name="message" rows={5} defaultValue={state.values?.message} className={`${field} resize-y`} required data-lenis-prevent />
										{state.errors?.message && <span className="mt-1 block text-xs text-red-400">{state.errors.message[0]}</span>}
									</label>
									<input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
									{state.message && (
										<p className="text-sm text-[#ffb35c]" role="alert">
											{state.message}
										</p>
									)}
									<button
										type="submit"
										disabled={pending}
										className="from-violet via-magenta to-violet w-full rounded-xl bg-gradient-to-r bg-[length:200%_auto] px-6 py-3.5 font-semibold text-white transition-all duration-500 hover:bg-right disabled:opacity-60"
									>
										{pending ? 'Transmission…' : 'Envoyer le message'}
									</button>
								</motion.form>
							)}
						</AnimatePresence>
					</div>
				</Reveal>
			</div>
		</section>
	);
}
