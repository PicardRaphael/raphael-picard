import { DocumentTextIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

export const skillType = defineType({
	name: 'skill',
	title: 'Skill',
	type: 'document',
	icon: DocumentTextIcon,
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
		defineField({
			name: 'link',
			type: 'url',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'speciality',
			type: 'string',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'type',
			type: 'string',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'position',
			type: 'string',
			validation: (Rule) => Rule.required(),
		}),
	],
});
