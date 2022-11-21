import { motion } from 'framer-motion';

import type { Experience as IExperience } from '../../types/experience';
import SlideCard from '../Card/slideCard';

type WorkExperienceProps = {
  experiences: IExperience[];
};

const WorkExperience = ({ experiences }: WorkExperienceProps) => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1.1 }}
        transition={{ duration: 1.5 }}
      >
        <h2 className='inline text-2xl font-bold gradient md:text-4xl'>
          Expériences
        </h2>
        <SlideCard data={experiences} />
      </motion.div>
    </>
  );
};

export default WorkExperience;
