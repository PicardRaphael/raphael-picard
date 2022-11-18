import Image from 'next/image';
import { urlFor } from '../../sanity';
import { Skill as ISkill } from '../../types/skill';

const Skill = ({ title, image }: ISkill) => {
  return (
    <div className='flex flex-col items-center justify-center w-16 md:w-28'>
      <div className='relative w-10 h-10 md:h-14 md:w-14'>
        <Image
          layout='fill'
          objectFit='contain'
          alt={title}
          src={urlFor(image).url()}
          title={`Je suis le logo de ${title}`}
        />
      </div>
      <h3 className='mt-2 hidden text-center uppercase text-gray-300 md:block text-sm md:w-28 truncate h-[20px]'>
        {title}
      </h3>
    </div>
  );
};

export default Skill;
