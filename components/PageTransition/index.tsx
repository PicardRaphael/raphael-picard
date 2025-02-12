'use client0';
import { AnimatePresence } from 'framer-motion';
const PageTransition = ({ children }: { children: React.ReactNode }) => {
	return <AnimatePresence>{children}</AnimatePresence>;
};

export default PageTransition;
