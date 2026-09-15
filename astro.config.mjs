// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import netlify from '@astrojs/netlify';

import { SITE } from './src/consts.ts';

// https://astro.build/config
export default defineConfig({
  site: SITE.url,

  integrations: [react(), mdx(), sitemap()],

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: netlify({
    // Edge function emulation needs a local Deno runtime we don't have, and this
    // project defines none. Re-enable if a netlify/edge-functions/ dir ever lands.
    devFeatures: { edgeFunctions: false, images: true, environmentVariables: false },
  }),
});
