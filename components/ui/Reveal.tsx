'use client';

import { motion } from 'motion/react';
import type { ReactNode } from 'react';

type Props = { children: ReactNode; delay?: number; y?: number; className?: string; as?: 'div' | 'li' | 'article' };

/**
 * Fades content up when it enters the viewport. Same markup on server and client
 * (no hydration mismatch); reduced motion is handled globally by <MotionConfig>.
 */
export function Reveal({ children, delay = 0, y = 28, className, as = 'div' }: Props) {
	const Tag = motion[as];
	return (
		<Tag
			className={className}
			initial={{ opacity: 0, y, filter: 'blur(6px)' }}
			whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
			viewport={{ once: true, margin: '0px 0px -12% 0px' }}
			transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
		>
			{children}
		</Tag>
	);
}
