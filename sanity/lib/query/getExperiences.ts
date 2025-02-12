import { defineQuery } from 'next-sanity';
import { sanityFetch } from '../live';

export const getExperiences = async () => {
	const EXPERIENCES_QUERY = defineQuery(`*[_type == "project"] | order(dateStarted desc){
		...,
		technologies[]->
	}`);

	try {
		const experiences = await sanityFetch({ query: EXPERIENCES_QUERY });
		return experiences.data || [];
	} catch (error) {
		console.log(error);
		return [];
	}
};
