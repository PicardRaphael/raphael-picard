// gloved/sleeved recolor of the MakeHuman arms texture: forearms (top half of UV) -> tactical sleeve, hands (bottom) -> glove
import sharp from 'sharp';
const [, , input, output] = process.argv;
const { data, info } = await sharp(input).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height, C = info.channels;
let sum = 0, n = 0;
for (let i = 0; i < W * H; i++) { const l = (data[i * C] * 0.3 + data[i * C + 1] * 0.59 + data[i * C + 2] * 0.11) / 255; if (l > 0.05) { sum += l; n++; } }
const mean = sum / n;
const hex = (h) => [1, 3, 5].map((k) => parseInt(h.slice(k, k + 2), 16));
const sleeve = hex(process.env.SLEEVE || '#2a3142'), glove = hex(process.env.GLOVE || '#202228');
const out = Buffer.alloc(W * H * 3);
// cheap value noise for a woven fabric grain
const rnd = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
	const i = y * W + x;
	const l = (data[i * C] * 0.3 + data[i * C + 1] * 0.59 + data[i * C + 2] * 0.11) / 255;
	const v = Math.max(0, Math.min(2, 1 + (l / mean - 1) * 1.6));
	const isHand = y > H * 0.47;
	const base = isHand ? glove : sleeve;
	const grain = isHand ? 0.92 + rnd(x >> 1, y >> 1) * 0.16 : 0.85 + 0.15 * ((x + y) % 4 < 2 ? 1 : 0) + rnd(x, y) * 0.1;
	for (let c = 0; c < 3; c++) out[i * 3 + c] = Math.max(0, Math.min(255, base[c] * v * grain));
}
await sharp(out, { raw: { width: W, height: H, channels: 3 } }).png().toFile(output);
console.log('ok', W, H, mean.toFixed(3));
