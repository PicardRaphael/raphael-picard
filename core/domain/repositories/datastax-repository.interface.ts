import { Collection, FoundDoc, InsertOneResult, SomeDoc } from '@datastax/astra-db-ts';
export type SimilarityMetric = 'dot_product' | 'cosine' | 'euclidean';
export interface IDatastaxRepository {
	createCollection(similarityMetric: SimilarityMetric): Promise<Collection<SomeDoc>>;
	insertOneToCollection({ vector, chunk }: { vector: number[]; chunk: string | string[] }): Promise<InsertOneResult<SomeDoc>>;
	getDocuments(embedding: number[]): Promise<FoundDoc<SomeDoc>[]>;
}
