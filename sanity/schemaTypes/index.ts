import { type SchemaTypeDefinition } from 'sanity';

import { aboutType } from './aboutType';
import { blockContentType } from './blockContentType';
import { cvType } from './cvType';
import { footerType } from './footerType';
import { heroType } from './heroType';
import { imageType } from './imageType';
import { portfolioType } from './portfolioType';
import { projectType } from './projectType';
import { skillType } from './skillType';
import { socialType } from './socialType';

export const schema: { types: SchemaTypeDefinition[] } = {
	types: [blockContentType, aboutType, heroType, skillType, socialType, footerType, imageType, projectType, cvType, portfolioType],
};
