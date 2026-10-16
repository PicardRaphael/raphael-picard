'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { ACHIEVEMENTS, unlocked } from '@/lib/achievements';
import { Pitch30Button } from '@/components/ui/Pitch30';
import { game, useGame } from '@/lib/game-store';
import { mobs } from '@/lib/mobs';
import { keymap } from '@/lib/keymap';
import { player } from '@/lib/player-state';
import { QUESTS } from '@/lib/quests';
import { site } from '@/lib/site';
import { SPAWN } from '@/lib/world';

type Tab = 'home' | 'options' | 'controls' | 'achievements' | 'bestiary' | 'credits' | 'help';

const TABS: { id: Tab; icon: string; label: string }[] = [
	{ id: 'home', icon: '⌂', label: 'Accueil' },
	{ id: 'options', icon: '⚙', label: 'Options' },
	{ id: 'controls', icon: '🎮', label: 'Commandes' },
	{ id: 'achievements', icon: '🏅', label: 'Hauts faits' },
	{ id: 'bestiary', icon: '☠', label: 'Bestiaire' },
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
				<Choice value={s.sound ? 'on' : 'off'} options={[{ v: 'on', l: 'Son activé' }, { v: 'off', l: 'Son coupé' }]} onChange={(v) => game.set({ sound: v === 'on' })} />
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
						{ v: 'knight', l: 'Chevalier du val' },
						{ v: 'runner', l: 'Runner du Nexus' },
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
						game.newGame();
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

/** Every bug of the world: problem and fix once defeated, a riddle otherwise. */
function Bestiary() {
	const defeated = useGame((s) => s.defeated);
	return (
		<>
			<p className="text-center font-mono text-sm text-[#a3e635]">
				{defeated.length} / {mobs.length} bugs corrigés
			</p>
			<ul className="mt-4 grid gap-3 sm:grid-cols-2">
				{mobs.map((m) => {
					const known = defeated.includes(m.id);
					return (
						<li key={m.id} className={`rounded-xl border p-3 ${known ? 'border-white/15 bg-white/5' : 'border-white/5 bg-black/30'}`}>
							<p className={`font-display font-bold ${known ? (m.zone === 'nexus' ? 'text-[#ff7ae6]' : 'text-[#ffd100]') : 'text-white/40'}`}>{known ? m.name : '???'}</p>
							<p className="mt-1 text-xs leading-relaxed text-white/70">{known ? m.problem : m.zone === 'nexus' ? 'Rôde quelque part dans le Nexus.' : 'Rôde quelque part dans le val.'}</p>
							{known && <p className="mt-1.5 text-xs leading-relaxed text-[#86efac]">↳ {m.lesson}</p>}
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
						Je m’appelle <b className="text-white">Raphaël Picard</b>, je suis <b className="text-white">Senior AI Engineer & Responsable IA</b> chez Neoteem, à Lyon : 7 agents IA en production,
						RAG hybride, évaluations et traces, une équipe formée.
					</p>
					<p>Ceci est mon portfolio. Explorez le monde, parlez à Raphy, accomplissez les quêtes et corrigez les bugs pour découvrir mon parcours.</p>
					<p>
						Pressé ? <Pitch30Button className="text-[#7dd3fc] underline-offset-4 hover:underline">Voir le résumé en 30 s</Pitch30Button>,{' '}
						<a href="/raphael-picard-cv-senior-ai-engineer-responsable-ia.pdf" download className="text-[#7dd3fc] underline-offset-4 hover:underline">
							Téléchargez mon CV
						</a>
						, lisez la <Link href="/portfolio" className="text-[#7dd3fc] underline-offset-4 hover:underline">version classique</Link> ou{' '}
						<a href={`mailto:${site.email}`} className="text-[#7dd3fc] underline-offset-4 hover:underline">
							écrivez-moi
						</a>
						.
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
						<p className="mt-3 text-white/60">Touches par défaut : elles se reconfigurent sur l’écran d’accueil (⌨ Touches), avant de lancer la partie.</p>
					</div>
				</div>
			);
		case 'achievements':
			return <Achievements />;
		case 'bestiary':
			return <Bestiary />;
		case 'credits':
			return (
				<div className="space-y-4 text-sm text-white/85">
					<p>Conception, code et textes : Raphaël Picard. Bruitages générés en direct (Web Audio API). Moteur : Next.js, React Three Fiber, three.js, shaders GLSL maison.</p>
					<div>
						<p className="mb-1 font-semibold text-white">Musiques (OpenGameArt)</p>
						<ul className="space-y-1">
							<li><a className="underline decoration-white/30 hover:text-white" href="https://opengameart.org/content/medieval-the-bards-tale" target="_blank" rel="noreferrer">Medieval: The Bard’s Tale</a> (Val des Origines) — RandomMind, CC0</li>
							<li><a className="underline decoration-white/30 hover:text-white" href="https://opengameart.org/content/medieval-exploration" target="_blank" rel="noreferrer">Medieval: Exploration</a> (Val des Origines) — RandomMind, CC0</li>
							<li>
								<a className="underline decoration-white/30 hover:text-white" href="https://opengameart.org/content/chillwave-nightdrive" target="_blank" rel="noreferrer">Chillwave Nightdrive</a> (Nexus) — Bogart VGM,{' '}
								<a className="underline decoration-white/30 hover:text-white" href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noreferrer">CC BY 3.0</a>
							</li>
							<li><a className="underline decoration-white/30 hover:text-white" href="https://opengameart.org/content/calm-ambient-1-synthwave-4k" target="_blank" rel="noreferrer">Calm Ambient 1 (Synthwave 4k)</a> (Nexus) — The Cynic Project / cynicmusic.com / pixelsphere.org, CC0</li>
						</ul>
						<p className="mt-1 text-white/60">Pistes réencodées en MP3 et volume harmonisé.</p>
					</div>
					<div>
						<p className="mb-1 font-semibold text-white">Voix des quêtes (synthèse vocale hors ligne)</p>
						<ul className="space-y-1">
							<li>
								Nexus : <a className="underline decoration-white/30 hover:text-white" href="https://huggingface.co/hexgrad/Kokoro-82M" target="_blank" rel="noreferrer">Kokoro-82M</a> — hexgrad, Apache-2.0 ; voix ff_siwis, corpus{' '}
								<a className="underline decoration-white/30 hover:text-white" href="https://datashare.ed.ac.uk/handle/10283/2353" target="_blank" rel="noreferrer">SIWIS</a> (CC BY 4.0)
							</li>
							<li>
								Val : <a className="underline decoration-white/30 hover:text-white" href="https://github.com/OHF-Voice/piper1-gpl" target="_blank" rel="noreferrer">Piper</a> — Open Home Foundation, GPL-3.0 ; voix{' '}
								<a className="underline decoration-white/30 hover:text-white" href="https://huggingface.co/rhasspy/piper-voices/tree/main/fr/fr_FR/upmc/medium" target="_blank" rel="noreferrer">fr_FR-upmc-medium</a> (locuteur pierre), corpus{' '}
								<a className="underline decoration-white/30 hover:text-white" href="https://github.com/marytts/upmc-pierre-data" target="_blank" rel="noreferrer">UPMC / MaryTTS</a> (CC BY-SA 4.0)
							</li>
						</ul>
						<p className="mt-1 text-white/60">Répliques générées hors ligne ; les enregistrements des voix du val sont partagés sous CC BY-SA 4.0.</p>
					</div>
					<div>
						<p className="mb-1 font-semibold text-white">Modèles 3D Sketchfab — licence CC BY 4.0</p>
						<ul className="space-y-1">
							<li><a className="underline decoration-white/30 hover:text-white" href="https://sketchfab.com/3d-models/9b1959fdbc774d65b75e62069bd82b19" target="_blank" rel="noreferrer">Village_Personal Assets (maisons, tour)</a> — jakekieferwaddington</li>
							<li><a className="underline decoration-white/30 hover:text-white" href="https://sketchfab.com/3d-models/d93444656b204ddd8270b9a9be0d99ec" target="_blank" rel="noreferrer">The Blacksmith’s (forge)</a> — Aartee</li>
							<li><a className="underline decoration-white/30 hover:text-white" href="https://sketchfab.com/3d-models/d246b8b4439d44c6adc854ebc5ffc5ba" target="_blank" rel="noreferrer">Handpainted Tree Pack et Texture pack 2 (sol)</a> — rudolfs</li>
							<li><a className="underline decoration-white/30 hover:text-white" href="https://sketchfab.com/3d-models/f3e0a67b9ca243b09119177649f21e17" target="_blank" rel="noreferrer">Stone Pack (rochers, falaises)</a> — ashkan.fancy</li>
							<li><a className="underline decoration-white/30 hover:text-white" href="https://sketchfab.com/3d-models/0040f94c8efd43639d8010874e4fefb6" target="_blank" rel="noreferrer">Low Poly Hand Painted Dungeon Arch (portail)</a> — bitgem</li>
							<li><a className="underline decoration-white/30 hover:text-white" href="https://sketchfab.com/3d-models/ea693b08bbff413ba634f3ae5efd8969" target="_blank" rel="noreferrer">Stylized Street Lamp</a> — lazarys</li>
							<li><a className="underline decoration-white/30 hover:text-white" href="https://sketchfab.com/3d-models/d39a0dee0f054c21b6751f7821aa7a8e" target="_blank" rel="noreferrer">3DRT – Fantasy Warrior (chevalier)</a> — 3DRT.com</li>
							<li><a className="underline decoration-white/30 hover:text-white" href="https://sketchfab.com/3d-models/1337edb8b567486aa22f15b519e60c4d" target="_blank" rel="noreferrer">Skelet warrior (bugs du val)</a> — uchaikineugene</li>
							<li><a className="underline decoration-white/30 hover:text-white" href="https://sketchfab.com/3d-models/e08b178ecddb4e47890142b10c90b3a5" target="_blank" rel="noreferrer">Neo Noir – Punk Vigilante</a> — manoeldarochadeoliveira</li>
							<li><a className="underline decoration-white/30 hover:text-white" href="https://sketchfab.com/3d-models/03a5255bb9624d4e82cb8e15e0070b70" target="_blank" rel="noreferrer">Full Gameready City Buildings III [HongKong] (Nexus)</a> — abhayexe</li>
							<li><a className="underline decoration-white/30 hover:text-white" href="https://sketchfab.com/3d-models/5849c107ecb7472bb1eef028f5b97f0d" target="_blank" rel="noreferrer">Japanese Small Vertical Neon Sign</a> — alexbescg</li>
							<li><a className="underline decoration-white/30 hover:text-white" href="https://sketchfab.com/3d-models/c91524e74c8c463ca3ddf71bc73911db" target="_blank" rel="noreferrer">Japanese Neon Street Sign</a> — mcmanusmedia</li>
							<li><a className="underline decoration-white/30 hover:text-white" href="https://sketchfab.com/3d-models/58d2570e88c642bba8ef92f3175391cf" target="_blank" rel="noreferrer">Sci-Fi Portal Gateway (porte du Nexus)</a> — Sam54123</li>
						</ul>
						<p className="mt-1 text-white/60">Modèles adaptés : découpés, optimisés, enseignes de marques repeintes.</p>
					</div>
					<p>Robots, armes et skin de squelette : Quaternius et KayKit (CC0). Eau : normal map three.js (MIT).</p>
					<p>
						Bras gantés de la vue FPS :{' '}
						<a className="underline decoration-white/30 hover:text-white" href="https://opengameart.org/content/fps-arms-rigged-only" target="_blank" rel="noreferrer">
							fps arms (rigged only)
						</a>{' '}
						— para, maillage MakeHuman, CC0 (posés sur le fusil et retexturés).
					</p>
				</div>
			);
		case 'help':
			return (
				<div className="space-y-3 text-sm leading-relaxed text-white/85">
					<p>Suis les « ! » jaunes : ils donnent des quêtes. Les « ? » dorés marquent les lieux à visiter et les quêtes à rendre.</p>
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
		// the start screen opens the menu straight on a tab (Réglages)
		const onTab = (e: Event) => setTab((e as CustomEvent<Tab>).detail);
		window.addEventListener('menu:tab', onTab);
		const on = (e: KeyboardEvent) => {
			if (e.code === 'Escape' && game.get().overlay === 'menu' && !game.get().started) {
				game.set({ overlay: null });
				return;
			}
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
		return () => {
			window.removeEventListener('keydown', on);
			window.removeEventListener('menu:tab', onTab);
		};
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
		// the baseline is the real state (a game restored from this browser included), not the first render:
		// hydration starts from the initial state, and the restored save must not look like new unlocks
		if (seen.current === null) {
			seen.current = unlocked(game.get());
			return;
		}
		const prev = seen.current;
		seen.current = list;
		// nothing is announced on the start screen
		if (!game.get().started) return;
		const fresh = list.find((id) => !prev.includes(id));
		const a = ACHIEVEMENTS.find((x) => x.id === fresh);
		// a quest reward already announced itself when the quest was handed in
		if (a && !QUESTS.some((q) => q.reward.title === a.title)) game.toast(`Haut fait : ${a.title}`, a.text);
	}, [key]);
	return null;
}
