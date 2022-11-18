import type { SanityImage, SantiyBody } from './sanity';

export interface About extends SantiyBody {
  _type: 'about';
  about: block[];
  aboutPic: SanityImage;
}
