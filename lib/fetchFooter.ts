import type { Footer } from '../types/footer';

export const fetchFooter = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/getFooter`);

  const data = await res.json();
  const { footer }: { footer: Footer } = data;

  return footer;
};
