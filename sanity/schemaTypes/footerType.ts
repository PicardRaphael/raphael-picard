import { InfoOutlineIcon } from '@sanity/icons';
import { defineArrayMember, defineField, defineType } from 'sanity';

export const footerType = defineType({
	icon: InfoOutlineIcon,
	name: 'footer',
	title: 'Footer',
	type: 'document',
	fields: [
		defineField({
			name: 'name',
			type: 'string',
		}),
		defineField({
			name: 'role',
			type: 'string',
		}),
		defineField({
			name: 'logo',
			type: 'array',
			of: [defineArrayMember({ type: 'reference', to: { type: 'imageCdn' } })],
		}),
		defineField({
			name: 'email',
			type: 'string',
		}),
		defineField({
			name: 'phoneNumber',
			type: 'string',
		}),
		defineField({
			name: 'address',
			type: 'string',
		}),
		defineField({
			name: 'city',
			type: 'string',
		}),
		defineField({
			name: 'social',
			type: 'array',
			of: [defineArrayMember({ type: 'reference', to: { type: 'social' } })],
		}),
	],
});
