import { motion } from 'framer-motion';
import Image from 'next/image';
import type { RefObject } from 'react';
import { DiGithubFull } from 'react-icons/di';
import { ImYoutube2 } from 'react-icons/im';
import { TbWorld } from 'react-icons/tb';

import { urlFor } from '../../sanity';
import type { Project } from '../../types/project';
import IconLink from '../IconLink/iconLink';

type CardProjectProps = Project & {
  scrollRef: RefObject<Element>;
};

const ProjectCard = ({
  image,
  scrollRef,
  linkToBuild,
  linkToGithub,
  linkToYoutube,
  summary,
  technologies,
  title,
}: CardProjectProps) => {
  return (
    <motion.article
      initial={{ opacity: 0.3 }}
      whileInView={{ opacity: 1 }}
      viewport={{ root: scrollRef, amount: 0.8 }}
      className='flex w-[300px] shrink-0 cursor-pointer select-none snap-center flex-col items-center space-y-7 overflow-hidden rounded-medium bg-black-500 p-10  md:w-[500px] 	xl:w-[900px] '
    >
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        transition={{ duration: 0.5 }}
        whileInView={{ opacity: 1, y: 0 }}
        className='relative w-[250px] h-[200px] md:h-[288px] md:w-[500px] overflow-hidden '
      >
        <Image
          alt={title}
          layout='fill'
          objectFit='contain'
          src={urlFor(image).url()}
        />
      </motion.div>
      <div className='self-start px-0 md:px-10'>
        <h4 className='text-xl text-secondary-light'>{title}</h4>
        <div className='flex my-2 space-x-2'>
          {technologies.map((technologie) => (
            <IconLink
              key={technologie._id}
              {...technologie}
              activeText={false}
            />
          ))}
        </div>
        <p>{summary}</p>

        <div className='flex items-center mt-2 gap-x-5'>
          {linkToYoutube && (
            <a
              title='vidéo du projet'
              href={linkToYoutube}
              target='_blank'
              rel='noreferrer'
            >
              {' '}
              <ImYoutube2 className='w-12 h-12 text-red-500 icon-animate' />
            </a>
          )}
          <a
            title='github du projet'
            href={linkToGithub}
            target='_blank'
            rel='noreferrer'
          >
            {' '}
            <DiGithubFull className='w-12 h-12 icon-animate text-black-800' />
          </a>
          {linkToBuild && (
            <a
              title='lien du projet'
              href={linkToBuild}
              target='_blank'
              rel='noreferrer'
            >
              {' '}
              <TbWorld className='w-8 h-8 icon-animate text-primary' />
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
};

export default ProjectCard;
