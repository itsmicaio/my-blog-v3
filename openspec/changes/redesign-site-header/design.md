## Context

See proposal.md — Why. The constraints that shape the approach:

- **Tailwind v4, no config file.** Theme tokens are declared in `@theme` inside
  `src/styles/global.css`. Today that block holds exactly two entries:
  `--color-green: #4e8663` and `--breakpoint-news: 672px`.
- **Zero client-side JavaScript.** The site ships no islands and no scripts beyond the
  analytics tag. Nothing in this change may break that.
- **Colour is hardcoded in more places than the token suggests.** `src/styles/content.css`
  carries literal light-scheme values (`#4b5563` for prose, `#e5e7eb` for inline-code
  backgrounds, `#ffffff` on the code-block language badge) alongside five uses of
  `var(--color-green)`. `PostCard.astro` uses Tailwind's `hover:bg-gray-200`. These were
  invisible while the site was light; inverting the ground exposes all of them.
- **`@apply` does not work in scoped `.astro` `<style>` blocks** under Tailwind v4
  without `@reference`. The project convention is plain CSS with `var(--color-*)` there.
- **Astro 7 has a stable top-level `fonts` config.** `fonts` is an array in the config
  schema and `fontProviders` is exported from `astro/config`, so self-hosting needs no
  new dependency.

## Goals / Non-Goals

**Goals:**

- A token layer expressive enough for a dark UI, not just a single accent swap.
- A header component that is composable and readable, rather than more inline markup in
  the layout.
- Every surface that the dark flip touches stays legible at WCAG AA.
- Disabled controls that are honest: visible, inert, and announced.

**Non-Goals:**

- Redesigning the post card or home index layout. Cards adopt the new tokens; their
  structure and class-level layout stay as they are.
- Changing post body *typography* — sizes, weights, spacing, and the deliberate choice to
  render code in the body sans font. Only colour values in `content.css` change.
- Building any theme-switching machinery, even scaffolding for it.

## Decisions

### Two-tier tokens: brand palette, then semantic roles

The brand kit gives four colours. Four is not enough to build a dark interface — there is
no surface step between the page ground and a panel, no border colour, and no muted text.
Rather than scatter one-off values, `@theme` declares the brand palette and a semantic
layer derived from it:

```
brand            semantic role
-----            -------------
#0D1117  ----->  --color-ground     page background
   (derived)     --color-surface    panel / card background (lifted from ground)
   (derived)     --color-border     hairlines, panel outlines
#2D6A4F  ----->  --color-accent-dim structural green: borders, inactive frames
#52B788  ----->  --color-accent     interactive green: links, active nav, markers
#D8F3DC  ----->  --color-bright     high-contrast detail, headings
   (derived)     --color-muted      labels, metadata, secondary prose
```

*Alternative considered:* keep a single `--color-green` renamed to the new hex. Rejected —
it would leave every surface and text step as a literal hex scattered across files, which
is the exact problem that makes the current dark flip risky.

### Contrast drives which green is allowed where

Measured against the `#0D1117` ground:

| Token | Hex | Ratio vs ground | Permitted use |
| --- | --- | --- | --- |
| Tertiary | `#D8F3DC` | ~16.1:1 | body text, headings — anything |
| Secondary | `#52B788` | ~7.7:1 | link text, active nav, small text |
| Primary | `#2D6A4F` | ~2.96:1 | **decorative non-text only** — frames, dividers |

Primary is the palette's headline colour but fails AA for body text on the dark ground.
It is therefore assigned to structure, never to prose. This is the single most
consequential rule in the design and the easiest one to violate by eye.

It also lands just under the 3:1 that WCAG 1.4.11 requires for the *boundary of a user
interface component*, so it is restricted further: decorative framing only. No control
may depend on it to be identifiable. Every interactive affordance in the header is
identified by its label text (7.49:1 at rest, 7.65:1 on hover), with the frame as
reinforcement rather than the sole cue. Keeping the brand hex exact was preferred over
nudging it lighter to clear a threshold it does not need to meet.

### The reading column stays light, so the post surfaces are untouched

An earlier reading of the mockups took the whole site to be dark. It is not: the artwork
shows a **dark header panel above a cream reading column**, with the near-black ground
visible only in the gutters either side. `PALLETE.png`'s dark canvas is the palette tool's
own chrome, not the page.

That correction removes work rather than adding it. Because the reading column stays
light, `content.css`, `PostCard.astro`, `TagList.astro` and `linktree.astro` need no
change at all — they keep their current styling and their use of `--color-green`, which is
therefore retained in `@theme` alongside the Emerald tokens. Those surfaces belong to the
parallel `redesign-post-list-cards` change; touching them here would collide with it.

The dark text tokens (`bright`, `body`, `muted`) are measured against the ink ground and
are meaningful **only inside the header**. Nothing on the cream column should use them.

### Header as a composed component, not inline markup

The header moves out of `BaseLayout.astro` into its own component with small sub-parts for
the repeated bracketed-button affordance and the disabled control. The layout keeps only a
one-line usage. The `bare` prop continues to suppress it for `/linktree`.

Positioning: the panel is static and in normal flow. `fixed` and the hardcoded `h-28`
spacer are both deleted — the spacer exists only to compensate for the fixed positioning,
so it is removed rather than retuned.

### Disabled controls: `aria-disabled`, not `disabled`

Placeholders render as `<span>` (or `<a>` without `href`) carrying `aria-disabled="true"`,
a dimmed style, `cursor: not-allowed`, and `title="Em breve"`.

A native `<button disabled>` was rejected: it drops out of the tab order and is skipped by
screen readers, so a keyboard or screen-reader user would never learn the feature is
planned. The spec requires these controls stay reachable and be announced as unavailable.

### Mobile: flex-wrap and a scrolling social row

The panel is a flex column of two rows; each row is a flex container that wraps. Below the
`news` breakpoint the groups stack. The social row gets `overflow-x: auto` so four
bracketed buttons never force horizontal page scroll. No disclosure widget, no checkbox
hack, no script.

### Fonts self-hosted via Astro's `fonts` config

`fonts` + `fontProviders.google()` in `astro.config.mjs` downloads and serves both families
from the site's own origin at build time, satisfying the spec's first-party font
requirement. `font-display: swap` plus explicit fallback stacks keep text visible during
load.

*Alternative considered:* `<link>` to Google Fonts. Rejected — it is a third-party request
on every page load and the spec forbids it. `@fontsource` packages were also rejected as
an unnecessary dependency given the built-in path.

## Risks / Trade-offs

- **Dark-surface tokens leak onto the cream column** → They are legible only on ink. The
  token comment in `global.css` says so; anything on the reading column keeps using
  `--color-green` and the existing greys until the post-list change replaces them.
- **Primary green used for text by eye** → Documented in the table above; the semantic
  token name `--color-accent-dim` signals structure-only at the call site.
- **Token collision with the parallel post-list change** → Both changes will want to name
  the cream ground. This change defines `--color-page`; the merge should reconcile to one
  definition rather than two near-identical creams.
- **Cream slightly lowers prose link contrast** → `--color-green` on the cream column
  measures ~3.7:1, against ~4.3:1 on the previous white. Both are already under AA, so
  this introduces no pass-to-fail regression, but the post-list change should pick a
  darker link green when it restyles prose.
- **Font load causes a layout shift** → `swap` with fallback stacks metric-matched as
  closely as practical; both families are self-hosted so they are same-origin and cached.
- **Two typefaces plus multiple weights inflate the payload** → Subset to Latin and ship
  only the weights the design uses; verify the built font payload rather than assuming.
- **The mockup is desktop-only** → Mobile stacking is a design decision made here, not
  copied from a comp. It should be checked in a real viewport before the change is
  considered done.

## Migration Plan

A statically built site with no data or persisted user state, so there is no migration in
the data sense. Deployment is the existing Netlify static build; rollback is reverting the
commit and redeploying.

This change and `redesign-post-list-cards` both alter the same pages and will need
reconciling at merge. They are cleanly separated by surface — this one owns the header,
the page ground and the token layer; that one owns the cards, tags and post body — so the
expected conflicts are in `global.css` (`@theme`) and `BaseLayout.astro`, not in the
components.

`AGENTS.md` must be updated in the same change: it currently documents the light-only rule
and forbids reintroducing a theme toggle without a spec change. Leaving it stale would
leave the repository instructing future work to undo this.

## Open Questions

- **The YouTube channel URL.** Not yet supplied. It does not affect the specs, the
  approach, or the task breakdown — the link entry and glyph are needed either way — but
  the button cannot ship until the value is provided.
- **What `[> CRT]` eventually toggles.** Deliberately unresolved. The spec commits only to
  a placeholder, so this can be answered when the control is actually built without
  invalidating anything here.
