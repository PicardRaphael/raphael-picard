/**
 * The poster (public/video/resume-30s.jpg): the val and the Nexus side by side across a neon seam, the name, three proofs.
 */
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { loadFont as loadSora } from '@remotion/google-fonts/Sora';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { loadFont as loadMono } from '@remotion/google-fonts/JetBrainsMono';

const { fontFamily: SORA } = loadSora('normal', { weights: ['700', '800'], subsets: ['latin', 'latin-ext'] });
const { fontFamily: INTER } = loadInter('normal', { weights: ['500', '600'], subsets: ['latin', 'latin-ext'] });
const { fontFamily: MONO } = loadMono('normal', { weights: ['500'], subsets: ['latin', 'latin-ext'] });

const GRADIENT = 'linear-gradient(100deg, #651fff 0%, #c50eff 45%, #e879f9 75%, #38bdf8 100%)';
const NNBSP = ' ';
const shadow = '0 4px 30px rgba(5,4,12,0.9), 0 0 2px rgba(5,4,12,0.9)';
/** The seam between the two worlds, as a fraction of the width at the top and at the bottom. */
const SEAM = [0.6, 0.44];

export function Poster({ framesDir = 'frames', val = 'game-val/0012.jpg', nexus = 'nexus-crane/0060.jpg' }) {
	const clip = `polygon(0 0, ${SEAM[0] * 100}% 0, ${SEAM[1] * 100}% 100%, 0 100%)`;
	const stats = [`7 agents IA en production`, `5 contrôles humains`, `−33${NNBSP}% de coûts d’inférence`];
	return (
		<AbsoluteFill style={{ backgroundColor: '#05040c', overflow: 'hidden' }}>
			<Img
				src={staticFile(`${framesDir}/${nexus}`)}
				style={{
					position: 'absolute',
					width: '100%',
					height: '100%',
					objectFit: 'cover',
					transform: 'translateX(26%) scale(1.15)',
					filter: 'saturate(1.25) contrast(1.1) brightness(1.08) blur(1px)',
				}}
			/>
			<AbsoluteFill style={{ clipPath: clip }}>
				<Img
					src={staticFile(`${framesDir}/${val}`)}
					style={{
						width: '100%',
						height: '100%',
						objectFit: 'cover',
						transform: 'translateX(-14%) scale(1.15)',
						filter: 'saturate(1.15) contrast(1.05) brightness(1) blur(1.2px)',
					}}
				/>
			</AbsoluteFill>
			{/* the neon seam */}
			<svg width="1920" height="1080" style={{ position: 'absolute', inset: 0 }}>
				<defs>
					<linearGradient id="seam" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#38bdf8" />
						<stop offset="0.5" stopColor="#e879f9" />
						<stop offset="1" stopColor="#651fff" />
					</linearGradient>
					<filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
						<feGaussianBlur stdDeviation="9" />
					</filter>
				</defs>
				<line x1={1920 * SEAM[0]} y1="0" x2={1920 * SEAM[1]} y2="1080" stroke="url(#seam)" strokeWidth="16" filter="url(#glow)" />
				<line x1={1920 * SEAM[0]} y1="0" x2={1920 * SEAM[1]} y2="1080" stroke="#fff" strokeOpacity="0.9" strokeWidth="3" />
			</svg>
			<AbsoluteFill style={{ background: 'linear-gradient(90deg, rgba(5,4,12,0.82) 0%, rgba(5,4,12,0.55) 36%, rgba(5,4,12,0) 60%)' }} />
			<AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, rgba(5,4,12,0) 50%, rgba(5,4,12,0.6) 100%)' }} />
			<AbsoluteFill style={{ padding: '0 0 0 150px', justifyContent: 'center' }}>
				<div
					style={{
						fontFamily: MONO,
						fontWeight: 500,
						fontSize: 27,
						letterSpacing: '0.16em',
						color: '#38bdf8',
						display: 'flex',
						alignItems: 'center',
						gap: 16,
					}}
				>
					<span style={{ width: 54, height: 3, background: GRADIENT }} />
					SENIOR AI ENGINEER &amp; RESPONSABLE IA
				</div>
				<div
					style={{
						fontFamily: SORA,
						fontWeight: 800,
						fontSize: 150,
						lineHeight: 1.0,
						letterSpacing: '-0.035em',
						color: '#fff',
						textShadow: shadow,
						marginTop: 18,
					}}
				>
					Raphaël
					<br />
					Picard
				</div>
				<div style={{ fontFamily: INTER, fontWeight: 600, fontSize: 40, color: '#d9d3ff', textShadow: shadow, marginTop: 16 }}>
					Neoteem · Lyon
				</div>
				<div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 34 }}>
					{stats.map((s) => (
						<div
							key={s}
							style={{
								fontFamily: SORA,
								fontWeight: 700,
								fontSize: 34,
								color: '#fff',
								textShadow: shadow,
								display: 'flex',
								alignItems: 'center',
								gap: 14,
							}}
						>
							<span style={{ width: 12, height: 12, borderRadius: 6, background: GRADIENT, boxShadow: '0 0 14px #e879f9' }} />
							{s}
						</div>
					))}
				</div>
				<div
					style={{
						marginTop: 44,
						alignSelf: 'flex-start',
						display: 'flex',
						alignItems: 'center',
						gap: 16,
						padding: '16px 30px 16px 22px',
						borderRadius: 999,
						background: GRADIENT,
						boxShadow: '0 0 40px rgba(197,14,255,0.55)',
						fontFamily: SORA,
						fontWeight: 700,
						fontSize: 32,
						color: '#fff',
					}}
				>
					<span
						style={{
							width: 0,
							height: 0,
							borderTop: '13px solid transparent',
							borderBottom: '13px solid transparent',
							borderLeft: '20px solid #fff',
							marginLeft: 6,
						}}
					/>
					Raphaël en 30{NNBSP}secondes
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
}
