import React, { useEffect, useRef, useState } from 'react';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';

import type { Experience } from '../../types/experience';
import type { Project } from '../../types/project';
import ExperienceCard from './cardExperience';
import ProjectCard from './cardProject';

type SlideCardProps = {
  data: Project[] | Experience[];
};

const SlideCard = ({ data }: SlideCardProps) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [cardActive, setCardActive] = useState(1);

  const slideLeft = () => {
    sliderRef.current.scrollLeft -= 500;
    setCardActive((prev) => prev - 1);
  };
  const slideRight = () => {
    sliderRef.current.scrollLeft += 500;
    setCardActive((prev) => prev + 1);
  };

  useEffect(() => {
    const handleScroll = () => {
      sliderRef.current.scrollLeft === 0 && setCardActive(1);
      sliderRef.current.scrollLeft > data.length * 500 - 500 &&
        setCardActive(data.length);
    };
    const element = sliderRef.current;
    element.addEventListener('scroll', handleScroll);

    return () => {
      element.removeEventListener('scroll', handleScroll);
    };
  }, [data.length]);

  return (
    <div className='relative flex items-center justify-center'>
      {data.length > 1 && (
        <MdChevronLeft
          className={`${
            cardActive !== 1 ? 'text-white' : 'text-black-500/60'
          } hidden cursor-pointer  opacity-50 hover:opacity-100 md:block absolute left-[-8%]`}
          onClick={cardActive !== 1 ? slideLeft : null}
          size={80}
        />
      )}
      <div
        id={`slide-${data[0]._type}`}
        ref={sliderRef}
        className='flex py-10 space-x-2 overflow-x-scroll cursor-pointer scrollbar-thin scrollbar-thumb-black-500/60 scrollbar-track-black-700 snap-x snap-mandatory first:ml-5 md:space-x-5 hover:scrollbar-thumb-black-500'
      >
        {data?.map((value: Project | Experience) =>
          value._type === 'experience' ? (
            <ExperienceCard key={value._id} scrollRef={sliderRef} {...value} />
          ) : (
            <ProjectCard key={value._id} scrollRef={sliderRef} {...value} />
          )
        )}
      </div>
      {data.length > 1 && (
        <MdChevronRight
          className={`${
            cardActive === data.length ? 'text-black-500/60' : 'text-white'
          } hidden cursor-pointer opacity-50 hover:opacity-100 md:block absolute right-[-8%]`}
          onClick={cardActive === data.length ? null : slideRight}
          size={80}
        />
      )}
    </div>
  );
};
export default SlideCard;
