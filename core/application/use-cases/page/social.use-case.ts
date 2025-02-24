import { SocialEntity } from '@/core/domain/entities/social.entity';
import { SocialMapper } from '@/core/domain/mappers/social.mapper';
import { SanityRepository } from '@/core/infrastructure/repositories/sanity/sanity.repository';

export class SocialUseCase {
	private readonly repository: SanityRepository;

	constructor(repository: SanityRepository) {
		this.repository = repository;
	}

	async execute(): Promise<SocialEntity[]> {
		const social = await this.repository.getSocial();
		return social.map((soc) => SocialMapper.toEntity(soc));
	}
}
