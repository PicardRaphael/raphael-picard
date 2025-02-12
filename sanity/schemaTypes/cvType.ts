import { AddDocumentIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

export const cvType = defineType({
	name: 'cv',
	title: 'CV',
	type: 'document',
	icon: AddDocumentIcon,
	fields: [
		defineField({
			name: 'cv',
			type: 'file',
			validation: (Rule) => Rule.required(),
		}),
	],
});
