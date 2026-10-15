'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { ACHIEVEMENTS, unlocked } from '@/lib/achievements';
import { game, useGame } from '@/lib/game-store';
import { keymap } from '@/lib/keymap';
import { player } from '@/lib/player-state';
import { QUESTS } from '@/lib/quests';
import { site } from '@/lib/site';
import { SPAWN } from '@/lib/world';

type Tab = 'home' | 'options' | 'controls' | 'achievements' | 'credits' | 'help';

const TABS: { id: Tab; icon: string; label: string }[] = [
	{ id: 'home', icon: '⌂', label: 'Accueil' },
	{ id: 'options', icon: '⚙', label: 'Options' },
	{ id: 'controls', icon: '🎮', label: 'Commandes' },
	{ id: 'achievements', icon: '🏅', label: 'Hauts faits' },
	{ id: 'credits', icon: '✦', label: 'Crédits' },
	{ id: 'help', icon: '?', label: 'Aide' },
];

function Row({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div className="flex items-center justify-between gap-4 py-2">
			<span className="text-white/85">{label}</span>
			<div className="flex flex-wrap justify-end gap-1.5">{children}</div>
		</div>
	);
}

function Choice<T extends string>({ value, options, onChange }: { value: T; options: { v: T; l: string }[]; onChange: (v: T) => void }) {
	return (
		<>
			{options.map((o) => (
				<button
					key={o.v}
					onClick={() => onChange(o.v)}
					className={`rounded-lg border px-3 py-1.5 text-sm ${value === o.v ? 'border-[#ffd100] bg-[#ffd100]/15 text-[#ffd100]' : 'border-white/20 text-white/80 hover:bg-white/10'}`}
				>
					{o.l}
				</button>
			))}
		</>
	);
}

function Options() {
	const s = useGame((x) => x);
	return (
		<div className="divide-y divide-white/10">
			<Row label="Musique & sons">
				<Choice value={s.sound ? 'on' : 'off'} options={[{ v: 'on', l: 'Activés' }, { v: 'off', l: 'Coupés' }]} onChange={(v) => game.set({ sound: v === 'on' })} />
			</Row>
			<Row label="Heure">
				<Choice
					value={s.timeMode}
					options={[
						{ v: 'auto', l: 'Mon heure' },
						{ v: 'day', l: 'Jour' },
						{ v: 'dusk', l: 'Crépuscule' },
						{ v: 'night', l: 'Nuit' },
					]}
					onChange={(v) => game.set({ timeMode: v })}
				/>
			</Row>
			<Row label="Météo">
				<Choice
					value={s.weather}
					options={[
						{ v: 'auto', l: 'Auto' },
						{ v: 'clear', l: 'Clair' },
						{ v: 'rain', l: 'Pluie' },
						{ v: 'fog', l: 'Brume' },
					]}
					onChange={(v) => game.set({ weather: v })}
				/>
			</Row>
			<Row label="Personnage">
				<Choice
					value={s.hero}
					options={[
						{ v: 'knight', l: 'Chevalier' },
						{ v: 'runner', l: 'Runner cyber' },
					]}
					onChange={(v) => game.set({ hero: v })}
				/>
			</Row>
			<Row label="Je suis bloqué !">
				<button
					onClick={() => {
						player.teleport = { ...(s.zone === 'nexus' ? { x: 0, z: -608, yaw: 0 } : SPAWN) };
						game.set({ overlay: null });
					}}
					className="rounded-lg border border-white/20 px-3 py-1.5 text-sm text-white/80 hover:bg-white/10"
				>
					Réapparaître
				</button>
			</Row>
			<Row label="Progression">
				<button
					onClick={() => {
						game.set({
							quests: Object.fromEntries(QUESTS.map((q, i) => [q.id, i === 0 ? 'available' : 'locked'])),
							visited: [],
							kills: 0,
							flags: [],
							jumps: 0,
							zone: 'val',
							overlay: null,
						});
						player.teleport = { ...SPAWN };
					}}
					className="rounded-lg border border-white/20 px-3 py-1.5 text-sm text-white/80 hover:bg-white/10"
				>
					Réinitialiser
				</button>
			</Row>
		</div>
	);
}

function Achievements() {
	const s = useGame((x) => x);
	const done = unlocked(s);
	return (
		<>
			<p className="text-center font-mono text-sm text-[#ffd100]">
				{done.length} / {ACHIEVEMENTS.length}
			</p>
			<ul className="mt-4 space-y-4">
				{ACHIEVEMENTS.map((a) => {
					const [n, max] = a.progress(s);
					const ok = n >= max;
					return (
						<li key={a.id}>
							<div className="flex items-baseline justify-between gap-3">
								<p className={`font-display text-lg font-bold ${ok ? 'text-[#a3e635]' : 'text-white'}`}>{a.title}</p>
								<p className={`font-mono text-sm ${ok ? 'text-[#a3e635]' : 'text-white/60'}`}>
									{ok ? '✓ ' : ''}
									{n}/{max}
								</p>
							</div>
							<p className="text-sm text-white/70">{a.text}</p>
							<div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
								<div className={`h-full ${ok ? 'bg-[#a3e635]' : 'bg-[#e879f9]'}`} style={{ width: `${(n / max) * 100}%` }} />
							</div>
						</li>
					);
				})}
			</ul>
		</>
	);
}

function Body({ tab }: { tab: Tab }) {
	switch (tab) {
		case 'home':
			return (
				<div className="space-y-3 leading-relaxed text-white/85">
					<p>Bienvenue !</p>
					<p>
						Je m’appelle <b className="text-white">Raphaël Picard</b>, je suis <b className="text-white">ingénieur IA</b> à Lyon : agents LangGraph en production, RAG, serveurs MCP et
						outillage Claude Code.
					</p>
					<p>Ceci est mon portfolio. Explore le monde, parle à Raphy, accomplis les quêtes et corrige les bugs pour découvrir mon parcours.</p>
					<p>
						Pressé ? La <Link href="/portfolio" className="text-[#7dd3fc] underline-offset-4 hover:underline">version classique</Link> résume tout, et{' '}
						<a href={`mailto:${site.email}`} className="text-[#7dd3fc] underline-offset-4 hover:underline">
							mon e-mail
						</a>{' '}
						reste ouvert.
					</p>
				</div>
			);
		case 'options':
			return <Options />;
		case 'controls':
			return (
				<div className="grid gap-5 text-sm text-white/85 sm:grid-cols-2">
					<div>
						<p className="font-display mb-2 text-lg font-bold text-white">Souris & clavier</p>
						<ul className="space-y-1.5">
							<li>Clic : aller / parler / attaquer</li>
							<li>Glisser (clic gauche ou droit) : caméra</li>
							<li>Molette : zoom</li>
							<li>Flèches ou ZQSD : bouger</li>
							<li>Espace : sauter · Maj : sprinter</li>
							<li>F : attaquer · E : interagir</li>
							<li>M : carte · Échap ou O : menu</li>
						</ul>
					</div>
					<div>
						<p className="font-display mb-2 text-lg font-bold text-white">Mobile & tablette</p>
						<ul className="space-y-1.5">
							<li>Joystick : bouger (à fond = sprint)</li>
							<li>Toucher : aller / parler / attaquer</li>
							<li>Glisser : caméra · Pincer : zoom</li>
							<li>⚔ attaquer · ⤒ sauter</li>
						</ul>
						<p className="mt-3 text-white/60">Les touches se reconfigurent depuis l’écran d’accueil (⌨ Touches).</p>
					</div>
				</div>
			);
		case 'achievements':
			return <Achievements />;
		case 'credits':
			return (
				<ul className="space-y-2 text-sm text-white/85">
					<li>Conception, code et textes : Raphaël Picard</li>
					<li>Personnages, squelettes et bâtiments : KayKit par Kay Lousberg (CC0)</li>
					<li>Végétation : Stylized Nature MegaKit par Quaternius (CC0)</li>
					<li>Musique : générée en direct avec la Web Audio API</li>
					<li>Moteur : Next.js, React Three Fiber, three.js, shaders GLSL maison</li>
				</ul>
			);
		case 'help':
			return (
				<div className="space-y-3 text-sm leading-relaxed text-white/85">
					<p>Suis les « ! » jaunes : ils donnent des quêtes. Les « ? » indiquent où les rendre.</p>
					<p>La grande porte au nord du val mène au Nexus, le monde des agents IA.</p>
					<p>Ça rame ? La version classique du portfolio contient exactement les mêmes informations.</p>
				</div>
			);
	}
}

export function Menu() {
	const open = useGame((s) => s.overlay === 'menu');
	const [tab, setTab] = useState<Tab>('home');
	useEffect(() => {
		const on = (e: KeyboardEvent) => {
			if (!game.get().started) return;
			if (e.target instanceof Element && e.target.closest('input, textarea, select')) return;
			const isMap = keymap.is('map', e.code) || e.key.toLowerCase() === 'm';
			if (isMap && !game.get().panel) {
				e.preventDefault();
				game.set({ overlay: game.get().overlay === 'map' ? null : 'map' });
				return;
			}
			if (e.code === 'Escape' && game.get().overlay) {
				game.set({ overlay: null });
				return;
			}
			if (keymap.is('menu', e.code) && !game.get().panel) game.set({ overlay: game.get().overlay === 'menu' ? null : 'menu' });
		};
		window.addEventListener('keydown', on);
		return () => window.removeEventListener('keydown', on);
	}, []);
	if (!open) return null;
	return (
		<div className="fixed inset-0 z-40 grid place-items-center bg-black/60 p-3" role="dialog" aria-modal="true" aria-label="Menu">
			<button className="absolute inset-0" aria-label="Fermer le menu" onClick={() => game.set({ overlay: null })} />
			<div className="relative w-full max-w-2xl">
				<div className="flex items-end justify-between">
					<div className="flex gap-1">
						{TABS.map((t) => (
							<button
								key={t.id}
								onClick={() => setTab(t.id)}
								title={t.label}
								aria-label={t.label}
								className={`grid h-11 w-11 place-items-center rounded-t-lg border border-b-0 text-lg ${tab === t.id ? 'border-white/30 bg-[#1c1726] text-white' : 'border-white/10 bg-[#120e19]/90 text-white/60 hover:text-white'}`}
							>
								{t.icon}
							</button>
						))}
					</div>
					<button onClick={() => game.set({ overlay: null })} className="mb-1 grid h-10 w-10 place-items-center rounded-lg bg-[#b91c1c] text-white" aria-label="Fermer">
						✕
					</button>
				</div>
				<div className="max-h-[70vh] overflow-y-auto rounded-b-xl rounded-tr-xl border border-white/30 bg-[#1c1726]/97 p-6">
					<h2 className="font-display mb-4 text-center text-3xl font-bold tracking-wide text-white">{TABS.find((t) => t.id === tab)?.label}</h2>
					<Body tab={tab} />
				</div>
			</div>
		</div>
	);
}

/** Pops a toast when an achievement unlocks during the session. */
export function AchievementWatcher() {
	const s = useGame((x) => x);
	const seen = useRef<string[] | null>(null);
	const key = unlocked(s).join(',');
	useEffect(() => {
		const list = key ? key.split(',') : [];
		const prev = seen.current;
		seen.current = list;
		if (prev === null) return;
		const fresh = list.find((id) => !prev.includes(id));
		const a = ACHIEVEMENTS.find((x) => x.id === fresh);
		if (a) game.toast(`Haut fait : ${a.title}`, a.text);
	}, [key]);
	return null;
}
