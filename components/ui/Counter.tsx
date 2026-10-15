'use client';

import { animate, useInView, useReducedMotion } from 'motion/react';
import { useEffect, useRef } from 'react';

type Props = { value: number; suffix?: string; className?: string };

export function Counter({ value, suffix = '', className }: Props) {
	const ref = useRef<HTMLSpanElement>(null);
	const inView = useInView(ref, { once: true, margin: '-10% 0px' });
	const reduced = useReducedMotion();

	useEffect(() => {
		const el = ref.current;
		if (!el || !inView || reduced) return;
		const controls = animate(0, value, {
			duration: 1.8,
			ease: [0.16, 1, 0.3, 1],
			onUpdate: (v) => {
				el.textContent = `${Math.round(v).toLocaleString('fr-FR')}${suffix}`;
			},
		});
		return () => controls.stop();
	}, [inView, value, suffix, reduced]);

	return (
		<span ref={ref} className={className}>
			{value.toLocaleString('fr-FR')}
			{suffix}
		</span>
	);
}
