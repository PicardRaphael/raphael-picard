import { OpenAIEmbeddingsUseCase } from '@/core/application/use-cases/ai/openai-embeddings.use-case';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { DatastaxUseCase } from '../use-cases/datastax';
import { WebScraperService } from './web-scraper.service';

export class LoadDataUseCase {
	private openaiEmbeddings: OpenAIEmbeddingsUseCase;
	private webScraper: WebScraperService;
	private splitter: RecursiveCharacterTextSplitter;
	private datastaxUseCase: DatastaxUseCase;

	constructor(openaiEmbeddings: OpenAIEmbeddingsUseCase, webScraper: WebScraperService, datastaxUseCase: DatastaxUseCase) {
		this.openaiEmbeddings = openaiEmbeddings;
		this.webScraper = webScraper;
		this.datastaxUseCase = datastaxUseCase;
		this.splitter = new RecursiveCharacterTextSplitter({
			chunkSize: 500,
			chunkOverlap: 50,
		});
	}

	async ensureCollectionExists() {
		try {
			const defaultSimilarityMetric = 'dot_product'; // or any other default value
			await this.datastaxUseCase.createCollectionUseCase.execute(defaultSimilarityMetric);
			console.log('Collection ensured.');
		} catch (error) {
			console.error('Error ensuring collection:', error);
		}
	}

	async loadSampleData(websiteData: string[]) {
		try {
			for await (const url of websiteData) {
				const content = await this.webScraper.scrapePage(url);
				const chunks = await this.splitter.splitText(content);
				for await (const chunk of chunks) {
					const vector = await this.openaiEmbeddings.execute(chunk);
					await this.datastaxUseCase.insertDocumentUseCase.execute({ vector, chunk });
					console.log(`Inserted document from ${url}`);
				}
			}
		} catch (error) {
			console.error('Error loading sample data:', error);
		}
	}

	async loadDoc(filePath: string) {
		try {
			const loader = new TextLoader(filePath);
			const docs = await loader.load();

			const text = docs.map((doc) => doc.pageContent).join('\n');

			const chunk = await this.splitter.splitText(text);

			const vector = await this.openaiEmbeddings.execute(chunk);
			await this.datastaxUseCase.insertDocumentUseCase.execute({ vector, chunk });
			console.log('Inserted document from file');
		} catch (error) {
			console.error('Error loading document:', error);
		}
	}
}
