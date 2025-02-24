import { PageUseCases } from '@/core/application/use-cases/page';
import { getRepository } from '@/core/infrastructure/factories/repository.factory';
import { competencesMetadata } from '@/utils/metadata/competences-metadata';
import Skills from './_components/Skills';
export const dynamic = 'force-static';
export const revalidate = 7200;
export const metadata = competencesMetadata;
const skillsUseCase = new PageUseCases(getRepository().sanity).skillsUseCase;

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
