import { LoadDataUseCase } from '@/core/application/services/load-data.service';
import { WebScraperService } from '@/core/application/services/web-scraper.service';
import { OpenAIEmbeddingsUseCase } from '@/core/application/use-cases/ai/openai-embeddings.use-case';
import { DatastaxUseCase } from '@/core/application/use-cases/datastax';
import { getRepository } from '@/core/infrastructure/factories/repository.factory';
import 'dotenv/config';

const openaiEmbeddings = new OpenAIEmbeddingsUseCase(getRepository().openai);
const webScraper = new WebScraperService();
const datastaxUseCase = new DatastaxUseCase(getRepository().datastax);

const loadDataUseCase = new LoadDataUseCase(openaiEmbeddings, webScraper, datastaxUseCase);

const websiteData = [
	'https://raphaelpicard.com/',
	'https://raphaelpicard.com/a-propos',
	'https://raphaelpicard.com/experiences',
	'https://raphaelpicard.com/competences',
	'https://raphaelpicard.com/projets',
	'https://raphaelpicard.com/contact',
	'https://www.linkedin.com/in/raphael-picard/details/experience/',
	'https://www.linkedin.com/in/raphael-picard/details/education/',
];

const FILE_PATH = './core/infrastructure/datastax/me.txt';

(async () => {
	await loadDataUseCase.ensureCollectionExists();
	await loadDataUseCase.loadSampleData(websiteData);
	await loadDataUseCase.loadDoc(FILE_PATH);
})();
