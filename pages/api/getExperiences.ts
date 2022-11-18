import type { NextApiRequest, NextApiResponse } from 'next';
import { groq } from 'next-sanity';

import { sanityClient } from '../../sanity';
import type { Experience } from '../../types/experience.d';

const query = groq`
*[_type=="experience"]{
  ...,
  technologies[]->
}
`;

type Data = {
  experiences: Experience[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const experiences: Experience[] = await sanityClient.fetch(query);

  experiences.sort((n1, n2) => {
    const dateA = new Date(n1.dateEnded).getTime();
    const dateB = new Date(n2.dateEnded).getTime();
    return dateA < dateB ? 1 : -1;
  });

  res.status(200).json({ experiences });
}
