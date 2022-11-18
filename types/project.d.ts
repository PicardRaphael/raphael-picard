import type { SanityImage, SantiyBody } from './sanity';
import type { Skill } from './skill';

export interface Project extends SantiyBody {
  _type: 'project';
  title: string;
  image: SanityImage;
  summary: string;
  technologies: Skill[];
  linkToBuild: string;
  linkToGithub: string;
  linkToYoutube: string;
}
