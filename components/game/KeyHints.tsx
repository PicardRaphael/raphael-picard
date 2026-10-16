'use client';

import { type ReactNode, useEffect, useState, useSyncExternalStore } from 'react';

import { game, useGame } from '@/lib/game-store';
import { keymap } from '@/lib/keymap';
import { mobs } from '@/lib/mobs';
import { player } from '@/lib/player-state';
import { landmark } from '@/lib/world';
import { useLayoutLabels } from './StartScreen';

/** French typography: a non-breaking space before « : ». */
const NB = ' ';
const GOLD = '#f5c451';

/** Bindings live in localStorage: the hints render after mount only. */
function useClient() {
	return useSyncExternalStore(
		() => () => undefined,
		() => true,
		() => false,
	);
}

/** First-person view (the runner aims with the mouse, clicks to shoot) or third person (the knight clicks to walk). */
function useFirstPerson() {
	const hero = useGame((s) => s.hero);
	const [firstPerson, setFirstPerson] = useState(player.camera.firstPerson);
	useEffect(() => {
		const on = (e: Event) => setFirstPerson((e as CustomEvent<boolean>).detail);
		window.addEventListener('fps:view', on);
		return () => window.removeEventListener('fps:view', on);
	}, []);
	return hero === 'runner' && firstPerson;
}

/** A living bug close enough to be worth hitting (sword reach plus a step for the knight, bolt range for the runner). */
function useBugNear(fps: boolean, active: boolean) {
	const [near, setNear] = useState(false);
	useEffect(() => {
		if (!active) return;
		const range = fps ? 22 : 7;
		const check = () => {
			const zone = game.get().zone;
			setNear(mobs.some((m) => m.state !== 'dead' && m.zone === zone && Math.hypot(m.x - player.x, m.z - player.z) < range));
		};
		check();
		const t = window.setInterval(check, 250);
		return () => {
			window.clearInterval(t);
			setNear(false);
		};
	}, [fps, active]);
	return active && near;
}

type Next = 'talk' | 'attack' | 'move' | null;

/** The one action worth pointing at right now: talk when a place is in reach, fight when a bug is close, walk at the start. */
function useNextAction(fps: boolean): Next {
	const talk = useGame((s) => s.inRange !== null && s.panel === null);
	const left = useGame((s) => s.flags.includes('left_spawn'));
	const near = useBugNear(fps, !talk);
	if (talk) return 'talk';
	if (near) return 'attack';
	if (!left) return 'move';
	return null;
}

/** Mouse drawn in a few strokes: the left button, the wheel, or the whole mouse sliding (drag, aim) in gold. */
function MouseIcon({ part }: { part: 'left' | 'wheel' | 'move' }) {
	return (
		<svg
			viewBox={part === 'move' ? '-7 0 30 24' : '0 0 16 24'}
			className={part === 'move' ? 'h-6 w-[1.9rem] shrink-0' : 'h-6 w-4 shrink-0'}
			aria-hidden
		>
			<rect x="1" y="1" width="14" height="22" rx="7" fill="rgba(0,0,0,0.35)" stroke="currentColor" strokeWidth="1.5" />
			<line x1="1.5" y1="10" x2="14.5" y2="10" stroke="currentColor" strokeWidth="1.2" />
			<line x1="8" y1="1.5" x2="8" y2="10" stroke="currentColor" strokeWidth="1.2" />
			{part !== 'wheel' && <path d="M7.4 1.8 A6.2 6.2 0 0 0 1.8 8 V9.4 H7.4 Z" fill={GOLD} />}
			{part === 'wheel' && <rect x="6.5" y="3.5" width="3" height="5.5" rx="1.5" fill={GOLD} />}
			{part === 'move' && (
				<g fill="none" stroke={GOLD} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
					<path d="M-2 8 L-5.5 12 L-2 16" />
					<path d="M18 8 L21.5 12 L18 16" />
				</g>
			)}
		</svg>
	);
}

/** A keycap. A hot one turns gold and sends out a ring, so the next useful key is found at a glance. */
function Cap({ children, hot = false, small = false }: { children: ReactNode; hot?: boolean; small?: boolean }) {
	return (
		<kbd
			className={`relative inline-grid shrink-0 place-items-center rounded-md border border-b-[3px] font-mono leading-none font-bold ${small ? 'h-6 min-w-6 px-1 text-xs' : 'h-7 min-w-7 px-1.5 text-[13px]'} ${hot ? 'border-[#8a6516] bg-[#f5c451] text-[#1b1206]' : 'border-white/45 bg-white/15 text-white'}`}
		>
			{hot && <span className="absolute -inset-1 rounded-lg border-2 border-[#f5c451]/80 motion-safe:animate-ping" aria-hidden />}
			{children}
		</kbd>
	);
}

function Caps({ keys, hot = false, small = false }: { keys: string[]; hot?: boolean; small?: boolean }) {
	return (
		<span className="flex gap-0.5">
			{keys.map((key, i) => (
				<Cap key={`${key}-${i}`} hot={hot} small={small}>
					{key}
				</Cap>
			))}
		</span>
	);
}

/** Movement keys laid out as on the keyboard (one key up, three below), which says « directions » without words. */
function MoveCluster({ up, left, down, right, hot }: { up: string; left: string; down: string; right: string; hot: boolean }) {
	return (
		<span className="inline-grid grid-cols-3 gap-0.5" role="group" aria-label={`${up} ${left} ${down} ${right}`}>
			<span />
			<Cap hot={hot}>{up}</Cap>
			<span />
			<Cap hot={hot}>{left}</Cap>
			<Cap hot={hot}>{down}</Cap>
			<Cap hot={hot}>{right}</Cap>
		</span>
	);
}

/** Row of keycaps for the start screen (light background of its own): the visitor's bindings, mouse first. */
export function KeyHints({ className = '', withMouse = false }: { className?: string; withMouse?: boolean }) {
	const label = useLayoutLabels();
	const client = useClient();
	const fps = useGame((s) => s.hero === 'runner');
	if (!client) return null;
	const k = keymap.get();
	const items: [ReactNode, string][] = [
		[<Caps key="m" keys={[label(k.forward[0]), label(k.left[0]), label(k.back[0]), label(k.right[0])]} />, 'bouger'],
		[<Cap key="j">{label(k.jump[0])}</Cap>, 'sauter'],
		[<Cap key="a">{label(k.attack[0])}</Cap>, 'attaquer'],
		[<Cap key="e">{label(k.interact[0])}</Cap>, 'parler'],
		[<Cap key="c">{label(k.map[0])}</Cap>, 'carte'],
		[<Cap key="w">{label(k.menu[0])}</Cap>, 'menu'],
	];
	if (withMouse)
		items.unshift(
			fps
				? [<MouseIcon key="mouse" part="move" />, `souris${NB}: viser · clic${NB}: tirer`]
				: [<MouseIcon key="mouse" part="left" />, `clic${NB}: aller · glisser${NB}: caméra`],
		);
	return (
		<ul className={`flex flex-wrap items-center gap-x-3.5 gap-y-2 ${className}`} aria-label="Commandes">
			{items.map(([key, what]) => (
				<li key={what} className="flex items-center gap-1.5 text-sm text-white/90 drop-shadow">
					{key}
					{what}
				</li>
			))}
		</ul>
	);
}

function Slot({ hot = false, dim = false, wide = false, children }: { hot?: boolean; dim?: boolean; wide?: boolean; children: ReactNode }) {
	return (
		<li
			className={`${wide ? 'hidden xl:flex' : 'flex'} shrink-0 items-center gap-1.5 rounded-xl px-1.5 py-1 text-sm whitespace-nowrap transition-colors ${hot ? 'bg-[#f5c451]/15 font-semibold text-[#ffe9a3] ring-1 ring-[#f5c451]/70' : dim ? 'text-white/75' : 'text-white'}`}
		>
			{children}
		</li>
	);
}

/**
 * In-game action bar, always on screen (desktop): one dark pill at the bottom right, on a single line. Mouse first
 * since it is the non-player's natural gesture, then the keys grouped under one verb. The next useful action (talk,
 * fight, walk) lights up in gold. Under 1024 px the jump, under 1280 px the map and menu step aside rather than wrap,
 * « Aide » still lists them all.
 */
export function ActionBar({ className = '', onHelp }: { className?: string; onHelp?: () => void }) {
	const label = useLayoutLabels();
	const client = useClient();
	const fps = useFirstPerson();
	const next = useNextAction(fps);
	const place = useGame((s) => s.inRange);
	if (!client) return null;
	const k = keymap.get();
	const hint = next === 'talk' && place ? landmark(place).hint : null;
	return (
		<ul
			className={`max-w-[calc(100vw-13rem)] flex-nowrap items-center justify-end gap-0.5 rounded-2xl border border-[#f5c451]/35 bg-black/75 p-1 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.9)] backdrop-blur-md ${className}`}
			aria-label="Commandes"
		>
			<Slot hot={fps ? next === 'attack' : next === 'move'}>
				<MouseIcon part="left" />
				{fps ? `souris${NB}: viser · clic${NB}: tirer` : `clic${NB}: aller · glisser${NB}: caméra`}
			</Slot>
			<li className="mx-1 h-6 w-px shrink-0 bg-white/20" aria-hidden />
			<Slot hot={fps && next === 'move'}>
				<Caps keys={[label(k.forward[0]), label(k.left[0]), label(k.back[0]), label(k.right[0])]} hot={fps && next === 'move'} />
				<span className="hidden lg:inline-grid">
					<Cap>{label(k.jump[0])}</Cap>
				</span>
				<span>
					bouger<span className="hidden lg:inline">, sauter</span>
				</span>
			</Slot>
			<Slot hot={next === 'talk'}>
				<Cap hot={next === 'talk'}>{label(k.interact[0])}</Cap>
				{hint ? (
					<>
						<span className="hidden min-[1400px]:inline">{hint}</span>
						<span className="min-[1400px]:hidden">parler</span>
					</>
				) : (
					'parler'
				)}
			</Slot>
			{!fps && (
				<Slot hot={next === 'attack'}>
					<Cap hot={next === 'attack'}>{label(k.attack[0])}</Cap>
					attaquer
				</Slot>
			)}
			<Slot dim wide>
				<Caps keys={[label(k.map[0]), label(k.menu[0])]} />
				carte, menu
			</Slot>
			{onHelp && (
				<li className="shrink-0">
					<button
						type="button"
						onClick={onHelp}
						aria-label="Afficher toutes les commandes"
						title="Toutes les commandes"
						className="pointer-events-auto ml-0.5 rounded-xl border border-[#f5c451]/60 px-2.5 py-1 text-sm font-semibold text-[#f5c451] hover:bg-[#f5c451]/15 focus-visible:outline-2 focus-visible:outline-[#f5c451]"
					>
						Aide
					</button>
				</li>
			)}
		</ul>
	);
}

function Row({ left, hot = false, narrow = false, children }: { left: ReactNode; hot?: boolean; narrow?: boolean; children: ReactNode }) {
	return (
		<li className={`flex items-center gap-3 rounded-lg px-2 py-1 text-sm ${hot ? 'bg-[#f5c451]/15 ring-1 ring-[#f5c451]/70' : ''}`}>
			<span className={`flex shrink-0 items-center justify-center text-white ${narrow ? 'w-9' : 'w-[5.5rem]'}`}>{left}</span>
			<span className="text-white/85">{children}</span>
		</li>
	);
}

const Strong = ({ children }: { children: ReactNode }) => <span className="font-semibold text-white">{children}</span>;

function Step({ done, children }: { done: boolean; children: ReactNode }) {
	return (
		<li className={`flex items-center gap-2 ${done ? 'text-white/55 line-through' : 'text-white'}`}>
			<span
				className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border text-[10px] leading-none ${done ? 'border-[#f5c451] bg-[#f5c451] text-[#1b1206]' : 'border-white/50'}`}
				aria-hidden
			>
				{done ? '✓' : ''}
			</span>
			<span className="sr-only">{done ? 'Fait.' : 'À faire.'}</span>
			{children}
		</li>
	);
}

/**
 * First steps: the full controls card, mouse first then keyboard, with the two first goals ticked off as they are met.
 * It gives way to the action bar once the hero has left the start and opened a first place (or on « Compris »).
 */
export function ControlsCard({ className = '', onClose }: { className?: string; onClose?: () => void }) {
	const label = useLayoutLabels();
	const client = useClient();
	const fps = useFirstPerson();
	const next = useNextAction(fps);
	const left = useGame((s) => s.flags.includes('left_spawn'));
	const opened = useGame((s) => s.visited.length > 0);
	if (!client) return null;
	const k = keymap.get();
	const cursor = k.cursor[0] === 'AltLeft' ? 'Alt' : label(k.cursor[0]);
	return (
		<section
			className={`rounded-2xl border border-[#f5c451]/45 bg-black/80 p-4 text-white shadow-[0_0_34px_-8px_rgba(245,196,81,0.5)] backdrop-blur-md ${fps ? 'w-[23rem]' : 'w-[23rem] md:w-[36rem]'} ${className}`}
			aria-label="Commandes"
		>
			<header className="flex items-start justify-between gap-4">
				<div>
					<p className="font-mono text-[11px] tracking-[0.2em] text-[#f5c451] uppercase">Commandes</p>
					<p className="font-display mt-0.5 text-lg leading-tight font-bold">
						{fps ? 'La souris vise, le clavier avance' : 'Tout se joue à la souris'}
					</p>
					<p className="text-sm text-white/70">
						{fps ? 'Clique dans le monde pour prendre la visée.' : 'Le clavier marche aussi, au choix.'}
					</p>
				</div>
				{onClose && (
					<button
						type="button"
						onClick={onClose}
						className="pointer-events-auto shrink-0 rounded-xl border border-[#f5c451]/60 px-3 py-1.5 text-sm font-semibold text-[#f5c451] hover:bg-[#f5c451]/15 focus-visible:outline-2 focus-visible:outline-[#f5c451]"
					>
						Compris
					</button>
				)}
			</header>

			<div className={`mt-3 grid gap-x-4 gap-y-3 ${fps ? '' : 'md:grid-cols-2'}`}>
				<div>
					<p className="mb-1 font-mono text-[11px] tracking-[0.18em] text-[#f5c451]/90 uppercase">À la souris</p>
					<ul className="space-y-0.5">
						{fps ? (
							<>
								<Row narrow left={<MouseIcon part="move" />}>
									<Strong>Bouger la souris</Strong> pour viser
								</Row>
								<Row narrow left={<MouseIcon part="left" />} hot={next === 'attack'}>
									<Strong>Clic</Strong> pour tirer sur un bug
								</Row>
								<Row narrow left={<Cap>{cursor}</Cap>}>
									<Strong>{cursor}</Strong> pour libérer ou reprendre la souris
								</Row>
							</>
						) : (
							<>
								<Row narrow left={<MouseIcon part="left" />} hot={next === 'move'}>
									<Strong>Clic au sol</Strong> pour y aller
								</Row>
								<Row narrow left={<MouseIcon part="left" />}>
									<Strong>Clic sur un lieu</Strong> pour y entrer
								</Row>
								<Row narrow left={<MouseIcon part="left" />} hot={next === 'attack'}>
									<Strong>Clic sur un bug</Strong> pour l’attaquer
								</Row>
								<Row narrow left={<MouseIcon part="move" />}>
									<Strong>Glisser</Strong> pour tourner la caméra
								</Row>
								<Row narrow left={<MouseIcon part="wheel" />}>
									<Strong>Molette</Strong> pour zoomer
								</Row>
							</>
						)}
					</ul>
				</div>

				<div>
					<p className="mb-1 font-mono text-[11px] tracking-[0.18em] text-[#f5c451]/90 uppercase">Au clavier</p>
					<ul className="space-y-0.5">
						<Row
							left={
								<MoveCluster
									up={label(k.forward[0])}
									left={label(k.left[0])}
									down={label(k.back[0])}
									right={label(k.right[0])}
									hot={fps && next === 'move'}
								/>
							}
							hot={fps && next === 'move'}
						>
							<Strong>{fps ? 'Avancer, se décaler' : 'Avancer, tourner'}</Strong> (ou les flèches)
						</Row>
						<Row left={<Cap hot={next === 'talk'}>{label(k.interact[0])}</Cap>} hot={next === 'talk'}>
							<Strong>Parler, entrer</Strong> {fps ? 'devant un lieu' : 'quand la bulle apparaît'}
						</Row>
						<Row left={<Cap hot={!fps && next === 'attack'}>{label(k.attack[0])}</Cap>} hot={!fps && next === 'attack'}>
							<Strong>Attaquer</Strong> un bug proche
						</Row>
						<Row
							left={
								<span className="flex gap-1">
									<Cap>{label(k.jump[0])}</Cap>
									<Cap>{label(k.sprint[0])}</Cap>
								</span>
							}
						>
							<Strong>Sauter</Strong>, <Strong>courir</Strong>
						</Row>
						<Row
							left={
								<span className="flex gap-1">
									<Cap>{label(k.map[0])}</Cap>
									<Cap>{label(k.menu[0])}</Cap>
								</span>
							}
						>
							<Strong>Carte</Strong>, <Strong>menu</Strong>
						</Row>
					</ul>
				</div>
			</div>

			{/* the two first goals, ticked off live. Once both are met (card called back with « Aide ») they are no news */}
			{!(left && opened) && (
				<div className="mt-3 border-t border-white/15 pt-2.5 [@media(max-height:700px)]:hidden">
					<p className="mb-1 font-mono text-[11px] tracking-[0.18em] text-[#f5c451]/90 uppercase">Premiers pas</p>
					<ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
						<Step done={left}>Quitter la clairière</Step>
						<Step done={opened}>Parler à quelqu’un ou ouvrir un lieu</Step>
					</ul>
				</div>
			)}
		</section>
	);
}
