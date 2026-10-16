/**
 * « Raphaël Picard en 30 secondes » — the edit: game footage (frames captured by ../capture.mjs and ../viral.mjs) under
 * kinetic typography. Every timing and every word comes from ../cues.json (copied next to this file by ../render.mjs).
 * The bottom quarter of the picture stays free of text: players draw the subtitles (resume-30s.fr.vtt) there.
 */
import { AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { loadFont as loadSora } from '@remotion/google-fonts/Sora';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { loadFont as loadMono } from '@remotion/google-fonts/JetBrainsMono';

import cues from './cues.json';

export const { fontFamily: SORA } = loadSora('normal', { weights: ['600', '700', '800'], subsets: ['latin', 'latin-ext'] });
export const { fontFamily: INTER } = loadInter('normal', { weights: ['400', '500', '600'], subsets: ['latin', 'latin-ext'] });
export const { fontFamily: MONO } = loadMono('normal', { weights: ['400', '500'], subsets: ['latin', 'latin-ext'] });

export const C = { violet: '#651fff', purple: '#c50eff', orchid: '#e879f9', sky: '#38bdf8', ink: '#05040c', mist: '#d9d3ff' };
export const GRADIENT = `linear-gradient(100deg, ${C.violet} 0%, ${C.purple} 45%, ${C.orchid} 75%, ${C.sky} 100%)`;
const NNBSP = ' ';

/** French typography: narrow no-break spaces before : ! ? % », after «, and as the thousands separator. */
export const fr = (s) =>
	String(s)
		.replace(/\s+([;:!?%»])/g, `${NNBSP}$1`)
		.replace(/«\s+/g, `«${NNBSP}`)
		.replace(/(\d)\s(\d{3})\b/g, `$1${NNBSP}$2`);

export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' };
export const pad = (n) => String(n).padStart(4, '0');

export const GRADES = {
	val: 'saturate(1.12) contrast(1.06) brightness(1.02)',
	nexus: 'saturate(1.18) contrast(1.1) brightness(1.1)',
	// page screenshots (the game's own UI in the picture): a lighter touch, the UI keeps its colours
	game: 'saturate(1.08) contrast(1.05) brightness(1.04)',
};

/** One captured shot, frame-accurate, with a small push-in on the cut. */
export function Shot({ src, grade, dir, zoom, offset = 0, punchIn = true }) {
	const f = useCurrentFrame();
	const punch = punchIn ? interpolate(f, [0, 10], [1.045, 1], { ...clamp, easing: Easing.out(Easing.cubic) }) : 1;
	const z = zoom ? zoom(f) : 1;
	return (
		<AbsoluteFill style={{ backgroundColor: C.ink, overflow: 'hidden' }}>
			<Img
				src={staticFile(`${dir ? `${dir}/` : ''}${src}/${pad(f + offset)}.jpg`)}
				style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${punch * z})`, filter: GRADES[grade] ?? GRADES.nexus }}
			/>
		</AbsoluteFill>
	);
}

/** The shots of a segment with their start frame, one after the other. */
const withStarts = (shots) => shots.map((s, i) => ({ ...s, from: shots.slice(0, i).reduce((n, p) => n + p.len, 0) }));

function Shots({ seg, dir, zoom }) {
	return withStarts(seg.shots).map((s) => (
		<Sequence key={s.src} from={s.from} durationInFrames={s.len} layout="none">
			<Shot src={s.src} grade={s.grade} dir={dir} zoom={zoom} offset={s.offset} />
		</Sequence>
	));
}

export function Vignette({ strength = 0.55 }) {
	return <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, rgba(5,4,12,0) 45%, rgba(5,4,12,${strength}) 100%)` }} />;
}

/** Dark wash behind the text, on the side where it sits. */
export function Scrim({ side = 'left', strength = 0.78 }) {
	const bg = {
		bottom: `linear-gradient(0deg, rgba(5,4,12,${strength}) 0%, rgba(5,4,12,${strength * 0.6}) 38%, rgba(5,4,12,0) 62%)`,
		top: `linear-gradient(180deg, rgba(5,4,12,${strength}) 0%, rgba(5,4,12,${strength * 0.55}) 32%, rgba(5,4,12,0) 55%)`,
		center: `radial-gradient(ellipse at 50% 45%, rgba(5,4,12,${strength * 0.8}) 0%, rgba(5,4,12,${strength * 0.4}) 45%, rgba(5,4,12,0) 75%)`,
		left: `linear-gradient(90deg, rgba(5,4,12,${strength}) 0%, rgba(5,4,12,${strength * 0.6}) 35%, rgba(5,4,12,0) 62%)`,
	}[side];
	return <AbsoluteFill style={{ background: bg }} />;
}

/** Entry / exit progress of an overlay living [inAt, outAt] in segment frames. */
export function useLife(inAt, outAt, { stiffness = 140, damping = 18 } = {}) {
	const f = useCurrentFrame();
	const { fps } = useVideoConfig();
	const enter = spring({ frame: f - inAt, fps, config: { stiffness, damping, mass: 0.8 } });
	const exit = interpolate(f, [outAt - 7, outAt], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
	return { f, enter, exit };
}

/** A line that rises out of a mask, then leaves upward. */
export function RevealLine({ children, delay = 0, inAt = 3, outAt, style }) {
	const { enter, exit } = useLife(inAt + delay, outAt);
	const y = (1 - enter) * 105 - exit * 105;
	return (
		// the mask only while the line moves: a still line keeps its whole soft shadow (a clipped one draws a dark box)
		<div style={{ overflow: Math.abs(y) < 0.5 ? 'visible' : 'hidden', paddingBottom: '0.12em', marginBottom: '-0.12em' }}>
			<div style={{ transform: `translateY(${y}%)`, opacity: Math.min(1, enter * 1.4) * (1 - exit * 0.4), ...style }}>{children}</div>
		</div>
	);
}

export function Eyebrow({ children, inAt = 2, outAt, size = 38, center }) {
	const { enter, exit } = useLife(inAt, outAt);
	return (
		<div
			style={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: center ? 'center' : 'flex-start',
				gap: 18,
				fontFamily: MONO,
				fontWeight: 500,
				fontSize: size,
				letterSpacing: '0.2em',
				textTransform: 'uppercase',
				color: C.sky,
				opacity: enter * (1 - exit),
				transform: `translateX(${(1 - enter) * -30}px)`,
				textShadow: '0 0 24px rgba(56,189,248,0.55), 0 2px 12px rgba(5,4,12,0.9)',
			}}
		>
			<span style={{ width: 54 * enter, height: 3, background: GRADIENT, borderRadius: 2, flex: 'none' }} />
			{fr(children)}
		</div>
	);
}

export const gradientText = {
	background: GRADIENT,
	WebkitBackgroundClip: 'text',
	backgroundClip: 'text',
	color: 'transparent',
	textShadow: 'none',
	filter: 'drop-shadow(0 4px 22px rgba(5,4,12,0.9))',
};
export const shadow = '0 4px 30px rgba(5,4,12,0.85), 0 0 2px rgba(5,4,12,0.9)';

/** The text block: inside the central 75 % of the width, never in the bottom quarter (subtitles). */
function Box({ children, portrait, align = 'left', justify }) {
	const { width, height } = useVideoConfig();
	const side = Math.round(width * (portrait ? 0.08 : 0.125));
	return (
		<AbsoluteFill
			style={{
				padding: `0 ${side}px`,
				justifyContent: justify ?? (portrait ? 'flex-end' : 'center'),
				paddingBottom: portrait ? Math.round(height * 0.27) : Math.round(height * 0.06),
				alignItems: align === 'center' ? 'center' : 'flex-start',
				textAlign: align,
			}}
		>
			{children}
		</AbsoluteFill>
	);
}

const big = (size) => ({
	fontFamily: SORA,
	fontWeight: 800,
	fontSize: size,
	lineHeight: 1.04,
	letterSpacing: '-0.02em',
	color: '#fff',
	textShadow: shadow,
});

// ——— segments ———

function Intro({ seg, portrait }) {
	const out = seg.len - (seg.id === 'val' ? 12 : 2);
	return (
		<Box portrait={portrait}>
			<Eyebrow outAt={out}>{seg.eyebrow}</Eyebrow>
			<div style={{ height: 22 }} />
			{seg.lines.map((l, i) => (
				<RevealLine key={l} delay={4 + i * 4} outAt={out} style={big(portrait ? 104 : 124)}>
					{i === seg.accent ? <span style={gradientText}>{fr(l)}</span> : fr(l)}
				</RevealLine>
			))}
		</Box>
	);
}

function Title({ seg, portrait }) {
	const f = useCurrentFrame();
	const out = seg.len - 2;
	const sweep = interpolate(f, [8, 60], [-30, 130], clamp);
	return (
		<Box portrait={portrait}>
			<RevealLine
				delay={0}
				outAt={out}
				style={{
					...big(portrait ? 140 : 168),
					lineHeight: 1.0,
					letterSpacing: '-0.035em',
					whiteSpace: portrait ? 'normal' : 'nowrap',
					textShadow: 'none',
				}}
			>
				<span
					style={{
						backgroundImage: `linear-gradient(100deg, #fff 0%, #fff ${sweep - 12}%, ${C.orchid} ${sweep}%, #fff ${sweep + 12}%, #fff 100%)`,
						WebkitBackgroundClip: 'text',
						backgroundClip: 'text',
						color: 'transparent',
						filter: 'drop-shadow(0 6px 28px rgba(5,4,12,0.9))',
					}}
				>
					{fr(seg.name)}
				</span>
			</RevealLine>
			<div style={{ height: 16 }} />
			<RevealLine
				delay={6}
				outAt={out}
				style={{ fontFamily: SORA, fontWeight: 700, fontSize: portrait ? 60 : 64, lineHeight: 1.1, maxWidth: portrait ? 900 : 1500 }}
			>
				<span style={gradientText}>{fr(seg.role)}</span>
			</RevealLine>
			<div style={{ height: 18 }} />
			<RevealLine
				delay={12}
				outAt={out}
				style={{ fontFamily: INTER, fontWeight: 600, fontSize: portrait ? 46 : 48, color: C.mist, textShadow: shadow }}
			>
				{fr(seg.sub)}
			</RevealLine>
		</Box>
	);
}

function Stat({ seg, portrait }) {
	const f = useCurrentFrame();
	const out = seg.len - 2;
	const count = interpolate(f, [3, 20], [0, seg.value], { ...clamp, easing: Easing.out(Easing.cubic) });
	const shown = Math.max(1, Math.round(count));
	const num = `${seg.prefix ?? ''}${seg.value >= 1000 ? fr(shown.toLocaleString('en-US').replace(/,/g, ' ')) : shown}${seg.suffix ?? ''}`;
	const { enter } = useLife(2, out, { stiffness: 220, damping: 14 });
	const punch = 1 + (1 - enter) * 0.25;
	return (
		<Box portrait={portrait}>
			<RevealLine
				inAt={1}
				outAt={out}
				style={{
					fontFamily: SORA,
					fontWeight: 800,
					fontSize: portrait ? (seg.value >= 1000 ? 230 : 270) : 280,
					lineHeight: 0.92,
					letterSpacing: '-0.05em',
					transform: `scale(${punch})`,
					transformOrigin: 'left bottom',
				}}
			>
				<span
					style={{
						...gradientText,
						filter: 'drop-shadow(0 0 36px rgba(197,14,255,0.45)) drop-shadow(0 8px 30px rgba(5,4,12,0.9))',
						fontVariantNumeric: 'tabular-nums',
					}}
				>
					{fr(num)}
				</span>
			</RevealLine>
			<div style={{ height: 10 }} />
			<RevealLine
				delay={5}
				outAt={out}
				style={{ ...big(portrait ? 76 : 82), fontWeight: 700, lineHeight: 1.05, maxWidth: portrait ? 900 : 1400 }}
			>
				{fr(seg.label)}
			</RevealLine>
			<div style={{ height: 16 }} />
			<RevealLine
				delay={9}
				outAt={out}
				style={{
					fontFamily: MONO,
					fontWeight: 500,
					fontSize: portrait ? 38 : 40,
					color: C.sky,
					textShadow: shadow,
					maxWidth: portrait ? 900 : 1400,
				}}
			>
				{fr(seg.sub)}
			</RevealLine>
		</Box>
	);
}

/** The runner shoots a bug down, its card opens with the parade (the game's own UI, left as is). */
function Fight({ seg, portrait }) {
	const f = useCurrentFrame();
	const after = seg.card + 6;
	const outA = after;
	if (f < after + 2)
		return (
			<Box portrait={portrait}>
				<Eyebrow outAt={outA}>{seg.eyebrow}</Eyebrow>
				<div style={{ height: 22 }} />
				{seg.lines.map((l, i) => (
					<RevealLine key={l} delay={3 + i * 4} outAt={outA} style={big(portrait ? 92 : 104)}>
						{i === 1 ? <span style={gradientText}>{fr(l)}</span> : fr(l)}
					</RevealLine>
				))}
			</Box>
		);
	// the card opens in the upper middle: the motto goes under it, still above the subtitles' quarter
	return (
		<Box portrait={portrait} align="center" justify="flex-end">
			<div style={{ marginBottom: portrait ? 0 : 210 }}>
				<RevealLine inAt={after + 2} outAt={seg.len + 30} style={big(portrait ? 76 : 76)}>
					<span style={gradientText}>{fr(seg.motto)}</span>
				</RevealLine>
				<div style={{ height: 14 }} />
				<RevealLine
					inAt={after + 10}
					outAt={seg.len + 30}
					style={{ fontFamily: MONO, fontWeight: 500, fontSize: portrait ? 32 : 34, lineHeight: 1.4, color: C.sky, textShadow: shadow }}
				>
					{fr(seg.keywords)}
				</RevealLine>
			</div>
		</Box>
	);
}

function Game({ seg, portrait }) {
	const f = useCurrentFrame();
	const out = seg.len - 3;
	const tags = withStarts(seg.shots);
	const cur = tags.findLast((t) => f >= t.from) ?? tags[0];
	const local = f - cur.from;
	const tagIn = interpolate(local, [2, 8], [0, 1], clamp) * interpolate(local, [cur.len - 4, cur.len], [1, 0], clamp);
	return (
		<Box portrait={portrait} align="center" justify="center">
			{seg.lines.map((l, i) => (
				<RevealLine
					key={l}
					delay={i * 5}
					inAt={2}
					outAt={out}
					style={{ ...big(portrait ? 92 : 100), lineHeight: 1.02, letterSpacing: '-0.03em' }}
				>
					{i === 1 ? <span style={{ ...gradientText, filter: 'drop-shadow(0 6px 26px rgba(5,4,12,0.95))' }}>{fr(l)}</span> : fr(l)}
				</RevealLine>
			))}
			<div style={{ height: 34 }} />
			<div
				style={{
					fontFamily: MONO,
					fontWeight: 500,
					fontSize: portrait ? 34 : 36,
					color: '#fff',
					padding: '12px 28px',
					borderRadius: 999,
					background: 'rgba(5,4,12,0.62)',
					border: `2px solid ${cur.grade === 'val' ? '#ffd9a0' : C.orchid}`,
					boxShadow: `0 0 30px ${cur.grade === 'val' ? 'rgba(255,209,0,0.35)' : 'rgba(232,121,249,0.45)'}`,
					opacity: tagIn,
					transform: `translateY(${(1 - tagIn) * 16}px)`,
					letterSpacing: '0.04em',
				}}
			>
				{fr(cur.tag)}
			</div>
		</Box>
	);
}

/** The end card: it stays on screen to the very last frame (a still of the film must give the contacts). */
function Cta({ seg, portrait, credit }) {
	const f = useCurrentFrame();
	const typed = Math.round(interpolate(f, [16, 16 + seg.url.length * 1.2], [0, seg.url.length], clamp));
	const caret = Math.floor(f / 9) % 2 === 0 || typed < seg.url.length;
	const creditIn = interpolate(f, [30, 42], [0, 1], clamp);
	const keep = seg.len + 60;
	return (
		<>
			<Box portrait={portrait} align="center" justify="center">
				<RevealLine inAt={4} outAt={keep} style={{ ...big(portrait ? 160 : 176), lineHeight: 1.0, letterSpacing: '-0.04em' }}>
					{fr(seg.main)}
				</RevealLine>
				<div style={{ height: 18 }} />
				<div style={{ fontFamily: MONO, fontWeight: 500, fontSize: portrait ? 60 : 70, letterSpacing: '0.01em', minHeight: '1.25em' }}>
					<span style={{ ...gradientText, filter: 'drop-shadow(0 0 20px rgba(56,189,248,0.35)) drop-shadow(0 4px 18px rgba(5,4,12,0.9))' }}>
						{seg.url.slice(0, typed)}
					</span>
					<span style={{ color: C.sky, opacity: caret ? 1 : 0 }}>▍</span>
				</div>
				<div style={{ height: 10 }} />
				<RevealLine
					inAt={24}
					outAt={keep}
					style={{ fontFamily: MONO, fontWeight: 500, fontSize: portrait ? 40 : 44, color: '#fff', textShadow: shadow }}
				>
					{seg.email}
				</RevealLine>
				<div style={{ height: 12 }} />
				<RevealLine
					inAt={30}
					outAt={keep}
					style={{
						fontFamily: SORA,
						fontWeight: 700,
						fontSize: portrait ? 44 : 46,
						color: C.mist,
						textShadow: shadow,
						letterSpacing: '0.04em',
					}}
				>
					{fr(seg.links)}
				</RevealLine>
			</Box>
			<AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'center', paddingTop: portrait ? 70 : 34 }}>
				<div
					style={{
						fontFamily: MONO,
						fontSize: portrait ? 19 : 20,
						color: 'rgba(217,211,255,0.8)',
						opacity: creditIn,
						textAlign: 'center',
						maxWidth: portrait ? 940 : 1500,
						textShadow: shadow,
					}}
				>
					{fr(credit)}
				</div>
			</AbsoluteFill>
		</>
	);
}

/** The crossing: the val zooms into the swirl, a violet-white flash covers the cut, the Nexus settles. */
export function PortalFlash({ at }) {
	const f = useCurrentFrame();
	const o = interpolate(f, [at - 7, at - 1, at + 1, at + 9], [0, 1, 1, 0], clamp);
	const r = interpolate(f, [at - 7, at], [10, 140], clamp);
	return (
		<AbsoluteFill
			style={{
				opacity: o,
				background: `radial-gradient(circle at 50% 50%, #ffffff 0%, #f5d0fe ${r * 0.25}%, ${C.orchid} ${r * 0.55}%, ${C.violet} ${r}%, rgba(101,31,255,0) ${r * 1.4}%)`,
				mixBlendMode: 'screen',
			}}
		/>
	);
}

/** A short violet light hit on the cuts that land on the beat (Nexus segments). */
export function CutFlash() {
	const f = useCurrentFrame();
	const o = interpolate(f, [0, 5], [0.32, 0], clamp);
	return (
		<AbsoluteFill
			style={{
				opacity: o,
				background: `radial-gradient(ellipse at 30% 50%, ${C.orchid} 0%, ${C.violet} 55%, rgba(101,31,255,0) 100%)`,
				mixBlendMode: 'screen',
			}}
		/>
	);
}

/** The signature in the corner, from the first proof to the call to action (clips shared out of context stay signed). */
function Signature({ from, to, portrait }) {
	const f = useCurrentFrame();
	const { width } = useVideoConfig();
	const o = interpolate(f, [from, from + 10, to - 6, to], [0, 0.85, 0.85, 0], clamp);
	return (
		<AbsoluteFill style={{ padding: `${portrait ? 110 : 54}px ${Math.round(width * (portrait ? 0.08 : 0.125))}px`, opacity: o }}>
			<div
				style={{
					fontFamily: MONO,
					fontWeight: 500,
					fontSize: portrait ? 26 : 24,
					letterSpacing: '0.18em',
					color: '#fff',
					textShadow: shadow,
					display: 'flex',
					gap: 14,
					alignItems: 'center',
				}}
			>
				<span style={{ width: 10, height: 10, borderRadius: 5, background: GRADIENT, boxShadow: `0 0 12px ${C.orchid}` }} />
				RAPHAËL PICARD <span style={{ color: C.sky }}>· IA</span>
			</div>
		</AbsoluteFill>
	);
}

function Segment({ seg, dir, portrait, credit }) {
	const zoom = seg.id === 'val' ? (f) => interpolate(f, [70, 90], [1, 1.35], { ...clamp, easing: Easing.in(Easing.quad) }) : undefined;
	const scrim = { intro: 'left', title: 'left', stat: 'left', fight: 'left', game: 'center', cta: 'center' }[seg.kind];
	const strength = { game: 0.72, cta: 0.9, fight: 0.7 }[seg.kind] ?? 0.75;
	const Body = { intro: Intro, title: Title, stat: Stat, fight: Fight, game: Game, cta: Cta }[seg.kind];
	return (
		<AbsoluteFill>
			<Shots seg={seg} dir={dir} zoom={zoom} />
			<Vignette />
			<Scrim side={portrait ? 'bottom' : scrim} strength={strength} />
			<Body seg={seg} portrait={portrait} credit={credit} />
			{['stat', 'fight', 'cta'].includes(seg.kind) ? <CutFlash /> : null}
		</AbsoluteFill>
	);
}

export function Resume({ framesDir = 'frames', audio = 'mix.wav' }) {
	const { width, height } = useVideoConfig();
	const portrait = height > width;
	const seg = (id) => cues.segments.find((s) => s.id === id);
	return (
		<AbsoluteFill style={{ backgroundColor: C.ink }}>
			{cues.segments.map((s) => (
				<Sequence key={s.id} from={s.from} durationInFrames={s.len}>
					<Segment seg={s} dir={framesDir} portrait={portrait} credit={cues.credit} />
				</Sequence>
			))}
			<PortalFlash at={seg('emerge').from} />
			<Signature from={seg('agents7').from} to={seg('cta').from} portrait={portrait} />
			{audio ? <Audio src={staticFile(audio)} /> : null}
		</AbsoluteFill>
	);
}
