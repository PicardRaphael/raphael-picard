import type { PortfolioEntity } from '@/core/domain/entities/portfolio.entity';
import { PortfolioMapper } from '@/core/domain/mappers/portfolio.mapper';
import { SanityRepository } from '@/core/infrastructure/repositories/sanity/sanity.repository';

export class PortfolioUseCase {
	private readonly repository: SanityRepository;

	constructor(repository: SanityRepository) {
		this.repository = repository;
	}

	async execute(): Promise<PortfolioEntity[]> {
		const portfolios = await this.repository.getPortfolios();
		return portfolios.map(PortfolioMapper.toEntity);
	}
}
