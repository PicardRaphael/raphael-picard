'use client';

import { useEffect, useRef, useState } from 'react';

const GLYPHS = '01<>/{}[]#$%&*+=?ΣΔλ∑∂';

type Props = { text: string; className?: string; delay?: number; speed?: number };

/** "Decodes" a string like a model streaming tokens. The real text stays readable by screen readers and crawlers. */
export function ScrambleText({ text, className, delay = 0, speed = 28 }: Props) {
	const [out, setOut] = useState(text);
	// plain text until the animation runs: the HTML (and what search engines index) holds the slogan once
	const [animating, setAnimating] = useState(false);
	const frame = useRef<number>(0);

	useEffect(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		let start = 0;
		const on = requestAnimationFrame(() => setAnimating(true));
		const total = text.length;
		const tick = (now: number) => {
			if (!start) start = now + delay;
			const progress = Math.max(0, (now - start) / speed);
			const revealed = Math.floor(progress);
			setOut(
				text
					.split('')
					.map((ch, i) => (i < revealed || ch === ' ' ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
					.join(''),
			);
			if (revealed < total) frame.current = requestAnimationFrame(tick);
		};
		frame.current = requestAnimationFrame(tick);
		return () => {
			cancelAnimationFrame(on);
			cancelAnimationFrame(frame.current);
		};
	}, [text, delay, speed]);

	return (
		<span className={className}>
			{animating ? (
				<>
					<span className="sr-only">{text}</span>
					<span aria-hidden>{out}</span>
				</>
			) : (
				text
			)}
		</span>
	);
}
