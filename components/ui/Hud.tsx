'use client';

import { useEffect, useRef, useState } from 'react';

import { game, useGame } from '@/lib/game-store';
import { sceneState } from '@/lib/scene-state';
import { REALMS, STATIONS } from '@/lib/stations';

/**
 * Game-like heads-up display for the scroll journey: current realm and sector,
 * speed gauge, waypoint navigation, boost (hold Space) and sound toggle.
 */
export function Hud() {
	const mode = useGame((s) => s.mode);
	const sound = useGame((s) => s.sound);
	const [station, setStation] = useState(0);
	const [realm, setRealm] = useState<'ancien' | 'futur'>('ancien');
	const speedRef = useRef<HTMLSpanElement>(null);
	const barRef = useRef<HTMLSpanElement>(null);
	const progressRef = useRef<HTMLSpanElement>(null);
	const [flash, setFlash] = useState(0);

	useEffect(() => {
		let raf = 0;
		let lastStation = -1;
		let lastRealm = '';
		const loop = () => {
			raf = requestAnimationFrame(loop);
			if (sceneState.station !== lastStation) {
				lastStation = sceneState.station;
				setStation(lastStation);
			}
			const r = sceneState.realm > 0.5 ? 'futur' : 'ancien';
			if (r !== lastRealm) {
				if (lastRealm) setFlash((f) => f + 1);
				lastRealm = r;
				setRealm(r);
			}
			const v = Math.min(sceneState.speed, 1.9);
			if (speedRef.current) speedRef.current.textContent = (v * 0.42).toFixed(2);
			if (barRef.current) barRef.current.style.transform = `scaleX(${Math.min(v / 1.9, 1)})`;
			if (progressRef.current) progressRef.current.style.transform = `scaleY(${sceneState.travel})`;
		};
		raf = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(raf);
	}, []);

	// Keyboard: hold Space to boost, 1-8 to warp to a sector.
	useEffect(() => {
		const typing = (e: KeyboardEvent) => e.target instanceof Element && e.target.closest('input, textarea, select, [contenteditable]');
		const down = (e: KeyboardEvent) => {
			if (typing(e) || game.get().mode !== 'journey') return;
			if (e.code === 'Space') {
				e.preventDefault();
				sceneState.boost = 1;
			}
			const n = Number(e.key);
			if (n >= 1 && n <= STATIONS.length) document.getElementById(STATIONS[n - 1].id)?.scrollIntoView({ behavior: 'smooth' });
		};
		const up = (e: KeyboardEvent) => {
			if (e.code === 'Space') sceneState.boost = 0;
		};
		window.addEventListener('keydown', down);
		window.addEventListener('keyup', up);
		return () => {
			window.removeEventListener('keydown', down);
			window.removeEventListener('keyup', up);
		};
	}, []);

	if (mode !== 'journey') return null;
	const s = STATIONS[station];
	const accent = realm === 'ancien' ? 'text-[#ffb35c]' : 'text-signal';

	return (
		<>
			{/* portal crossing flash */}
			{flash > 0 && <div key={flash} className="pointer-events-none fixed inset-0 z-30 animate-[portal-flash_1.2s_ease-out_forwards] bg-white" aria-hidden />}

			<div className="pointer-events-none fixed bottom-4 left-4 z-30 hidden font-mono text-[11px] sm:block" aria-hidden>
				<div className="glass pointer-events-auto w-64 rounded-2xl p-4">
					<p className={`tracking-[0.25em] uppercase ${accent}`}>{REALMS[realm].name}</p>
					<p className="text-dim mt-0.5">{REALMS[realm].era}</p>
					<p className="text-ink mt-3 text-sm">
						<span className={accent}>{s.code}</span> · {s.sector}
					</p>
					<div className="mt-3 flex items-center gap-2">
						<span className="text-dim">VIT</span>
						<span className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
							<span ref={barRef} className="from-violet to-magenta block h-full origin-left scale-x-0 bg-gradient-to-r" />
						</span>
						<span ref={speedRef} className="text-ink w-8 text-right">
							0.00
						</span>
						<span className="text-dim">c</span>
					</div>
					<div className="mt-3 flex items-center justify-between gap-2">
						<button
							type="button"
							onPointerDown={() => (sceneState.boost = 1)}
							onPointerUp={() => (sceneState.boost = 0)}
							onPointerLeave={() => (sceneState.boost = 0)}
							className="text-mist hover:text-ink rounded-lg border border-white/10 px-2 py-1 transition-colors"
						>
							⎵ Boost
						</button>
						<button
							type="button"
							onClick={() => game.set({ sound: !sound })}
							aria-pressed={sound}
							className="text-mist hover:text-ink rounded-lg border border-white/10 px-2 py-1 transition-colors"
						>
							{sound ? '♪ Son activé' : '♪ Son coupé'}
						</button>
					</div>
				</div>
			</div>

			<nav aria-label="Secteurs" className="fixed top-1/2 right-4 z-30 hidden -translate-y-1/2 xl:block">
				<div className="relative flex flex-col gap-3 py-1">
					<span className="absolute top-0 right-[5px] h-full w-px bg-white/10" aria-hidden />
					<span ref={progressRef} className="from-magenta to-signal absolute top-0 right-[5px] h-full w-px origin-top scale-y-0 bg-gradient-to-b" aria-hidden />
					{STATIONS.map((st, i) => (
						<a key={st.id} href={`#${st.id}`} className="group relative flex items-center justify-end gap-3" aria-current={i === station ? 'location' : undefined}>
							<span className={`font-mono text-[11px] transition-all ${i === station ? 'text-ink opacity-100' : 'text-dim opacity-0 group-hover:opacity-100'}`}>
								{st.code} · {st.nav}
							</span>
							<span
								className={`relative z-10 h-[11px] w-[11px] rotate-45 border transition-all ${
									i === station ? 'border-orchid bg-magenta shadow-[0_0_12px_#c50eff]' : i < station ? 'border-magenta/70 bg-magenta/30' : 'border-white/30 bg-black'
								}`}
							/>
						</a>
					))}
				</div>
			</nav>

			<button
				type="button"
				onClick={() => game.set({ sound: !sound })}
				aria-pressed={sound}
				aria-label={sound ? 'Couper la musique' : 'Activer la musique'}
				className="glass fixed right-4 bottom-4 z-30 grid h-11 w-11 place-items-center rounded-full font-mono text-sm sm:hidden"
			>
				{sound ? '♪' : '✕'}
			</button>
		</>
	);
}
