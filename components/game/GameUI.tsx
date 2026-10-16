'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { game, useGame } from '@/lib/game-store';
import { player } from '@/lib/player-state';
import { mobs } from '@/lib/mobs';
import { music } from '@/lib/music';
import { QUESTS, markerFor, objectiveDone } from '@/lib/quests';
import { LANDMARKS, NEXUS_CENTER, NEXUS_RADIUS, VAL_RADIUS, landmark } from '@/lib/world';
import { AchievementWatcher, Menu } from './Menu';
import { drawMarker } from './mapMarkers';
import { Soundtrack } from './Soundtrack';
import { BugCard } from './BugCard';
import { EndCard } from './EndCard';
import { Crosshair } from './Crosshair';
import { KeyHints } from './KeyHints';
import { StartScreen } from './StartScreen';
import { HurtFlash, TouchControls, ZoomButtons } from './TouchControls';
import { WorldMap } from './WorldMap';

// the panels embed every portfolio section (and motion): fetched the first time a place is opened
const Panel = dynamic(() => import('./Panels').then((m) => m.Panel), { ssr: false });

function ZoneBanner() {
	const banner = useGame((s) => s.banner);
	const started = useGame((s) => s.started);
	// the CSS animation fades the banner out by itself; a new id restarts it
	const visible = banner;
	useEffect(() => {
		if (!started) return;
		if (game.get().zone === 'nexus') game.banner('Le Nexus', 'L’ère des agents');
		else game.banner('Val des Origines', 'L’ère du code');
	}, [started]);
	if (!visible) return null;
	return (
		<div key={visible.id} className="pointer-events-none fixed inset-x-0 top-[16vh] z-20 [@media(max-height:500px)]:top-[22vh] animate-[zone-in_3.8s_ease-out_forwards] text-center">
			<p className="font-display text-4xl font-extrabold tracking-wide text-[#ffd100] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] sm:text-6xl [@media(max-height:500px)]:text-3xl">{visible.title}</p>
			<p className="mt-2 font-mono text-sm tracking-[0.3em] text-white/85 uppercase drop-shadow [@media(max-height:500px)]:mt-1 [@media(max-height:500px)]:text-xs">{visible.subtitle}</p>
		</div>
	);
}

/** Portal crossing: a violet then white whirl fills the screen for 1.3 s while the realm changes behind it. */
function Warp() {
	const warp = useGame((s) => s.warp);
	if (warp === null) return null;
	return (
		<div key={warp} className="pointer-events-none fixed inset-0 z-[45] animate-[warp_1.3s_ease-in-out_forwards]" aria-hidden>
			<div className="absolute inset-[-50%] animate-[spin_1.3s_linear] bg-[conic-gradient(from_0deg,#651fff,#c50eff,#5ef2ff,#e879f9,#651fff)] opacity-70 blur-2xl" />
			<div className="absolute inset-0 bg-[radial-gradient(circle,#ffffff_0%,rgba(255,255,255,0.6)_25%,transparent_65%)]" />
		</div>
	);
}

/** "Forge examinée ✓ · 1/3": the small line that rewards each step of a quest. */
function Ticker() {
	const ticker = useGame((s) => s.ticker);
	if (!ticker) return null;
	return (
		<div key={ticker.id} role="status" className="pointer-events-none fixed inset-x-0 top-[30vh] z-30 flex animate-[zone-in_3s_ease-out_forwards] justify-center px-4 [@media(max-height:500px)]:top-[34vh]">
			<p className="rounded-full border border-[#ffd100]/40 bg-black/70 px-4 py-1.5 font-mono text-sm text-[#ffe9a3] backdrop-blur-md">{ticker.text}</p>
		</div>
	);
}

function Toast() {
	const toast = useGame((s) => s.toast);
	const visible = toast;
	if (!visible) return null;
	return (
		<div key={visible.id} role="status" className="fixed inset-x-0 top-24 z-40 flex animate-[zone-in_4.5s_ease-out_forwards] justify-center px-4 [@media(max-height:500px)]:top-14">
			<div className="flex items-center gap-4 rounded-2xl border-2 border-[#ffd100]/70 bg-[#1b1206]/95 px-5 py-3 shadow-[0_0_40px_-10px_#ffd100]">
				<span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-[#ffd100] bg-[#ffd100]/15 text-2xl text-[#ffd100] [@media(max-height:500px)]:h-9 [@media(max-height:500px)]:w-9 [@media(max-height:500px)]:text-lg">★</span>
				<div>
					<p className="font-display font-bold text-[#ffd100]">{visible.title}</p>
					<p className="text-sm text-[#efe4c8]">{visible.text}</p>
				</div>
			</div>
		</div>
	);
}

/** True on touch screens, where the HUD folds itself to leave the world visible. */
function useCoarse() {
	const [coarse, setCoarse] = useState(false);
	useEffect(() => {
		const mq = window.matchMedia('(pointer: coarse)');
		const on = () => setCoarse(mq.matches);
		on();
		mq.addEventListener('change', on);
		return () => mq.removeEventListener('change', on);
	}, []);
	return coarse;
}

function QuestTracker() {
	const quests = useGame((s) => s.quests);
	const visited = useGame((s) => s.visited);
	const progress = useGame((s) => s.progress);
	const tracked = useGame((s) => s.tracked);
	const kills = useGame((s) => s.kills);
	const running = QUESTS.filter((q) => quests[q.id] === 'active' || quests[q.id] === 'ready');
	// the story quest (the one that leads somewhere) comes before the side quests
	const offered = QUESTS.filter((q) => quests[q.id] === 'available').sort((a, b) => Number(!!b.next) - Number(!!a.next));
	// the followed quest first, so the trail and the list agree
	const sorted = [...running].sort((a, b) => (a.id === tracked ? -1 : b.id === tracked ? 1 : 0));
	const who = (id: string) => landmark(id).name.split(',')[0];
	const [open, setOpen] = useState(false);
	const coarse = useCoarse();
	if (coarse && !open) {
		const q = sorted[0];
		const next = q && quests[q.id] !== 'ready' ? q.objectives.find((o) => !objectiveDone(q, o, visited, progress)) : undefined;
		return (
			<button
				onClick={() => setOpen(true)}
				aria-label="Afficher le suivi des quêtes"
				className="fixed top-3 right-16 z-20 max-w-[44vw] rounded-xl border border-[#ffd100]/30 bg-black/55 px-3 py-1.5 text-right text-xs backdrop-blur-md"
			>
				{q ? (
					<>
						<span className="font-display block truncate font-bold text-[#ffd100]">➤ {q.title}</span>
						<span className="block truncate text-white/85">{quests[q.id] === 'ready' ? `À rendre : ${who(q.turnIn)}` : next?.label}</span>
					</>
				) : (
					<span className="text-[#ffd100]">{offered.length ? `➤ Parle à ${who(offered[0].giver)}` : `☠ ${kills} / ${mobs.length}`}</span>
				)}
			</button>
		);
	}
	return (
		<aside
			className="pointer-events-none fixed top-4 right-20 z-20 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-white/10 bg-[#07050f]/70 p-3 text-right backdrop-blur-md pointer-coarse:top-3 pointer-coarse:right-16 pointer-coarse:max-h-[70vh] pointer-coarse:w-60 pointer-coarse:overflow-y-auto pointer-coarse:rounded-xl pointer-coarse:bg-black/70 pointer-coarse:p-3 pointer-coarse:text-xs pointer-coarse:backdrop-blur-md"
			aria-label="Suivi des quêtes"
		>
			{coarse && (
				<button onClick={() => setOpen(false)} className="pointer-events-auto mb-2 block w-full text-right font-mono text-white/70" aria-label="Replier le suivi des quêtes">
					Replier ▴
				</button>
			)}
			<p className="mb-3 font-mono text-xs text-[#ffb4ac] drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]">☠ Bugs corrigés : {kills} / {mobs.length}</p>
			{sorted.map((q) => {
				const followed = q.id === tracked || (!tracked && q === sorted[0]);
				return (
					<button
						key={q.id}
						onClick={() => game.set({ tracked: q.id })}
						title="Suivre cette quête"
						className={`pointer-events-auto mb-3 block w-full text-right drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] ${followed ? '' : 'opacity-85 hover:opacity-100'}`}
					>
						<span className="font-display font-bold text-[#ffd100]">
							{followed && <span className="mr-1 text-xs">➤</span>}
							{q.title}
						</span>
						{quests[q.id] === 'ready' ? (
							<span className="block text-sm text-white">À rendre : {who(q.turnIn)}</span>
						) : (
							(followed ? q.objectives : q.objectives.filter((o) => !objectiveDone(q, o, visited, progress)).slice(0, 1)).map((o) => {
								const done = objectiveDone(q, o, visited, progress);
								const count = o.kills ? `${Math.min(progress[q.id] ?? 0, o.kills.n)}/${o.kills.n}` : done ? '1/1' : '0/1';
								return (
									<span key={o.id} className={`block text-sm ${done ? 'text-white/50 line-through' : 'text-white'}`}>
										- {o.label} {count}
									</span>
								);
							})
						)}
					</button>
				);
			})}
			{offered.map((q) => (
				<button
					key={q.id}
					onClick={() => game.set({ tracked: q.id })}
					title="Suivre : le chemin mène à celui qui donne la quête"
					className={`pointer-events-auto mb-1.5 block w-full text-right text-sm drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] ${q.id === tracked ? 'text-[#ffd100]' : 'text-[#ffe9a3] hover:text-[#ffd100]'}`}
				>
					<span className="font-bold">!</span> {q.title} — {who(q.giver)}
				</button>
			))}
		</aside>
	);
}

function Prompt() {
	const id = useGame((s) => s.inRange);
	const panel = useGame((s) => s.panel);
	const hero = useGame((s) => s.hero);
	// in third person the prompt floats above the hero's head (HeadPrompt); first person keeps it on screen
	if (!id || panel || hero !== 'runner' || !player.camera.firstPerson) return null;
	const l = landmark(id);
	return (
		<button
			onClick={() => {
				game.set({ panel: id });
				game.visit(id);
			}}
			className="fixed top-[58%] left-1/2 z-20 -translate-x-1/2 rounded-xl border border-[#f5c451]/50 bg-black/75 px-4 py-2 text-white shadow-[0_0_18px_rgba(245,196,81,0.25)] backdrop-blur-md transition-transform hover:scale-105"
		>
			<span className="mr-2 inline-grid h-7 w-7 place-items-center rounded-md border border-[#f5c451]/70 font-mono text-sm text-[#f5c451]">E</span>
			{l.hint}
		</button>
	);
}

/** Top-down minimap drawn on a canvas, refreshed every frame from the live player state. */
function Minimap() {
	const ref = useRef<HTMLCanvasElement>(null);
	const zone = useGame((s) => s.zone);
	const quests = useGame((s) => s.quests);
	const visited = useGame((s) => s.visited);
	useEffect(() => {
		const c = ref.current;
		const ctx = c?.getContext('2d');
		if (!c || !ctx) return;
		let raf = 0;
		const size = c.width;
		const draw = () => {
			raf = requestAnimationFrame(draw);
			const nexus = zone === 'nexus';
			const cx = nexus ? NEXUS_CENTER.x : 0;
			const cz = nexus ? NEXUS_CENTER.z : -20;
			const R = (nexus ? NEXUS_RADIUS : VAL_RADIUS) + 8;
			const k = size / 2 / R;
			ctx.clearRect(0, 0, size, size);
			ctx.save();
			ctx.beginPath();
			ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
			ctx.clip();
			ctx.fillStyle = nexus ? '#0b0718' : '#3d6b2a';
			ctx.fillRect(0, 0, size, size);
			if (!nexus) {
				ctx.fillStyle = '#2b6f86';
				ctx.beginPath();
				ctx.arc(size / 2 + (-36 - cx) * k, size / 2 + (22 - cz) * k, 15 * k, 0, Math.PI * 2);
				ctx.fill();
			}
			for (const l of LANDMARKS) {
				if ((l.zone === 'nexus') !== nexus) continue;
				const x = size / 2 + (l.x - cx) * k;
				const y = size / 2 + (l.z - cz) * k;
				drawMarker(ctx, x, y, markerFor(l.id, quests, visited), 0.55, nexus ? '#e879f9' : '#f3e9cf');
			}
			// bugs
			for (const m of mobs) {
				if (m.zone !== zone || m.state === 'dead') continue;
				ctx.fillStyle = '#ef4444';
				ctx.beginPath();
				ctx.arc(size / 2 + (m.x - cx) * k, size / 2 + (m.z - cz) * k, 2.6, 0, Math.PI * 2);
				ctx.fill();
			}
			// player arrow
			const px = size / 2 + (player.x - cx) * k;
			const py = size / 2 + (player.z - cz) * k;
			ctx.translate(px, py);
			ctx.rotate(-player.yaw);
			ctx.fillStyle = '#ffffff';
			ctx.beginPath();
			ctx.moveTo(0, -7);
			ctx.lineTo(5, 6);
			ctx.lineTo(0, 3);
			ctx.lineTo(-5, 6);
			ctx.closePath();
			ctx.fill();
			ctx.restore();
			ctx.strokeStyle = nexus ? '#8b5cf6' : '#c8a35a';
			ctx.lineWidth = 3;
			ctx.beginPath();
			ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
			ctx.stroke();
		};
		draw();
		return () => cancelAnimationFrame(raf);
	}, [zone, quests, visited]);
	return <canvas ref={ref} width={150} height={150} className="fixed bottom-4 left-4 z-20 h-[150px] w-[150px] pointer-coarse:top-14 pointer-coarse:bottom-auto pointer-coarse:left-3 pointer-coarse:h-[84px] pointer-coarse:w-[84px]" aria-hidden />;
}

function MenuButtons() {
	return (
		<div className="fixed top-4 right-4 z-30 flex flex-col gap-2">
			<button onClick={() => game.set({ overlay: 'menu' })} aria-label="Menu" className="grid h-11 w-11 place-items-center rounded-xl border border-white/25 bg-[#5b1a3a]/85 text-xl text-white backdrop-blur-md hover:brightness-125">
				☰
			</button>
			<button onClick={() => game.set({ overlay: 'map' })} aria-label="Carte" className="grid h-11 w-11 place-items-center rounded-xl border border-white/25 bg-[#5b1a3a]/85 text-xl text-white backdrop-blur-md hover:brightness-125">
				⌖
			</button>
		</div>
	);
}

function Corner() {
	const sound = useGame((s) => s.sound);
	return (
		<div className="fixed top-4 left-4 z-20 flex items-center gap-2 pointer-coarse:top-3 pointer-coarse:left-3">
			<Link href="/portfolio" aria-label="Version classique du portfolio" className="rounded-full border border-white/20 bg-black/50 px-4 py-2 text-sm text-white backdrop-blur-md hover:bg-black/70 pointer-coarse:px-3">
				<span className="pointer-coarse:hidden">Version classique</span>
				<span className="hidden pointer-coarse:inline">Classique</span>
			</Link>
			<a
				href="/cv-RaphaelPICARD-IA.pdf"
				download
				aria-label="Télécharger le CV (PDF)"
				className="rounded-full border border-[#ffd9a0]/50 bg-black/50 px-4 py-2 text-sm text-[#ffd9a0] backdrop-blur-md hover:bg-black/70 pointer-coarse:px-3"
			>
				CV
			</a>
			<button
				onClick={() => {
					if (!sound) void music.start();
					game.set({ sound: !sound });
				}}
				aria-pressed={sound}
				aria-label={sound ? 'Son activé' : 'Son coupé'}
				className="rounded-full border border-white/20 bg-black/50 px-3 py-2 text-sm text-white backdrop-blur-md hover:bg-black/70"
			>
				<span className="pointer-coarse:hidden">{sound ? '♪ Son activé' : '♪ Son coupé'}</span>
				<span className="hidden pointer-coarse:inline">{sound ? '♪' : '🔇'}</span>
			</button>
		</div>
	);
}

/** The game is played sideways on phones (not tablets): in portrait, a full-screen hint asks to turn the device. */
function RotateHint() {
	return (
		<div className="fixed inset-0 z-[70] hidden flex-col items-center justify-center gap-5 bg-[#07050f]/95 px-8 text-center pointer-coarse:portrait:max-sm:flex" role="alert">
			<span className="animate-[spin_2.4s_ease-in-out_infinite] text-6xl text-[#ffd100]" aria-hidden>
				⟳
			</span>
			<p className="font-display text-2xl font-bold text-white">Tourne ton téléphone</p>
			<p className="text-white/75">Le monde se joue à l’horizontale, comme une console.</p>
			<Link href="/portfolio" className="text-sm text-white/70 underline underline-offset-4">
				Ou lire la version classique →
			</Link>
		</div>
	);
}

/** Compact key hints, bottom-right, desktop only. */
function Controls() {
	return <KeyHints className="pointer-events-none fixed right-4 bottom-4 z-20 hidden justify-end pointer-fine:sm:flex" />;
}

export function GameUI() {
	const started = useGame((s) => s.started);
	const zone = useGame((s) => s.zone);
	const hero = useGame((s) => s.hero);
	// the mouse cursor follows the realm (golden in the val, neon in the Nexus); on the start screen, the hero picked
	const cursor = started ? zone : hero === 'runner' ? 'nexus' : 'val';
	useEffect(() => {
		document.documentElement.dataset.cursor = cursor;
		return () => {
			delete document.documentElement.dataset.cursor;
		};
	}, [cursor]);
	return (
		<>
			<StartScreen />
			{started && (
				<>
					<Corner />
					<MenuButtons />
					<QuestTracker />
					<Minimap />
					<Controls />
					<Prompt />
					<Crosshair />
					<ZoomButtons />
					<TouchControls />
					<RotateHint />
				</>
			)}
			<ZoneBanner />
			<Toast />
			<Ticker />
			<Warp />
			<EndCard />
			<BugCard />
			<Soundtrack />
			<HurtFlash />
			<Panel />
			<Menu />
			<AchievementWatcher />
			<WorldMap />
		</>
	);
}
