import { getService } from '@/core/application/factories/service.factory';
import { SkillsUseCase } from '@/core/application/use-cases/skills.use-case';
import { competencesMetadata } from '@/utils/metadata/competences-metadata';
import Skills from './_components/Skills';

export const dynamic = 'force-static';
export const revalidate = 7200;
export const metadata = competencesMetadata;
const skillsUseCase = new SkillsUseCase(getService('sanity'));

const Competences = async () => {
	const skills = await skillsUseCase.execute();
	return (
		<section className="section-black-500">
			<div className="section-container">
				<h2 className="title-h2 gradient hidden lg:inline">Arbres de compétences</h2>
				<Skills skills={skills} />
			</div>
		</section>
	);
};

export default Competences;
