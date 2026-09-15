// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

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

  // Self-hosted so a page load makes no third-party font request. Weights are
  // limited to the ones the design actually uses; adding one costs a file.
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Space Grotesk',
      cssVariable: '--font-space-grotesk',
      weights: [400, 500, 700],
      subsets: ['latin'],
      display: 'swap',
      fallbacks: ['ui-sans-serif', 'system-ui', 'sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'Space Mono',
      cssVariable: '--font-space-mono',
      weights: [400, 700],
      subsets: ['latin'],
      display: 'swap',
      fallbacks: ['ui-monospace', 'monospace'],
    },
  ],

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
