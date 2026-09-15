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
  `var(--color-green)`, and `PostCard.astro` uses Tailwind's `hover:bg-gray-200`. They are
  all fine on the cream page and are left alone — but they are why the page ground could
  not simply be inverted.
- **`@apply` does not work in scoped `.astro` `<style>` blocks** under Tailwind v4
  without `@reference`. The project convention is plain CSS with `var(--color-*)` there.
- **Astro 7 has a stable top-level `fonts` config.** `fonts` is an array in the config
  schema and `fontProviders` is exported from `astro/config`, so self-hosting needs no
  new dependency.

## Goals / Non-Goals

**Goals:**

- A token layer covering both of the header's grounds, not just a single accent swap.
- A header component that is composable and readable, rather than more inline markup in
  the layout.
- Every text pair in the header clears WCAG AA, measured rather than eyeballed.
- Disabled controls that are honest: visible, inert, and announced.

**Non-Goals:**

- Redesigning the post card or home index. Those surfaces are untouched and belong to the
  parallel `redesign-post-list-cards` change.
- Changing post body styling at all. `content.css` is untouched.
- Building any theme-switching machinery, even scaffolding for it.

## Decisions

### Tokens sampled from the design, grouped by the surface they live on

The four-colour brand kit is not enough to build the header — it has no surface steps, no
well colour behind the nav, and no muted text. Rather than guess at the intermediate
values, they were read straight out of the design by decoding the PNG and sampling pixels,
so `@theme` carries the artwork's actual colours.

The header has **two** grounds, and a token legible on one is illegible on the other. The
tokens are therefore grouped by surface, and the group is the rule:

```
page           --color-page         #f4f1ea   the whole page

header bar     --color-header       #131b17   the dark upper row
  (on dark)    --color-well         #0a0e14   nav group recess
               --color-well-soft    #1a2520   disabled control recess
               --color-bright       #f7f9f6   author name
               --color-on-dark      #bfc9c1   nav items
               --color-muted        #8c918e   tagline

social band    --color-band         #dfd9cb   the cream lower row
  (on light)   --color-band-raised  #eae5d9   button fill
               --color-band-border  #99a696   button hairline
               --color-band-ink     #1e4d3a   button label
               --color-rule         #285441   the band's bottom edge

greens         --color-accent-dim   #2d6a4f   active nav fill, band label
               --color-accent       #52b788   hover
               --color-accent-soft  #a8e7c5   label on the active fill
```

*Alternative considered:* a single neutral ramp shared by both surfaces. Rejected — the
two grounds are far enough apart that one ramp would have needed per-use overrides
anyway, and grouping by surface makes the "don't use this here" rule self-evident at the
call site.

### Contrast

Every text pair in the design was measured. All clear AA, two only barely:

| Pair | Ratio | Need |
| --- | --- | --- |
| author name on bar | 16.57:1 | 4.5 |
| nav item on well | 11.36:1 | 4.5 |
| band label on fill | 7.67:1 | 4.5 |
| tagline on bar | 5.48:1 | 4.5 |
| band label on band | 4.54:1 | 4.5 |
| active nav label on fill | 4.53:1 | 4.5 |

The last two have almost no headroom: darkening the band or lightening the active fill by
a step would drop them under. Treat those four values as fixed.

`--color-band-border` is 1.81:1 against the band and `--color-accent-dim` is 2.96:1
against the bar — both under the 3:1 that WCAG 1.4.11 asks for the *boundary* of a
control. They are therefore decorative only: every affordance is identified by its label
text, never by its frame. Keeping the sampled hexes exact was preferred over nudging them
to clear a threshold they do not need to meet.

### Disabled controls are deliberately low-contrast

`SOBRE`, `PT / EN` and `[> CRT]` render dimmed, below the AA floor. That is allowed —
WCAG 1.4.3 exempts inactive controls — and it is what the design shows. The accessible
affordance is not contrast but `aria-disabled` plus a preserved tab stop.

Note the design renders `[> CRT]` in bright `#52b788`, as though live. It is dimmed here
instead, because the feature does not exist; that was an explicit instruction and it
overrides the comp.

### The page stays light, so the post surfaces are untouched

Two successive readings of the mockups were wrong before the design settled, both worth
recording so they are not repeated:

1. The site is **not** dark. `PALLETE.png`'s dark canvas is the palette tool's own chrome,
   not the page.
2. There is **no** dotted gutter ground. Those dots are Figma's canvas texture showing
   around the artboard, and the near-black frame around the comp is the Figma backdrop —
   not part of the design. The page is simply cream, edge to edge, with the header as a
   full-bleed bar across it.

The correction removes work rather than adding it. Because the page stays light,
`content.css`, `PostCard.astro`, `TagList.astro` and `linktree.astro` need no change at
all — they keep their current styling and their use of `--color-green`, which is therefore
retained in `@theme` alongside the sampled tokens. Those surfaces belong to the parallel
`redesign-post-list-cards` change; touching them here would collide with it.

**Reading a comp: check what is artwork and what is tooling.** Both mistakes came from
treating the surrounding canvas as design. When a mockup arrives as a screenshot rather
than a frame export, the safest move is to sample the artboard's own pixels — which is how
the final palette was derived.

### Header as a composed component, not inline markup

The header moves out of `BaseLayout.astro` into its own component with small sub-parts for
the repeated bracketed-button affordance and the disabled control. The layout keeps only a
one-line usage. The `bare` prop continues to suppress it for `/linktree`.

Positioning: the bar is static and in normal flow. `fixed` and the hardcoded `h-28`
spacer are both deleted — the spacer exists only to compensate for the fixed positioning,
so it is removed rather than retuned.

### Disabled controls: `aria-disabled`, not `disabled`

Placeholders render as `<span>` (or `<a>` without `href`) carrying `aria-disabled="true"`,
a dimmed style, `cursor: not-allowed`, and `title="Em breve"`.

A native `<button disabled>` was rejected: it drops out of the tab order and is skipped by
screen readers, so a keyboard or screen-reader user would never learn the feature is
planned. The spec requires these controls stay reachable and be announced as unavailable.

### Mobile: flex-wrap and a scrolling social row

The header is a flex column of two rows; each row is a flex container that wraps. Below the
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

- **A token is used on the wrong ground** → The two groups are legible only on their own
  surface. `global.css` groups them by surface with a comment saying so; anything on the
  cream page keeps using `--color-green` and the existing greys until the post-list change
  replaces them.
- **Primary green used for text by eye** → Documented in the table above; the semantic
  token name `--color-accent-dim` signals structure-only at the call site.
- **Token collision with the parallel post-list change** → Both changes will want to name
  the cream ground. This change defines `--color-page`; the merge should reconcile to one
  definition rather than two near-identical creams.
- **Cream slightly lowers prose link contrast** → `--color-green` on the cream page
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
