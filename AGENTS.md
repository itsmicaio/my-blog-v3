# caiofuzatto.com.br — v3

Astro 7, Tailwind v4, Markdown content collections, deployed to Netlify as a
fully static site. Ported from the Gatsby blog at `itsmicaio/my-blog-v2`, keeping
its URLs unchanged. The v2 visual design has since been replaced by the dark
"Emerald 8-Bit Arcade" identity.

## Tooling

Toolchain versions are pinned in `mise.toml` (Node, pnpm, OpenSpec). Always run
commands through mise:

```
mise exec -- pnpm dev
mise exec -- pnpm verify
```

## Commands

| Command             | What it does                                                |
| ------------------- | ----------------------------------------------------------- |
| `pnpm dev`          | Dev server                                                  |
| `pnpm build`        | Production build into `dist/`                               |
| `pnpm preview`      | Serve the built output                                      |
| `pnpm check`        | `astro check` — types and Astro diagnostics                 |
| `pnpm lint`         | ESLint                                                      |
| `pnpm format`       | Prettier, write mode                                        |
| `pnpm check:assets` | Every post image resolves to a file in `public/`            |
| `pnpm verify`       | format:check + lint + check + check:assets — run before PRs |

When starting the dev server, use background mode: `astro dev --background`.
Manage it with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Layout

```
src/
  components/      .astro components
  content/blog/    posts (.md) — one file per post, filename == URL slug
  content.config.ts  collection schema — frontmatter contract lives here
  layouts/         page shells
  lib/             shared helpers (post querying, excerpts, dates, tag labels)
  pages/           file-based routes — / , /post/<slug>/ , /linktree , /404
  styles/global.css   Tailwind entry + reset + theme
  styles/content.css  post body typography and code blocks
  consts.ts        site metadata and social links
public/uploads/    all post images, referenced as /uploads/<file>
scripts/           repo checks (post asset verification)
```

## Conventions

- Site metadata lives in `src/consts.ts`; `astro.config.mjs` reads `site` from it.
- The design is light: a cream page (`--color-page`, `#f4f1ea`) with the header as a
  full-bleed dark bar across the top. The "Emerald 8-Bit Arcade" palette lives in the
  `@theme` block of `src/styles/global.css`, with a custom `news: 672px` breakpoint.
  `--color-green` (`#4e8663`) is v2's accent and is still used by the post index,
  linktree and post body until those surfaces adopt the new identity.
- The header has **two grounds**, and the tokens are grouped by which one they are
  legible on. The `header bar` group (`--color-header`, `--color-well`,
  `--color-bright`, `--color-on-dark`, `--color-muted`) works only on the dark row;
  the `social band` group (`--color-band`, `--color-band-raised`,
  `--color-band-border`, `--color-band-ink`) only on the cream row. Don't cross them,
  and don't use either on the page. `--color-band-border` (1.81:1) and
  `--color-accent-dim` on the bar (2.96:1) are decorative frames only — never text,
  and never the only thing identifying a control. Two text pairs sit at 4.53:1 and
  4.54:1 with no headroom: `--color-accent-soft` on `--color-accent-dim`, and
  `--color-accent-dim` on `--color-band`. Don't nudge those four values.
- The site does not follow the reader's OS colour preference, and there is no working
  theme switch — the header's `[> CRT]` control is a deliberate disabled placeholder
  whose eventual behaviour is still undecided. Don't implement one without a spec
  change.
- Header placeholders (`SOBRE`, `PT / EN`, `[> CRT]`) render through
  `BracketButton.astro` as spans with `aria-disabled` and an explicit `tabindex`,
  never as `<button disabled>` — a disabled button leaves the tab order and goes
  unannounced, hiding the fact that the feature is planned.
- Space Grotesk (body/headings) and Space Mono (labels) are self-hosted through
  Astro's top-level `fonts` config, so no third-party font request is made. Add a
  weight there before using it.
- Post body styling lives in `src/styles/content.css` under the `.mdx` class. It is
  global rather than scoped because it targets HTML generated from Markdown at
  build time. Inline code and code blocks deliberately inherit the body sans-serif
  font, matching v2, whose CSS reset overrode the monospace default.
- `@apply` does not work inside scoped `<style>` blocks in `.astro` files under
  Tailwind v4 without `@reference`. Prefer plain CSS with `var(--color-*)` there.
- The site ships no client-side JavaScript beyond the analytics tag, and has no
  islands. `react` / `react-dom` / `@astrojs/react` stay installed, but the
  integration is off in `astro.config.mjs` — with zero islands it emitted a ~220KB
  React runtime that no page referenced. Re-enable it there if an island is needed.
- Post URLs are `/post/<slug>/` with `trailingSlash: 'always'`, matching the v2
  site exactly. Changing a filename changes a live URL — don't rename casually.
- Frontmatter `type` (`blog` | `article` | `tutorial`) is editorial taxonomy, not a
  layout selector. `/linktree` lists only `article` posts.
- `description` is optional; when absent a summary is derived from the post body in
  `src/lib/posts.ts` (120 chars for cards, 200 for metadata).
- Markdown runs through Sätteri with smart punctuation **off** — leaving it on
  curls quotes and dashes that the migrated posts expect to stay straight.
- Posts with `draft: true` are visible in dev and excluded from builds, the RSS
  feed, and the sitemap — see `src/lib/posts.ts`.

## Spec-driven development

This project uses OpenSpec. Non-trivial changes start as a proposal in
`openspec/changes/`. Use `/opsx:propose`, `/opsx:apply`, and `/opsx:archive`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
