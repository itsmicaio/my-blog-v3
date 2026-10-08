# Proposal

## Why

Every page declares a `summary_large_image` Twitter card, but no page emits an `og:image`,
so a post shared on WhatsApp, LinkedIn, X or Slack previews as bare text. v2 tried to fix
this in January 2024 with a Gatsby plugin (draft PR #6, `gatsby-plugin-satorare`) and never
shipped it. On Astro the same feature needs no plugin: a static endpoint can write one PNG
per post when the site is built, in the site's own identity, and the site stays fully
static.

## What Changes

- The build generates a 1200 × 630 share image for every published post at
  `/og/<slug>.png`, drawn as the home page's post card on the dark header ground: the band
  with the post number and reading time, up to three terminal tags, the title in uppercase,
  the short summary, the publication date, and the author line with the pixel avatar.
- The build also generates one default image at `/og/site.png` from the site title, tagline
  and description, used by every page that is not a post (home, linktree, 404).
- Every page's head gains `og:image` as an absolute URL, `og:image:width`,
  `og:image:height`, `og:image:alt` and `twitter:image`. Post pages declare `og:type` as
  `article` instead of `website`.
- Draft posts get no image in production builds, matching the feed and the sitemap.
- Long titles and summaries are clamped so the card never overflows: the title drops one
  size step before being clamped to three lines; the summary is clamped to three lines.
- One new runtime dependency, `satori`, turns the layout into SVG; the `sharp` the project
  already depends on turns the SVG into PNG. Two new dev dependencies,
  `@fontsource/space-grotesk` and `@fontsource/space-mono`, supply static WOFF files for
  the renderer. No client-side JavaScript, no adapter, no request-time function.
- Post numbering, today computed inline on the home page, becomes a shared helper so the
  card on the site and the card in the image cannot disagree.
- `README.md` and `AGENTS.md` describe the image route and where its fonts come from.

Not breaking: no URL changes, no existing page's markup changes beyond the added meta
tags, and the `/og/` route is new.

## Capabilities

### New Capabilities

None. Link previews are already the stated purpose of `site-metadata`.

### Modified Capabilities

- `site-metadata`: "Per-page metadata" gains the share image declaration — an absolute
  image URL with width, height and alternative text — and the `article` type on post
  pages. New requirements describe the generated images: one per published post plus a
  site default, their dimensions and address, what the post image shows and how long text
  is fitted, draft exclusion, and that they are produced when the site is built rather
  than on request.

## Impact

**Added**

- `src/pages/og/[...id].png.ts` and `src/pages/og/site.png.ts` — the two image
  endpoints.
- `src/lib/share-image.ts` — the renderer: font loading, the card layout, Satori to
  sharp.

**Changed**

- `src/layouts/BaseLayout.astro` — `image` and `type` props and the new meta tags.
- `src/pages/post/[...id].astro` — passes the post's image and the `article` type.
- `src/lib/posts.ts` and `src/pages/index.astro` — post numbering helper.
- `package.json` — `satori` as a dependency; `@fontsource/space-grotesk` and
  `@fontsource/space-mono` as dev dependencies.
- `README.md`, `AGENTS.md` — layout tree, fonts convention, a note on the route.

**Explicitly out of scope** — a per-post cover image chosen in frontmatter; images for
listing pages other than the site default; a visual regression test for the rendered
PNGs; versioned image URLs for cache busting; any change to Astro's `fonts` config.

**Risks**

- Satori implements a CSS subset: flexbox only, no grid, a fixed list of properties. The
  card uses flex, borders, a hard box-shadow and line clamping, all supported, but the
  look must be tuned on the rendered PNG rather than copied from the Tailwind classes.
- Social platforms cache a preview per URL. A later redesign of the card will not show up
  on already-shared links until the URL changes or the platform's debugger is asked to
  refresh.
- The build renders one image per post, roughly 45 today, which adds seconds, not
  minutes.
- The Fontsource packages are a separate build of the same families Astro downloads from
  Google for the pages. The two can drift by a glyph revision, which is invisible at this
  size, but the renderer's fonts are pinned by the lockfile and Astro's are not.
