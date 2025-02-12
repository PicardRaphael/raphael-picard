import type { BlockContent, ImageEntity } from './common.entity';
import type { SkillEntity } from './skills.entity';

export interface Skill {
	id: string;
	name: string;
	icon: string;
}

export interface HeroEntity {
	id: string;
	name: string;
	role: string;
	typeWriter: string[];
	speciality: string;
	title: string;
	together: BlockContent;
	profilePicture: ImageEntity;
	skills: SkillEntity[];
}
