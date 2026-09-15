## 1. Foundations

- [x] 1.1 Add the self-hosted monospace face: place a subset `.woff2` under `public/fonts/`
      alongside its OFL license file, declare `@font-face` with `font-display: swap` in
      `src/styles/global.css`, and expose a `--font-mono` token in the `@theme` block.
      Verify by loading `/` with the network panel open — exactly one font request, and it
      is same-origin.
- [x] 1.2 Add `readingTime(post)` to `src/lib/posts.ts`, reusing the module-private
      `toPlainText()` so code blocks are excluded; 200 wpm, rounded, floored at 1 minute.
      Keep `toPlainText` unexported. Verify by spot-checking three posts of different
      lengths — the 71-word `esse-vai-ser-meu-diario` returns 1, and the 2267-word
      `diagram-as-code-com-c4-model-structurizr` returns 7 (1312 words once its code
      blocks are stripped — the raw count would have given 11).
- [x] 1.3 Add a helper for the compact ISO publication date derived in UTC, so the card's
      date cannot differ by a day from the post page's `formatDate()` output. Verify a post
      with a `pubDate` near midnight renders the same calendar day in both places.

## 2. Tag chips without touching post pages

- [x] 2.1 Add a `variant: 'pill' | 'terminal'` prop to `src/components/TagList.astro`
      defaulting to `'pill'`, keeping `tagLabel()` and the `maxTags` overflow-count logic
      shared between both variants. Verify `/post/<slug>/` renders tag pills byte-identically
      to before by diffing the built HTML for one post against the pre-change build.
- [x] 2.2 Implement the `terminal` variant's bordered mono chip styling. Verify a card with
      five tags still shows three labels plus a "+2" indicator, per the `site-chrome`
      overflow requirement.

## 3. The card

- [x] 3.1 Rebuild `src/components/PostCard.astro` as the card: top strip (`> POST #NN`,
      `N MIN READ`), tag chips via the `terminal` variant, uppercase title, existing
      `excerpt()` output, divider, and footer row (date, `LER POST >`). Keep the whole card a
      single `<a>` and keep the `<li>` wrapper. Verify clicking anywhere on a card opens the
      post.
- [x] 3.2 Accept the post number as a prop computed by the caller rather than derived inside
      the card. Verify the card renders correctly given an arbitrary number.
- [x] 3.3 Move the `(rascunho)` draft badge into the top strip. Verify by setting
      `draft: true` on a post locally that the badge appears in dev and the post is absent
      from `pnpm build` output.
- [x] 3.4 Mark decorative chrome (`>` prefixes, `LER POST >`) `aria-hidden` or render it via
      CSS `content`. Verify with a screen reader or accessibility tree inspection that a card
      announces title, tags, date and reading time — and does not announce `LER POST >` as a
      second link.
- [x] 3.5 Pin the footer row to the card's bottom with a flex column and `margin-top: auto`.
      Verify a one-tag card with a two-word title matches the height of a three-tag card with
      a nine-word title in the same row.

## 4. Grid and panel

- [x] 4.1 In `src/pages/index.astro`, compute each post's number as `posts.length - index`
      over the rendered array and pass it to the card. Verify the newest post shows the
      highest number, the oldest shows 1, and numbers decrease by one down the page.
- [x] 4.2 Replace the single-column `<ul>` with a responsive grid: one column on narrow
      viewports, scaling up to three on wide ones, reusing the existing `news: 672px`
      breakpoint. Verify at 375px, 800px and 1280px that columns are 1, 2 and 3 and that the
      page never scrolls horizontally.
- [x] 4.3 Wrap the grid in the framed panel with the `RECENT LOGS // ARTIGOS RECENTES`
      section bar and the decorative `[SELECT POST WITH <CR>]` text, marked `aria-hidden`.
      Verify `body` has no new background rule and that `/post/*`, `/linktree` and `/404` are
      visually unchanged.

## 5. Hover and motion

- [x] 5.1 Implement the hover/focus state in the card's scoped `<style>` block as plain CSS
      using `var(--color-green)` — not `@apply` — bound to `:hover, :focus-visible` on the
      `<a>`: translate the card, reveal the hard offset shadow, darken the border, shift the
      title to green. Verify tabbing to a card produces the same visible state as hovering it.
- [x] 5.2 Confirm the state animates only `transform` and `box-shadow`. Verify by hovering a
      card in the middle of a full row and observing that no neighbouring card moves and the
      row height does not change.
- [x] 5.3 Add the `prefers-reduced-motion: reduce` branch that drops the translate and keeps
      the colour change. Verify with the reduced-motion emulation in browser devtools that the
      card still visibly changes on hover but does not move.

## 6. Verification

- [x] 6.1 Run `mise exec -- pnpm verify` (format:check, lint, astro check, check:assets) and
      confirm it passes clean.
- [x] 6.2 Build and diff the output for `/post/*`, `/linktree` and `/404` against a
      pre-change build to prove the change did not leak beyond the home page.
- [x] 6.3 Confirm no new client-side JavaScript shipped: inspect the built `/` output and
      verify the only script tags are the existing analytics ones.
- [x] 6.4 Run `mise exec -- openspec validate --strict` against this change and confirm the
      delta spec parses with all requirements and scenarios recognised.
