'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Pitch30Button } from '@/components/ui/Pitch30';
import { hero as hero_ } from '@/content/profile';
import { game, useGame } from '@/lib/game-store';
import { ACTIONS, type Action, keyLabel, keymap } from '@/lib/keymap';
import { music } from '@/lib/music';
import { player } from '@/lib/player-state';
import { NEXUS_SPAWN } from '@/lib/world';
import { KeyHints } from './KeyHints';

type LayoutMap = Map<string, string>;

/** Real key labels for the visitor's layout (AZERTY shows Z, not W) when the browser exposes it. */
export function useLayoutLabels() {
	const [layout, setLayout] = useState<LayoutMap | null>(null);
	useEffect(() => {
		const kb = (navigator as Navigator & { keyboard?: { getLayoutMap?: () => Promise<LayoutMap> } }).keyboard;
		kb?.getLayoutMap?.()
			.then(setLayout)
			.catch(() => undefined);
	}, []);
	return (code: string) => {
		const l = layout?.get(code);
		return l && l.length === 1 ? l.toUpperCase() : keyLabel(code);
	};
}

function KeyConfig({ onClose }: { onClose: () => void }) {
	const label = useLayoutLabels();
	const [map, setMap] = useState(keymap.get());
	const [listening, setListening] = useState<Action | null>(null);

	useEffect(() => {
		if (!listening) return;
		const on = (e: KeyboardEvent) => {
			e.preventDefault();
			e.stopPropagation();
			if (e.code !== 'Escape') keymap.bind(listening, e.code);
			setMap(keymap.get());
			setListening(null);
		};
		window.addEventListener('keydown', on, { capture: true });
		return () => window.removeEventListener('keydown', on, { capture: true });
	}, [listening]);

	return (
		<div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-label="Configuration des touches">
			<div className="w-full max-w-md rounded-2xl border-2 border-[#c8a35a]/70 bg-[#140d07]/95 p-6 text-[#efe4c8]">
				<p className="font-display text-xl font-bold text-[#ffd100]">Touches</p>
				<p className="mt-1 text-sm text-[#bfae8a]">Clique sur une touche puis appuie sur la nouvelle. Les flèches restent toujours actives.</p>
				<ul className="mt-5 space-y-2">
					{ACTIONS.map((a) => (
						<li key={a.id} className="flex items-center justify-between gap-3">
							<span>{a.label}</span>
							<span className="flex items-center gap-2">
								<button
									onClick={() => setListening(a.id)}
									className={`min-w-20 rounded-lg border px-3 py-1.5 font-mono text-sm ${listening === a.id ? 'animate-pulse border-[#ffd100] text-[#ffd100]' : 'border-white/25 hover:bg-white/10'}`}
								>
									{listening === a.id ? '…' : label(map[a.id][0])}
								</button>
								{map[a.id][1] !== map[a.id][0] && <span className="w-14 font-mono text-xs text-white/40">{label(map[a.id][1])}</span>}
							</span>
						</li>
					))}
				</ul>
				<div className="mt-6 flex justify-between">
					<button
						onClick={() => {
							keymap.reset();
							setMap(keymap.get());
						}}
						className="text-sm text-[#bfae8a] underline-offset-4 hover:underline"
					>
						Réinitialiser
					</button>
					<button onClick={onClose} className="rounded-lg bg-[#ffd100] px-5 py-2 font-semibold text-black">
						OK
					</button>
				</div>
			</div>
		</div>
	);
}

/** Full screen + landscape lock; iOS Safari supports neither, the rotate hint of the HUD covers it. */
async function playLandscape() {
	try {
		if (!document.fullscreenElement) await document.documentElement.requestFullscreen?.({ navigationUI: 'hide' });
		await (screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> }).lock?.('landscape');
	} catch {
		// refused or unsupported: the portrait overlay asks to turn the phone
	}
}

const HEROES = [
	{ id: 'knight' as const, name: 'Chevalier du val', tag: 'Fantasy', text: 'Armure, épée et bouclier : le héros du Val des Origines.', ring: '#ffd100' },
	{ id: 'runner' as const, name: 'Runner du Nexus', tag: 'Cyberpunk', text: 'Vue à la première personne, fusil sci-fi : la ville à hauteur d’yeux.', ring: '#e879f9' },
];

/** Starts the game, back in the realm the save was left in. */
function begin() {
	game.set({ started: true, sound: true });
	if (game.get().resume === 'nexus') {
		player.teleport = { ...NEXUS_SPAWN };
		game.set({ zone: 'nexus', resume: 'val' });
		game.banner('Le Nexus', 'L’ère des agents');
	}
}

export function StartScreen() {
	const started = useGame((s) => s.started);
	const hero = useGame((s) => s.hero);
	const [keys, setKeys] = useState(false);
	const ready = useGame((s) => s.ready);
	const loading = useGame((s) => s.loading);
	const saved = useGame((s) => s.saved);
	// a click before the world is ready is remembered: the game starts by itself once the shaders are warm
	const [queued, setQueued] = useState(false);
	useEffect(() => {
		if (queued && ready) begin();
	}, [queued, ready]);
	const play = () => {
		// unlock audio inside the gesture itself (required by Safari / iOS)
		void music.start();
		if (ready) begin();
		else setQueued(true);
	};

	useEffect(() => {
		if (started) return;
		const on = (e: KeyboardEvent) => {
			// Enter plays, unless it is pressing another button of the screen (hero cards, keys, links)
			const el = document.activeElement;
			if (e.code !== 'Enter' || keys || (el instanceof HTMLElement && el.closest('button, a') && !el.dataset.play)) return;
			play();
		};
		window.addEventListener('keydown', on);
		return () => window.removeEventListener('keydown', on);
	});

	return (
		<>
			<div
				className={`fixed inset-0 z-30 flex flex-col items-center overflow-y-auto bg-gradient-to-t from-black/85 via-black/35 to-transparent px-4 pt-6 pb-[6vh] text-center [@media(max-height:500px)]:pt-2 [@media(max-height:500px)]:pb-2 transition-opacity duration-700 ${
					started ? 'pointer-events-none opacity-0' : 'opacity-100'
				}`}
				aria-hidden={started}
			>
				<div className="order-1 mt-auto rounded-3xl bg-black/45 px-6 py-5 shadow-[0_0_60px_30px_rgba(0,0,0,0.35)] backdrop-blur-[3px] [@media(max-height:500px)]:py-3">
					<p className="font-mono text-sm tracking-[0.22em] text-[#ffd9a0] uppercase [@media(max-height:500px)]:text-xs">Senior AI Engineer & Responsable IA · Neoteem · Lyon</p>
					<h1 className="font-display mt-2 text-5xl font-extrabold tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)] sm:text-7xl [@media(max-height:500px)]:text-4xl">
						Raphaël Picard<span className="sr-only">, Senior AI Engineer &amp; Responsable IA à Lyon</span>
					</h1>
					<p className="mx-auto mt-3 max-w-xl text-lg leading-snug text-white [@media(max-height:500px)]:hidden">
						<strong className="font-semibold text-[#ffe9a3]">7 agents IA en production chez Neoteem.</strong>
						<br />
						Choisissez un héros et explorez mon parcours en jouant, ou lisez la version classique en 2 minutes.
					</p>
					{/* phones held sideways: the proof stays, in one line */}
					<p className="mt-1 hidden text-sm font-semibold text-[#ffe9a3] [@media(max-height:500px)]:block">7 agents IA en production chez Neoteem.</p>
				</div>

				<div className="order-3 mt-7 grid w-full max-w-xl grid-cols-2 gap-3 pointer-coarse:mt-4 [@media(max-height:500px)]:mt-4" role="radiogroup" aria-label="Choix du personnage">
					{HEROES.map((h) => (
						<button
							key={h.id}
							role="radio"
							aria-checked={hero === h.id}
							onClick={() => game.set({ hero: h.id })}
							className="rounded-2xl border-2 bg-black/55 p-4 text-left backdrop-blur-md transition-all hover:-translate-y-0.5 [@media(max-height:500px)]:px-3 [@media(max-height:500px)]:py-2"
							style={{ borderColor: hero === h.id ? h.ring : 'rgba(255,255,255,0.15)', boxShadow: hero === h.id ? `0 0 30px -8px ${h.ring}` : undefined }}
						>
							<p className="font-mono text-[0.65rem] tracking-widest uppercase [@media(max-height:500px)]:hidden" style={{ color: h.ring }}>
								{h.tag}
							</p>
							<p className="font-display mt-1 text-lg font-bold text-white [@media(max-height:500px)]:mt-0 [@media(max-height:500px)]:text-base">{h.name}</p>
							<p className="mt-1 text-xs leading-snug text-white/70 pointer-coarse:hidden [@media(max-height:500px)]:hidden">{h.text}</p>
						</button>
					))}
				</div>

				<div className="order-4 mt-6 flex flex-wrap items-center justify-center gap-3 pointer-coarse:mt-4 [@media(max-height:500px)]:mt-2">
					<button
						data-play
						onClick={() => {
							play();
							// on phones (not tablets) the game is played sideways: full screen, then lock landscape where the browser allows it (Android)
							if (window.matchMedia('(pointer: coarse)').matches && Math.min(screen.width, screen.height) < 600) void playLandscape();
						}}
						aria-busy={queued && !ready}
						className="font-display relative overflow-hidden rounded-full bg-gradient-to-r from-[#651fff] to-[#c50eff] px-9 py-3.5 text-lg font-bold text-white shadow-[0_0_40px_-6px_#c50eff] transition-transform hover:scale-105"
					>
						{/* the download fills the button from the left while the world loads */}
						{!ready && <span className="absolute inset-y-0 left-0 bg-white/15 transition-[width] duration-300" style={{ width: `${loading}%` }} aria-hidden />}
						<span className="relative">{ready || !queued ? (saved ? 'Continuer la partie' : 'Jouer') : loading > 0 ? `Le monde arrive… ${loading} %` : 'Le monde arrive…'}</span>
					</button>
					{/* a game restored from this browser: continue it, or start from the beginning */}
					{saved && (
						<button onClick={() => game.newGame()} className="rounded-full border border-white/30 bg-black/40 px-5 py-3 text-sm text-white hover:bg-black/60">
							Nouvelle partie
						</button>
					)}
					<button
						onClick={() => {
							window.dispatchEvent(new CustomEvent('menu:tab', { detail: 'options' }));
							game.set({ overlay: 'menu' });
						}}
						className="rounded-full border border-white/30 bg-black/40 px-5 py-3 text-sm text-white hover:bg-black/60"
					>
						⚙ Réglages
					</button>
					<button onClick={() => setKeys(true)} className="pointer-coarse:hidden rounded-full border border-white/30 bg-black/40 px-5 py-3 text-sm text-white hover:bg-black/60">
						⌨ Touches
					</button>
				</div>
				{!ready && (
					<p className="order-5 mt-3 font-mono text-xs text-white/60 [@media(max-height:500px)]:hidden" role="status">
						Chargement du monde{loading > 0 ? ` : ${loading} %` : '…'}
					</p>
				)}
				<KeyHints withMouse className="order-6 mt-5 max-w-xl justify-center pointer-coarse:hidden" />
				<p className="order-6 mt-5 hidden text-sm text-white/75 [@media(pointer:coarse)_and_(min-height:501px)]:block">Joystick pour bouger, ⚔ attaquer, ⤒ sauter, touchez un lieu pour y aller ou parler. Glissez pour la caméra, pincez pour zoomer.</p>
				{/* the recruiter's way: CV, classic page and contact one click away, without playing */}
				<nav aria-label="Accès rapide" className="order-7 mt-5 flex flex-wrap items-center justify-center gap-2 text-sm [@media(pointer:coarse)_and_(min-height:501px)]:order-2 [@media(pointer:coarse)_and_(min-height:501px)]:mt-3 [@media(max-height:500px)]:mt-2">
					<span className="text-white/60">Pressé ?</span>
					<Pitch30Button className="rounded-full border border-[#7dd3fc]/60 bg-black/45 px-4 py-2 font-semibold text-[#7dd3fc] backdrop-blur-md hover:bg-black/70" />
					<a href={hero_.secondaryCta.href} download className="rounded-full border border-[#ffd9a0]/50 bg-black/45 px-4 py-2 text-[#ffd9a0] backdrop-blur-md hover:bg-black/70">
						Télécharger le CV
					</a>
					<Link href="/portfolio" className="rounded-full border border-white/30 bg-black/45 px-4 py-2 text-white backdrop-blur-md hover:bg-black/70">
						Version classique · 2 min
					</Link>
					<Link href="/portfolio#contact" className="rounded-full border border-white/30 bg-black/45 px-4 py-2 text-white backdrop-blur-md hover:bg-black/70">
						Me contacter
					</Link>
				</nav>
			</div>
			{keys && <KeyConfig onClose={() => setKeys(false)} />}
		</>
	);
}
