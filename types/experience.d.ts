import type { SanityImage, SantiyBody } from './sanity';
import type { Skill } from './skill';

export interface Experience extends SantiyBody {
  _type: 'experience';
  jobTitle: string;
  company: string;
  companyImage: SanityImage;
  dateStarted: string;
  dateEnded: string;
  technologies: Skill[];
  points: string[];
}
