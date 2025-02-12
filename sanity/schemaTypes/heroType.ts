import { UserIcon } from '@sanity/icons';
import { defineArrayMember, defineField, defineType } from 'sanity';

export const heroType = defineType({
	name: 'hero',
	title: 'Hero',
	type: 'document',
	icon: UserIcon,
	fields: [
		defineField({
			name: 'name',
			type: 'string',
			validation: (Rule) => Rule.required().min(3),
		}),
		defineField({
			name: 'role',
			type: 'string',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'typeWriter',
			type: 'array',
			of: [{ type: 'string' }],
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'speciality',
			type: 'string',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'title',
			type: 'string',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'together',
			type: 'blockContent',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'profilePicture',
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
			name: 'skills',
			type: 'array',
			of: [defineArrayMember({ type: 'reference', to: { type: 'skill' } })],
			validation: (Rule) => Rule.required(),
		}),
	],
});
