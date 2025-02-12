import { IRepository } from '@/core/domain/repositories/repository.interface';
import type {
	ABOUT_QUERYResult,
	EXPERIENCES_QUERYResult,
	FOOTER_QUERYResult,
	HERO_QUERYResult,
	PROTFOLIO_QUERYResult,
	SKILL_QUERYResult,
	SOCIAL_QUERYResult,
} from '@/sanity.types';

export class SanityService {
	private readonly repository: IRepository;

	constructor(repository: IRepository) {
		this.repository = repository;
	}

	async getAbout(): Promise<ABOUT_QUERYResult> {
		return await this.repository.getAbout();
	}

	async getExperiences(): Promise<EXPERIENCES_QUERYResult> {
		return await this.repository.getExperiences();
	}

	async getPortfolios(): Promise<PROTFOLIO_QUERYResult> {
		return await this.repository.getPortfolios();
	}

	async getSkills(): Promise<SKILL_QUERYResult> {
		return await this.repository.getSkills();
	}

	async getSocial(): Promise<SOCIAL_QUERYResult> {
		return await this.repository.getSocial();
	}

	async getHero(): Promise<HERO_QUERYResult> {
		return await this.repository.getHero();
	}

	async getFooter(): Promise<FOOTER_QUERYResult> {
		return await this.repository.getFooter();
	}
}
