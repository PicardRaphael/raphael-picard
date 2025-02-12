import type {
	ABOUT_QUERYResult,
	EXPERIENCES_QUERYResult,
	FOOTER_QUERYResult,
	HERO_QUERYResult,
	PROTFOLIO_QUERYResult,
	SKILL_QUERYResult,
	SOCIAL_QUERYResult,
} from '@/sanity.types';

export interface IRepository {
	getAbout(): Promise<ABOUT_QUERYResult>;
	getExperiences(): Promise<EXPERIENCES_QUERYResult>;
	getPortfolios(): Promise<PROTFOLIO_QUERYResult>;
	getSkills(): Promise<SKILL_QUERYResult>; // On utilisera le type spécifique de skills
	getSocial(): Promise<SOCIAL_QUERYResult>;
	getHero(): Promise<HERO_QUERYResult>;
	getFooter(): Promise<FOOTER_QUERYResult>;
}
