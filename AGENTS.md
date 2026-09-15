# caiofuzatto.com.br — v3

Astro 7, Tailwind v4, Markdown content collections, deployed to Netlify as a
fully static site. Ported from the Gatsby blog at `itsmicaio/my-blog-v2`, keeping
its URLs and visual design unchanged.

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
- The design is light-only, ported from v2: green `--color-green` (`#4e8663`) on
  `text-gray-600` body copy, with a custom `news: 672px` breakpoint. There is no
  dark mode and no theme toggle — do not reintroduce one without a spec change.
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
