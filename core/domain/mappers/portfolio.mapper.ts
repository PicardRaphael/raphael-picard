import type { PortfolioEntity } from '@/core/domain/entities/portfolio.entity';
import type { PROTFOLIO_QUERYResult } from '@/sanity.types';
import { urlFor } from '@/sanity/lib/image';

export class PortfolioMapper {
	static toEntity(data: PROTFOLIO_QUERYResult[0]): PortfolioEntity {
		if (!data) throw new Error('No portfolio data provided');

		return {
			id: data._id,
			title: data.title,
			description: data.description,
			image: {
				url: data.image?.asset ? urlFor(data.image.asset).url() : '',
				alt: data.image?.alt || '',
			},
			technologies: data.technologies.map((tech) => ({
				id: tech._id,
				name: tech.title,
				icon: tech.image?.asset ? urlFor(tech.image.asset).url() : '',
				link: tech.link,
				speciality: tech.speciality,
				type: tech.type,
				position: tech.position,
			})),
			linkToGithub: data.linkToGithub,
			linkToYoutube: data.linkToYoutube,
			linkToProject: data.linkToProject,
		};
	}
}
