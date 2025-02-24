import { IDatastaxRepository, SimilarityMetric } from '@/core/domain/repositories/datastax-repository.interface';
import { Collection, DataAPIClient, Db, InsertOneResult, SomeDoc } from '@datastax/astra-db-ts';

export class DatastaxRepository implements IDatastaxRepository {
	private static instance: DatastaxRepository;
	client: DataAPIClient;
	db: Db;
	private constructor() {
		this.client = new DataAPIClient(process.env.ASTRA_DB_APPLICATION_TOKEN, {});
		this.db = this.client.db(process.env.ASTRA_DB_API_ENDPOINT as string, {
			namespace: process.env.ASTRA_DB_NAMESPACE,
		});
	}

	public static getInstance(): DatastaxRepository {
		if (!DatastaxRepository.instance) {
			DatastaxRepository.instance = new DatastaxRepository();
		}
		return DatastaxRepository.instance;
	}

	private async getCollection() {
		return await this.db.collection(process.env.ASTRA_DB_COLLECTION as string);
	}
	async createCollection(similarityMetric: SimilarityMetric = 'dot_product'): Promise<Collection<SomeDoc>> {
		return await this.db.createCollection(process.env.ASTRA_DB_COLLECTION as string, {
			vector: {
				dimension: 1536,
				metric: similarityMetric,
			},
			checkExists: false,
		});
	}
	async insertOneToCollection({ vector, chunk }: { vector: number[]; chunk: string | string[] }): Promise<InsertOneResult<SomeDoc>> {
		const collection = await this.getCollection();
		return await collection.insertOne({
			$vector: vector,
			text: chunk,
		});
	}
	async getDocuments(embedding: number[]) {
		const collection = await this.getCollection();
		const cursor = collection.find(
			{},
			{
				sort: {
					$vector: embedding,
				},
				limit: 10,
			},
		);
		return await cursor.toArray();
	}
}
