import { defineQuery } from 'next-sanity';
import { sanityFetch } from '../live';

export const getPortfolios = async () => {
	const PROTFOLIO_QUERY = defineQuery(`*[_type == "portfolio"] | order(_createdAt desc){
		...,
		technologies[]->
	}`);

	try {
		const portfolios = await sanityFetch({ query: PROTFOLIO_QUERY });
		return portfolios.data || [];
	} catch (error) {
		console.log(error);
		return [];
	}
};
