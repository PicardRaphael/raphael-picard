import type { StructureResolver } from 'sanity/structure';

export const structure: StructureResolver = (S) =>
	S.list().title('Base').items(
		S.documentTypeListItems(), // <= example code goes here
	);
