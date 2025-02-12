import { ProjectsIcon } from '@sanity/icons';
import { defineArrayMember, defineField, defineType } from 'sanity';

export const portfolioType = defineType({
	icon: ProjectsIcon,
	name: 'portfolio',
	title: 'Portfolio',
	type: 'document',
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
			name: 'description',
			type: 'array',
			of: [defineArrayMember({ type: 'block' })],
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'technologies',
			type: 'array',
			of: [defineArrayMember({ type: 'reference', to: { type: 'skill' } })],
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'linkToGithub',
			type: 'url',
		}),
		defineField({
			name: 'linkToYoutube',
			type: 'url',
		}),
		defineField({
			name: 'linkToProject',
			type: 'url',
		}),
	],
});
