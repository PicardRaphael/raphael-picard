import { TwitterIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

export const socialType = defineType({
	icon: TwitterIcon,
	name: 'social',
	title: 'Social',
	type: 'document',
	fields: [
		defineField({
			name: 'socialImage',
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
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'url',
			type: 'url',
			validation: (Rule) => Rule.required(),
		}),
	],
});
