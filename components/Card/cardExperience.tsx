/* eslint-disable no-underscore-dangle */
import { motion } from 'framer-motion';
import Image from 'next/image';
import type { RefObject } from 'react';

import { urlFor } from '../../sanity';
import type { Experience } from '../../types/experience';
import IconLink from '../IconLink/iconLink';

type ExperienceCardProps = Experience & {
  scrollRef: RefObject<Element>;
};

const ExperienceCard = ({
  scrollRef,
  company,
  companyImage,
  dateEnded,
  dateStarted,
  jobTitle,
  points,
  technologies,
}: ExperienceCardProps) => {
  return (
    <motion.article
      initial={{ opacity: 0.3 }}
      whileInView={{ opacity: 1 }}
      viewport={{ root: scrollRef, amount: 0.8 }}
      className='flex w-[300px] shrink-0 cursor-pointer select-none snap-center flex-col items-center space-y-7 overflow-hidden rounded-medium bg-black-500  p-4 md:p-10  md:w-[500px] 	xl:w-[900px]'
    >
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        transition={{ duration: 0.5 }}
        whileInView={{ opacity: 1, y: 0 }}
        className='relative overflow-hidden bg-white rounded-full h-28 w-28'
      >
        <Image
          alt={company}
          layout='fill'
          objectFit='contain'
          src={urlFor(companyImage).url()}
        />
      </motion.div>
      <div className='px-0 md:px-10'>
        <h4 className='text-xl text-secondary-light'>{jobTitle}</h4>
        <p className='mt-1 text-lg font-bold text-primary-light'>{company}</p>
        <div className='flex flex-wrap justify-center my-2 space-x-2 md:justify-start'>
          {technologies.map((technologie) => (
            <IconLink
              key={technologie._id}
              {...technologie}
              activeText={false}
            />
          ))}
        </div>
        <p className='py-5 text-xs text-gray-300 uppercase md:text-sm'>
          Début {new Date(dateStarted).toLocaleDateString('fr')} - Fin{' '}
          {new Date(dateEnded).toLocaleDateString('fr')}{' '}
        </p>
        <div className='scrollbar-medium overflow-auto h-[300px] p-4 scrollbar-thin scrollbar-track-black-600/50 scrollbar-thumb-gray-600/50 hover:scrollbar-thumb-gray-600 '>
          <ul className='list-disc space-y-4 text-base text-white h-[250px]'>
            {points.map((point, index) => (
              <li key={index} className='text-sm md:text-base'>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.article>
  );
};

export default ExperienceCard;
