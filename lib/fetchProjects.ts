import type { Project } from '../types/project';

export const fetchProjects = async () => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/getProjects`
  );

  const data = await res.json();
  const { projects }: { projects: Project[] } = data;

  return projects;
};
