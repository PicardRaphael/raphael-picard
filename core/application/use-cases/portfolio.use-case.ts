import type { PortfolioEntity } from '@/core/domain/entities/portfolio.entity';
import { PortfolioMapper } from '@/core/domain/mappers/portfolio.mapper';
import { SanityService } from '../services/sanity.service';

export class PortfolioUseCase {
	private readonly service: SanityService;

	constructor(service: SanityService) {
		this.service = service;
	}

	async execute(): Promise<PortfolioEntity[]> {
		const portfolios = await this.service.getPortfolios();
		return portfolios.map((portfolio) => PortfolioMapper.toEntity(portfolio));
	}
}
