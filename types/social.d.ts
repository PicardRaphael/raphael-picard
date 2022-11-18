import type { SanityImage, SantiyBody } from './sanity';

export interface Social extends SantiyBody {
  _type: 'social';
  title: string;
  url: string;
  image: SanityImage;
}
