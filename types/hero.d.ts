import type { SanityImage, SantiyBody } from './sanity';
import type { Skill } from './skill';

export interface Hero extends SantiyBody {
  _type: 'hero';
  name: string;
  role: string;
  speciality: string;
  together: block[];
  logo: SanityImage;
  profilePic: SanityImage;
  skill: Skill[];
  typeWriter: string[];
}
