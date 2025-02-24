import { DatastaxRepository } from '@/core/infrastructure/repositories/datastax/datastax.repository';
import { CreateCollectionUseCase } from './create-collection.use-case';
import { GetDocumentsUseCase } from './get-documents.use-case';
import { InsertDocumentUseCase } from './insert-document.use-case';

export class DatastaxUseCase {
	createCollectionUseCase: CreateCollectionUseCase;
	getDocumentsUseCase: GetDocumentsUseCase;
	insertDocumentUseCase: InsertDocumentUseCase;

	constructor(repository: DatastaxRepository) {
		this.createCollectionUseCase = new CreateCollectionUseCase(repository);
		this.getDocumentsUseCase = new GetDocumentsUseCase(repository);
		this.insertDocumentUseCase = new InsertDocumentUseCase(repository);
	}
}
