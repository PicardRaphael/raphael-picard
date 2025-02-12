'use client';
import { motion } from 'framer-motion';

const AnimationY = ({
	children,
	yInitial = -500,
	yAnimate = 0,
	className,
	ref,
}: Readonly<{
	children: React.ReactNode;
	yInitial?: number;
	yAnimate?: number;
	className?: string;
	ref?: React.RefObject<any> | ((node?: Element | null) => void);
}>) => {
	return (
		<motion.div
			ref={ref}
			initial={{
				y: yInitial,
				opacity: 0,
				scale: 0.5,
			}}
			animate={{
				y: yAnimate,
				opacity: 1,
				scale: 1,
			}}
			transition={{ duration: 0.5 }}
			className={className}
		>
			{children}
		</motion.div>
	);
};

export default AnimationY;
