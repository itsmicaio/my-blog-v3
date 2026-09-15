// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

import { satteri } from '@astrojs/markdown-satteri';

import { SITE } from './src/consts.ts';
import { hastTargetBlank } from './src/lib/hast-target-blank.mjs';

// https://astro.build/config
export default defineConfig({
  site: SITE.url,

  // v2's published URLs all carry a trailing slash, and the canonical tags and
  // sitemap still emit that form under 'ignore' (directory build output).
  // Deliberately not 'always': that makes the dev and preview servers 404 on the
  // slashless form, which Netlify serves in production via a 301 — so 'always'
  // only manufactures a local-only failure with no production benefit.
  trailingSlash: 'ignore',

  // React stays in package.json so islands remain one line away, but the
  // integration is off: with zero islands it still emitted a ~220KB React
  // runtime into dist/ that no page referenced.
  integrations: [mdx(), sitemap()],

  markdown: {
    processor: satteri({
      hastPlugins: [hastTargetBlank],
      // Astro enables smart punctuation by default; Gatsby did not, so leaving it
      // on would curl the quotes and dashes in every migrated post.
      features: { smartPunctuation: false },
    }),
    shikiConfig: {
      // v2 highlighted with prism-react-renderer's nightOwl; this is the same
      // theme lineage, resolved at build time so no JS ships per code block.
      theme: 'night-owl',
      wrap: false,
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
