import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    // Absent on every migrated post; a summary is derived from the body instead.
    description: z.string().optional(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    // Editorial taxonomy carried over from v2's `layout` field. Named `type` to
    // avoid colliding with Astro's reserved `layout` frontmatter key.
    type: z.enum(['blog', 'article', 'tutorial']),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
