'use client';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
const Cv = () => {
	return (
		<motion.div
			initial={{ '--x': '100%' }}
			animate={{ '--x': '-100%' }}
			transition={{
				repeat: Infinity,
				repeatType: 'loop',
				repeatDelay: 0.5,
				type: 'spring',
				stiffness: 20,
				damping: 15,
				mass: 2,
			}}
			className="rounded-sm"
		>
			<a
				className="group active:text relative z-0 flex h-10 w-30 items-center justify-center rounded-sm bg-gradient-to-r from-(--color-secondary-default) to-(--color-primary-default) p-2 font-bold active:text-white"
				href="https://cdn.sanity.io/files/awd9ns3x/production/1f512876cc5c18d678b8c6e3c1c08f5fcb1f4211.pdf"
				download
				target="_blank"
				rel="noreferrer"
			>
				<DocumentArrowDownIcon className="mr-1 h-6 w-6" />
				CV
				<div className="absolute top-[-2] left-[-2] -z-10 h-14 w-34 bg-gradient-to-r from-(--color-primary-default) to-(--color-secondary-default) opacity-0 blur-md transition duration-300 ease-in-out group-hover:opacity-100"></div>
				<div className="absolute top-0 left-0 -z-10 h-10 w-30 rounded-sm bg-gray-400 group-hover:bg-transparent"></div>
				<span className="linear-overlay absolute inset-0 rounded-sm p-1" />
			</a>
		</motion.div>
	);
};

export default Cv;
