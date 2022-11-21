import { dehydrate, QueryClient, useQuery } from '@tanstack/react-query';
import type { GetServerSideProps } from 'next';

import About from '../components/About/about';
import Contact from '../components/Contact/contact';
import Hero from '../components/Hero/hero';
import Loading from '../components/Loading/loading';
import Portfolio from '../components/Portfolio/portfolio';
import Skills from '../components/Skills/skills';
import WorkExperience from '../components/WorkExperience/workExperience';
import { fetchAbout } from '../lib/fetchAbout';
import { fetchExperiences } from '../lib/fetchExperiences';
import { fetchFooter } from '../lib/fetchFooter';
import { fetchHero } from '../lib/fetchHero';
import { fetchProjects } from '../lib/fetchProjects';
import { fetchSkills } from '../lib/fetchSkills';

const Home = () => {
  const heroQuery = useQuery({ queryKey: ['hero'], queryFn: fetchHero });
  const aboutQuery = useQuery({ queryKey: ['about'], queryFn: fetchAbout });
  const skillsQuery = useQuery({ queryKey: ['skills'], queryFn: fetchSkills });
  const experiencesQuery = useQuery({
    queryKey: ['experiences'],
    queryFn: fetchExperiences,
  });
  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  });

  return (
    <div>
      <section id='hero' className='w-full bg-black-600'>
        <div className='section'>
          {heroQuery.isLoading ? <Loading /> : <Hero {...heroQuery.data} />}
        </div>
      </section>
      <section id='a-propos' className='w-full'>
        <div className='section md:pl-6'>
          {aboutQuery.isLoading ? <Loading /> : <About {...aboutQuery.data} />}
        </div>
      </section>
      <section id='experiences' className='w-full bg-black-600'>
        <div className='section md:pl-6'>
          {experiencesQuery.isLoading ? (
            <Loading />
          ) : (
            <WorkExperience experiences={experiencesQuery.data} />
          )}
        </div>
      </section>
      <section id='competences' className='w-full'>
        <div className='section'>
          {skillsQuery.isLoading ? (
            <Loading />
          ) : (
            <Skills skills={skillsQuery.data} />
          )}
        </div>
      </section>
      <section id='portfolio' className='w-full bg-black-600'>
        <div className='section md:pl-6'>
          {projectsQuery.isLoading ? (
            <Loading />
          ) : (
            <Portfolio projects={projectsQuery.data} />
          )}
        </div>
      </section>
      <section id='contact' className='w-full'>
        <Contact />
      </section>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(['hero'], fetchHero);
  await queryClient.prefetchQuery(['about'], fetchAbout);
  await queryClient.prefetchQuery(['experiences'], fetchExperiences);
  await queryClient.prefetchQuery(['projects'], fetchProjects);
  await queryClient.prefetchQuery(['skills'], fetchSkills);
  const footer = await fetchFooter();

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      footer,
    },
  };
};

export default Home;
