/** Small seeded 2D simplex noise (public-domain algorithm by S. Gustavson), shared by terrain mesh and vehicle physics. */

const grad = [
	[1, 1],
	[-1, 1],
	[1, -1],
	[-1, -1],
	[1, 0],
	[-1, 0],
	[0, 1],
	[0, -1],
];

function buildPerm(seed: number) {
	const p = Array.from({ length: 256 }, (_, i) => i);
	let s = seed >>> 0;
	for (let i = 255; i > 0; i--) {
		s = (s * 1664525 + 1013904223) >>> 0;
		const j = s % (i + 1);
		[p[i], p[j]] = [p[j], p[i]];
	}
	return Uint8Array.from([...p, ...p]);
}

const perm = buildPerm(1987);
const F2 = 0.5 * (Math.sqrt(3) - 1);
const G2 = (3 - Math.sqrt(3)) / 6;

export function noise2(x: number, y: number) {
	const s = (x + y) * F2;
	const i = Math.floor(x + s);
	const j = Math.floor(y + s);
	const t = (i + j) * G2;
	const x0 = x - (i - t);
	const y0 = y - (j - t);
	const i1 = x0 > y0 ? 1 : 0;
	const j1 = x0 > y0 ? 0 : 1;
	const x1 = x0 - i1 + G2;
	const y1 = y0 - j1 + G2;
	const x2 = x0 - 1 + 2 * G2;
	const y2 = y0 - 1 + 2 * G2;
	const ii = i & 255;
	const jj = j & 255;
	let n = 0;
	const corners: [number, number, number][] = [
		[x0, y0, perm[ii + perm[jj]] % 8],
		[x1, y1, perm[ii + i1 + perm[jj + j1]] % 8],
		[x2, y2, perm[ii + 1 + perm[jj + 1]] % 8],
	];
	for (const [cx, cy, g] of corners) {
		let tt = 0.5 - cx * cx - cy * cy;
		if (tt > 0) {
			tt *= tt;
			n += tt * tt * (grad[g][0] * cx + grad[g][1] * cy);
		}
	}
	return 70 * n;
}

export function fbm(x: number, y: number, octaves = 4) {
	let a = 0.5;
	let f = 1;
	let sum = 0;
	for (let o = 0; o < octaves; o++) {
		sum += a * noise2(x * f, y * f);
		f *= 2;
		a *= 0.5;
	}
	return sum;
}
