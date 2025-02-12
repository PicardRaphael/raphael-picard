import type { AboutEntity } from '@/core/domain/entities/about.entity';
import type { ABOUT_QUERYResult } from '@/sanity.types';
import { urlFor } from '@/sanity/lib/image';

export class AboutMapper {
	static toEntity(data: ABOUT_QUERYResult[0]): AboutEntity {
		return {
			id: data._id,
			title: data.title,
			body: data.body,
			image: {
				url: data.aboutImage?.asset ? urlFor(data.aboutImage.asset).url() : '',
				alt: data.aboutImage?.alt || '',
			},
		};
	}
}
