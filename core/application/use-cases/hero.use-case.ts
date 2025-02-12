import type { HeroEntity } from '@/core/domain/entities/hero.entity';
import { HeroMapper } from '@/core/domain/mappers/hero.mapper';
import { SanityService } from '../services/sanity.service';

export class HeroUseCase {
	private readonly service: SanityService;

	constructor(service: SanityService) {
		this.service = service;
	}

	async execute(): Promise<HeroEntity> {
		const [hero] = await this.service.getHero();
		return HeroMapper.toEntity(hero);
	}
}
