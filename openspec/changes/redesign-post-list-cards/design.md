## Context

See `proposal.md` — Why. The constraints that actually shape the approach:

- `src/components/TagList.astro` is rendered by both `PostCard.astro` and
  `src/pages/post/[...id].astro`. Post pages are out of scope, so TagList cannot simply be
  restyled.
- `AGENTS.md`: the site ships no client-side JavaScript beyond the analytics tag and has no
  islands. Tailwind v4 `@apply` does not work in scoped `.astro` `<style>` blocks without
  `@reference`; plain CSS with `var(--color-*)` is the house style there.
- The `site-chrome` "Site visual identity" requirement fixes the palette at a single light
  scheme accented with green `#4e8663`, with no dark mode and no theme toggle.
- The design mockups (`POSTS_LIST.png`, `POST_HOVER_EXAMPLE.png`, `PALLETE.png`,
  `HEADER.png`) are not internally consistent: the palette sheet and header are dark, the
  card sheets are light. They are treated as reference, not as a contract.
- Content reality the mockups do not reflect: 32 of 44 posts carry exactly one tag; the
  mockup's `MIN READ` values follow no consistent words-per-minute formula and are
  placeholders; the mockup's `CATEGORIA` field corresponds to nothing in the content model.

## Goals / Non-Goals

**Goals:**

- Keep the change presentation-only: no content-model change, no new routes, no migration.
- Contain every visual change inside the home page's post list, so `/post/*`, `/linktree`
  and `/404` render byte-identically.
- Keep the zero-JavaScript guarantee intact — the hover state is CSS only.

**Non-Goals:**

- Reproducing the mockups pixel-for-pixel where they conflict with the content model or
  the existing palette.
- Establishing design tokens or a component system for the eventual site-wide redesign.
  This change may add one local token; generalising is a later change's job.

## Decisions

### Derive every card colour from `--color-green: #4e8663`

The brand kit proposes `#2D6A4F` / `#52B788` / `#D8F3DC`, but the header — which stays on
this page — is `#4e8663`. Adopting the kit would put two unrelated greens side by side
within one viewport, and would contradict the "Site visual identity" requirement without a
spec change. Card border, title, hover title and chip fill are therefore shades derived
from the existing green.

*Alternative:* adopt the kit greens now and retune the header later. Rejected — it makes
the page visibly worse in the interim for a benefit that only lands in a future change.

### Frame the grid with a panel, leave `body` alone

In the mockup the cards sit on a dark olive ground; that ground is what separates the
cream cards from the page. Painting `body` would change every route, breaking the scope
boundary. Instead the panel itself carries the cream fill and dashed border, giving the
cards their contrast locally.

*Alternative:* scope an olive `body` background to `/` only. Rejected — it makes the home
page diverge from post pages, which is a worse inconsistency than the one it fixes.

### Add a `variant` prop to TagList rather than a second component

TagList owns `tagLabel()` lookup and the `maxTags` / overflow-count behavior, and that
overflow behavior is specified in `site-chrome`. Duplicating it into a card-only component
risks the two drifting. Astro's scoped styles do not reach into a child component's
markup, so the card cannot restyle TagList's chips from outside either. A
`variant: 'pill' | 'terminal'` prop defaulting to `'pill'` keeps post pages untouched by
construction — the post page passes no variant.

*Alternative:* a separate `CardTagList.astro`. Rejected — duplicates specified logic.

**Discovered during implementation:** the prop alone is not sufficient. Giving TagList its
own scoped `<style>` block made Astro emit that CSS *and* a `data-astro-cid-*` attribute on
every page rendering the component — so post pages picked up ~400 bytes of dead chip CSS
and changed markup, even though the pills looked identical. TagList therefore carries no
`<style>` block at all; the terminal chips are styled from `PostCard.astro` as
`.card :global(.chip)`, anchored under `.card` so the rules cannot reach another page. The
build diff in task 2.1 is what caught this, and it is the reason that task is worth
keeping in any future change that touches a shared component.

### Compute reading time in `posts.ts`, reusing the existing prose extraction

`toPlainText()` already strips fenced code, inline code, images, links and Markdown syntax
— that is why `excerpt()` excludes code. Reading time needs exactly the same text, so
`readingTime(post)` goes in the same module and keeps `toPlainText` private. 200 wpm,
rounded, floored at 1 minute. All of it runs at build time; the site stays static.

*Alternative:* count raw `post.body` words. Rejected — code-heavy posts like the C4 and
AdminJS ones would be wildly overstated.

### Post number is `posts.length - index` over the rendered array

Posts are already sorted newest-first by `getPublishedPosts()`, so the ordinal counted from
the oldest is just `length - index`. Computing it over the rendered array — rather than
over all files on disk — is what makes the development/production divergence fall out for
free: in development the array includes drafts, in production it does not, and each
environment is internally consistent without special-casing.

*Alternative:* an explicit `logId` frontmatter field, permanent across backdating and
drafts. Rejected — it reintroduces the 44-file migration this change exists to avoid, for
a number that is decorative.

### Animate `transform` and `box-shadow` only

The hover lift must not reflow the grid. Changing `border-width`, `margin` or `padding`
would resize the card and shift its row neighbours — and in a grid with stretched equal
heights, that shifts the whole row. `transform: translate()` plus a `box-shadow` that
appears on hover produces the mockup's 8-bit offset lift while leaving layout untouched.
The border "thickens" visually by darkening its colour and adding an inset shadow, not by
changing its width.

The state is bound to `:hover, :focus-visible` on the card's single `<a>`, so keyboard and
pointer share one code path. Under `prefers-reduced-motion: reduce`, the transform is
dropped and the colour change retained.

### Equal card heights via grid stretch + a pinned footer

Titles run from two words to nine and most posts have one tag, so natural card heights
vary a lot. Grid items stretch by default; inside each card a flex column with
`margin-top: auto` on the footer row pins the date/`LER POST >` row to the bottom.

The excerpt is left to `excerpt()`'s existing 120-character prune, which already appends
its own `…`. A CSS `line-clamp` on top would risk a doubled ellipsis, so if a clamp is used
as an overflow guard it must be sized so the pruned text never actually reaches it.

### Decorative chrome is hidden from assistive tech

`> ` prefixes, `[SELECT POST WITH <CR>]`, and the `LER POST >` cue are visual flavour. The
`<CR>` string in particular implies a keyboard affordance the site does not implement.
These are marked `aria-hidden`, or rendered as CSS `content`, so screen readers announce
the title, tags, date and reading time and nothing else. `LER POST >` must not be an
anchor — the card is already a single `<a>`, and nesting anchors is invalid.

### One self-hosted mono face, `font-display: swap`

The mono labels carry the terminal identity; a system mono stack renders differently per
OS and loses it. One subset woff2 in `public/fonts/`, declared via `@font-face` in
`global.css` with a `--font-mono` theme token, applied only to card labels and chips. Body
copy and titles keep the system sans stack, so a font failure degrades labels rather than
the page.

*Alternative:* Google Fonts CDN. Rejected — a third-party request on a site that currently
makes none, for one small face.

### Dates render as compact ISO

`formatDate()`'s pt-BR long form ("22 de outubro de 2024") does not fit the footer row
opposite `LER POST >`. `YYYY-MM-DD` suits the log aesthetic and is locale-neutral. It is
derived in UTC, matching `formatDate`'s existing `timeZone: 'UTC'`, so the displayed day
cannot drift from the post page's.

## Risks / Trade-offs

- **Post numbers are not stable identifiers.** A backdated post renumbers everything above
  it → accepted; the number appears nowhere else on the site, is marked `aria-hidden`-adjacent
  decorative chrome, and is documented as positional in the spec.
- **First web font on a zero-font site.** → subset to the glyphs the labels use, `swap`,
  and scope it to labels so a slow load never blocks reading a title or excerpt.
- **Cards with one tag look sparser than the mockup.** → the chip row reserves its height
  and the footer is pinned, so a one-chip card matches its neighbours' height rather than
  collapsing.
- **TagList gains a second rendering mode.** → the default is the existing pill style and
  post pages pass no variant, so the risk is a compile-time prop mistake rather than a
  silent visual regression. Verify post pages visually once.
- **The panel's cream fill on the current body may read as a floating slab.** → this is the
  accepted cost of leaving `body` untouched; revisit when the site-wide redesign lands.
- **Scope leak into post pages** is the main failure mode of this change → `pnpm verify`
  plus a visual check of `/post/<slug>/` before and after.

## Open Questions

None. Reading-time constant (200 wpm), date format, numbering basis, palette source, font
strategy and the TagList approach were all settled before this change was written.
