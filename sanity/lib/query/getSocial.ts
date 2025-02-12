import { defineQuery } from 'next-sanity';
import { sanityFetch } from '../live';

export const getSocial = async () => {
	const SOCIAL_QUERY = defineQuery(`*[_type == "social"]`);

	try {
		const social = await sanityFetch({ query: SOCIAL_QUERY });
		return social.data || [];
	} catch (error) {
		console.log(error);
		return [];
	}
};
