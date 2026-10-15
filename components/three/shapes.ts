/**
 * Procedural point clouds. Every generator returns `count * 3` floats so the
 * vertex shader can blend between shapes particle by particle.
 */

type Rng = () => number;

/** Deterministic PRNG so server/client and reloads draw the same scene. */
export function mulberry32(seed: number): Rng {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

const gauss = (rng: Rng) => {
	const u = Math.max(rng(), 1e-6);
	return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rng());
};

/** A neural "brain": dense fibonacci shell + inner synapse filaments. */
export function brain(count: number, rng: Rng) {
	const out = new Float32Array(count * 3);
	const golden = Math.PI * (3 - Math.sqrt(5));
	for (let i = 0; i < count; i++) {
		let x: number, y: number, z: number;
		if (i % 5 === 0) {
			// inner filaments: random walks around great circles
			const t = rng() * Math.PI * 2;
			const k = Math.floor(rng() * 9);
			const r = 0.6 + (k / 9) * 1.3;
			x = Math.cos(t) * r;
			y = Math.sin(t * (1 + (k % 3))) * r * 0.55;
			z = Math.sin(t) * r;
		} else {
			const yy = 1 - (i / (count - 1)) * 2;
			const radius = Math.sqrt(1 - yy * yy);
			const theta = golden * i;
			const r = 2.05 + gauss(rng) * 0.05;
			x = Math.cos(theta) * radius * r;
			y = yy * r * 0.92;
			z = Math.sin(theta) * radius * r;
			// two hemispheres, a subtle cortex fold
			x += Math.sign(x) * 0.12;
			y += Math.sin(theta * 3) * 0.05;
		}
		out.set([x, y, z], i * 3);
	}
	return out;
}

/** Multi-agent constellation: a router core, eight agent clusters, orbits and edges. */
export function constellation(count: number, rng: Rng) {
	const out = new Float32Array(count * 3);
	const agents = 8;
	const nodes = Array.from({ length: agents }, (_, i) => {
		const a = (i / agents) * Math.PI * 2;
		const r = 2.6 + (i % 2) * 0.35;
		return [Math.cos(a) * r, Math.sin(a * 2) * 0.45, Math.sin(a) * r] as const;
	});
	for (let i = 0; i < count; i++) {
		const kind = rng();
		let p: [number, number, number];
		if (kind < 0.2) {
			// router core
			const u = rng() * 2 - 1;
			const t = rng() * Math.PI * 2;
			const r = 0.55 * Math.cbrt(rng());
			const s = Math.sqrt(1 - u * u);
			p = [Math.cos(t) * s * r, u * r, Math.sin(t) * s * r];
		} else if (kind < 0.62) {
			// agent nodes
			const n = nodes[Math.floor(rng() * agents)];
			const r = 0.28;
			p = [n[0] + gauss(rng) * r, n[1] + gauss(rng) * r, n[2] + gauss(rng) * r];
		} else if (kind < 0.86) {
			// edges router ↔ agent (message passing)
			const n = nodes[Math.floor(rng() * agents)];
			const t = rng();
			const j = 0.025;
			p = [n[0] * t + gauss(rng) * j, n[1] * t + gauss(rng) * j, n[2] * t + gauss(rng) * j];
		} else {
			// outer tool ring
			const t = rng() * Math.PI * 2;
			const r = 3.9 + gauss(rng) * 0.04;
			p = [Math.cos(t) * r, Math.sin(t * 3) * 0.12, Math.sin(t) * r];
		}
		out.set(p, i * 3);
	}
	return out;
}

/** Double helix with rungs — the career timeline. */
export function helix(count: number, rng: Rng) {
	const out = new Float32Array(count * 3);
	const length = 9;
	const turns = 3.2;
	for (let i = 0; i < count; i++) {
		const t = rng();
		const a = t * Math.PI * 2 * turns;
		const y = (t - 0.5) * length;
		const r = 1.1;
		const kind = rng();
		let x: number, z: number;
		if (kind < 0.8) {
			const strand = kind < 0.4 ? 0 : Math.PI;
			x = Math.cos(a + strand) * r + gauss(rng) * 0.04;
			z = Math.sin(a + strand) * r + gauss(rng) * 0.04;
		} else {
			// rungs, quantized along the strand
			const q = Math.round(t * 46) / 46;
			const qa = q * Math.PI * 2 * turns;
			const s = rng() * 2 - 1;
			x = Math.cos(qa) * r * s;
			z = Math.sin(qa) * r * s;
		}
		// lay the helix down diagonally across the screen
		const tilt = -0.95;
		out.set([y * Math.cos(tilt) - x * Math.sin(tilt), y * Math.sin(tilt) + x * Math.cos(tilt), z], i * 3);
	}
	return out;
}

/** Spiral galaxy of projects. */
export function galaxy(count: number, rng: Rng) {
	const out = new Float32Array(count * 3);
	const arms = 4;
	for (let i = 0; i < count; i++) {
		const r = Math.pow(rng(), 1.6) * 4.6;
		const arm = (Math.floor(rng() * arms) / arms) * Math.PI * 2;
		const spin = r * 1.05;
		const spread = 0.38 * (1 - r / 6);
		const a = arm + spin;
		const x = Math.cos(a) * r + gauss(rng) * spread;
		const z = Math.sin(a) * r + gauss(rng) * spread;
		const y = gauss(rng) * 0.12 * (1.4 - r / 4.6);
		// tilt the disc toward the camera
		const tilt = 1.05;
		out.set([x, y * Math.cos(tilt) - z * Math.sin(tilt), y * Math.sin(tilt) + z * Math.cos(tilt)], i * 3);
	}
	return out;
}

/** Fallback while the logo is being rasterized. */
export function sphere(count: number, rng: Rng, radius = 2) {
	const out = new Float32Array(count * 3);
	for (let i = 0; i < count; i++) {
		const u = rng() * 2 - 1;
		const t = rng() * Math.PI * 2;
		const s = Math.sqrt(1 - u * u);
		const r = radius * Math.cbrt(rng());
		out.set([Math.cos(t) * s * r, u * r, Math.sin(t) * s * r], i * 3);
	}
	return out;
}

/**
 * Rasterizes the "R" logo and samples its pixels: positions follow the glyph,
 * colors keep the violet → magenta gradient and the two white "eyes".
 */
export async function sampleLogo(src: string, count: number, rng: Rng, height = 4.4) {
	const img = new Image();
	img.decoding = 'async';
	img.src = src;
	await img.decode();

	const h = 360;
	const w = Math.round((img.naturalWidth / img.naturalHeight) * h) || 326;
	const canvas = document.createElement('canvas');
	canvas.width = w;
	canvas.height = h;
	const ctx = canvas.getContext('2d', { willReadFrequently: true });
	if (!ctx) throw new Error('2D context unavailable');
	ctx.drawImage(img, 0, 0, w, h);
	const { data } = ctx.getImageData(0, 0, w, h);

	const filled: number[] = [];
	for (let y = 0; y < h; y++) {
		for (let x = 0; x < w; x++) {
			if (data[(y * w + x) * 4 + 3] > 140) filled.push(y * w + x);
		}
	}
	if (filled.length === 0) throw new Error('Empty logo');

	const positions = new Float32Array(count * 3);
	const colors = new Float32Array(count * 3);
	const scale = height / h;
	for (let i = 0; i < count; i++) {
		const idx = filled[Math.floor(rng() * filled.length)];
		const px = idx % w;
		const py = Math.floor(idx / w);
		const o = idx * 4;
		const white = data[o] > 200 && data[o + 1] > 200 && data[o + 2] > 200;
		positions.set(
			[(px - w / 2 + rng() - 0.5) * scale, (h / 2 - py + rng() - 0.5) * scale, (rng() - 0.5) * (white ? 0.15 : 0.55)],
			i * 3,
		);
		colors.set([data[o] / 255, data[o + 1] / 255, data[o + 2] / 255], i * 3);
	}
	return { positions, colors };
}

/** Torus knot core — the orchestration engine. */
export function knot(count: number, rng: Rng) {
	const out = new Float32Array(count * 3);
	const p = 2;
	const q = 3;
	for (let i = 0; i < count; i++) {
		const t = rng() * Math.PI * 2;
		const r = 2 + Math.cos(q * t);
		const cx = r * Math.cos(p * t) * 0.8;
		const cy = r * Math.sin(p * t) * 0.8;
		const cz = -Math.sin(q * t) * 0.8;
		const tube = 0.18 * Math.sqrt(rng());
		const a = rng() * Math.PI * 2;
		out.set([cx + Math.cos(a) * tube, cy + Math.sin(a) * tube, cz + gauss(rng) * 0.08], i * 3);
	}
	return out;
}

/** Vortex portal — the contact gate. */
export function portal(count: number, rng: Rng) {
	const out = new Float32Array(count * 3);
	for (let i = 0; i < count; i++) {
		const kind = rng();
		let x: number, y: number, z: number;
		if (kind < 0.45) {
			// bright rim
			const a = rng() * Math.PI * 2;
			const r = 3 + gauss(rng) * 0.06;
			x = Math.cos(a) * r;
			y = Math.sin(a) * r;
			z = gauss(rng) * 0.08;
		} else if (kind < 0.85) {
			// spiral funnel into the gate
			const s = rng();
			const a = s * Math.PI * 8 + Math.floor(rng() * 3) * ((Math.PI * 2) / 3);
			const r = 2.9 * (1 - s * 0.85);
			x = Math.cos(a) * r + gauss(rng) * 0.05;
			y = Math.sin(a) * r + gauss(rng) * 0.05;
			z = -s * 4;
		} else {
			// runic outer circle
			const a = rng() * Math.PI * 2;
			const r = 3.7 + (Math.sin(a * 24) > 0.6 ? 0.18 : 0) + gauss(rng) * 0.03;
			x = Math.cos(a) * r;
			y = Math.sin(a) * r;
			z = 0.1;
		}
		out.set([x, y, z], i * 3);
	}
	return out;
}

/** World tree: twisted trunk, branching limbs and a glowing canopy. */
export function tree(count: number, rng: Rng) {
	const out = new Float32Array(count * 3);
	const branches = Array.from({ length: 9 }, (_, i) => {
		const a = (i / 9) * Math.PI * 2 + rng() * 0.4;
		const h = 0.6 + rng() * 1.6;
		return { a, h, len: 1.6 + rng() * 1.2, rise: 0.5 + rng() * 0.6 };
	});
	for (let i = 0; i < count; i++) {
		const k = rng();
		let x: number, y: number, z: number;
		if (k < 0.22) {
			// trunk with a slow twist and flared roots
			const t = rng();
			const yy = -3 + t * 4;
			const r = 0.42 * (1 - t * 0.55) + (t < 0.12 ? (0.12 - t) * 5 : 0);
			const a = rng() * Math.PI * 2 + t * 2.5;
			x = Math.cos(a) * r;
			y = yy;
			z = Math.sin(a) * r;
		} else if (k < 0.42) {
			// limbs
			const b = branches[Math.floor(rng() * branches.length)];
			const t = rng();
			const curve = Math.sin(t * Math.PI * 0.5);
			x = Math.cos(b.a) * b.len * t;
			z = Math.sin(b.a) * b.len * t;
			y = b.h + curve * b.rise + gauss(rng) * 0.03;
			x += gauss(rng) * 0.04;
			z += gauss(rng) * 0.04;
		} else if (k < 0.92) {
			// canopy: clustered blobs around the branch tips
			const b = branches[Math.floor(rng() * branches.length)];
			const cx = Math.cos(b.a) * b.len;
			const cz = Math.sin(b.a) * b.len;
			const cy = b.h + b.rise;
			const r = 0.75 * Math.cbrt(rng());
			const u = rng() * 2 - 1;
			const th = rng() * Math.PI * 2;
			const s = Math.sqrt(1 - u * u);
			x = cx + Math.cos(th) * s * r;
			y = cy + u * r * 0.7;
			z = cz + Math.sin(th) * s * r;
		} else {
			// falling motes of light under the canopy
			x = gauss(rng) * 1.6;
			y = -3 + rng() * 5;
			z = gauss(rng) * 1.6;
		}
		out.set([x, y, z], i * 3);
	}
	return out;
}
