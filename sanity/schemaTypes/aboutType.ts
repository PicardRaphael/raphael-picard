import { TagIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

export const aboutType = defineType({
	icon: TagIcon,
	name: 'about',
	title: 'About',
	type: 'document',
	fields: [
		defineField({
			name: 'aboutImage',
			type: 'image',
			validation: (Rule) => Rule.required(),
			options: {
				hotspot: true,
			},
			fields: [
				defineField({
					name: 'alt',
					type: 'string',
					title: 'Alternative text',
					validation: (Rule) => Rule.required(),
				}),
			],
		}),
		defineField({
			name: 'title',
			type: 'string',
			validation: (Rule) => Rule.required().min(3),
		}),
		defineField({
			name: 'body',
			type: 'blockContent',
			validation: (Rule) => Rule.required(),
		}),
	],
});
