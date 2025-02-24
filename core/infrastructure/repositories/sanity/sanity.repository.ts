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
import { getAbout } from '@/sanity/lib/query/getAbout';
import { getExperiences } from '@/sanity/lib/query/getExperiences';
import { getFooter } from '@/sanity/lib/query/getFooter';
import { getHero } from '@/sanity/lib/query/getHero';
import { getPortfolios } from '@/sanity/lib/query/getPortfolios';
import { getSkill } from '@/sanity/lib/query/getSkills';
import { getSocial } from '@/sanity/lib/query/getSocial';

export class SanityRepository implements IRepository {
	private static instance: SanityRepository;
	private constructor() {}

	public static getInstance(): SanityRepository {
		if (!SanityRepository.instance) {
			SanityRepository.instance = new SanityRepository();
		}
		return SanityRepository.instance;
	}

	async getAbout(): Promise<ABOUT_QUERYResult> {
		return await getAbout();
	}

	async getExperiences(): Promise<EXPERIENCES_QUERYResult> {
		return await getExperiences();
	}

	async getPortfolios(): Promise<PROTFOLIO_QUERYResult> {
		return await getPortfolios();
	}

	async getSkills(): Promise<SKILL_QUERYResult> {
		return await getSkill();
	}

	async getSocial(): Promise<SOCIAL_QUERYResult> {
		return await getSocial();
	}

	async getHero(): Promise<HERO_QUERYResult> {
		return await getHero();
	}

	async getFooter(): Promise<FOOTER_QUERYResult> {
		return await getFooter();
	}
}
