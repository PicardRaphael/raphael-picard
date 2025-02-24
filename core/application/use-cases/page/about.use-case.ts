import type { AboutEntity } from '@/core/domain/entities/about.entity';
import { AboutMapper } from '@/core/domain/mappers/about.mapper';
import { SanityRepository } from '@/core/infrastructure/repositories/sanity/sanity.repository';

export class AboutUseCase {
	private readonly repository: SanityRepository;

	constructor(repository: SanityRepository) {
		this.repository = repository;
	}

	async execute(): Promise<AboutEntity> {
		const about = await this.repository.getAbout();
		return AboutMapper.toEntity(about[0]);
	}
}
