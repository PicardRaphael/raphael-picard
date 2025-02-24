import { OpenAIRepository } from '@/core/infrastructure/repositories/openai/openai.repository';

export class OpenAIEmbeddingsUseCase {
	private readonly repository: OpenAIRepository;

	constructor(repository: OpenAIRepository) {
		this.repository = repository;
	}

	async execute(chunk: string | string[]): Promise<number[]> {
		const embedding = await this.repository.getEmbeddings(chunk);
		const vector = embedding.data[0].embedding;
		return vector;
	}
}
