import type { CategorizedSkills, SkillEntity, SkillPosition, SkillSpeciality } from '@/core/domain/entities/skills.entity';
import type { SKILL_QUERYResult } from '@/sanity.types';
import { urlFor } from '@/sanity/lib/image';

export class SkillsMapper {
	static toEntity(data: SKILL_QUERYResult[0]): SkillEntity {
		if (!data) throw new Error('No skill data provided');

		return {
			id: data._id,
			title: data.title,
			image: {
				url: data.image?.asset ? urlFor(data.image.asset).url() : '',
				alt: data.image?.alt || '',
			},
			link: data.link,
			speciality: data.speciality as SkillSpeciality,
			type: data.type,
			position: data.position as SkillPosition,
		};
	}

	static toCategorizedSkills(data: SKILL_QUERYResult): CategorizedSkills {
		const skills = SkillsMapper.convertToSkills(data);
		return SkillsMapper.organizeBySpeciality(skills);
	}

	private static convertToSkills(data: SKILL_QUERYResult): SkillEntity[] {
		return data
			.map((item) => {
				if (['Front end', 'Back end', 'Global'].includes(item.speciality) && ['top', 'middle', 'right', 'left'].includes(item.position)) {
					return {
						id: item._id,
						title: item.title,
						image: {
							url: item.image?.asset ? urlFor(item.image.asset).url() : '',
							alt: item.image?.alt || '',
						},
						link: item.link,
						speciality: item.speciality as SkillSpeciality,
						type: item.type,
						position: item.position as SkillPosition,
					} as SkillEntity;
				}
				return null;
			})
			.filter((item): item is SkillEntity => item !== null);
	}

	private static organizeBySpeciality(items: SkillEntity[]): CategorizedSkills {
		const categorized: CategorizedSkills = {
			front: { top: [], middle: [], right: [], left: [] },
			back: { top: [], middle: [], right: [], left: [] },
			global: { top: [], middle: [], right: [], left: [] },
		};

		items.forEach((item) => {
			if (item.speciality === 'Front end') {
				categorized.front[item.position].push(item);
			} else if (item.speciality === 'Back end') {
				categorized.back[item.position].push(item);
			} else if (item.speciality === 'Global') {
				categorized.global[item.position].push(item);
			}
		});

		return categorized;
	}
}
