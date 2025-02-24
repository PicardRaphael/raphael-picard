import type { ProjectEntity } from '@/core/domain/entities/project.entity';
import { ProjectMapper } from '@/core/domain/mappers/project.mapper';
import { SanityRepository } from '@/core/infrastructure/repositories/sanity/sanity.repository';

export class ProjectsUseCase {
	private readonly repository: SanityRepository;

	constructor(repository: SanityRepository) {
		this.repository = repository;
	}

	async execute(): Promise<ProjectEntity[]> {
		const projects = await this.repository.getPortfolios();
		return projects.map(ProjectMapper.toEntity);
	}
}
