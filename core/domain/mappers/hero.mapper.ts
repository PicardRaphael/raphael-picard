import type { HeroEntity } from '@/core/domain/entities/hero.entity';
import type { HERO_QUERYResult } from '@/sanity.types';
import { urlFor } from '@/sanity/lib/image';
import { SkillsMapper } from './skills.mapper';

export class HeroMapper {
	static toEntity(data: HERO_QUERYResult[0]): HeroEntity {
		return {
			id: data._id,
			name: data.name,
			role: data.role,
			typeWriter: data.typeWriter,
			speciality: data.speciality,
			title: data.title,
			together: data.together,
			profilePicture: {
				url: data.profilePicture?.asset ? urlFor(data.profilePicture.asset).url() : '',
				alt: data.profilePicture?.alt || '',
			},
			skills: data.skills.map((tech) => SkillsMapper.toEntity(tech)),
		};
	}
}
