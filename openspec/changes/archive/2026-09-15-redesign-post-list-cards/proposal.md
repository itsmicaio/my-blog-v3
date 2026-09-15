## Why

The home page renders every post as an undifferentiated row of text — title, grey tag
pills, excerpt — in a single 672px column. With 44 posts it is a long, flat wall with no
scanning affordances and no visual identity beyond the green header. A terminal/log
aesthetic has been designed for the site, and the post list is the surface where it pays
off most: a card grid makes 44 entries scannable, and the card chrome gives each entry
enough structure to carry a hover state that signals what is clickable.

## What Changes

- The home index becomes a responsive card grid (1 column → 2 → 3) instead of a single
  vertical column of text rows.
- The grid is wrapped in a framed panel with a section bar reading
  `RECENT LOGS // ARTIGOS RECENTES` and a decorative `[SELECT POST WITH <CR>]` affordance.
- Each entry becomes a bordered card with a top strip (`> POST #NN` and `N MIN READ`),
  mono tag chips, an uppercase title, the existing 120-character excerpt, and a footer
  row carrying the publication date and a `LER POST >` cue.
- Two new derived values appear on cards: a **reading time** computed from the post body,
  and a **post number** — the entry's 1-based position in the rendered list counted from
  the oldest, so numbers descend down the page.
- The publication date appears on the home page for the first time; it was previously
  only on post pages.
- Cards gain a CSS-only hover/focus state: the card lifts with a hard offset shadow, its
  border darkens, and the title shifts to green.
- A single self-hosted monospace font is added for the card's labels and chips. Titles and
  body copy stay on the current system sans stack.

Not breaking: every post URL, the ordering, the set of posts listed, and the whole-entry
link target are unchanged.

## Capabilities

### New Capabilities

None. This change restyles an existing surface and adds fields derived from data the
content model already carries.

### Modified Capabilities

- `site-chrome`: the "Home page lists every published post" requirement currently fixes
  each entry's content at title, up to three tag labels, and the short summary. It must
  now also cover the post number, reading time, publication date, the card's hover and
  keyboard-focus state, and reduced-motion behavior. Ordering, the no-pagination rule,
  and the whole-entry-is-one-link rule are unchanged.

## Impact

**Changed**

- `src/pages/index.astro` — wraps the grid in the panel and section bar.
- `src/components/PostCard.astro` — rebuilt as the card; gains scoped card CSS.
- `src/lib/posts.ts` — new reading-time helper.
- `src/styles/global.css` — the self-hosted mono `@font-face` and its theme token.

**Added**

- `public/fonts/` — one self-hosted woff2 face.
- A card-local tag chip treatment (see below).

**Explicitly out of scope** — the header, post pages, `/linktree`, the 404 page, the
`body` background, the dark "Emerald 8-Bit Arcade" palette, the `CRT` and `PT / EN`
controls from the header mockup, and any content-model change. Each is a separate change.

**Constraint to respect**: `src/components/TagList.astro` is shared with
`src/pages/post/[...id].astro`. Restyling it in place would change post pages, which this
change scopes out — the card's chips must be introduced without altering how TagList
renders on a post page.

**Risks**

- Post numbers are positional, not identifiers. They are stable while publishing is
  append-only; a backdated post renumbers every entry above it, and drafts (visible in dev,
  absent from production) make dev and production numbering disagree. Accepted: the number
  appears nowhere else on the site and is decorative chrome.
- The new mono font is the first web font the site loads. It is scoped to small labels, so
  a swap is low-impact, but it is a new network request on a site that previously made none.
- 32 of 44 posts carry exactly one tag, so most cards show a single chip where the design
  mockup showed two or three. The card must not look broken with one chip, or with none.
