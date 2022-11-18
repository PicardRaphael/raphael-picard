import type { About } from '../types/about';

export const fetchAbout = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/getAbout`);

  const data = await res.json();
  const { about }: { about: About } = data;

  return about;
};
