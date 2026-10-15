'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';

import { game, useGame } from '@/lib/game-store';
import { player } from '@/lib/player-state';
import { mobs } from '@/lib/mobs';
import { music } from '@/lib/music';
import { QUESTS } from '@/lib/quests';
import { LANDMARKS, NEXUS_CENTER, NEXUS_RADIUS, VAL_RADIUS, landmark } from '@/lib/world';
import { AchievementWatcher, Menu } from './Menu';
import { Panel } from './Panels';
import { Soundtrack } from './Soundtrack';
import { StartScreen } from './StartScreen';
import { HurtFlash, TouchControls, ZoomButtons } from './TouchControls';
import { WorldMap } from './WorldMap';

function ZoneBanner() {
	const banner = useGame((s) => s.banner);
	const started = useGame((s) => s.started);
	// the CSS animation fades the banner out by itself; a new id restarts it
	const visible = banner;
	useEffect(() => {
		if (started) game.banner('Val des Origines', "L'ère du code");
	}, [started]);
	if (!visible) return null;
	return (
		<div key={visible.id} className="pointer-events-none fixed inset-x-0 top-[16vh] z-20 animate-[zone-in_3.8s_ease-out_forwards] text-center">
			<p className="font-display text-4xl font-extrabold tracking-wide text-[#ffd100] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] sm:text-6xl">{visible.title}</p>
			<p className="mt-2 font-mono text-sm tracking-[0.3em] text-white/85 uppercase drop-shadow">{visible.subtitle}</p>
		</div>
	);
}

function Toast() {
	const toast = useGame((s) => s.toast);
	const visible = toast;
	if (!visible) return null;
	return (
		<div key={visible.id} role="status" className="fixed inset-x-0 top-24 z-40 flex animate-[zone-in_4.5s_ease-out_forwards] justify-center px-4">
			<div className="flex items-center gap-4 rounded-2xl border-2 border-[#ffd100]/70 bg-[#1b1206]/95 px-5 py-3 shadow-[0_0_40px_-10px_#ffd100]">
				<span className="grid h-12 w-12 place-items-center rounded-xl border border-[#ffd100] bg-[#ffd100]/15 text-2xl text-[#ffd100]">★</span>
				<div>
					<p className="font-display font-bold text-[#ffd100]">{visible.title}</p>
					<p className="text-sm text-[#efe4c8]">{visible.text}</p>
				</div>
			</div>
		</div>
	);
}

function QuestTracker() {
	const quests = useGame((s) => s.quests);
	const visited = useGame((s) => s.visited);
	const active = QUESTS.filter((q) => quests[q.id] === 'active' || quests[q.id] === 'ready');
	const available = QUESTS.find((q) => quests[q.id] === 'available');
	const kills = useGame((s) => s.kills);
	return (
		<aside className="pointer-events-none fixed top-4 right-20 z-20 w-72 max-w-[calc(100vw-2rem)] text-right max-sm:top-auto max-sm:right-3 max-sm:bottom-48 max-sm:w-52 max-sm:text-xs" aria-label="Suivi des quêtes">
			<p className="mb-3 font-mono text-xs text-[#ff8a80] drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]">☠ Bugs corrigés : {kills} / {mobs.length}</p>
			{active.length === 0 && available && (
				<p className="text-sm text-[#ffd100] drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]">
					<span className="font-bold">!</span> Parle à {landmark(available.giver).name.split(',')[0]}
				</p>
			)}
			{active.map((q) => (
				<div key={q.id} className="mb-3 drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]">
					<p className="font-display font-bold text-[#ffd100]">{q.title}</p>
					{quests[q.id] === 'ready' ? (
						<p className="text-sm text-white">Retourne voir {landmark(q.turnIn).name.split(',')[0]} ?</p>
					) : (
						q.objectives.map((o) => (
							<p key={o.id} className={`text-sm ${visited.includes(o.id) ? 'text-white/50 line-through' : 'text-white'}`}>
								- {o.label} {visited.includes(o.id) ? '1/1' : '0/1'}
							</p>
						))
					)}
				</div>
			))}
		</aside>
	);
}

function Prompt() {
	const id = useGame((s) => s.inRange);
	const panel = useGame((s) => s.panel);
	if (!id || panel) return null;
	const l = landmark(id);
	return (
		<button
			onClick={() => {
				game.set({ panel: id });
				game.visit(id);
			}}
			className="fixed bottom-28 left-1/2 z-20 -translate-x-1/2 rounded-xl border border-white/20 bg-black/70 px-5 py-2.5 text-white backdrop-blur-md transition-transform hover:scale-105"
		>
			<span className="mr-2 inline-grid h-7 w-7 place-items-center rounded-md border border-white/40 font-mono text-sm">E</span>
			{l.hint}
		</button>
	);
}

/** Top-down minimap drawn on a canvas, refreshed every frame from the live player state. */
function Minimap() {
	const ref = useRef<HTMLCanvasElement>(null);
	const zone = useGame((s) => s.zone);
	const quests = useGame((s) => s.quests);
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
				const giver = QUESTS.some((q) => (q.giver === l.id && quests[q.id] === 'available') || (q.turnIn === l.id && quests[q.id] === 'ready'));
				ctx.fillStyle = giver ? '#ffd100' : nexus ? '#e879f9' : '#f3e9cf';
				ctx.beginPath();
				ctx.arc(x, y, giver ? 4.5 : 3, 0, Math.PI * 2);
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
	}, [zone, quests]);
	return <canvas ref={ref} width={150} height={150} className="fixed bottom-4 left-4 z-20 h-[120px] w-[120px] pointer-coarse:top-16 pointer-coarse:bottom-auto sm:h-[150px] sm:w-[150px]" aria-hidden />;
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
		<div className="fixed top-4 left-4 z-20 flex items-center gap-2">
			<Link href="/portfolio" className="rounded-full border border-white/20 bg-black/50 px-4 py-2 text-sm text-white backdrop-blur-md hover:bg-black/70">
				Version classique
			</Link>
			<button
				onClick={() => {
					if (!sound) void music.start();
					game.set({ sound: !sound });
				}}
				aria-pressed={sound}
				className="rounded-full border border-white/20 bg-black/50 px-3 py-2 text-sm text-white backdrop-blur-md hover:bg-black/70"
			>
				{sound ? '♪ Son' : '♪ Muet'}
			</button>
		</div>
	);
}

function Controls() {
	return (
		<p className="pointer-events-none fixed right-4 bottom-4 z-20 hidden text-right font-mono text-[11px] leading-5 text-white/70 drop-shadow sm:block">
			clic : aller · glisser : caméra · molette : zoom
			<br />
			flèches : bouger · Espace sauter · F attaquer · E interagir
		</p>
	);
}

export function GameUI() {
	const started = useGame((s) => s.started);
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
					<ZoomButtons />
					<TouchControls />
				</>
			)}
			<ZoneBanner />
			<Toast />
			<Soundtrack />
			<HurtFlash />
			<Panel />
			<Menu />
			<AchievementWatcher />
			<WorldMap />
		</>
	);
}
