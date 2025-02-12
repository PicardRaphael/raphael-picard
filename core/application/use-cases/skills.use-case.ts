import type { CategorizedSkills } from '@/core/domain/entities/skills.entity';
import { SkillsMapper } from '@/core/domain/mappers/skills.mapper';
import { SanityService } from '../services/sanity.service';

export class SkillsUseCase {
	private readonly service: SanityService;

	constructor(service: SanityService) {
		this.service = service;
	}

	async execute(): Promise<CategorizedSkills> {
		const skillsData = await this.service.getSkills();
		return SkillsMapper.toCategorizedSkills(skillsData);
	}
}
