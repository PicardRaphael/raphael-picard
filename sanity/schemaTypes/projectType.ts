import { ProjectsIcon } from '@sanity/icons';
import { defineArrayMember, defineField, defineType } from 'sanity';

export const projectType = defineType({
	icon: ProjectsIcon,
	name: 'project',
	title: 'Project',
	type: 'document',
	fields: [
		defineField({
			name: 'title',
			type: 'string',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'company',
			type: 'string',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'dateStarted',
			type: 'date',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'dateEnded',
			type: 'date',
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
			name: 'summary',
			type: 'array',
			of: [defineArrayMember({ type: 'block' })],
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'shortSummary',
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
			name: 'linkToBuild',
			type: 'url',
		}),
		defineField({
			name: 'linkToGitHub',
			type: 'url',
		}),
		defineField({
			name: 'linkToYoutube',
			type: 'url',
		}),
	],
});
