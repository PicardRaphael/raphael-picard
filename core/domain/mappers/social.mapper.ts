import type { SocialEntity } from '@/core/domain/entities/social.entity';
import type { SOCIAL_QUERYResult } from '@/sanity.types';
import { urlFor } from '@/sanity/lib/image';

export class SocialMapper {
	static toEntity(data: SOCIAL_QUERYResult[0]): SocialEntity {
		return {
			id: data._id,
			title: data.title,
			url: data.url,
			image: {
				url: data.socialImage?.asset ? urlFor(data.socialImage.asset).url() : '',
				alt: data.socialImage?.alt || '',
			},
		};
	}
}
