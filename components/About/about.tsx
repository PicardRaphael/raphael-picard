import { PortableText } from '@portabletext/react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import React from 'react';
import { InView } from 'react-intersection-observer';

import { urlFor } from '../../sanity';
import type { About as IAbout } from '../../types/about';

const About = ({ about, aboutPic }: IAbout) => {
  return (
    <>
      <h2 className='inline text-2xl font-bold gradient md:text-4xl'>
        Qui suis-je ?
      </h2>
      <div className='flex gap-10'>
        <InView threshold={0.25}>
          {({ ref, inView }) => (
            <motion.div
              ref={ref}
              initial={{
                x: -250,
                opacity: 0,
              }}
              animate={inView ? { x: 0, opacity: 1 } : { x: -250, opacity: 0 }}
              transition={{ duration: 0.5, type: 'tween' }}
            >
              <PortableText value={about} />
            </motion.div>
          )}
        </InView>
        <InView threshold={0.25}>
          {({ ref, inView }) => (
            <motion.div
              ref={ref}
              initial={{
                x: 250,
                opacity: 0,
              }}
              animate={inView ? { x: 0, opacity: 1 } : { x: 250, opacity: 0 }}
              transition={{ duration: 0.5, type: 'tween' }}
              className='relative hidden w-full overflow-hidden rounded-medium md:block'
            >
              <Image
                layout='fill'
                objectFit='cover'
                alt='Raphaël PICARD'
                src={urlFor(aboutPic).url()}
                priority
              />
            </motion.div>
          )}
        </InView>
      </div>
    </>
  );
};

export default About;
