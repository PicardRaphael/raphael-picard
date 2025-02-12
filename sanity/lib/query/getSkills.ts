import { defineQuery } from 'next-sanity';
import { sanityFetch } from '../live';

export const getSkill = async () => {
	const SKILL_QUERY = defineQuery(`*[_type == "skill"]`);

	try {
		const skills = await sanityFetch({ query: SKILL_QUERY });
		return skills.data || [];
	} catch (error) {
		throw new Error('Error');
	}
};
