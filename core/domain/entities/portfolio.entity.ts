import { BlockContentItem } from './common.entity';

export interface PortfolioEntity {
	id: string;
	title: string;
	description: Array<BlockContentItem>;
	image: {
		url: string;
		alt: string;
	};
	technologies: {
		id: string;
		name: string;
		icon: string;
		link: string;
		speciality: string;
		type: string;
		position: string;
	}[];
	linkToGithub?: string;
	linkToYoutube?: string;
	linkToProject?: string;
}
