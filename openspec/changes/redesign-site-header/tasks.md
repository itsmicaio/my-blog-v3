## 1. Design tokens and typography foundation

- [x] 1.1 Add the design system's palette and names to the `@theme` block of
      `src/styles/global.css` — grounds, recesses, the emerald ramp and `--color-pixel-black`
      as listed in design.md — keeping `--color-green` for the surfaces that still use it;
      verify `pnpm build` succeeds and the generated CSS contains the new custom properties.
- [x] 1.2 Apply the cream page ground to `html` and `body` in the base layer of
      `src/styles/global.css`, keeping `color-scheme: light`; verify the page renders cream
      with no white flash on first paint and no background pattern.
- [x] 1.3 Add the top-level `fonts` block to `astro.config.mjs` using `fontProviders.google()`
      for Space Grotesk and Space Mono, restricted to the Latin subset and only the weights
      the design uses, with `display: swap` and explicit fallback stacks; verify the build
      emits font files into the output directory.
- [x] 1.4 Wire the two families into `@theme` as font tokens and apply the body family in the
      base layer, replacing the system sans stack; verify rendered pages use Space Grotesk
      and that no request to a third-party font host is made on load.

## 2. Header component

- [x] 2.1 Add a `tagline` field to `SITE` in `src/consts.ts` carrying "DEV DIARY & TECH BLOG";
      verify `pnpm check` passes with the widened type.
- [x] 2.2 Add a YouTube glyph to `src/components/SocialIcon.astro` alongside the existing
      three; verify it renders at the same size and inherits `currentColor`.
- [ ] 2.3 **BLOCKED — needs the channel URL from the user.** Add the YouTube entry to
      `SOCIAL_LINKS` in `src/consts.ts` and reorder the list to GitHub, LinkedIn, Instagram,
      YouTube to match the design; verify all four render in that order.
- [x] 2.4 Build the shared bracketed-button sub-component used by the social links and
      controls; verify it renders both an enabled anchor and an inert variant from the same
      component.
- [x] 2.5 Build the disabled-control presentation — `aria-disabled="true"`, dimmed styling,
      `cursor: not-allowed`, `title="Em breve"`, no `href` — as specified in design.md;
      verify with a keyboard that the control receives focus and that a screen reader
      announces it as unavailable.
- [x] 2.6 Build the header component's brand block: avatar, author name with the `[1P]`
      badge, and the tagline beneath; verify the avatar and name both link to the home page.
- [x] 2.7 Build the navigation group with ARTIGOS linking to `/` and marked as the current
      section, SOBRE disabled, and RSS linking to `/rss.xml`; verify the RSS link serves the
      existing feed and that the current-section marking appears on the home page.
- [x] 2.8 Add the PT / EN and `[> CRT]` controls using the disabled presentation from 2.5;
      verify clicking either one neither navigates nor changes the page.
- [x] 2.9 Build the second row: the filled marker plus "CONNECT // REDES SOCIAIS" label and
      the four social buttons, each opening in a new tab with `rel="noopener noreferrer"`;
      verify a click opens the profile in a new tab.
- [x] 2.10 Assemble the two rows into a full-bleed bar — dark upper row, cream social band,
      no surrounding border — with colours sampled from the design; verify the rendered
      output matches the sampled hexes and the bar:band height ratio is close to the comp.

## 3. Layout integration

- [x] 3.1 Replace the inline header markup in `src/layouts/BaseLayout.astro` with the new
      component, and delete both the `fixed` positioning and the `h-28` spacer div; verify no
      empty spacer element remains in the rendered output.
- [x] 3.2 Confirm the header scrolls away with page content rather than pinning; verify on a
      long post that no content is hidden beneath it at any scroll position.
- [x] 3.3 Confirm the `bare` prop still suppresses the header on `/linktree`; verify that
      page renders without it.

## 4. Responsive and no-script behaviour

- [x] 4.1 Implement the stacking behaviour so the header's groups wrap to separate rows below
      the `news` breakpoint; verify at 375px that the groups stack and the page does not
      scroll horizontally.
- [x] 4.2 Lay the profile links out as a two-column grid below the `news` breakpoint and a
      single row above it, with no scrolling anywhere; verify at 320px that four buttons form
      a 2x2 block, no label is clipped, and neither the page nor the band scrolls.
- [x] 4.3 Confirm the header needs no client-side JavaScript; verify it renders and lays out
      identically with scripting disabled, and that the build output ships no new script
      beyond the existing analytics tag.

## 5. Page ground

Groups 5 and 6 as originally written assumed the whole site went dark. It does not — the
mockups show a full-bleed dark header bar on a cream page — so the post surfaces need no
colour work and are left to the parallel `redesign-post-list-cards` change. See design.md,
"The page stays light".

- [x] 5.1 Retain `--color-green` in `@theme` so `PostCard.astro`, `TagList.astro`,
      `linktree.astro` and `content.css` keep rendering unchanged; verify those four files
      are untouched in the diff and the post index still styles correctly.
- [x] 5.2 Set the cream page ground globally rather than wrapping the slot in a column;
      verify every page renders cream and `/linktree` still bypasses the header via `bare`.
- ~~5.3 Re-point `linktree.astro`~~ — not needed; `--color-green` is retained.
- ~~5.4 Grep for remaining light-scheme utilities~~ — not needed; the column stays light.

## 6. Post body colours

- ~~6.1–6.5~~ — not applicable. `content.css` is unchanged: `#4b5563` prose on the cream
  column measures 6.5:1, comfortably over AA, so there is no contrast regression to fix.

## 7. Documentation

- [x] 7.1 Update `AGENTS.md` to replace the light-only design rule and the instruction not to
      reintroduce a theme toggle, describing the dark Emerald palette, the two typefaces and
      the disabled placeholder controls; verify no statement in the file contradicts the
      shipped design.

## 8. Verification

- [x] 8.1 Run `mise exec -- pnpm verify` and confirm format, lint, type-check and asset checks
      all pass.
- [x] 8.2 Audit contrast across the home page, a post page, the 404 page and the header at AA;
      verify body text reaches 4.5:1 and that `#2D6A4F` is used only for non-text elements.
- [x] 8.3 Review the built output size for the added font payload; verify only the intended
      subsets and weights shipped.
- [x] 8.4 Check the header and a post page in a real narrow viewport, since the source mockup
      was desktop-only; verify the stacking decision holds up in practice.
