'use client';
import { motion } from 'framer-motion';
import { PortableText } from 'next-sanity';

import { ProjectEntity } from '@/core/domain/entities/project.entity';
import Image from 'next/image';
import { DiGithubFull } from 'react-icons/di';
import { ImYoutube2 } from 'react-icons/im';
import { TbWorld } from 'react-icons/tb';
import IconLink from '../IconLink';

interface CardPortfolioProps {
	portfolio: ProjectEntity;
	slide?: (direction: 'left' | 'right') => void;
}

const CardPortfolio = ({ portfolio, slide }: CardPortfolioProps) => {
	return (
		<motion.article
			key={portfolio.id}
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
			className="bg-black-500 z-5 flex w-[350px] shrink-0 cursor-pointer flex-col space-y-7 overflow-hidden rounded-md p-4 select-none md:h-[600px] md:w-[500px] lg:mt-5 lg:min-h-[627px] lg:min-w-[820px] lg:p-8"
		>
			<header className="m-0 flex w-full flex-col space-y-2">
				<div className="relative flex h-20 w-20 items-center justify-center self-center overflow-hidden rounded-full bg-white lg:h-28 lg:w-28">
					<Image alt={portfolio.image.alt} src={portfolio.image.url} priority layout="fill" objectFit="contain" />
				</div>

				<div className="flex flex-grow flex-col text-left">
					<h2 className="text-secondary-light text-xl">{portfolio.title}</h2>
				</div>
			</header>

			<section className="my-4 flex flex-wrap justify-start space-x-2">
				{portfolio.technologies.map((technologie, index) => (
					<IconLink key={`${portfolio.id}${index}`} {...technologie} activeText={false} size="h-4 w-4 md:h-8 md:w-8" />
				))}
			</section>

			<section className="description-portable-text">
				<PortableText value={portfolio.description} />
			</section>

			<footer className="mt-2 flex items-center gap-x-5">
				{portfolio.linkToYoutube && (
					<a title="vidéo du projet" href={portfolio.linkToYoutube} target="_blank" rel="noreferrer">
						{' '}
						<ImYoutube2 className="icon-animate h-8 w-8 text-red-500 lg:h-12 lg:w-12" />
					</a>
				)}
				{portfolio.linkToGithub && (
					<a title="github du projet" href={portfolio.linkToGithub} target="_blank" rel="noreferrer">
						{' '}
						<DiGithubFull className="icon-animate text-black-800 h-8 w-8 lg:h-12 lg:w-12" />
					</a>
				)}
				{portfolio.linkToProject && (
					<a title="lien du projet" href={portfolio.linkToProject} target="_blank" rel="noreferrer">
						{' '}
						<TbWorld className="icon-animate text-primary-default h-8 w-8 lg:h-12 lg:w-12" />
					</a>
				)}
			</footer>
		</motion.article>
	);
};

export default CardPortfolio;
