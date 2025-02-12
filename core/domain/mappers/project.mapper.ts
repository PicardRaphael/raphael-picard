import type { ProjectEntity } from '@/core/domain/entities/project.entity';
import type { PROTFOLIO_QUERYResult } from '@/sanity.types';
import { urlFor } from '@/sanity/lib/image';
import { SkillsMapper } from './skills.mapper';

export class ProjectMapper {
	static toEntity(data: PROTFOLIO_QUERYResult[0]): ProjectEntity {
		return {
			id: data._id,
			title: data.title,
			description: data.description,
			image: {
				url: data.image?.asset ? urlFor(data.image.asset).url() : '',
				alt: data.image?.alt || '',
			},
			technologies: data.technologies.map((tech) => SkillsMapper.toEntity(tech)),
			linkToGithub: data.linkToGithub,
			linkToYoutube: data.linkToYoutube,
			linkToProject: data.linkToProject,
		};
	}
}
