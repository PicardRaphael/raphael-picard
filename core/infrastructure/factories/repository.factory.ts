import { DatastaxRepository } from '../repositories/datastax/datastax.repository';
import { OpenAIRepository } from '../repositories/openai/openai.repository';
import { SanityRepository } from '../repositories/sanity/sanity.repository';

export const getRepository = () => {
	return {
		sanity: SanityRepository.getInstance(),
		openai: OpenAIRepository.getInstance(),
		datastax: DatastaxRepository.getInstance(),
	};
};
