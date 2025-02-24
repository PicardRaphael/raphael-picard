import { CategorizedSkills } from '@/core/domain/entities/skills.entity';
import { SkillsMapper } from '@/core/domain/mappers/skills.mapper';
import { SanityRepository } from '@/core/infrastructure/repositories/sanity/sanity.repository';

export class SkillsUseCase {
	private readonly repository: SanityRepository;

	constructor(repository: SanityRepository) {
		this.repository = repository;
	}

	async execute(): Promise<CategorizedSkills> {
		const skillsData = await this.repository.getSkills();
		return SkillsMapper.toCategorizedSkills(skillsData);
	}
}
