import type { TreeSkills as TreeSkillsType } from '../../types/skill';
import Skill from '../Skill/skill';

type TreeSkillProps = {
  title: string;
  skills: TreeSkillsType;
};

const TreeSkill = ({ title, skills }: TreeSkillProps) => {
  return (
    <div className='flex items-center pb-10'>
      <div className='w-full mx-auto'>
        <h2 className='pb-2 text-base font-bold tracking-tighter text-center text-white uppercase md:text-lg'>
          {title}
        </h2>
        <div className='h-10 mx-auto mb-12'>
          <div className='mx-auto flex h-[30px] w-[30px] items-center  justify-center'>
            <div className='btn-gradient h-[15px] w-[15px] animate-pulse rounded-full' />
          </div>
          <div className='mx-auto h-full w-[1px] border-l border-solid border-gray-600' />
        </div>

        <h2 className='pb-2 text-sm font-medium tracking-tighter text-center text-white md:text-lg'>
          {skills.top[0].type}
        </h2>
        <div className='flex items-center justify-center w-full mb-8'>
          {skills.top.map((skill) => (
            <Skill key={skill._id} {...skill} />
          ))}
        </div>
        <div className='h-10 mx-auto mb-3'>
          <div className='mx-auto h-full w-[1px] border-l border-solid border-gray-600' />
        </div>
        <hr className='w-7/12 mx-auto border-t border-gray-600 border-solid' />

        <div className='flex justify-center'>
          {skills.left && (
            <div className='w-5/12'>
              <div className='h-10 mx-auto mb-12'>
                <div className='mx-auto -mt-4 flex h-[30px] w-[30px] items-center  justify-center bg-black-500'>
                  <div className='btn-gradient h-[15px] w-[15px] animate-pulse rounded-full' />
                </div>
                <div className='mx-auto h-full w-[1px] border-l border-solid border-gray-600' />
              </div>
              <h2 className='pb-2 text-sm font-medium tracking-tighter text-center text-white md:text-lg'>
                {skills.left[0].type}
              </h2>
              <div className='flex flex-wrap items-center justify-center w-full mb-11 gap-y-2'>
                {skills.left.map((skill) => (
                  <Skill key={skill._id} {...skill} />
                ))}
              </div>
            </div>
          )}
          {skills.middle && (
            <div className='w-2/12 -mt-4'>
              <div className='mx-auto mb-12 h-[100%]'>
                <div className='mx-auto flex h-[30px] w-[30px] items-center  justify-center bg-black-500'>
                  <div className='btn-gradient h-[15px] w-[15px] animate-pulse rounded-full' />
                </div>
                <div className='mx-auto h-full w-[1px] border-l border-solid border-gray-600' />
              </div>
            </div>
          )}
          {skills.right && (
            <div className='w-5/12'>
              <div className='h-10 mx-auto mb-12'>
                <div className='mx-auto -mt-4 flex h-[30px] w-[30px] items-center  justify-center bg-black-500'>
                  <div className='btn-gradient h-[15px] w-[15px] animate-pulse rounded-full' />
                </div>
                <div className='mx-auto h-full w-[1px] border-l border-solid border-gray-600' />
              </div>
              <h2 className='pb-2 text-sm font-medium tracking-tighter text-center text-white md:text-lg'>
                {skills.right[0].type}
              </h2>
              <div className='flex flex-wrap items-center justify-center w-full mb-11 gap-y-2'>
                {skills.right.map((skill) => (
                  <Skill key={skill._id} {...skill} />
                ))}
              </div>
            </div>
          )}
        </div>
        {skills.middle && (
          <div className='mt-10'>
            <h2 className='pb-2 text-sm font-medium tracking-tighter text-center text-white md:text-lg'>
              {skills.middle[0].type}
            </h2>
            <div className='flex flex-wrap items-center justify-center w-full space-x-1 md:space-x-10'>
              {skills.middle.map((skill) => (
                <Skill key={skill._id} {...skill} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TreeSkill;
