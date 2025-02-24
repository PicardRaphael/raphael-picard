import { DatastaxRepository } from '@/core/infrastructure/repositories/datastax/datastax.repository';

export class InsertDocumentUseCase {
	private readonly datastaxRepository: DatastaxRepository;

	constructor(datastaxRepository: DatastaxRepository) {
		this.datastaxRepository = datastaxRepository;
	}

	async execute({ vector, chunk }: { vector: number[]; chunk: string | string[] }) {
		return this.datastaxRepository.insertOneToCollection({ vector, chunk });
	}
}
