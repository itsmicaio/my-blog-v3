## 1. Content migration

- [x] 1.1 Clone `itsmicaio/my-blog-v2` to a scratch location and verify it contains 44 files in `static/posts/` and 62 in `static/uploads/`
- [x] 1.2 Write a throwaway migration script that, for each v2 post, strips the `YYYY-MM-DD-` filename prefix, writes it as `.md` into `src/content/blog/`, renames frontmatter `date` → `pubDate` and `layout` → `type`, and copies the body byte-for-byte; verify by diffing each output body against its source and confirming zero body differences
- [x] 1.3 Run the script and verify `src/content/blog/` holds exactly 44 `.md` files whose basenames match the 44 slugs in the live sitemap at `https://caiofuzatto.com.br/sitemap-0.xml`
- [x] 1.4 Verify the migrated frontmatter distribution matches the source — 26 `type: blog`, 17 `article`, 1 `tutorial` — and that every post has a `title` and `pubDate`
- [x] 1.5 Delete the placeholder `src/content/blog/ola-mundo.mdx` and verify it no longer appears in any listing
- [x] 1.6 Add `src/content/blog/` to `.prettierignore` and verify `pnpm format` leaves post files unmodified
- [x] 1.7 Delete the migration script and verify it is not referenced by any package script

## 2. Assets

- [x] 2.1 Copy v2's `static/uploads/` into `public/uploads/` and verify all 62 files are present
- [x] 2.2 Write a check that extracts every `/uploads/` reference from the 44 posts and asserts the file exists; verify it reports zero missing
- [x] 2.3 Download the 7 live `static.structurizr.com` images into `public/uploads/` and rewrite those references in `entendendo-arquiteturas-de-sistema-com-c4-model.md`; verify the post contains no remaining `http` image references to structurizr
- [x] 2.4 Source replacements for the 3 dead `c4model.com` images in `entendendo-arquiteturas-de-sistema-com-c4-model.md`, checking each against the surrounding prose; verify the post renders with all figures present
- [x] 2.5 Source a replacement for the dead `docs.aws.amazon.com` diagram in `entendendo-e-otimizando-aws-lambdas.md`; verify the figure matches what the surrounding text describes
- [x] 2.6 **Needs author decision** — resolve the expired `media.licdn.com` image in `como-se-tornar-um-senior.md` by substituting an image, rewriting the sentence that references it, or dropping the figure; verify the post reads coherently with whichever option is chosen — *author chose to drop it; the figure was terminal, unreferenced by any sentence, and a third party's reshared image*
- [x] 2.7 Verify no post in the corpus contains any external image reference — every image is a site-relative `/uploads/` path

## 3. Content schema and helpers

- [x] 3.1 Update `src/content.config.ts` — rename `pubDate` handling as needed, make `description` optional, add `type` as an enum of `blog | article | tutorial`, keep `tags` as free-form strings; verify `pnpm check` passes against all 44 posts
- [x] 3.2 Verify the schema rejects bad input by temporarily adding a post with `type: newsletter` and confirming the build fails naming that file, then removing it
- [x] 3.3 Add excerpt derivation to `src/lib/posts.ts` exposing short (120) and long (200) lengths, stripping code blocks before Markdown syntax and truncating at word boundaries; verify against a post that opens with a fenced code block that no code appears in its excerpt — *28 of 39 excerpts match the live site byte-for-byte; the other 11 differ only because v2's `prune` chopped words mid-word, which the spec forbids*
- [x] 3.4 Verify an authored `description` is used verbatim at both lengths, and that a post whose prose is shorter than the limit gets no ellipsis
- [x] 3.5 Add the tag slug → label map with a fallback to the raw slug plus a build warning; verify all 11 tags in use resolve to v2's labels and that an unmapped tag warns instead of crashing

## 4. Routing

- [x] 4.1 Set `trailingSlash` in `astro.config.mjs` and verify built output lands at `dist/post/<slug>/index.html` — *left at `'ignore'`, not `'always'`: directory build format already produces the trailing-slash URLs, while `'always'` made dev and preview 404 on the slashless form that Netlify 301s in production (see design.md)*
- [x] 4.2 Move `src/pages/blog/[...id].astro` to `src/pages/post/[...id].astro` and verify all 44 post routes generate
- [x] 4.3 Fold `src/pages/blog/index.astro` into `src/pages/index.astro` as the full post index, then delete the `blog/` directory; verify `/blog` no longer generates and `/` lists all 44 posts newest first
- [x] 4.4 Add `src/pages/linktree.astro` listing the 4 most recent `type: article` posts; verify no `blog` or `tutorial` post appears and that the page links back to `/`
- [x] 4.5 Delete `src/pages/sobre.astro` and verify `/sobre` no longer generates
- [x] 4.6 Update `src/pages/404.astro` to the site's design in Portuguese with a link home; verify it renders for an unknown path

## 5. Styling and chrome

- [x] 5.1 Replace `src/styles/global.css` — remove the oklch token set, the `.dark` variant and dark mode; define green `#4e8663` and the `news: 672px` breakpoint under Tailwind v4 `@theme`; verify no `bg-surface`/`text-ink` utility remains referenced anywhere
- [x] 5.2 Port v2's meyerweb reset, loading it after Tailwind's base layer; verify prose spacing on a long post matches the live site side by side
- [x] 5.3 Port v2's `mdx.css` as a global content stylesheet keyed off a wrapper class; verify headings, lists, blockquotes, horizontal rules, images and inline code match the live site on `entendendo-ecmascript-modules`
- [x] 5.4 Rebuild `src/layouts/BaseLayout.astro` as v2's fixed green header with avatar, name and LinkedIn/GitHub/Instagram links as inline SVG; verify the header stays pinned on scroll and no content is hidden beneath it
- [x] 5.5 Update `src/consts.ts` — replace `NAV_LINKS` with the social links, and take v2's site title and description copy; verify the home page title reads as v2's did
- [x] 5.6 Restyle `src/components/PostCard.astro` to v2's index entry: title, up to 3 tag labels with a `+N` overflow indicator, short excerpt, whole card linked; verify against a post with more than 3 tags
- [x] 5.7 Configure the Markdown highlighter to use Shiki's `night-owl` theme; verify a code block renders highlighted with no client JavaScript
- [x] 5.8 Add the green uppercase language badge via CSS `content: attr(data-language)` on `pre[data-language]`, excluding blocks with no language; verify a fenced `js` block shows a "JS" badge and an unfenced-language block shows none
- [x] 5.9 Verify post body links open in a new tab and that long code lines scroll within the block without the page scrolling horizontally
- [x] 5.10 Delete `src/components/ThemeToggle.tsx` and `src/components/Counter.tsx`; verify no remaining import references them and `pnpm check` passes

## 6. Metadata and analytics

- [x] 6.1 Add the Google Analytics tag for `G-FE4HS11JXL` to the base layout without blocking render; verify a page view is reported on load
- [x] 6.2 Add the `google-site-verification` meta tag with v2's token; verify it appears in the built home page markup
- [x] 6.3 Verify per-page metadata — post pages carry the post title, the 200-char summary, and a canonical trailing-slash URL; every page declares `pt-BR`
- [x] 6.4 Update `src/pages/rss.xml.ts` to link items at `/post/<slug>/` and use the long summary; verify feed links resolve without redirects and drafts are absent
- [x] 6.5 Verify the sitemap lists all 44 posts plus `/` and `/linktree/`, each with a trailing slash

## 7. Configuration cleanup

- [x] 7.1 Remove the `@astrojs/netlify` adapter from `astro.config.mjs` along with the `devFeatures` workaround from commit `8fe8f93`; verify `pnpm dev` starts cleanly with no Deno runtime requirement — *also removed the `devFeatures` workaround from commit `8fe8f93`*
- [x] 7.2 Verify `pnpm build` produces a fully static `dist/` and `netlify.toml` still publishes it correctly under `pnpm preview`
- [x] 7.3 Keep `@astrojs/react` and React installed per the proposal; verify the built output ships no React runtime bundle now that no island remains — *the integration is disabled; with it on, a 220KB React runtime was emitted that no page referenced*

## 8. Verification

- [x] 8.1 Build, then diff the generated route list against the 46 URLs in the live sitemap; verify an exact match with zero missing and zero extra routes — **this is the blocking gate before cutover** — *46/46 exact match, trailing slashes included, every URL backed by a built HTML file*
- [x] 8.2 Verify a draft post is visible in `pnpm dev` and absent from a production build's listings, feed, sitemap and its own URL
- [x] 8.3 Verify no page requests a JavaScript bundle other than the analytics script, and that the site is fully navigable and readable with JavaScript disabled
- [x] 8.4 Verify the site renders in its light scheme for a reader whose system prefers dark mode, and that no theme toggle is present
- [x] 8.5 Compare the home page, a `blog` post, an `article` post and `/linktree/` side by side against the live site at desktop and mobile widths; verify no horizontal page scrolling at narrow viewports
- [x] 8.6 Verify dates render as `26 de maio de 2023` form with no off-by-one from timezone handling, checking a post dated on the 1st of a month
- [x] 8.7 Run `pnpm verify` and confirm format, lint and type checks all pass

## 9. Documentation

- [x] 9.1 Update `CLAUDE.md` — rewrite the Conventions section to describe the light-only green design instead of token utilities and dark mode, note that React is installed but unused, and correct the Layout section for `/post/` routing and `public/uploads/`; verify no statement in it contradicts the built site
- [x] 9.2 Update `README.md` if it describes the scaffold's structure; verify it reflects the migrated site
