import Image from 'next/image';

import { urlFor } from '../../sanity';
import type { Skill } from '../../types/skill';

type IconLinkProps = Skill & {
  activeText?: boolean;
};
const IconLink = ({ title, link, image, activeText = true }: IconLinkProps) => {
  return (
    <a href={link} target='_blank' rel='noreferrer' className='icon-animate'>
      <div className='flex flex-col items-center text-gray-300 hover:text-white'>
        <div className='relative h-7 w-7 md:h-10 md:w-10'>
          <Image
            layout='fill'
            objectFit='contain'
            alt={title}
            title={`Je suis le logo de ${title}`}
            src={urlFor(image).url()}
          />
        </div>
        {activeText && (
          <span className='block mt-2 text-xs uppercase md:text-base'>
            {title}
          </span>
        )}
      </div>
    </a>
  );
};

export default IconLink;
