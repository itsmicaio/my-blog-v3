## Why

The site currently wears the visual identity it inherited from the v2 Gatsby blog: a
light scheme built on a single green accent, with a header that exists only to carry an
avatar, a name and three profile links. A new brand direction — "Emerald 8-Bit Arcade", a
dark terminal/arcade aesthetic — replaces it, and the header is the first surface to
adopt it. The header is also where the site's navigation has been missing: there is no
way to reach the RSS feed from a page, and no place for the sections still to come.

This change lands the header and the design tokens it depends on. It deliberately stops
short of the post index, which has its own mockup and will follow as a separate change.

## What Changes

- **BREAKING (visual):** The page gains the Emerald identity: a cream page with the header
  as a full-bleed dark bar across the top, its second row a lighter cream band. The site
  stays a single light scheme — it does not become dark.
- The Emerald palette is added as semantic tokens alongside the existing
  `--color-green` (`#4e8663`), which the post index, linktree and post body keep using
  until those surfaces adopt the new identity in their own change.
- Two self-hosted typefaces are introduced — Space Grotesk for headings and body copy,
  Space Mono for labels — replacing the system sans stack.
- The header is rebuilt as a two-row bordered panel: brand block (avatar, name, `[1P]`
  badge, tagline), a three-item nav, two disabled placeholder controls, and a row of
  social links.
- **BREAKING (behaviour):** The header stops being pinned to the viewport. It becomes a
  static panel that scrolls with the page, and the spacer element that compensated for
  the fixed positioning is removed.
- Navigation gains `ARTIGOS` (home, active) and `RSS` (the existing feed at `/rss.xml`),
  which was previously unreachable from the site itself.
- `SOBRE`, the `PT / EN` language switch and the `[> CRT]` display-mode control render as
  visible but disabled placeholders. None of them have an implementation behind them, and
  none is promised by this change.
- A fourth social link, YouTube, joins GitHub, LinkedIn and Instagram.

## Capabilities

### New Capabilities

None. This change modifies an existing capability only.

### Modified Capabilities

- `site-chrome`: Two requirements are rewritten.
  - **Site visual identity** — currently mandates a single light scheme on green
    `#4e8663` and forbids any theme toggle outright, with a scenario asserting that no
    theme control is offered. It stays a single light scheme but is restated on the
    Emerald palette — a cream page with a full-bleed dark header bar whose second row is a
    cream band — and now permits a disabled display-mode placeholder. The existing
    guarantees that the site does not follow the reader's OS colour preference and stays
    legible on mobile without horizontal scroll are retained.
  - **Persistent site header** — currently specifies avatar, name and three profile
    links, pinned to the top of the viewport with content never obscured beneath it. It
    becomes a static panel and gains the tagline, the nav, the disabled controls and the
    fourth social link.

## Impact

**Code**

- `src/layouts/BaseLayout.astro` — header markup replaced; fixed positioning and the
  hardcoded spacer removed.
- `src/components/` — a new header component (and its sub-parts) is introduced;
  `SocialIcon.astro` gains a YouTube glyph.
- `src/styles/global.css` — Emerald tokens added alongside `--color-green`, the cream page
  ground applied to `html` and `body`, font families wired in.
- `src/consts.ts` — a `tagline` field is added to `SITE`; `SOCIAL_LINKS` gains a YouTube
  entry and is reordered to match the design.
- `astro.config.mjs` — a top-level `fonts` block is added.

**Not touched — owned by the parallel `redesign-post-list-cards` change**

`PostCard.astro`, `TagList.astro`, `linktree.astro` and `content.css` keep their current
light styling and their use of `--color-green`. They sit on the new cream column without
modification.

**Dependencies**

None added. Font self-hosting uses Astro's built-in `fonts` configuration and
`fontProviders`, so no runtime third-party request and no new package.

**Documentation**

`AGENTS.md` describes the v2 palette and instructs that a theme toggle must not be
reintroduced without a spec change. It must be updated alongside this change, or the
repository's own instructions will contradict the shipped design.

**Deliberately untouched**

`/linktree` renders `bare`, without the site header, and is unchanged. Post body
typography in `src/styles/content.css` — including the deliberate choice to render code
blocks in the body sans font — is unchanged here.

**Open question**

The YouTube channel URL has not been supplied yet. It is the single unresolved input; the
link cannot ship until it is provided.
