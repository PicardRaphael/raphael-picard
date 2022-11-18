import type { NextApiRequest, NextApiResponse } from 'next';
import { groq } from 'next-sanity';

import { sanityClient } from '../../sanity';
import type { Footer } from '../../types/footer';

const query = groq`
*[_type=="footer"][0] {
  ...,
  socials[]->
}
`;

type Data = {
  footer: Footer;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const footer: Footer = await sanityClient.fetch(query);

  res.status(200).json({ footer });
}
