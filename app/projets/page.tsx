import { getService } from '@/core/application/factories/service.factory';
import { ProjectsUseCase } from '@/core/application/use-cases/projects.use-case';
import { projetsMetadata } from '@/utils/metadata/projets-metadata';
import ProjetsSlider from './ProjetsSlider';

export const dynamic = 'force-static';
export const revalidate = 7200;
export const metadata = projetsMetadata;
const projectsUseCase = new ProjectsUseCase(getService('sanity'));

const Projets = async () => {
	const projects = await projectsUseCase.execute();
	return (
		<section className="section-black-600">
			<div className="section-container">
				<h2 className="title-h2 gradient hidden lg:inline">Mes projets</h2>
				<ProjetsSlider portfolios={projects} />
			</div>
		</section>
	);
};

export default Projets;
