/**
 * The vertical viral cut (1080×1920, ~19 s): only footage of the game (takes of ../viral.mjs), big text that reads
 * without sound. Burned-in subtitles (`captions` of a segment in ../viral.json) are supported, none are used today.
 * Text stays out of the top 6 % and the bottom 15 % (the apps draw their own buttons there).
 */
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

import viral from './viral.json';
import {
	C,
	CutFlash,
	Eyebrow,
	INTER,
	MONO,
	PortalFlash,
	RevealLine,
	SORA,
	Scrim,
	Shot,
	Vignette,
	clamp,
	fr,
	gradientText,
	shadow,
} from './Resume.jsx';

const big = (size) => ({
	fontFamily: SORA,
	fontWeight: 800,
	fontSize: size,
	lineHeight: 1.04,
	letterSpacing: '-0.025em',
	color: '#fff',
	textShadow: shadow,
});

/** Where a text block sits: top (under the status bar), bottom (above the app buttons), lower and mid (above the subtitles). */
const PLACE = {
	top: { justifyContent: 'flex-start', paddingTop: 210 },
	bottom: { justifyContent: 'flex-end', paddingBottom: 330 },
	lower: { justifyContent: 'flex-end', paddingBottom: 420 },
	mid: { justifyContent: 'flex-end', paddingBottom: 640 },
	end: { justifyContent: 'flex-end', paddingBottom: 380 },
};

function TextBlock({ t }) {
	const f = useCurrentFrame();
	if (f < t.from - 1 || f > t.to + 1) return null;
	const center = t.pos === 'end';
	return (
		<AbsoluteFill
			style={{ padding: '0 80px', alignItems: center ? 'center' : 'flex-start', textAlign: center ? 'center' : 'left', ...PLACE[t.pos] }}
		>
			{t.eyebrow ? (
				<>
					<Eyebrow inAt={t.from} outAt={t.to} size={34}>
						{t.eyebrow}
					</Eyebrow>
					<div style={{ height: 20 }} />
				</>
			) : null}
			{t.url ? <Url url={t.url} at={t.from + 6} /> : null}
			{t.lines.map((l, i) => (
				<RevealLine
					key={l}
					inAt={t.from}
					delay={i * 4 + (t.url ? 22 : 0)}
					outAt={t.to}
					style={
						t.url
							? { fontFamily: INTER, fontWeight: 600, fontSize: t.size, color: C.mist, textShadow: shadow, marginTop: 18 }
							: big(t.size)
					}
				>
					{i === t.accent ? <span style={gradientText}>{fr(l)}</span> : fr(l)}
				</RevealLine>
			))}
		</AbsoluteFill>
	);
}

function Url({ url, at }) {
	const f = useCurrentFrame();
	const typed = Math.round(interpolate(f, [at, at + url.length * 1.1], [0, url.length], clamp));
	const caret = Math.floor(f / 9) % 2 === 0 || typed < url.length;
	return (
		<div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 84, letterSpacing: '-0.01em', minHeight: '1.25em' }}>
			<span style={{ ...gradientText, filter: 'drop-shadow(0 0 22px rgba(56,189,248,0.4)) drop-shadow(0 4px 18px rgba(5,4,12,0.9))' }}>
				{url.slice(0, typed)}
			</span>
			<span style={{ color: C.sky, opacity: caret ? 1 : 0 }}>▍</span>
		</div>
	);
}

/** Burned-in subtitles of the voice (the bug card read aloud by Raphy·OS). */
function Captions({ captions, fps }) {
	const f = useCurrentFrame();
	const t = f / fps;
	const c = captions.find((x) => t >= x.at && t < x.to);
	if (!c) return null;
	return (
		<AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 300, padding: '0 70px 300px' }}>
			<div
				style={{
					fontFamily: INTER,
					fontWeight: 600,
					fontSize: 46,
					lineHeight: 1.3,
					color: '#fff',
					textAlign: 'center',
					background: 'rgba(5,4,12,0.72)',
					borderRadius: 18,
					padding: '14px 26px',
					boxDecorationBreak: 'clone',
				}}
			>
				{fr(c.text)}
			</div>
		</AbsoluteFill>
	);
}

function Credit({ text, from }) {
	const f = useCurrentFrame();
	const o = interpolate(f, [from, from + 12], [0, 1], clamp);
	return (
		<AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'center', paddingTop: 120 }}>
			<div
				style={{
					fontFamily: MONO,
					fontSize: 20,
					color: 'rgba(217,211,255,0.8)',
					opacity: o,
					textAlign: 'center',
					maxWidth: 900,
					textShadow: shadow,
				}}
			>
				{fr(text)}
			</div>
		</AbsoluteFill>
	);
}

export function Viral({ audio = 'mix-viral.wav' }) {
	const { fps } = useVideoConfig();
	const captions = viral.segments.flatMap((s) => s.captions ?? []);
	const end = viral.segments.find((s) => s.id === 'end');
	return (
		<AbsoluteFill style={{ backgroundColor: C.ink }}>
			{viral.segments.map((s) => (
				<Sequence key={s.id} from={s.from} durationInFrames={s.len}>
					<Shot src={s.src} dir="" grade={s.id === 'end' ? 'nexus' : 'game'} offset={s.offset ?? 0} punchIn={s.id !== 'cross'} />
					<Vignette strength={0.45} />
					<Scrim side={s.texts.some((t) => t.pos === 'top') ? 'top' : 'bottom'} strength={0.7} />
					{s.texts.map((t) => (
						<TextBlock key={t.lines[0]} t={t} />
					))}
					{s.id !== 'cross' ? <CutFlash /> : null}
				</Sequence>
			))}
			<PortalFlash at={viral.teleport} />
			<Captions captions={captions} fps={fps} />
			<Sequence from={end.from}>
				<Credit text={viral.credit} from={30} />
			</Sequence>
			{audio ? <Audio src={staticFile(audio)} /> : null}
		</AbsoluteFill>
	);
}
