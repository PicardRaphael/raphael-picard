'use client';

import { useEffect, useMemo, useRef } from 'react';

import { drawMarker } from './mapMarkers';

import { openPitch30 } from '@/components/ui/Pitch30';
import { game, useGame } from '@/lib/game-store';
import { keyLabel, keymap } from '@/lib/keymap';
import { mobs } from '@/lib/mobs';
import { fbm, noise2 } from '@/lib/noise';
import { player } from '@/lib/player-state';
import { markerFor } from '@/lib/quests';
import { HOUSES, LAKE, LANDMARKS, NEXUS_CENTER, NEXUS_RADIUS, VAL_RADIUS, pathDistance, valHeight } from '@/lib/world';

const SIZE = 640;
const BAKE = 400;
let baked: HTMLCanvasElement | null = null;

/** Painted top-down map of the valley, baked once from the same height and colour rules as the 3D terrain. */
function bakeValley() {
	if (baked) return baked;
	const c = document.createElement('canvas');
	c.width = c.height = BAKE;
	const ctx = c.getContext('2d');
	if (!ctx) return c;
	const img = ctx.createImageData(BAKE, BAKE);
	const R = VAL_RADIUS + 18;
	for (let py = 0; py < BAKE; py++) {
		for (let px = 0; px < BAKE; px++) {
			const x = (px / BAKE - 0.5) * 2 * R;
			const z = (py / BAKE - 0.5) * 2 * R - 20;
			const h = valHeight(x, z);
			let r = 98;
			let g = 161;
			let b = 54;
			const n = fbm(x * 0.05, z * 0.05, 2);
			r += n * 30;
			g += n * 30;
			if (noise2(x * 0.02 + 40, z * 0.02) > 0.35) {
				r += 40;
				g += 10;
			}
			if (pathDistance(x, z) < 3.4) [r, g, b] = [178, 140, 94];
			if (h < LAKE.level + 0.2 && Math.hypot(x - LAKE.x, z - LAKE.z) < LAKE.r + 9) [r, g, b] = [52, 140, 160];
			if (h > 14) [r, g, b] = [128, 118, 108];
			if (h > 28) [r, g, b] = [236, 232, 226];
			// soft relief shading
			const sh = (valHeight(x + 1.5, z + 1.5) - h) * 6;
			const i = (py * BAKE + px) * 4;
			img.data[i] = Math.max(0, Math.min(255, r - sh));
			img.data[i + 1] = Math.max(0, Math.min(255, g - sh));
			img.data[i + 2] = Math.max(0, Math.min(255, b - sh));
			img.data[i + 3] = Math.hypot(x, z + 20) > VAL_RADIUS + 14 ? 0 : 255;
		}
	}
	ctx.putImageData(img, 0, 0);
	baked = c;
	return c;
}

export function WorldMap() {
	const open = useGame((s) => s.overlay === 'map');
	const zone = useGame((s) => s.zone);
	const quests = useGame((s) => s.quests);
	const visited = useGame((s) => s.visited);
	const ref = useRef<HTMLCanvasElement>(null);
	/** Where each label was drawn (canvas pixels): a tap on a name travels there too. */
	const hits = useRef<{ id: string; x0: number; y0: number; x1: number; y1: number }[]>([]);
	const valley = useMemo(() => (typeof document === 'undefined' || !open ? null : bakeValley()), [open]);

	useEffect(() => {
		if (open) game.flag('map');
	}, [open]);

	useEffect(() => {
		if (!open) return;
		const c = ref.current;
		const ctx = c?.getContext('2d');
		if (!c || !ctx) return;
		let raf = 0;
		const nexus = zone === 'nexus';
		const cx = nexus ? NEXUS_CENTER.x : 0;
		const cz = nexus ? NEXUS_CENTER.z : -20;
		const R = nexus ? NEXUS_RADIUS + 18 : VAL_RADIUS + 18;
		const toPx = (x: number, z: number) => [((x - cx) / (2 * R) + 0.5) * SIZE, ((z - cz) / (2 * R) + 0.5) * SIZE] as const;
		const draw = () => {
			raf = requestAnimationFrame(draw);
			// the canvas is shown smaller than 640 px on phones: scale text and markers back up
			const k = Math.min(2.4, Math.max(1, SIZE / Math.max(c.clientWidth, 1)));
			ctx.clearRect(0, 0, SIZE, SIZE);
			if (nexus) {
				ctx.fillStyle = '#0b0718';
				ctx.beginPath();
				ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2 - 4, 0, Math.PI * 2);
				ctx.fill();
				ctx.strokeStyle = 'rgba(139,92,246,0.35)';
				for (let i = 0; i <= SIZE; i += 32) {
					ctx.beginPath();
					ctx.moveTo(i, 0);
					ctx.lineTo(i, SIZE);
					ctx.moveTo(0, i);
					ctx.lineTo(SIZE, i);
					ctx.stroke();
				}
			} else if (valley) {
				ctx.drawImage(valley, 0, 0, SIZE, SIZE);
				ctx.fillStyle = '#3b5aa8';
				for (const h of HOUSES) {
					const [x, y] = toPx(h.x, h.z);
					ctx.fillRect(x - 5, y - 5, 10, 10);
				}
			}
			for (const m of mobs) {
				if (m.zone !== zone || m.state === 'dead') continue;
				const [x, y] = toPx(m.x, m.z);
				ctx.fillStyle = '#ef4444';
				ctx.beginPath();
				ctx.arc(x, y, 4 * k, 0, Math.PI * 2);
				ctx.fill();
			}
			ctx.font = `700 ${Math.round(14 * k)}px sans-serif`;
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			// each label takes the first free spot around its place (above, below, right, left): none overlaps another
			const taken: { x0: number; y0: number; x1: number; y1: number }[] = [];
			hits.current = [];
			const free = (r: (typeof taken)[number]) => taken.every((t) => r.x1 < t.x0 || r.x0 > t.x1 || r.y1 < t.y0 || r.y0 > t.y1);
			const places = LANDMARKS.filter((l) => l.zone === zone);
			for (const l of places) {
				const [x, y] = toPx(l.x, l.z);
				const marker = markerFor(l.id, quests, visited);
				drawMarker(ctx, x, y, marker, k);
				taken.push({ x0: x - 11 * k, y0: y - 11 * k, x1: x + 11 * k, y1: y + 11 * k });
			}
			for (const l of places) {
				const [x, y] = toPx(l.x, l.z);
				const marker = markerFor(l.id, quests, visited);
				const label = k > 1.4 ? l.name.split(',')[0].replace(/^(La |Le |Les )/, '') : l.name;
				const w = ctx.measureText(label).width + 14 * k;
				const h = 18 * k;
				const spots = [
					[x, y - 19 * k],
					[x, y + 19 * k],
					[x + 14 * k + w / 2, y],
					[x - 14 * k - w / 2, y],
				];
				const box = (sx: number, sy: number) => ({ x0: sx - w / 2, y0: sy - h / 2, x1: sx + w / 2, y1: sy + h / 2 });
				const spot = spots.find(([sx, sy]) => free(box(sx, sy))) ?? spots[0];
				// kept inside the map: a label at the edge is never cut
				const sx = Math.min(SIZE - w / 2 - 4, Math.max(w / 2 + 4, spot[0]));
				const sy = spot[1];
				taken.push(box(sx, sy));
				hits.current.push({ id: l.id, ...box(sx, sy) });
				ctx.fillStyle = marker === 'objective' ? '#ffd100' : '#fff';
				ctx.strokeStyle = 'rgba(0,0,0,0.8)';
				ctx.lineWidth = 4 * k;
				ctx.strokeText(label, sx, sy);
				ctx.fillText(label, sx, sy);
			}
			const [px, py] = toPx(player.x, player.z);
			ctx.save();
			ctx.translate(px, py);
			ctx.rotate(-player.yaw);
			ctx.scale(k, k);
			ctx.fillStyle = '#ffd100';
			ctx.strokeStyle = '#000';
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.moveTo(0, -12);
			ctx.lineTo(9, 10);
			ctx.lineTo(0, 5);
			ctx.lineTo(-9, 10);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
			ctx.restore();
		};
		draw();
		return () => cancelAnimationFrame(raf);
	}, [open, zone, valley, quests, visited]);

	if (!open) return null;

	// clicking a place (or its label) on the map: fast travel next to it, facing it, and open it
	const onClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
		const r = e.currentTarget.getBoundingClientRect();
		const nexus = zone === 'nexus';
		const cx = nexus ? NEXUS_CENTER.x : 0;
		const cz = nexus ? NEXUS_CENTER.z : -20;
		const R = nexus ? NEXUS_RADIUS + 18 : VAL_RADIUS + 18;
		const px = ((e.clientX - r.left) / r.width) * SIZE;
		const py = ((e.clientY - r.top) / r.height) * SIZE;
		const label = hits.current.find((b) => px >= b.x0 && px <= b.x1 && py >= b.y0 && py <= b.y1);
		const x = ((e.clientX - r.left) / r.width - 0.5) * 2 * R + cx;
		const z = ((e.clientY - r.top) / r.height - 0.5) * 2 * R + cz;
		const l = label
			? LANDMARKS.find((m) => m.id === label.id)
			: LANDMARKS.filter((m) => m.zone === zone).sort((a, b) => Math.hypot(a.x - x, a.z - z) - Math.hypot(b.x - x, b.z - z))[0];
		if (!l || (!label && Math.hypot(l.x - x, l.z - z) > 14)) return;
		game.set({ overlay: null });
		player.moveTarget = null;
		if (l.id === 'portal') {
			// a few steps before the gate, facing it: the crossing stays the visitor's own move
			player.teleport = { x: l.x, z: l.z + 9, yaw: 0 };
			return;
		}
		if (l.id === 'portal-back') {
			player.teleport = { x: l.x, z: l.z - 9, yaw: Math.PI };
			return;
		}
		// the cinema faces its screen (west, on the facade at the end of the street)
		player.teleport = l.id === 'cinema' ? { x: l.x + 8, z: l.z, yaw: Math.PI / 2 } : { x: l.x, z: l.z + Math.max(l.solid + 3, 5), yaw: 0 };
		// arrived: the place opens as a click in the world would open it
		if (l.id === 'cinema') openPitch30();
		else {
			game.set({ panel: l.id });
			game.visit(l.id);
		}
	};

	return (
		<div className="fixed inset-0 z-40 grid place-items-center bg-black/70 p-2 sm:p-4" role="dialog" aria-modal="true" aria-label="Carte du monde">
			<button className="absolute inset-0" aria-label="Fermer la carte" onClick={() => game.set({ overlay: null })} />
			<div className="relative">
				<canvas
					ref={ref}
					width={SIZE}
					height={SIZE}
					onClick={onClick}
					className="aspect-square w-[min(96vw,82vh)] cursor-pointer rounded-[2rem] shadow-[0_0_80px_-10px_rgba(0,0,0,0.9)]"
				/>
				<p className="mt-3 text-center font-mono text-xs text-white/70"><span className="pointer-coarse:hidden">Clique sur un lieu pour t’y rendre · {keyLabel(keymap.get().map[0])} ou Échap pour fermer</span>
					<span className="hidden pointer-coarse:inline">Touche un lieu pour t’y rendre · ✕ pour fermer</span></p>
				<button onClick={() => game.set({ overlay: null })} className="absolute -top-3 -right-3 grid h-10 w-10 place-items-center rounded-lg bg-[#b91c1c] text-white">
					✕
				</button>
			</div>
		</div>
	);
}
