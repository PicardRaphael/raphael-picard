import type { Skills } from '../types/skill';

export const fetchSkills = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/getSkills`);

  const data = await res.json();
  const { skills }: { skills: Skills } = data;

  return skills;
};
