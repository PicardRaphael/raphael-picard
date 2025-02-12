import { ImageIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

export const imageType = defineType({
	name: 'imageCdn',
	title: 'Image',
	type: 'document',
	icon: ImageIcon,
	fields: [
		defineField({
			name: 'title',
			type: 'string',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'image',
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
	],
});
