import type { ExperienceEntity } from '@/core/domain/entities/experiences.entity';
import { ExperiencesMapper } from '@/core/domain/mappers/experiences.mapper';
import { SanityRepository } from '@/core/infrastructure/repositories/sanity/sanity.repository';

export class ExperiencesUseCase {
	private readonly repository: SanityRepository;

	constructor(repository: SanityRepository) {
		this.repository = repository;
	}

	async execute(): Promise<ExperienceEntity[]> {
		const experiences = await this.repository.getExperiences();
		return experiences.map((exp) => ExperiencesMapper.toEntity(exp));
	}
}
