/**
 * « Raphaël Picard en 30 secondes » — the edit: game footage (frames captured by ../capture.mjs) under kinetic typography.
 * Every timing and every word comes from ../cues.json (copied next to this file by ../render.mjs).
 */
import { AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { loadFont as loadSora } from '@remotion/google-fonts/Sora';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { loadFont as loadMono } from '@remotion/google-fonts/JetBrainsMono';

import cues from './cues.json';

const { fontFamily: SORA } = loadSora('normal', { weights: ['600', '700', '800'], subsets: ['latin', 'latin-ext'] });
const { fontFamily: INTER } = loadInter('normal', { weights: ['400', '500', '600'], subsets: ['latin', 'latin-ext'] });
const { fontFamily: MONO } = loadMono('normal', { weights: ['400', '500'], subsets: ['latin', 'latin-ext'] });

const C = { violet: '#651fff', purple: '#c50eff', orchid: '#e879f9', sky: '#38bdf8', ink: '#05040c', mist: '#d9d3ff' };
const GRADIENT = `linear-gradient(100deg, ${C.violet} 0%, ${C.purple} 45%, ${C.orchid} 75%, ${C.sky} 100%)`;
const NNBSP = ' ';

/** French typography: narrow no-break spaces before ; : ! ? % », after «, and as the thousands separator. */
export const fr = (s) =>
	String(s)
		.replace(/\s+([;:!?%»])/g, `${NNBSP}$1`)
		.replace(/«\s+/g, `«${NNBSP}`)
		.replace(/(\d)\s(\d{3})\b/g, `$1${NNBSP}$2`);

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' };
const pad = (n) => String(n).padStart(4, '0');

const GRADES = {
	val: 'saturate(1.12) contrast(1.06) brightness(1.02)',
	nexus: 'saturate(1.18) contrast(1.1) brightness(1.1)',
	dim: 'saturate(1.1) contrast(1.05) brightness(0.55) blur(3px)',
};

/** One captured shot, frame-accurate, with a small push-in on the cut. */
function Shot({ src, grade, dir, zoom }) {
	const f = useCurrentFrame();
	const punch = interpolate(f, [0, 10], [1.045, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
	const z = zoom ? zoom(f) : 1;
	return (
		<AbsoluteFill style={{ backgroundColor: C.ink, overflow: 'hidden' }}>
			<Img
				src={staticFile(`${dir}/${src}/${pad(f)}.jpg`)}
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
			<Shot src={s.src} grade={s.grade} dir={dir} zoom={zoom} />
		</Sequence>
	));
}

function Vignette({ strength = 0.55 }) {
	return <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, rgba(5,4,12,0) 45%, rgba(5,4,12,${strength}) 100%)` }} />;
}

/** Dark wash behind the text, on the side where it sits. */
function Scrim({ side = 'left', strength = 0.78, portrait }) {
	const bg = portrait
		? `linear-gradient(0deg, rgba(5,4,12,${strength}) 0%, rgba(5,4,12,${strength * 0.6}) 38%, rgba(5,4,12,0) 62%)`
		: side === 'bottom'
			? `linear-gradient(0deg, rgba(5,4,12,${strength}) 0%, rgba(5,4,12,${strength * 0.55}) 40%, rgba(5,4,12,0) 70%)`
			: side === 'center'
				? `radial-gradient(ellipse at 50% 55%, rgba(5,4,12,${strength * 0.75}) 0%, rgba(5,4,12,${strength * 0.35}) 45%, rgba(5,4,12,0) 75%)`
				: `linear-gradient(90deg, rgba(5,4,12,${strength}) 0%, rgba(5,4,12,${strength * 0.6}) 35%, rgba(5,4,12,0) 62%)`;
	return <AbsoluteFill style={{ background: bg }} />;
}

/** Entry / exit progress of an overlay living [inAt, outAt] in segment frames. */
function useLife(inAt, outAt, { stiffness = 140, damping = 18 } = {}) {
	const f = useCurrentFrame();
	const { fps } = useVideoConfig();
	const enter = spring({ frame: f - inAt, fps, config: { stiffness, damping, mass: 0.8 } });
	const exit = interpolate(f, [outAt - 7, outAt], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
	return { f, enter, exit };
}

/** A line that rises out of a mask, then leaves upward. */
function RevealLine({ children, delay = 0, inAt = 3, outAt, style }) {
	const { enter, exit } = useLife(inAt + delay, outAt);
	const y = (1 - enter) * 105 - exit * 105;
	return (
		<div style={{ overflow: 'hidden', paddingBottom: '0.08em', marginBottom: '-0.08em' }}>
			<div style={{ transform: `translateY(${y}%)`, opacity: Math.min(1, enter * 1.4) * (1 - exit * 0.4), ...style }}>{children}</div>
		</div>
	);
}

function Eyebrow({ children, inAt = 2, outAt, size = 38, center }) {
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
				letterSpacing: '0.22em',
				textTransform: 'uppercase',
				color: C.sky,
				opacity: enter * (1 - exit),
				transform: `translateX(${(1 - enter) * -30}px)`,
				textShadow: '0 0 24px rgba(56,189,248,0.55)',
			}}
		>
			<span style={{ width: 54 * enter, height: 3, background: GRADIENT, borderRadius: 2, flex: 'none' }} />
			{fr(children)}
		</div>
	);
}

const gradientText = {
	background: GRADIENT,
	WebkitBackgroundClip: 'text',
	backgroundClip: 'text',
	color: 'transparent',
	textShadow: 'none',
	filter: 'drop-shadow(0 4px 22px rgba(5,4,12,0.9))',
};
const shadow = '0 4px 30px rgba(5,4,12,0.85), 0 0 2px rgba(5,4,12,0.9)';

function Box({ children, portrait, align = 'left', top }) {
	const { width, height } = useVideoConfig();
	const side = Math.round(width * (portrait ? 0.08 : 0.125));
	return (
		<AbsoluteFill
			style={{
				padding: `0 ${side}px`,
				justifyContent: top ?? (portrait ? 'flex-end' : 'center'),
				paddingBottom: portrait ? Math.round(height * 0.14) : 0,
				alignItems: align === 'center' ? 'center' : 'flex-start',
				textAlign: align,
			}}
		>
			{children}
		</AbsoluteFill>
	);
}

// ——— segments ———

function Intro({ seg, portrait }) {
	const out = seg.len - (seg.id === 'val' ? 12 : 2);
	const size = portrait ? 112 : 118;
	return (
		<Box portrait={portrait}>
			<Eyebrow outAt={out}>{seg.eyebrow}</Eyebrow>
			<div style={{ height: 22 }} />
			{seg.lines.map((l, i) => (
				<RevealLine
					key={l}
					delay={4 + i * 4}
					outAt={out}
					style={{
						fontFamily: SORA,
						fontWeight: 800,
						fontSize: size,
						lineHeight: 1.04,
						letterSpacing: '-0.02em',
						color: '#fff',
						textShadow: shadow,
					}}
				>
					{i === seg.lines.length - 1 && seg.id === 'emerge' ? <span style={gradientText}>{fr(l)}</span> : fr(l)}
				</RevealLine>
			))}
		</Box>
	);
}

function Title({ seg, portrait }) {
	const f = useCurrentFrame();
	const out = seg.len - 2;
	const sweep = interpolate(f, [10, 70], [-30, 130], clamp);
	return (
		<Box portrait={portrait}>
			<Eyebrow inAt={4} outAt={out} size={portrait ? 30 : 36}>
				{seg.eyebrow}
			</Eyebrow>
			<div style={{ height: 18 }} />
			<RevealLine
				delay={2}
				outAt={out}
				style={{
					fontFamily: SORA,
					fontWeight: 800,
					fontSize: portrait ? 150 : 176,
					lineHeight: 1.0,
					letterSpacing: '-0.035em',
					whiteSpace: portrait ? 'normal' : 'nowrap',
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
			<div style={{ height: 22 }} />
			<RevealLine
				delay={10}
				outAt={out}
				style={{ fontFamily: INTER, fontWeight: 600, fontSize: portrait ? 56 : 60, color: C.mist, textShadow: shadow }}
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
	const shown = Math.round(count);
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
					fontSize: portrait ? (seg.value >= 1000 ? 230 : 270) : 300,
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
				style={{
					fontFamily: SORA,
					fontWeight: 700,
					fontSize: portrait ? 78 : 84,
					lineHeight: 1.05,
					color: '#fff',
					textShadow: shadow,
					maxWidth: portrait ? 900 : 1300,
				}}
			>
				{fr(seg.label)}
			</RevealLine>
			<div style={{ height: 18 }} />
			<RevealLine
				delay={9}
				outAt={out}
				style={{
					fontFamily: MONO,
					fontWeight: 500,
					fontSize: portrait ? 38 : 40,
					color: C.sky,
					textShadow: shadow,
					letterSpacing: '0.02em',
					maxWidth: portrait ? 900 : 1300,
				}}
			>
				{fr(seg.sub)}
			</RevealLine>
		</Box>
	);
}

function Archi({ seg, portrait }) {
	const f = useCurrentFrame();
	const { fps } = useVideoConfig();
	const out = seg.len - 3;
	const first = 2;
	const beat = 18;
	const exit = interpolate(f, [out - 8, out], [0, 1], clamp);
	const railH = interpolate(f, [first, first + beat * 4 + 6], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
	const rowH = portrait ? 150 : 134;
	return (
		<Box portrait={portrait} top={portrait ? 'center' : 'center'}>
			<div style={{ opacity: 1 - exit, transform: `translateY(${-exit * 30}px)` }}>
				<Eyebrow inAt={2} outAt={seg.len + 20} size={portrait ? 32 : 36}>
					{seg.eyebrow}
				</Eyebrow>
				<div style={{ height: portrait ? 40 : 34 }} />
				<div style={{ position: 'relative', paddingLeft: 64 }}>
					<div
						style={{
							position: 'absolute',
							left: 13,
							top: rowH / 2 - 6,
							width: 4,
							height: (seg.rows.length - 1) * rowH * railH,
							background: GRADIENT,
							borderRadius: 2,
							boxShadow: `0 0 18px ${C.purple}`,
						}}
					/>
					{seg.rows.map((r, i) => {
						const s = spring({ frame: f - (first + i * beat), fps, config: { stiffness: 170, damping: 16 } });
						const lit = interpolate(f - (first + i * beat), [0, 4, 16], [0, 1, 0.55], clamp);
						return (
							<div
								key={r.k}
								style={{
									position: 'relative',
									height: rowH,
									display: 'flex',
									flexDirection: 'column',
									justifyContent: 'center',
									opacity: s,
									transform: `translateX(${(1 - s) * 60}px)`,
								}}
							>
								<div
									style={{
										position: 'absolute',
										left: -64,
										top: rowH / 2 - 15,
										width: 30,
										height: 30,
										borderRadius: 15,
										background: GRADIENT,
										boxShadow: `0 0 ${18 + lit * 40}px ${C.orchid}`,
										transform: `scale(${0.6 + s * 0.4 + lit * 0.25})`,
									}}
								/>
								<div
									style={{
										fontFamily: SORA,
										fontWeight: 800,
										fontSize: portrait ? 76 : 70,
										lineHeight: 1.02,
										color: '#fff',
										textShadow: shadow,
										letterSpacing: '-0.015em',
									}}
								>
									{fr(r.k)}
								</div>
								<div
									style={{
										fontFamily: INTER,
										fontWeight: 500,
										fontSize: portrait ? 38 : 36,
										color: C.mist,
										opacity: 0.92,
										marginTop: 4,
										textShadow: shadow,
									}}
								>
									{fr(r.v)}
								</div>
							</div>
						);
					})}
				</div>
				<div style={{ height: portrait ? 50 : 30 }} />
				<RevealLine
					inAt={first + beat * 5 + 6}
					outAt={seg.len + 20}
					style={{ fontFamily: SORA, fontWeight: 700, fontSize: portrait ? 64 : 62, lineHeight: 1.1 }}
				>
					<span style={{ ...gradientText, filter: 'drop-shadow(0 4px 22px rgba(5,4,12,0.9))' }}>{fr(seg.motto)}</span>
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
	const tagIn = interpolate(local, [2, 8], [0, 1], clamp) * interpolate(local, [cur.len - 4, cur.len], [1, 0.0], clamp);
	return (
		<>
			<Box portrait={portrait} align="center" top="center">
				{seg.lines.map((l, i) => (
					<RevealLine
						key={l}
						delay={i * 5}
						inAt={2}
						outAt={out}
						style={{
							fontFamily: SORA,
							fontWeight: 800,
							fontSize: portrait ? 132 : 150,
							lineHeight: 1.0,
							letterSpacing: '-0.03em',
							color: '#fff',
							textShadow: shadow,
						}}
					>
						{i === 1 ? <span style={{ ...gradientText, filter: 'drop-shadow(0 6px 26px rgba(5,4,12,0.95))' }}>{fr(l)}</span> : fr(l)}
					</RevealLine>
				))}
			</Box>
			<AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: portrait ? 330 : 120 }}>
				<div
					style={{
						fontFamily: MONO,
						fontWeight: 500,
						fontSize: portrait ? 36 : 38,
						color: '#fff',
						padding: '14px 30px',
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
			</AbsoluteFill>
		</>
	);
}

function Cta({ seg, portrait, credit }) {
	const f = useCurrentFrame();
	const typed = Math.round(interpolate(f, [26, 26 + seg.url.length * 1.4], [0, seg.url.length], clamp));
	const caret = Math.floor(f / 9) % 2 === 0 || typed < seg.url.length;
	const creditIn = interpolate(f, [40, 52], [0, 1], clamp);
	return (
		<>
			<Box portrait={portrait} align="center" top="flex-end">
				<div style={{ paddingBottom: portrait ? 120 : 96, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
					<RevealLine
						inAt={6}
						outAt={seg.len + 40}
						style={{
							fontFamily: SORA,
							fontWeight: 800,
							fontSize: portrait ? 170 : 190,
							lineHeight: 1.0,
							letterSpacing: '-0.04em',
							color: '#fff',
							textShadow: shadow,
						}}
					>
						{fr(seg.main)}
					</RevealLine>
					<div style={{ height: 22 }} />
					<div
						style={{
							fontFamily: MONO,
							fontWeight: 500,
							fontSize: portrait ? 62 : 72,
							letterSpacing: '0.01em',
							textShadow: shadow,
							minHeight: '1.25em',
						}}
					>
						<span style={{ ...gradientText, filter: 'drop-shadow(0 0 20px rgba(56,189,248,0.35))' }}>{seg.url.slice(0, typed)}</span>
						<span style={{ color: C.sky, opacity: caret ? 1 : 0 }}>▍</span>
					</div>
					<div style={{ height: 14 }} />
					<RevealLine
						inAt={34}
						outAt={seg.len + 40}
						style={{ fontFamily: INTER, fontWeight: 600, fontSize: portrait ? 40 : 42, color: C.mist, textShadow: shadow }}
					>
						{fr(seg.sub)}
					</RevealLine>
				</div>
			</Box>
			<AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: portrait ? 56 : 30 }}>
				<div
					style={{
						fontFamily: MONO,
						fontSize: portrait ? 19 : 20,
						color: 'rgba(217,211,255,0.75)',
						opacity: creditIn,
						textAlign: 'center',
						maxWidth: portrait ? 940 : 1600,
					}}
				>
					{fr(credit)}
				</div>
			</AbsoluteFill>
		</>
	);
}

/** The crossing: the val zooms into the swirl, a violet-white flash covers the cut, the Nexus settles. */
function PortalFlash({ at }) {
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
function CutFlash() {
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

/** The signature in the corner, from the title to the call to action (clips shared out of context stay signed). */
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
	const scrim = { intro: 'left', title: 'left', stat: 'left', archi: 'left', game: 'center', cta: 'bottom' }[seg.kind];
	const strength = { archi: 0.7, game: 0.72, cta: 0.9 }[seg.kind] ?? 0.75;
	const Body = { intro: Intro, title: Title, stat: Stat, archi: Archi, game: Game, cta: Cta }[seg.kind];
	return (
		<AbsoluteFill>
			<Shots seg={seg} dir={dir} zoom={zoom} />
			<Vignette />
			<Scrim side={scrim} strength={strength} portrait={portrait} />
			<Body seg={seg} portrait={portrait} credit={credit} />
			{['stat', 'archi', 'cta'].includes(seg.kind) ? <CutFlash /> : null}
		</AbsoluteFill>
	);
}

export function Resume({ framesDir = 'frames', audio = 'mix.wav' }) {
	const f = useCurrentFrame();
	const { width, height, durationInFrames } = useVideoConfig();
	const portrait = height > width;
	const fadeOut = interpolate(f, [durationInFrames - 12, durationInFrames - 1], [0, 1], clamp);
	const seg = (id) => cues.segments.find((s) => s.id === id);
	const portalCut = seg('emerge').from;
	return (
		<AbsoluteFill style={{ backgroundColor: C.ink }}>
			{cues.segments.map((seg) => (
				<Sequence key={seg.id} from={seg.from} durationInFrames={seg.len}>
					<Segment seg={seg} dir={framesDir} portrait={portrait} credit={cues.music.credit} />
				</Sequence>
			))}
			<PortalFlash at={portalCut} />
			<Signature from={seg('agents7').from} to={seg('cta').from} portrait={portrait} />
			<AbsoluteFill style={{ backgroundColor: C.ink, opacity: fadeOut }} />
			{audio ? <Audio src={staticFile(audio)} /> : null}
		</AbsoluteFill>
	);
}
