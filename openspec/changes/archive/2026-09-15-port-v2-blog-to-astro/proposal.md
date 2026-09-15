## Why

The live site at `caiofuzatto.com.br` still runs the Gatsby 5 blog from
`itsmicaio/my-blog-v2`: 44 posts, 62 local images, and a build that depends on
`netlify-cms-app` (end-of-life) plus eleven `gatsby-*` plugins. This repo holds an
Astro 7 scaffold with one placeholder post and none of that content.

This change moves the whole v2 blog onto the Astro scaffold as a faithful port —
same URLs, same visual design, same feature set — so the site can be maintained on
a supported toolchain without asking readers or search engines to absorb a
redesign at the same time. Keeping the port visually faithful means the only
variable being changed is the build stack, which makes regressions obvious.

## What Changes

**Content migration**

- Migrate 44 posts from `static/posts/*.mdx` to `src/content/blog/*.md`. Every post
  was verified to contain no JSX or `import`/`export` outside code fences, so none
  requires MDX; plain Markdown is sufficient.
- Rename post files to drop the `YYYY-MM-DD-` prefix so the Astro glob id equals
  the public slug with no slug-derivation logic. The date remains in frontmatter.
- Remap frontmatter: `date` → `pubDate`, and `layout` → `type`. The `layout` key has
  reserved meaning in Astro Markdown, and the field is a content taxonomy
  (`blog` | `article` | `tutorial`), not a layout selector.
- Copy 62 images to `public/uploads/`, leaving every `/uploads/*` reference in post
  bodies untouched.
- Self-host the 12 externally-hosted images. Five are already dead on the live site
  (three `c4model.com` 404s, one `docs.aws.amazon.com` 404, one expired
  `media.licdn.com` signed URL) and need replacements sourced; the seven live
  `static.structurizr.com` images get pulled local to end the external dependency.

**Routing**

- Move the post route from `/blog/[...id]` to `/post/[...id]` and set
  `trailingSlash: 'always'`, reproducing v2's live URLs exactly. All 44 indexed URLs
  plus `/` and `/linktree/` are preserved, so **no redirects are required and no
  public URL breaks**.
- Remove `/blog` as a listing route. As in v2, `/` is the full post index.

**Visual design — pixel-for-pixel v2**

- **BREAKING (internal)**: replace the scaffold's design system. The oklch token set
  (`surface`, `ink`, `edge`, `accent`), the `.dark` variant, and dark mode are
  removed in favour of v2's light-only palette: green `#4e8663` accent, `gray-600`
  body text at `font-thin`, the meyerweb reset, the custom `news: 672px`
  breakpoint, and the hand-written `.mdx` content stylesheet.
- Rebuild `BaseLayout` as v2's fixed green header: avatar, name, and LinkedIn /
  GitHub / Instagram links.
- Add the `/linktree` page, which lists the four most recent `type: article` posts —
  deliberately excluding the diary entries and AWS course notes.

**Feature parity**

- Restore Google Analytics (`G-FE4HS11JXL`) and the `google-site-verification` meta tag.
- Reproduce v2's code blocks — night-owl theme with a green uppercase language
  badge — at build time via the existing Shiki-based highlighter rather than
  porting `prism-react-renderer` as a per-block React island.
- Port the tag display, including v2's slug → label map (`nodejs` → `NodeJS`,
  `aleatorio` → `Aleatório`, and so on). Tags remain display-only; v2 has no tag routes.

**Removals**

- Drop the Netlify/Decap CMS. `/admin`, `static/admin/config.yml`, and the EOL
  `netlify-cms-app` dependency do not come across; posts are authored as files.
- Drop utterances comments. Two years of use produced one thread with one comment,
  and removing it eliminates a third-party script and a GitHub-account barrier.
- Delete the scaffold's `ThemeToggle.tsx`, `Counter.tsx`, and `/sobre` page — none
  has a v2 counterpart.
- Leave the nine `.drawio` diagram sources in the v2 repo; only exported images migrate.

**Retained from the scaffold**

- The RSS feed, which v2 never had. It renders no UI, so it does not conflict with
  the pixel-for-pixel goal. Its item links move to `/post/<slug>/`.
- The sitemap, and the `draft` flag (additive, defaults to `false`).
- `@astrojs/react` and `react`/`react-dom` stay installed although the port leaves
  zero islands — every v2 surface is static. Astro ships no JS for zero islands, so
  this costs nothing at runtime and keeps the option open.

**Schema**

- `description` becomes optional. v2 had no descriptions; Gatsby synthesized them
  with `excerpt(pruneLength: N)` at query time. A build-time excerpt derived from
  post body text replaces it, at v2's two lengths: 120 characters for index cards
  and 200 for meta descriptions.

## Capabilities

### New Capabilities

- `blog-content`: the post content model — frontmatter contract, file naming and
  slug derivation, draft handling, excerpt derivation, and image asset location.
- `post-pages`: rendering an individual post at `/post/<slug>/` — title, formatted
  date, tag list, Markdown body styling, and syntax-highlighted code blocks.
- `site-chrome`: the reader-facing shell and navigational pages — the fixed header,
  the `/` post index, `/linktree`, `/404`, and the site's visual identity.
- `site-metadata`: machine-facing output — per-page SEO meta, the RSS feed, the
  sitemap, and analytics.

### Modified Capabilities

None. The project has no existing specs (`openspec list --specs` reports none), so
every capability above is introduced by this change.

## Impact

**Content and assets**

- `src/content/blog/`: 1 placeholder post replaced by 44 migrated posts.
- `public/uploads/`: new, ~74 images (62 migrated + 12 self-hosted).
- Three posts need replacement figures sourced for dead external images.

**Source**

- `src/content.config.ts` — `pubDate`/`type` fields, `description` made optional.
- `src/consts.ts` — `NAV_LINKS` replaced by social links; site title and description
  take v2's copy.
- `src/layouts/BaseLayout.astro`, `src/styles/global.css` — rewritten.
- `src/pages/` — `blog/[...id].astro` → `post/[...id].astro`; `blog/index.astro`
  folded into `index.astro`; `linktree.astro` added; `sobre.astro` removed.
- `src/lib/posts.ts` — excerpt derivation added.
- `src/components/` — `PostCard.astro` restyled; `ThemeToggle.tsx` and `Counter.tsx`
  deleted; a tag-list component and inline social SVG icons added.
- `astro.config.mjs` — `trailingSlash: 'always'`, Shiki night-owl config, and a
  decision on whether the `@astrojs/netlify` adapter is still warranted now that the
  site is fully static with no dynamic routes.

**Dependencies**

- Nothing added. Nothing removed, on the decision to keep React installed.

**Documentation**

- `CLAUDE.md` must be updated. Its Conventions section currently instructs using
  token utilities (`bg-surface`, `text-ink-muted`) "so dark mode keeps working" and
  describes React island usage — both become inaccurate under this change.

**Out of scope**

- Any redesign, tag archive pages, pagination, or post search.
- Migrating the single existing utterances comment thread.
- Repointing DNS or the Netlify site; this change produces the build, not the cutover.
