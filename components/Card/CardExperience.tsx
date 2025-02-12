'use client';
import { motion } from 'framer-motion';

import { ExperienceEntity } from '@/core/domain/entities/experiences.entity';
import { PortableText } from 'next-sanity';
import Image from 'next/image';
import IconLink from '../IconLink';

interface CardExperienceProps {
	experience: ExperienceEntity;
	slide?: (direction: 'left' | 'right') => void;
}
const CardExperience = ({ experience, slide }: CardExperienceProps) => {
	return (
		<motion.article
			key={experience.id}
			layout
			initial={{ opacity: 0, scale: 0.85, y: 20 }}
			animate={{ opacity: 1, scale: 1, y: 0 }}
			exit={{ opacity: 0, scale: 0.85, y: -20 }}
			transition={{ duration: 0.3, ease: 'easeInOut' }}
			drag="x"
			onDragEnd={(event, info) => {
				if (info.offset.x < -100) {
					slide && slide('right');
				} else if (info.offset.x > 100) {
					slide && slide('left');
				}
			}}
			className="bg-black-500 z-5 flex w-[350px] shrink-0 cursor-pointer flex-col space-y-7 overflow-hidden rounded-md p-4 select-none md:h-[600px] md:w-[550px] lg:mt-5 lg:min-h-[627px] lg:min-w-[820px] lg:p-8"
		>
			<header className="m-0 flex w-full flex-col space-y-2">
				{/* Conteneur de l’image centré verticalement */}
				<div className="relative flex h-20 w-20 items-center justify-center self-center overflow-hidden rounded-full bg-white lg:h-28 lg:w-28">
					<Image alt={experience.image.alt} src={experience.image.url} priority layout="fill" objectFit="contain" />
				</div>

				{/* Conteneur du texte aligné à gauche */}
				<div className="flex flex-grow flex-col text-left">
					<h2 className="text-secondary-light text-xl">{experience.title}</h2>
					<h3 className="text-primary-light mt-1 text-lg font-bold">{experience.company}</h3>
					<p className="text-xs text-gray-300 uppercase lg:text-sm">
						Début {new Date(experience.dateStarted).toLocaleDateString('fr')} - Fin{' '}
						{new Date(experience.dateEnded).toLocaleDateString('fr')}{' '}
					</p>
				</div>
			</header>

			{/* Icônes des technologies */}
			<section className="my-4 flex flex-wrap justify-start space-x-2">
				{experience.technologies.map((technologie, index) => (
					<IconLink key={`${experience.id}${index}`} {...technologie} activeText={false} size="h-4 w-4 md:h-8 md:w-8" />
				))}
			</section>

			{/* Description de l'expérience */}
			<section className="description-portable-text">
				<PortableText value={experience.shortSummary} />
			</section>
		</motion.article>
	);
};

export default CardExperience;
