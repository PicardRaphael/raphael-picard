'use client';
import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useRef, useState } from 'react';

interface SliderProps<T> {
	items: T[];
	renderItem: (item: T, slide: (direction: 'left' | 'right') => void) => React.ReactNode;
}

const Slider = <T,>({ items, renderItem }: SliderProps<T>) => {
	const [currentIndex, setCurrentIndex] = useState(0);
	const sliderRef = useRef<HTMLDivElement>(null);

	// Calcul de l'index précédent et suivant
	const getPrevIndex = (current: number) => (current - 1 + items.length) % items.length;
	const getNextIndex = (current: number) => (current + 1) % items.length;

	// Fonction de navigation
	const slide = (direction: 'left' | 'right') => {
		setCurrentIndex((prevIndex) => (direction === 'left' ? (prevIndex - 1 + items.length) % items.length : (prevIndex + 1) % items.length));
	};

	return (
		<div className="flex w-full items-center justify-center">
			<div className="relative w-full">
				{items.length > 1 ? (
					<div className="absolute top-10 left-1 z-6 -translate-y-1/2 md:top-1/2 md:left-[-55px]">
						<motion.div
							transition={{ duration: 0.3, ease: 'easeInOut' }}
							initial={{ opacity: 0, scale: 0 }}
							animate={{ opacity: 1, scale: 1 }}
						>
							<button
								onClick={() => slide('left')}
								className="z-50 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-all hover:bg-white/20"
								aria-label="Previous slide"
							>
								<ChevronDoubleLeftIcon className="h-6 w-6" />
							</button>
						</motion.div>
					</div>
				) : null}
				{items.length > 1 ? (
					<div className="absolute top-10 right-1 z-6 -translate-y-1/2 md:top-1/2 md:right-[-54px]">
						<motion.div
							transition={{ duration: 0.3, ease: 'easeInOut' }}
							initial={{ opacity: 0, scale: 0 }}
							animate={{ opacity: 1, scale: 1 }}
						>
							<button
								onClick={() => slide('right')}
								className="z-40 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-all hover:bg-white/20"
								aria-label="Next slide"
							>
								<ChevronDoubleRightIcon className="h-6 w-6" />
							</button>
						</motion.div>
					</div>
				) : null}

				<div className="relative flex items-center justify-center">
					{/* Previous Card */}
					{currentIndex !== 0 && (
						<div className="absolute right-full hidden scale-[0.85] opacity-30 md:block lg:mr-[-50px] lg:w-[200px]">
							{renderItem(items[getPrevIndex(currentIndex)], slide)}
						</div>
					)}

					{/* Current Card */}
					{renderItem(items[currentIndex], slide)}

					{/* Next Card */}
					{currentIndex !== items.length - 1 && (
						<div className="absolute left-full hidden scale-[0.85] opacity-30 md:block lg:ml-[-550px] lg:w-[200px]">
							{renderItem(items[getNextIndex(currentIndex)], slide)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default Slider;
