import type { Hero } from '../types/hero';

export const fetchHero = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/getHero`);

  const data = await res.json();
  const { hero }: { hero: Hero } = data;

  return hero;
};
