import { SimilarityMetric } from '@/core/domain/repositories/datastax-repository.interface';
import { DatastaxRepository } from '@/core/infrastructure/repositories/datastax/datastax.repository';

export class CreateCollectionUseCase {
	private readonly datastaxRepository: DatastaxRepository;

	constructor(datastaxRepository: DatastaxRepository) {
		this.datastaxRepository = datastaxRepository;
	}

	async execute(similarityMetric: SimilarityMetric) {
		return this.datastaxRepository.createCollection(similarityMetric);
	}
}
