import type { ImageEntity } from './common.entity';

export interface SocialEntity {
	id: string;
	title: string;
	url: string;
	image: ImageEntity;
}
