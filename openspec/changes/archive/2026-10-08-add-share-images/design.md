# Design

## Context

See proposal.md — Why. The relevant current state:

- `src/layouts/BaseLayout.astro` emits title, description, canonical, `og:title`,
  `og:description`, `og:url`, `og:type` fixed to `website`, and `twitter:card` fixed to
  `summary_large_image`. It has no image prop. `Astro.site` is set from `SITE.url`, so
  absolute URLs are one `new URL()` away.
- The post route is `src/pages/post/[...id].astro`; `src/pages/rss.xml.ts` is the one
  existing endpoint and shows the house style: `getPublishedPosts()` from
  `src/lib/posts.ts`, `context.site` for absolute links. `getPublishedPosts()` already
  hides drafts outside dev.
- The home card (`src/components/PostCard.astro`) is the design to reproduce: cream face
  (`--color-bright`), 4 px `--color-emerald-deep` frame, hard 4 px offset shadow in the
  same colour, a `--color-band` header row in Space Mono bold uppercase with the post
  number on the left and the reading time on the right, terminal tag chips
  (`--color-band-raised` on a 1 px emerald frame, `> LABEL`), the title in Space Grotesk
  semibold uppercase clamped to two lines, the short excerpt clamped to three, and a
  footer row with the ISO date in `--color-outline`. The post number is computed inline
  on the home page as `posts.length - index`.
- The identity's two rules: square corners everywhere, hard offset shadows with no blur.
- Fonts on the pages come from Astro's `fonts` config with the Google provider, which
  downloads WOFF2 only (see `.astro/fonts/`). Satori reads TTF, OTF and WOFF, not WOFF2.
  Google publishes Space Grotesk only as a variable TTF (`SpaceGrotesk[wght].ttf`), which
  Satori's OpenType parser would render at a single default instance rather than at the
  requested weight. Fontsource publishes static per-weight WOFF files for both families
  (`@fontsource/space-grotesk`, `@fontsource/space-mono`, both OFL-1.1), and their
  package exports expose `./files/*.woff`.
- `sharp` 0.35 is already a direct dependency (co-located post images); its bundled
  libvips includes librsvg, so it rasterises SVG from a buffer with no extra package.
- `public/uploads/avatar.png` is a 1254 × 1254 pixel-art PNG; `public/uploads/icon.png`
  is 512 × 512.
- The site is static with no adapter, and the `site-metadata` spec forbids client-side
  JavaScript for any reader-facing feature.

## Goals / Non-Goals

**Goals:**

- A share image that is unmistakably the same object as the home card, so the identity
  carries into feeds and chats.
- Zero change to how the site is served: files in `dist/`, nothing at request time.
- The renderer reuses the post helpers (`excerpt`, `readingTime`, `isoDate`,
  `tagLabel`) so the image and the card can't disagree on content.

**Non-Goals:**

- Pixel-perfect parity with the browser-rendered card. Satori lays out its own CSS
  subset; the target is the same design, not the same pixels.
- Touching Astro's `fonts` config or the fonts the pages load.
- A general-purpose image route. The endpoints render exactly two shapes: a post and the
  site default.

## Decisions

### 1. Static endpoints, no plugin, no integration

Two endpoints under `src/pages/og/` do the work. `[...id].png.ts` exports
`getStaticPaths()` from `getPublishedPosts()` (one path per post, the post as a prop) and
a `GET` that returns the PNG with `Content-Type: image/png`. `site.png.ts` exports a
`GET` with no params. Astro writes them to `dist/og/<slug>.png` and `dist/og/site.png`
at build time, and in dev they render on request, so an image can be previewed at its
final address while tuning. A static `site.png.ts` wins over the dynamic route for the
literal id `site`; no post carries that slug.

Alternatives considered:

- **`astro-og-canvas`** (CanvasKit): one call, Astro 7 peer supported, but its layout is
  title + description + logo on a gradient. The card frame, band and chips are out of
  reach without forking its renderer.
- **`astro-opengraph-images`** (Satori + React templates): wants the React integration
  this project deliberately keeps off, and hooks the build as an integration where a
  plain endpoint is enough.
- **A Netlify function or edge function**: breaks "fully static" and adds an adapter for
  no benefit; the inputs are all known at build time.

### 2. Satori for layout, the existing sharp for rasterising

`satori` takes an element tree and returns SVG with every glyph already converted to
paths, so the SVG depends on no font at raster time. `sharp(Buffer.from(svg)).png()`
turns it into the PNG. This is the only new runtime dependency; `@resvg/resvg-js`, the
usual companion to Satori, is not needed because sharp already does the job and already
builds on Netlify.

The tree is written as plain objects (`{ type: 'div', props: { style, children } }`),
the form Satori accepts without JSX, through two or three small helper functions in
`src/lib/share-image.ts`. Satori's experimental JSX runtime and `satori-html` were
rejected: the first means a `.tsx` file with a pragma in a project whose `tsconfig`
points JSX at React, the second adds a dependency to parse an HTML string that is
easier to read as a tree anyway.

Satori's CSS subset covers everything the card needs: flex layout, `border`,
`boxShadow` with a zero blur radius (parsed by `css-box-shadow`), `lineClamp`,
`textTransform: 'uppercase'`, `letterSpacing`, and `<img src="data:...">`. It does not
support `z-index` (logged, ignored) or CSS grid; neither is needed.

Confirmed by the render spike (task 1.2) on Satori 0.36.0: the hard shadow, borders,
dashed border, uppercase, letter-spacing, the data-URI image and the accented glyphs all
render as intended, in about 35 ms for the SVG and 30 ms for the PNG. One gotcha:
`lineClamp` is honoured only when the element holding the text has `display: 'block'`
(Satori checks that explicitly); on a flex container it is silently ignored and the text
runs on. Text containers are therefore blocks, and only the layout wrappers are flex.
Also, pnpm's release-age guard resolved `satori` to 0.36.0: versions 0.37 to 0.44 were
all published on the same day while the project swapped `yoga-layout` for a bundled
WebAssembly layout engine. 0.36.0 is what the lockfile pins.

### 3. Fonts for the renderer come from Fontsource

`@fontsource/space-grotesk` and `@fontsource/space-mono` are added as dev dependencies.
At render time the module reads four files from `node_modules` by resolving the package
subpaths (`createRequire(import.meta.url).resolve('@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff')` or `import.meta.resolve`; apply picks whichever Vite's
SSR build leaves intact) and hands the buffers to Satori as four `fonts` entries:

| Role                                  | File                                  |
| ------------------------------------- | ------------------------------------- |
| Title                                 | `space-grotesk-latin-700-normal.woff` |
| Summary                               | `space-grotesk-latin-400-normal.woff` |
| Band, chips, date, author line        | `space-mono-latin-700-normal.woff`    |
| Site default: tagline, site address   | `space-mono-latin-400-normal.woff`    |

The title uses 700 rather than the card's `font-semibold` because the pages only load
400, 500 and 700, and CSS weight matching resolves 600 to 700 there too. The `latin`
subset covers every Portuguese accented glyph (U+00C0–U+00FF).

Fonts are loaded once per build, at module scope, which Satori recommends for
performance; `fonts` are not re-read per image.

Alternatives considered:

- **Vendor TTF files under `src/assets/fonts/`:** needs a static instance of Space
  Grotesk, which Google does not publish; the upstream repository does, but then the
  repo carries font binaries and a manual update step. Fontsource gives static instances
  pinned by the lockfile.
- **Reuse Astro's downloaded fonts through `fontData` and
  `experimental_getFontFileURL`:** one source of truth, but the files are WOFF2, which
  Satori can't read, and the API is experimental. Adding `formats: ['woff2', 'woff']` to
  the Google provider might make a WOFF available, but that changes the pages' font
  config for the renderer's benefit and depends on the experimental API resolving to a
  readable file during a static build. Worth revisiting if the API stabilises.

### 4. The layout: the card, scaled, on the dark ground

Canvas 1200 × 630. Ground `--color-header` (`#131b17`), 48 px padding on every side.
Inside, the card: `--color-bright` face, 4 px `--color-emerald-deep` border, hard offset
shadow `10px 10px 0 --color-emerald-deep`, no border radius. The card fills the padded
area, so its content box is roughly 1096 × 526 before the shadow. The height budget was
settled in the spike: with the sizes below, a three-line title, a three-line summary, a
tag row and the footer fit with a few pixels to spare, and nothing can push the footer
off the card because both text blocks are clamped.

Rows, top to bottom, in a column flex:

1. **Band**: `--color-band`, 2 px `--color-emerald-deep` bottom border, padding
   12 × 28 px. Space Mono 700, 22 px, letter-spacing 0.08 em, uppercase. Left:
   `> POST #NN` in `--color-emerald-deep`; right: `N MIN READ` in `--color-pixel-black`.
2. **Body**, padding 24 px, column flex with 12 px gap:
   - **Tags** (skipped entirely when the post has none): row flex, 10 px gap, chips in
     `--color-band-raised` with a 1 px `--color-emerald-deep` border, Space Mono 700
     20 px uppercase `> LABEL`; after three, one chip with a dashed border reading `+n`.
   - **Title**: Space Grotesk 700, uppercase, `--color-emerald-deep`, letter-spacing
     −0.02 em, line-height 1.05. Size rule in Decision 5.
   - **Summary**: Space Grotesk 400, 26 px, line-height 1.35, `--color-pixel-black`,
     `lineClamp: 3`.
3. **Footer**, pushed to the bottom with `marginTop: auto`, 2 px `--color-band` top
   border, 14 px top padding, row flex, space-between, Space Mono 700 20 px uppercase.
   Left: ISO date in `--color-outline`. Right: the avatar at 56 px, then
   `CAIO FUZATTO` in `--color-emerald-deep` and a `[1P]` badge as in the header
   (`--color-well-soft` ground, `--color-emerald-mint` text, 1 px `--color-emerald-mid`
   border). The card's `Ler post >` cue is dropped: it is a link affordance and means
   nothing on a picture.

Colours are written as hex literals in the renderer, taken from the `@theme` block in
`src/styles/global.css`, with a comment pointing there; Satori never sees CSS variables.
All sizes above are starting values to be tuned on the rendered PNG in apply, viewing it
at the roughly 500 px width LinkedIn and X display it at.

The site default (`site.png`) reuses the same chrome with: band left `> CAIOFUZATTO.COM.BR`,
band right `[1P]`; no tag row; title `CAIO FUZATTO`; summary = `SITE.description`;
footer left = `SITE.tagline` uppercase, footer right = avatar and `CAIO FUZATTO`.

### 5. Fitting long text

Satori does not reflow across font sizes, so the title size is chosen before layout from
the title's length, which is a good enough proxy for its line count at a known width:
up to 48 characters renders at 60 px, longer titles at 50 px. Either way the title style
carries `lineClamp: 3`, so a title that still overflows ends in an ellipsis instead of
pushing the summary off the card. The summary is `excerpt(post)` — the short,
120-character form, which the card also uses — clamped to three lines as a safety net.

Settled in apply against the corpus of 46 titles, 19 to 61 characters long. A line holds
about 32 uppercase characters at 60 px and about 36 at 50 px, so every title up to 48
characters rendered on two lines at 60 px (checked on the 47-character "AdminJS: diga
adeus aos templates de backoffice" and the 38-character "Hot n' Code: Devops and Cyber
Security") and the three longer ones on two lines at 50 px (49, 55 and 61 characters).
The height budget assumes the 60 px size never reaches three lines, which would need a
title under 48 characters made of words long enough to waste a third of each line; no
real title does that, and the small size, where three lines fit, takes over at 49.

Rejected: measuring the title with Satori twice (render, inspect line count, re-render
smaller). It doubles the per-image cost for a rule the character count already settles.

### 6. The avatar is pre-scaled and embedded at its display size

Satori embeds `<img>` as an SVG `<image>`, and librsvg would scale it again at raster
time. The renderer therefore reads `public/uploads/avatar.png` once, resizes it to its
display size (56 px) with sharp, and embeds the result as a base64 data URI at exactly
that width and height, so no scaling happens inside the SVG.

The plan was to resize with `kernel: 'nearest'` to keep the pixel art crisp, but a run-
length scan of the source shows it has no clean pixel grid: runs of one and two pixels
dominate, so it is a high-resolution illustration in a pixel-art style rather than an
upscaled sprite. The spike rendered nearest and lanczos side by side and the two are
indistinguishable at 56 px, so the renderer uses sharp's default kernel, which is also
what the browser does when it scales the same file to 40 px in the header.

### 7. The layout declares the image; pages choose which one

`BaseLayout.astro` gains two optional props: `image?: { src: string; alt: string }`,
defaulting to `/og/site.png` with the alt "Caio Fuzatto — Dev Diary & Tech Blog", and
`type?: 'website' | 'article'`, defaulting to `website`. It emits `og:image` as
`new URL(image.src, Astro.site)`, `og:image:width` 1200, `og:image:height` 630,
`og:image:alt`, `twitter:image` and `og:type`. The post page passes
`image={{ src: \`/og/${post.id}.png\`, alt: post.data.title }}` and `type="article"`.
Home, linktree and 404 pass nothing and get the default. The dimensions are constants
exported from `src/lib/share-image.ts`, so the layout and the renderer share one pair
of numbers.

### 8. Post numbering becomes a helper

`src/pages/index.astro` computes `posts.length - index`. The image needs the same number
for the same post, so a `postNumber(posts, post)` (or an equivalent that returns the
list with ordinals attached) moves into `src/lib/posts.ts`, and the home page uses it.
Numbers count from the oldest published post, so they are stable for existing posts;
in dev, drafts are included and a draft dated earlier than an existing post would shift
the numbers of newer ones, which is also what the home page shows in dev today.

### 9. Stable image addresses, no cache busting

The image URL is `/og/<slug>.png` with nothing appended. Previews are cached by
platforms per URL, so a redesign of the card will not refresh links already shared. That
is accepted for now: the first version has no previous version to invalidate, and when
the design does change, a `?v=` suffix in the meta tags (not in the filename) is a
one-line change. A content hash in the filename was rejected: Astro endpoints don't get
hashed names, and emulating that needs a manifest the layout would have to read.

### 10. Satori is required, not imported

Satori 0.36.0's ES module build inlines the harfbuzz loader, which reads `__dirname`
during its WebAssembly init, so importing the package under native Node ESM (which is
how both `astro dev` and `astro build` load it) rejects with a `ReferenceError`. The
CommonJS build defines `__dirname` and works, so the renderer obtains the function
through `createRequire(import.meta.url)`, lazily inside the rasterise step so that a
page importing the size constants never loads it. Upstream fixed this in 0.37.1 ("stop
the ESM bundle from reading __dirname", #845), published the same day; once pnpm's
release-age guard admits it, the `require` can become a plain import.

## Risks / Trade-offs

- [Satori renders the card differently from the browser: letter-spacing, line-height,
  clamping] → Expected and accepted; the target is the same design. Tuning happens on
  the PNG, and the spec constrains behaviour (clamping, no overlap), not pixels.
- [A title or summary with a glyph outside the `latin` subset (an emoji, a CJK
  character) renders as a missing-glyph box] → Satori supports a `loadAdditionalAsset`
  hook for fallbacks, but the corpus is Portuguese and English prose. Not handled; if a
  future title needs it, Fontsource ships `latin-ext` files alongside.
- [The hard shadow in `--color-emerald-deep` on the `#131b17` ground reads darker than
  on the cream page] → It is the same construction as the card on the page; if it
  disappears, apply may lift it to `--color-emerald-base`. Recorded as an open
  question.
- [sharp's SVG rasteriser differs between the author's macOS build and Netlify's Linux
  build] → Both are sharp's prebuilt libvips with the same librsvg; text is paths, so
  there is no font-hinting difference. Verified by comparing a deploy preview's image
  with the local one once.
- [Build time] → About 45 Satori renders plus 45 PNG encodes, each well under 100 ms
  on a laptop. Fonts and the avatar are loaded once.
- [A broken render blocks the deploy] → Intended; the endpoint throws, Astro names the
  route, and a page would otherwise ship pointing at a missing image.
- [Fontsource and Google serve different builds of the same families] → Invisible at
  this size; the renderer's files are pinned by the lockfile.

## Migration Plan

No data migration. The route is new and every page gains tags it did not have.
Previously shared links pick up the image the next time a platform re-scrapes them;
LinkedIn's Post Inspector and Facebook's Sharing Debugger force that for a given URL.

Rollback: revert the commit. Pages go back to having no `og:image`; nothing else
depends on the route.

## Open Questions

- Whether the card's shadow should stay `--color-emerald-deep` on the dark ground or
  step up to `--color-emerald-base` for contrast. Decided by looking at the rendered
  PNG; neither choice changes the specs or the tasks.
- The exact size thresholds in Decision 5, and the final avatar display size in
  Decision 6. Both are tuning values settled against the corpus during apply.
