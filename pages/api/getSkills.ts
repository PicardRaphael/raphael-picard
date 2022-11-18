import type { NextApiRequest, NextApiResponse } from 'next';
import { groq } from 'next-sanity';

import { sanityClient } from '../../sanity';
import type { Skill, Skills } from '../../types/skill';
import { groupBy } from '../../utils/groupBy';

const query = groq`
*[_type=="skill"]
`;

type Data = {
  skills: Skills;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const data: Skill[] = await sanityClient.fetch(query);
  const frontSkills: Skill[] = groupBy(data, 'speciality', 'Front end');

  const backSkills: Skill[] = groupBy(data, 'speciality', 'Back end');

  const skills = {
    front: {
      top: groupBy(frontSkills, 'position', 'top'),
      middle: groupBy(frontSkills, 'position', 'middle'),
      left: groupBy(frontSkills, 'position', 'left'),
      right: groupBy(frontSkills, 'position', 'right'),
    },
    back: {
      top: groupBy(backSkills, 'position', 'top'),
      middle: groupBy(backSkills, 'position', 'middle'),
      left: groupBy(backSkills, 'position', 'left'),
      right: groupBy(backSkills, 'position', 'right'),
    },
  };

  res.status(200).json({ skills });
}
