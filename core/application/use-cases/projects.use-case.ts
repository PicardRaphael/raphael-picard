import type { ProjectEntity } from '@/core/domain/entities/project.entity';
import { ProjectMapper } from '@/core/domain/mappers/project.mapper';
import { SanityService } from '../services/sanity.service';

export class ProjectsUseCase {
	private readonly service: SanityService;

	constructor(service: SanityService) {
		this.service = service;
	}

	async execute(): Promise<ProjectEntity[]> {
		const projects = await this.service.getPortfolios();
		return projects.map((project) => ProjectMapper.toEntity(project));
	}
}
