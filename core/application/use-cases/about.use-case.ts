import type { AboutEntity } from '@/core/domain/entities/about.entity';
import { AboutMapper } from '@/core/domain/mappers/about.mapper';
import { SanityService } from '../services/sanity.service';

export class AboutUseCase {
	private readonly service: SanityService;

	constructor(service: SanityService) {
		this.service = service;
	}

	async execute(): Promise<AboutEntity> {
		const [about] = await this.service.getAbout();
		return AboutMapper.toEntity(about);
	}
}
