import { getRepository } from '@/core/infrastructure/factories/repository.factory';
import { SanityService } from '../services/sanity.service';

export type ServiceType = 'sanity';

export const getService = (type: ServiceType = 'sanity') => {
	const services = {
		sanity: new SanityService(getRepository(type)),
	};
	return services[type];
};
