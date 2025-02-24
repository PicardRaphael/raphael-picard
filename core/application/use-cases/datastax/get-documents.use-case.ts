import { DatastaxRepository } from '@/core/infrastructure/repositories/datastax/datastax.repository';

export class GetDocumentsUseCase {
	private readonly datastaxRepository: DatastaxRepository;

	constructor(datastaxRepository: DatastaxRepository) {
		this.datastaxRepository = datastaxRepository;
	}

	async execute(embedding: number[]) {
		return this.datastaxRepository.getDocuments(embedding);
	}
}
