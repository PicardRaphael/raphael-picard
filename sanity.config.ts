'use client';

/**
 * This configuration is used to for the Sanity Studio that’s mounted on the `\app\studio\[[...tool]]\page.tsx` route
 */

import { visionTool } from '@sanity/vision';
import { defineConfig, isDev } from 'sanity';

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import { structureTool } from 'sanity/structure';
import { dataset, projectId } from './sanity/env';
import { schema } from './sanity/schemaTypes';
import { structure } from './sanity/structure';
export default defineConfig({
	basePath: '/studio',
	projectId,
	dataset,
	// Add and edit the content schema in the './sanity/schemaTypes' folder
	schema,
	plugins: isDev ? [structureTool({ structure }), visionTool()] : [structureTool()],
});
