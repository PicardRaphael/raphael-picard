import { SocialEntity } from '@/core/domain/entities/social.entity';
import { SocialMapper } from '@/core/domain/mappers/social.mapper';
import { SanityService } from '../services/sanity.service';

export class SocialUseCase {
	private readonly service: SanityService;

	constructor(service: SanityService) {
		this.service = service;
	}

	async execute(): Promise<SocialEntity[]> {
		const social = await this.service.getSocial();
		return social.map((soc) => SocialMapper.toEntity(soc));
	}
}
