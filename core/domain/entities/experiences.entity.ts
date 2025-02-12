import type { BlockContentItem, ImageEntity } from './common.entity';
import type { SkillEntity } from './skills.entity';

export interface ExperienceEntity {
	id: string;
	title: string;
	company: string;
	summary: Array<BlockContentItem>;
	shortSummary: Array<BlockContentItem>;
	dateStarted: string;
	dateEnded: string;
	image: ImageEntity;
	technologies: SkillEntity[];
	linkToBuild?: string;
	linkToGitHub?: string;
	linkToYoutube?: string;
}
