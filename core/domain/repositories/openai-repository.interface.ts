import OpenAI from 'openai';

export interface IOpenAIRepository {
	getEmbeddings(chunk: string | string[]): Promise<
		OpenAI.Embeddings.CreateEmbeddingResponse & {
			_request_id?: string | null;
		}
	>;
	// Add more methods as needed for OpenAI operations
}
