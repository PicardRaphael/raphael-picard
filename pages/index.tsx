import type { GetServerSideProps } from 'next';

import About from '../components/About/about';
import Contact from '../components/Contact/contact';
import Hero from '../components/Hero/hero';
import MainLayout from '../components/Layout/mainLayout';
import Portfolio from '../components/Portfolio/portfolio';
import Skills from '../components/Skills/skills';
import WorkExperience from '../components/WorkExperience/workExperience';
import { fetchAbout } from '../lib/fetchAbout';
import { fetchExperiences } from '../lib/fetchExperiences';
import { fetchFooter } from '../lib/fetchFooter';
import { fetchHero } from '../lib/fetchHero';
import { fetchProjects } from '../lib/fetchProjects';
import { fetchSkills } from '../lib/fetchSkills';
import type { About as IAbout } from '../types/about';
import type { Experience as IExperience } from '../types/experience';
import type { Footer as IFooter } from '../types/footer';
import type { Hero as IHero } from '../types/hero';
import type { Project as IProject } from '../types/project';
import type { Skills as ISkills } from '../types/skill';
import { AppConfig } from '../utils/appConfig';

type HomeProps = {
  hero: IHero;
  about: IAbout;
  experiences: IExperience[];
  projects: IProject[];
  footer: IFooter;
  skills: ISkills;
};
const Home = ({ hero, about, experiences, projects, skills }: HomeProps) => {
  return (
    <div>
      <section id='hero' className='w-full bg-black-600'>
        {hero ? <Hero {...hero} /> : null}
      </section>
      <section id='a-propos' className='w-full'>
        {about ? <About {...about} /> : null}
      </section>
      <section id='experiences' className='w-full bg-black-600'>
        {experiences ? <WorkExperience experiences={experiences} /> : null}
      </section>
      <section id='competences' className='w-full'>
        {projects ? <Skills skills={skills} /> : null}
      </section>
      <section id='portfolio' className='w-full bg-black-600'>
        {skills ? <Portfolio projects={projects} /> : null}
      </section>
      <section id='contact' className='w-full'>
        <Contact />
      </section>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
  const heroQuery = fetchHero();
  const aboutQuery = fetchAbout();
  const footerQuery = fetchFooter();
  const projectsQuery = fetchProjects();
  const experiencesQuery = fetchExperiences();
  const skillsQuery = fetchSkills();

  const [hero, about, footer, projects, experiences, skills] =
    await Promise.all([
      heroQuery,
      aboutQuery,
      footerQuery,
      projectsQuery,
      experiencesQuery,
      skillsQuery,
    ]);

  return {
    props: {
      hero,
      about,
      footer,
      projects,
      experiences,
      skills,
    },
  };
};

Home.getLayout = function getLayout(
  component,
  { footer }: { footer: IFooter }
) {
  return (
    <MainLayout
      meta={{
        title: `${AppConfig.site_name} | ${AppConfig.job}`,
        description: AppConfig.description,
      }}
      footer={footer}
    >
      {component}
    </MainLayout>
  );
};

export default Home;
