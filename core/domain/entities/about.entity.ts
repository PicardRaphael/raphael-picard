import type { BlockContent, ImageEntity } from './common.entity';

export interface AboutEntity {
	id: string;
	title: string;
	body: BlockContent;
	image: ImageEntity;
}
