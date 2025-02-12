'use client';
import { AnimateType } from '@/utils/types/animate';
import { motion } from 'framer-motion';

const Animate = ({
	ref,
	children,
	animate,
	className,
}: {
	ref?: React.RefObject<any> | ((node?: Element | null) => void);
	children: React.ReactNode;
	animate?: AnimateType;
	className?: string;
}) => {
	return (
		<motion.div
			ref={ref}
			initial={{
				y: animate?.yInitial ?? 0,
				x: animate?.xInitial ?? 0,
				opacity: animate?.opacityInitial ?? 1,
				scale: animate?.scaleInitial ?? 1,
			}}
			animate={{
				y: animate?.yAnimate ?? 0,
				x: animate?.xAnimate ?? 0,
				opacity: animate?.opacityAnimate ?? 1,
				scale: animate?.scaleAnimate ?? 1,
			}}
			transition={{ duration: animate?.duration ?? 0.5 }}
			className={className}
		>
			{children}
		</motion.div>
	);
};

export default Animate;
