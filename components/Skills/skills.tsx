import { motion } from 'framer-motion';
import { useRef, useState } from 'react';
import { Skills as ISkills } from '../../types/skill';

import TreeSkill from '../TreeSkills/treeSkills';

type SkillsProp = {
  skills: ISkills;
};

const cardLeft = {
  active: {
    display: 'block',
    x: 0,
    transition: {
      duration: 0.5,
    },
  },
  inactive: {
    display: 'none',
    x: -200,
    transition: {
      duration: 0.5,
    },
  },
};
const cardRight = {
  active: {
    display: 'block',
    x: 0,
    transition: {
      duration: 0.5,
    },
  },
  inactive: {
    display: 'none',
    x: 200,
    transition: {
      duration: 0.5,
    },
  },
};
const Skills = ({ skills }: SkillsProp) => {
  const [tabActive, setTabActive] = useState(1);

  const handleClickTab = (value: number) => {
    setTabActive(value);
  };

  return (
    <>
      <h2 className='text-2xl font-bold text-center gradient md:text-4xl'>
        Arbres de compétences
      </h2>
      <div className='flex justify-center mt-5 mb-5'>
        <ul className='flex flex-wrap items-center p-1 rounded bg-black-600'>
          <li
            className={`tab ${tabActive === 1 ? 'tab-active' : ''}`}
            onClick={() => handleClickTab(1)}
          >
            <span>Front end</span>
          </li>
          <li
            className={`tab ${tabActive === 2 ? 'tab-active' : ''} `}
            onClick={() => handleClickTab(2)}
          >
            Back end
          </li>
        </ul>
      </div>
      <motion.div>
        <motion.div
          animate={tabActive === 1 ? 'active' : 'inactive'}
          variants={cardLeft}
          id='frontend'
        >
          <TreeSkill title='Front End' skills={skills.front} />
        </motion.div>
        <motion.div
          animate={tabActive === 2 ? 'active' : 'inactive'}
          variants={cardRight}
          id='backend'
        >
          <TreeSkill title='Back End' skills={skills.back} />
        </motion.div>
      </motion.div>
    </>
  );
};

export default Skills;
