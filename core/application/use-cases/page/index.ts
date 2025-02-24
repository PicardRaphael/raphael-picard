import { SanityRepository } from '@/core/infrastructure/repositories/sanity/sanity.repository';
import { AboutUseCase } from './about.use-case';
import { ExperiencesUseCase } from './experiences.use-case';
import { HeroUseCase } from './hero.use-case';
import { PortfolioUseCase } from './portfolio.use-case';
import { ProjectsUseCase } from './projects.use-case';
import { SkillsUseCase } from './skills.use-case';
import { SocialUseCase } from './social.use-case';

export class PageUseCases {
	aboutUseCase: AboutUseCase;
	experiencesUseCase: ExperiencesUseCase;
	heroUseCase: HeroUseCase;
	portfolioUseCase: PortfolioUseCase;
	projectsUseCase: ProjectsUseCase;
	skillsUseCase: SkillsUseCase;
	socialUseCase: SocialUseCase;

	constructor(repository: SanityRepository) {
		this.aboutUseCase = new AboutUseCase(repository);
		this.experiencesUseCase = new ExperiencesUseCase(repository);
		this.heroUseCase = new HeroUseCase(repository);
		this.portfolioUseCase = new PortfolioUseCase(repository);
		this.projectsUseCase = new ProjectsUseCase(repository);
		this.skillsUseCase = new SkillsUseCase(repository);
		this.socialUseCase = new SocialUseCase(repository);
	}
}
