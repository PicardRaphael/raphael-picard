import { PortableText } from '@portabletext/react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Cursor, useTypewriter } from 'react-simple-typewriter';
import { urlFor } from '../../sanity';
import type { Hero as IHero } from '../../types/hero';

import IconLink from '../IconLink/iconLink';

const Hero = ({
  typeWriter,
  name,
  profilePic,
  role,
  speciality,
  skill,
  together,
}: IHero) => {
  const [text] = useTypewriter({
    words: typeWriter,
    loop: true,
    delaySpeed: 2000,
  });

  return (
    <div className='section'>
      <motion.div
        initial={{
          y: -500,
          opacity: 0,
          scale: 0.5,
        }}
        animate={{
          y: 0,
          opacity: 1,
          scale: 1,
        }}
        transition={{ duration: 0.5 }}
        className='relative w-32 h-32 mx-auto overflow-hidden border-2 rounded-full border-primary'
      >
        <Image
          alt={name}
          title={`Je suis ${name}`}
          layout='fill'
          objectFit='cover'
          src={urlFor(profilePic).url()}
          priority
        />
      </motion.div>
      <h2 className='px-10 text-2xl font-semibold text-center text-white md:text-4xl'>
        {name}
      </h2>
      <h1 className='text-3xl font-bold text-center uppercase gradient'>
        {role}
      </h1>
      <h3 className='text-2xl italic font-bold text-center reverse-gradient'>
        {speciality}
      </h3>
      <h2 className='px-10 italic font-semibold text-center text-gray-300 md:text-4xl'>
        <span className='text-3xl md:mr-3'>{text}</span>
        <Cursor cursorColor='#C50EFF' />
      </h2>

      <div className='mt-5 border-y-2 border-gray-600/50'>
        <div className='flex items-center justify-around py-5'>
          {skill?.map((value) => (
            <IconLink key={value._id} {...value} />
          ))}
        </div>
      </div>

      <div className='pt-5 md:pt-10 md:pl-6'>
        <h2 className='inline text-2xl font-bold gradient md:text-4xl'>
          Que pourrions-nous faire ensemble ?
        </h2>
        <PortableText value={together} />
      </div>
    </div>
  );
};

export default Hero;
