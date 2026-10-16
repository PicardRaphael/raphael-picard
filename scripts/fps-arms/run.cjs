// usage: node run.cjs <module.js> [shot.png] [out.glb]
const { chromium } = require('C:/Users/rapha/Documents/raphael-picard/node_modules/@playwright/test');
const fs = require('fs'); const path = require('path');
const R = 'C:/Users/rapha/Documents/raphael-picard/';
const SP = 'C:/Users/rapha/AppData/Local/Temp/claude/C--Users-rapha-Documents-raphael-picard/48315230-c474-4d8b-8365-b2c6fdd1de00/scratchpad/fps-arms/';
const [mod, shot, outGlb] = process.argv.slice(2);
const map = { '/three/': R + 'node_modules/three/', '/models/': R + 'public/models/', '/sp/': SP };
const types = { '.js': 'text/javascript', '.png': 'image/png', '.glb': 'model/gltf-binary', '.fbx': 'application/octet-stream', '.jpg': 'image/jpeg', '.webp': 'image/webp' };
(async () => {
	const b = await chromium.launch({ args: ['--use-angle=d3d11', '--enable-gpu'] });
	const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
	p.on('console', (m) => console.log('[page]', m.text()));
	p.on('pageerror', (e) => console.log('[err]', e.message));
	await p.route('http://wb.test/**', async (route) => {
		const u = new URL(route.request().url()); const pn = decodeURIComponent(u.pathname);
		if (pn === '/') return route.fulfill({ contentType: 'text/html', body: `<html><head><style>body{margin:0;background:#333}</style><script type="importmap">{"imports":{"three":"/three/build/three.module.js","three/addons/":"/three/examples/jsm/"}}</script></head><body><script type="module" src="/main.js"></script></body></html>` });
		if (pn === '/sp/wb/params.js' && process.env.PARAMS) return route.fulfill({ contentType: 'text/javascript', body: fs.readFileSync(process.env.PARAMS, 'utf8') });
		if (pn === '/main.js') return route.fulfill({ contentType: 'text/javascript', body: fs.readFileSync(mod, 'utf8') });
		for (const k in map) if (pn.startsWith(k)) { const f = map[k] + pn.slice(k.length); if (fs.existsSync(f)) return route.fulfill({ contentType: types[path.extname(f)] || 'application/octet-stream', body: fs.readFileSync(f) }); }
		route.fulfill({ status: 404, body: 'nf' });
	});
	await p.goto('http://wb.test/');
	await p.waitForFunction(() => window.__done, null, { timeout: 60000 }).catch(() => console.log('timeout'));
	const out = await p.evaluate(() => window.__out);
	if (out) console.log(typeof out === 'string' ? out : JSON.stringify(out, null, 1));
	if (shot) await p.screenshot({ path: shot });
	if (outGlb) { const b64 = await p.evaluate(() => window.__glb); fs.writeFileSync(outGlb, Buffer.from(b64, 'base64')); console.log('wrote', outGlb, fs.statSync(outGlb).size); }
	await b.close();
})();
