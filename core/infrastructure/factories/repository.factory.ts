import { IRepository } from '@/core/domain/repositories/repository.interface';
import { SanityRepository } from '../sanity/sanity.repository';

export type RepositoryType = 'sanity';

export const getRepository = (type: RepositoryType = 'sanity'): IRepository => {
	const repositories: Record<RepositoryType, IRepository> = {
		sanity: SanityRepository.getInstance(),
	};

	return repositories[type];
};
