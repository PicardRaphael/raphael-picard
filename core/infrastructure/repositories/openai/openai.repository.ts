import { IOpenAIRepository } from '@/core/domain/repositories/openai-repository.interface';
import OpenAI from 'openai';

export class OpenAIRepository implements IOpenAIRepository {
	private static instance: OpenAIRepository;
	openai: OpenAI;
	private constructor() {
		this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
	}

	public static getInstance(): OpenAIRepository {
		if (!OpenAIRepository.instance) {
			OpenAIRepository.instance = new OpenAIRepository();
		}
		return OpenAIRepository.instance;
	}

	async getEmbeddings(chunk: string | string[]): Promise<OpenAI.Embeddings.CreateEmbeddingResponse & { _request_id?: string | null }> {
		return await this.openai.embeddings.create({
			model: 'text-embedding-3-small',
			input: chunk,
			encoding_format: 'float',
		});
	}
}
