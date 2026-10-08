# Tasks

## 1. Dependencies and a render spike

- [x] 1.1 Add `satori` to `dependencies`, and `@fontsource/space-grotesk` and
      `@fontsource/space-mono` to `devDependencies`, with `mise exec -- pnpm add`. Verify
      the install succeeds, the lockfile changes, and a one-line
      `mise exec -- node -e` resolves each of the four WOFF paths from design Decision 3
      to an existing file.
- [x] 1.2 In the scratchpad (nothing committed), render a throwaway 1200 × 630 card with
      Satori and sharp using the four fonts: a 4 px border, a `10px 10px 0` box-shadow,
      `lineClamp: 3` on a long string, uppercase with letter-spacing, and a base64 avatar.
      Verify the PNG shows a hard-edged shadow with no blur, an ellipsis on the clamped
      line, the glyphs `ã ç é õ ê`, and a crisp avatar. Record any property Satori
      rejected in design.md Decision 2 before continuing.

## 2. Renderer and endpoints

- [x] 2.1 Create `src/lib/share-image.ts` exporting the image width and height constants,
      `renderPostImage(post, number)` and `renderSiteImage()`, each returning a PNG
      buffer: fonts read once at module scope (Decision 3), the avatar pre-scaled with
      `kernel: 'nearest'` and embedded as a data URI (Decision 6), the layout from
      Decision 4 with hex colours copied from `@theme`, and the title size rule from
      Decision 5. Verify `mise exec -- pnpm check` and `mise exec -- pnpm lint` pass.
- [x] 2.2 Move post numbering from `src/pages/index.astro` into a helper in
      `src/lib/posts.ts` (Decision 8) and use it on the home page. Verify in `astro dev`
      that the home page shows the same numbers as before: `Post #01` on the oldest post,
      the highest number on the newest.
- [x] 2.3 Create `src/pages/og/[...id].png.ts` with `getStaticPaths` built from
      `getPublishedPosts()` and a `GET` that returns the PNG with `Content-Type:
      image/png`. Verify in dev that `/og/entendendo-ecmascript-modules.png` opens as a
      1200 × 630 PNG showing the uppercase title, the summary, the tag labels, the ISO
      date, the reading time, the post number and the author line with the avatar.
- [x] 2.4 Create `src/pages/og/site.png.ts`. Verify in dev that `/og/site.png` shows the
      site title, tagline, description, address and avatar, with no tags, reading time or
      post number.
- [x] 2.5 Tune the layout against the corpus and settle the Decision 5 thresholds and the
      Decision 6 avatar size. View the images for "Fiz um script de projeção do resultado
      das Eleições no Brasil", "Migrei um app React Native legado para Expo em 18 horas",
      a post with an authored `description`, a post with no tags, and a post with more
      than three tags (a temporary draft, deleted afterwards, if the corpus has none).
      Verify the long titles render at the smaller size and never overlap the summary, the
      summary never overlaps the footer, the `+n` chip appears after three tags, no empty
      tag row is drawn, and the authored description is the summary shown. Record the
      final values in design.md.
- [x] 2.6 With a `draft: true` post present, run `mise exec -- pnpm build`. Verify
      `dist/og/` holds no PNG for the draft, holds one PNG for every `/post/` URL in
      `dist/sitemap-0.xml` plus `site.png`, and that a one-off sharp metadata check in
      the scratchpad reports every file as 1200 × 630 PNG.

## 3. Page metadata

- [x] 3.1 Add the `image` and `type` props to `src/layouts/BaseLayout.astro` and emit
      `og:image` (absolute, from `Astro.site`), `og:image:width`, `og:image:height`,
      `og:image:alt`, `twitter:image` and `og:type` (Decision 7), with the dimensions
      imported from `src/lib/share-image.ts`. Verify the built `dist/index.html` declares
      `https://caiofuzatto.com.br/og/site.png`, width 1200, height 630, an alt naming the
      site, and `og:type` `website`.
- [x] 3.2 Pass the post image and `article` from `src/pages/post/[...id].astro`. Verify
      `dist/post/entendendo-ecmascript-modules/index.html` declares
      `https://caiofuzatto.com.br/og/entendendo-ecmascript-modules.png` with the post
      title as alt and `og:type` `article`, and that `dist/linktree/index.html` and
      `dist/404.html` carry the site default.
- [x] 3.3 Verify with a short scratchpad script that every `og:image` URL found in
      `dist/**/*.html` maps to an existing file under `dist/og/`, so no page points at an
      image the build did not produce.

## 4. Documentation

- [x] 4.1 In `AGENTS.md`, add `pages/og/` and `lib/share-image.ts` to the Layout tree,
      extend the fonts convention to say the share-image renderer reads static WOFF files
      from the Fontsource packages rather than Astro's font pipeline, and add a convention
      that the renderer mirrors `PostCard.astro` with hex colours copied from `@theme`, so
      a change to the card or the palette is made in both places. Verify
      `mise exec -- pnpm exec prettier --check AGENTS.md` passes.
- [x] 4.2 In `README.md`, add `pages/og/` to the Estrutura tree and a sentence in the
      Deploy section saying share images are generated by the build, one per post plus a
      site default. Verify `mise exec -- pnpm exec prettier --check README.md` passes.

## 5. Final verification

- [x] 5.1 Run `mise exec -- pnpm verify` and `mise exec -- pnpm check:posts && mise exec --
      pnpm build`. Verify both pass and that no built page gained a `<script>` tag beyond
      the analytics pair already in `BaseLayout.astro`.
- [ ] 5.2 After the change is pushed, open the Netlify deploy preview's
      `/og/entendendo-ecmascript-modules.png` next to the local one and run the preview's
      post URL through a preview debugger (opengraph.xyz or LinkedIn's Post Inspector).
      Verify the two images match and the debugger shows the card.
- [x] 5.3 Run `mise exec -- openspec validate add-share-images --strict`. Verify it reports
      the change as valid.

## Workflow follow-up

- Archive the change after the deploy preview has been checked and merged.
- After the production deploy, ask LinkedIn's Post Inspector to re-scrape one or two
  already-shared post URLs so their previews pick up the image.
