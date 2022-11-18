import type { SanityImage, SantiyBody } from './sanity';

export interface Skill extends SantiyBody {
  _type: 'skill';
  title: string;
  image: SanityImage;
  link?: string;
  type: string;
  speciality: string;
  position: string
}

export type TreeSkills = {
  top: Skill[];
  middle?: Skill[];
  left?: Skill[];
  right?: Skill[];
};

export type Skills = {
  front: TreeSkills,
  back: TreeSkills
}


