'use client';
import Cv from '@/components/CV';
import NavItem from '@/components/Header/NavItem';
import navigationConfig from '@/utils/nav-config';
import { motion } from 'framer-motion';
import { useState } from 'react';

const NavHeaderMobile = () => {
	const [isNavOpen, setIsNavOpen] = useState(false);
	const closePanel = () => setIsNavOpen(false);

	return (
		<nav className="relative">
			<div className="relative z-12 space-y-2" onClick={() => setIsNavOpen((prev) => !prev)}>
				{isNavOpen ? (
					<>
						<span className="btn-gradient block h-0.5 w-8 translate-y-1.5 rotate-45"></span>
						<span className="btn-gradient block h-0.5 w-8 -translate-y-1 -rotate-45"></span>
					</>
				) : (
					<>
						<span className="btn-gradient block h-0.5 w-8"></span>
						<span className="btn-gradient block h-0.5 w-8"></span>
						<span className="btn-gradient block h-0.5 w-8"></span>
					</>
				)}
			</div>
			{isNavOpen && <div className="bg-black-700 fixed inset-0 z-10 opacity-70" onClick={closePanel}></div>}
			<motion.div
				initial={{ x: '100%' }}
				animate={{ x: isNavOpen ? 0 : '100%' }}
				transition={{ type: 'spring', stiffness: 300, damping: 30 }}
				className="bg-black-700 bg-opacity-90 fixed top-0 right-0 z-11 h-full w-3/4 shadow-lg"
			>
				<ul className="relative flex h-full flex-col items-center justify-center space-y-6">
					{navigationConfig.map((item) => (
						<NavItem key={item.key} item={item} />
					))}
					<Cv />
				</ul>
			</motion.div>
		</nav>
	);
};

export default NavHeaderMobile;
