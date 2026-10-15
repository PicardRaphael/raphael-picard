'use client';

import { useEffect, useRef, useState } from 'react';

import { attack, jump } from '@/components/three/world/Player';
import { player } from '@/lib/player-state';

/** Virtual joystick (bottom-left) writing analog input, camera-relative like the keyboard. */
function Joystick() {
	const base = useRef<HTMLDivElement>(null);
	const [knob, setKnob] = useState({ x: 0, y: 0 });
	const id = useRef<number | null>(null);

	const update = (cx: number, cy: number) => {
		const r = base.current?.getBoundingClientRect();
		if (!r) return;
		const max = r.width / 2;
		let dx = cx - (r.left + max);
		let dy = cy - (r.top + max);
		const d = Math.hypot(dx, dy);
		if (d > max) {
			dx = (dx / d) * max;
			dy = (dy / d) * max;
		}
		setKnob({ x: dx, y: dy });
		player.input.forward = -dy / max;
		player.input.strafe = dx / max;
		player.input.boost = d > max * 0.95;
	};
	const end = () => {
		id.current = null;
		setKnob({ x: 0, y: 0 });
		player.input.forward = 0;
		player.input.strafe = 0;
		player.input.boost = false;
	};

	return (
		<div
			ref={base}
			className="fixed bottom-6 left-6 z-20 h-32 w-32 touch-none rounded-full border-2 border-white/30 bg-black/30 backdrop-blur-sm"
			onPointerDown={(e) => {
				id.current = e.pointerId;
				e.currentTarget.setPointerCapture(e.pointerId);
				update(e.clientX, e.clientY);
			}}
			onPointerMove={(e) => id.current === e.pointerId && update(e.clientX, e.clientY)}
			onPointerUp={end}
			onPointerCancel={end}
			aria-label="Joystick de déplacement"
			role="application"
		>
			<div className="absolute top-1/2 left-1/2 h-14 w-14 rounded-full border-2 border-white/60 bg-white/25" style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }} />
		</div>
	);
}

function Round({ label, onPress, className = '' }: { label: string; onPress: () => void; className?: string }) {
	return (
		<button
			onPointerDown={(e) => {
				e.preventDefault();
				onPress();
			}}
			className={`grid touch-none place-items-center rounded-full border-2 border-white/40 bg-black/45 font-bold text-white backdrop-blur-sm active:scale-95 ${className}`}
		>
			{label}
		</button>
	);
}

export function TouchControls() {
	const [coarse, setCoarse] = useState(false);
	useEffect(() => {
		const mq = window.matchMedia('(pointer: coarse)');
		const on = () => setCoarse(mq.matches);
		on();
		mq.addEventListener('change', on);
		return () => mq.removeEventListener('change', on);
	}, []);
	if (!coarse) return null;
	return (
		<>
			<Joystick />
			<div className="fixed right-5 bottom-6 z-20 flex items-end gap-3">
				<Round label="⤒" onPress={jump} className="h-14 w-14 text-xl" />
				<Round label="⚔" onPress={attack} className="h-20 w-20 text-3xl" />
			</div>
		</>
	);
}

/** + / − zoom buttons (mouse users have the wheel, touch users the pinch). */
export function ZoomButtons() {
	const zoom = (d: number) => {
		player.camera.distance = Math.min(48, Math.max(6, player.camera.distance + d));
	};
	return (
		<div className="fixed top-1/2 right-3 z-20 flex -translate-y-1/2 flex-col gap-2">
			<button onClick={() => zoom(-4)} aria-label="Zoomer" className="h-10 w-10 rounded-full border border-white/25 bg-black/50 text-xl text-white backdrop-blur-md hover:bg-black/70">
				+
			</button>
			<button onClick={() => zoom(4)} aria-label="Dézoomer" className="h-10 w-10 rounded-full border border-white/25 bg-black/50 text-xl text-white backdrop-blur-md hover:bg-black/70">
				−
			</button>
		</div>
	);
}

/** Red flash on the screen edges when a bug hits the player. */
export function HurtFlash() {
	const [n, setN] = useState(0);
	useEffect(() => {
		const on = () => setN((x) => x + 1);
		window.addEventListener('ui:hurt', on);
		return () => window.removeEventListener('ui:hurt', on);
	}, []);
	if (!n) return null;
	return <div key={n} className="pointer-events-none fixed inset-0 z-30 animate-[hurt_0.5s_ease-out_forwards] shadow-[inset_0_0_120px_30px_rgba(225,29,72,0.65)]" aria-hidden />;
}
