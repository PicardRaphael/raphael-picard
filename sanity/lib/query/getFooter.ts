import { defineQuery } from 'next-sanity';
import { sanityFetch } from '../live';

export const getFooter = async () => {
	const FOOTER_QUERY = defineQuery(`*[_type == "footer"]{
		...,
    social[]->,
		imageCdn[]->
	}`);

	try {
		const about = await sanityFetch({ query: FOOTER_QUERY });
		return about.data || [];
	} catch (error) {
		console.log(error);
		return [];
	}
};
