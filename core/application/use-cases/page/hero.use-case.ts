import type { HeroEntity } from '@/core/domain/entities/hero.entity';
import { HeroMapper } from '@/core/domain/mappers/hero.mapper';
import { SanityRepository } from '@/core/infrastructure/repositories/sanity/sanity.repository';

export class HeroUseCase {
	private readonly repository: SanityRepository;

	constructor(repository: SanityRepository) {
		this.repository = repository;
	}

	async execute(): Promise<HeroEntity> {
		const [hero] = await this.repository.getHero();
		return HeroMapper.toEntity(hero);
	}
}
