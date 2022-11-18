import type { SanityImage, SantiyBody } from './sanity';
import type { Social } from './social';

export interface Footer extends SantiyBody {
  _type: 'pageInfo';
  name: string;
  role: string;
  logo: SanityImage;
  address: string;
  phoneNumber: string;
  address: string;
  country: string;
  city: string;
  socials: Social[];
}
