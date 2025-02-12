import { defineQuery } from 'next-sanity';
import { sanityFetch } from '../live';

export const getHero = async () => {
	const HERO_QUERY = defineQuery(`*[_type == "hero"]{
		...,
		skills[]->
	}`);

	try {
		const about = await sanityFetch({ query: HERO_QUERY });
		return about.data || [];
	} catch (error) {
		console.log(error);
		return [];
	}
};
