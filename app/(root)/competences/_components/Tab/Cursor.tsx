import { motion } from 'framer-motion';
import { Position } from '../Skills';

const Cursor = ({ position }: { position: Position }) => {
	return (
		<motion.li
			animate={{
				left: position.left,
				width: position.width,
				opacity: position.opacity,
			}}
			className="from-primary-default to-secondary-default absolute z-0 h-6 rounded-full bg-gradient-to-r lg:h-9"
		/>
	);
};

export default Cursor;
