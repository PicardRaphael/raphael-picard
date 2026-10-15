import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const alt = 'Raphaël Picard — Senior AI Engineer & Responsable IA : agents, RAG, MCP & Claude Code';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpengraphImage() {
	const logo = await readFile(join(process.cwd(), 'public/logo/logo-sombre.svg'), 'utf8');
	const logoSrc = `data:image/svg+xml;base64,${Buffer.from(logo).toString('base64')}`;
	const stars = Array.from({ length: 70 }, (_, i) => ({ x: (i * 397) % 1200, y: (i * 211) % 630, s: 1 + (i % 3) }));

	return new ImageResponse(
		(
			<div
				style={{
					width: '100%',
					height: '100%',
					display: 'flex',
					position: 'relative',
					background: 'radial-gradient(ellipse at 80% 40%, #3b0f5c 0%, #140a2a 45%, #05040c 100%)',
					color: '#ece9ff',
					fontFamily: 'sans-serif',
				}}
			>
				{stars.map((s, i) => (
					<div key={i} style={{ position: 'absolute', left: s.x, top: s.y, width: s.s, height: s.s, borderRadius: 9, background: '#ffffff', opacity: 0.5 }} />
				))}
				<div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 80px', width: 780 }}>
					<div style={{ fontSize: 24, letterSpacing: 6, color: '#38bdf8', textTransform: 'uppercase' }}>Senior AI Engineer & Responsable IA · Lyon</div>
					<div style={{ fontSize: 88, fontWeight: 800, marginTop: 18, lineHeight: 1 }}>Raphaël Picard</div>
					<div style={{ fontSize: 40, marginTop: 22, color: '#e879f9' }}>J’industrialise l’IA agentique.</div>
					<div style={{ fontSize: 26, marginTop: 28, color: '#a39fc4' }}>Agents LangGraph · RAG hybrides · serveurs MCP · Claude Code</div>
				</div>
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img src={logoSrc} width={300} height={332} style={{ position: 'absolute', right: 110, top: 150 }} alt="" />
			</div>
		),
		size,
	);
}
