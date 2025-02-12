'use client';
import { motion } from 'framer-motion';

const AnimationX = ({
	children,
	ref,
	inView,
	xInitial = 250,
	xAnimate = 0,
	className,
}: Readonly<{
	children: React.ReactNode;
	ref?: React.RefObject<any> | ((node?: Element | null) => void);
	inView: boolean;
	xInitial?: number;
	xAnimate?: number;
	className?: string;
}>) => {
	return (
		<motion.div
			ref={ref}
			initial={{
				x: xInitial,
				opacity: 0,
			}}
			animate={inView ? { x: 0, opacity: 1 } : { x: xAnimate, opacity: 0 }}
			transition={{ duration: 0.5, type: 'tween' }}
			className={className}
		>
			{children}
		</motion.div>
	);
};

export default AnimationX;
