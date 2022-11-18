import type { NextApiRequest, NextApiResponse } from 'next';
import { groq } from 'next-sanity';

import { sanityClient } from '../../sanity';
import type { Hero } from '../../types/hero';

const query = groq`
*[_type=="hero"][0] {
  ...,
  skill[]->,
}
`;

type Data = {
  hero: Hero;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const hero: Hero = await sanityClient.fetch(query);

  res.status(200).json({ hero });
}
