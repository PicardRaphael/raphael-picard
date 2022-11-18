import { motion } from 'framer-motion';
import { Project } from '../../types/project';

import SlideCard from '../Card/slideCard';
type PortfolioProps = {
  projects: Project[];
};
const Portfolio = ({ projects }: PortfolioProps) => {
  return (
    <div className='section md:pl-6'>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1.1 }}
        transition={{ duration: 1.5 }}
      >
        <h2 className='inline text-2xl font-bold gradient md:text-4xl'>
          Mes projets
        </h2>
        <SlideCard data={projects} />
      </motion.div>
    </div>
  );
};

export default Portfolio;
