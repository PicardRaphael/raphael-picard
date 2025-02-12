import type { ExperienceEntity } from '@/core/domain/entities/experiences.entity';
import type { EXPERIENCES_QUERYResult } from '@/sanity.types';
import { urlFor } from '@/sanity/lib/image';
import { SkillsMapper } from './skills.mapper';

export class ExperiencesMapper {
	static toEntity(data: EXPERIENCES_QUERYResult[0]): ExperienceEntity {
		if (!data) throw new Error('No experience data provided');

		return {
			id: data._id,
			title: data.title,
			company: data.company,
			summary: data.summary,
			shortSummary: data.shortSummary,
			dateStarted: data.dateStarted,
			dateEnded: data.dateEnded,
			image: {
				url: data.image?.asset ? urlFor(data.image.asset).url() : '',
				alt: data.image?.alt || '',
			},
			technologies: data.technologies.map((tech) => SkillsMapper.toEntity(tech)),
			linkToBuild: data.linkToBuild,
			linkToGitHub: data.linkToGitHub,
			linkToYoutube: data.linkToYoutube,
		};
	}
}
