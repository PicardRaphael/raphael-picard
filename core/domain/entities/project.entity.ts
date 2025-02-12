import type { BlockContentItem, ImageEntity } from './common.entity';
import type { SkillEntity } from './skills.entity';

export interface ProjectEntity {
	id: string;
	title: string;
	description: Array<BlockContentItem>;
	image: ImageEntity;
	technologies: SkillEntity[];
	linkToGithub?: string;
	linkToYoutube?: string;
	linkToProject?: string;
}
