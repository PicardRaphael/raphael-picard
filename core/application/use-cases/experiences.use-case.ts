import type { ExperienceEntity } from '@/core/domain/entities/experiences.entity';
import { ExperiencesMapper } from '@/core/domain/mappers/experiences.mapper';
import { SanityService } from '../services/sanity.service';

export class ExperiencesUseCase {
	private readonly service: SanityService;

	constructor(service: SanityService) {
		this.service = service;
	}

	async execute(): Promise<ExperienceEntity[]> {
		const experiences = await this.service.getExperiences();
		return experiences.map((exp) => ExperiencesMapper.toEntity(exp));
	}
}
