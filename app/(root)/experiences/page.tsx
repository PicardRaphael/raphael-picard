import { PageUseCases } from '@/core/application/use-cases/page';
import { getRepository } from '@/core/infrastructure/factories/repository.factory';
import { experiencesMetadata } from '@/utils/metadata/experiences-metadata';
import ExperiencesSlider from './ExperiencesSlider';

export const dynamic = 'force-static';
export const revalidate = 7200;
export const metadata = experiencesMetadata;
const experiencesUseCase = new PageUseCases(getRepository().sanity).experiencesUseCase;

const Experiences = async () => {
	const experiences = await experiencesUseCase.execute();
	return (
		<section className="section-black-600">
			<div className="section-container">
				<h2 className="title-h2 gradient hidden lg:inline">Expériences</h2>
				<ExperiencesSlider experiences={experiences} />
			</div>
		</section>
	);
};

export default Experiences;
