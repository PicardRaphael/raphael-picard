import type { Marker } from '@/lib/quests';

/**
 * Draws a place on a 2D map, WoW-style: yellow "!" (quest to take), yellow "?" (quest to hand in),
 * grey "?" (quest in progress), golden "?" in a pulsing ring (objective to visit, as in the 3D world), a dot otherwise.
 */
export function drawMarker(ctx: CanvasRenderingContext2D, x: number, y: number, marker: Marker, k: number, base = '#ffffff') {
	if (marker === 'objective') {
		const pulse = 1 + 0.25 * Math.sin(performance.now() / 220);
		ctx.strokeStyle = '#ffd100';
		ctx.lineWidth = 2.5 * k;
		ctx.beginPath();
		ctx.arc(x, y, 11 * k * pulse, 0, Math.PI * 2);
		ctx.stroke();
		ctx.fillStyle = 'rgba(255,209,0,0.25)';
		ctx.fill();
	}
	if (marker === '!' || marker === '?' || marker === '?grey' || marker === 'objective') {
		ctx.save();
		ctx.font = `900 ${Math.round(22 * k)}px sans-serif`;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.lineWidth = 5 * k;
		ctx.strokeStyle = '#1a1000';
		ctx.fillStyle = marker === '?grey' ? '#c8c8c8' : '#ffd100';
		const glyph = marker === '!' ? '!' : '?';
		ctx.strokeText(glyph, x, y);
		ctx.fillText(glyph, x, y);
		ctx.restore();
		return;
	}
	ctx.fillStyle = base;
	ctx.strokeStyle = '#111';
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.arc(x, y, 5 * k, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();
}
