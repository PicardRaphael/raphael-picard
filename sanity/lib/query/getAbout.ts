import { defineQuery } from 'next-sanity';
import { sanityFetch } from '../live';

export const getAbout = async () => {
	const ABOUT_QUERY = defineQuery(`*[_type == "about"]`);

	try {
		const about = await sanityFetch({ query: ABOUT_QUERY });
		return about.data || [];
	} catch (error) {
		console.log(error);
		return [];
	}
};
