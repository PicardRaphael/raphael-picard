/**
 * Review stills of the edit (bundles the Remotion project once, then renders the requested frames as JPEG):
 *   node scripts/video/stills.mjs <workDir> <outDir> [composition] frame1 frame2 …
 * <workDir>/remotion holds Remotion (installed by render.mjs), <workDir>/pub its public folder.
 */
import { copyFileSync, mkdirSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const [work, out, ...rest] = process.argv.slice(2);
const comp = Number.isNaN(Number(rest[0])) ? rest.shift() : 'resume';
const frames = rest.map(Number);
const RW = resolve(work, 'remotion');
const HERE = resolve(new URL('.', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'));
mkdirSync(join(RW, 'src'), { recursive: true });
for (const f of readdirSync(join(HERE, 'remotion'))) copyFileSync(join(HERE, 'remotion', f), join(RW, 'src', f));
copyFileSync(join(HERE, 'cues.json'), join(RW, 'src', 'cues.json'));

const req = createRequire(join(RW, 'package.json'));
const { bundle } = await import(pathToFileURL(req.resolve('@remotion/bundler')).href);
const { renderStill, selectComposition } = await import(pathToFileURL(req.resolve('@remotion/renderer')).href);

const serveUrl = await bundle({ entryPoint: join(RW, 'src', 'index.jsx'), publicDir: resolve(work, 'pub') });
const inputProps = { audio: null, framesDir: comp === 'resume-vertical' ? 'frames-portrait' : 'frames' };
const browserExecutable = process.env.REMOTION_BROWSER ?? null;
const composition = await selectComposition({ serveUrl, id: comp, inputProps, browserExecutable });
mkdirSync(out, { recursive: true });
for (const frame of frames) {
	const output = join(out, `${comp}-${String(frame).padStart(4, '0')}.jpg`);
	await renderStill({ serveUrl, composition, frame, output, imageFormat: 'jpeg', jpegQuality: 90, inputProps, browserExecutable });
	console.log(output);
}
