# caiofuzatto.com.br — v3

Astro 7 + React islands, Tailwind v4, MDX content collections, deployed to Netlify.

## Tooling

Toolchain versions are pinned in `mise.toml` (Node, pnpm, OpenSpec). Always run
commands through mise:

```
mise exec -- pnpm dev
mise exec -- pnpm verify
```

## Commands

| Command        | What it does                                 |
| -------------- | -------------------------------------------- |
| `pnpm dev`     | Dev server                                   |
| `pnpm build`   | Production build into `dist/`                |
| `pnpm preview` | Serve the built output                       |
| `pnpm check`   | `astro check` — types and Astro diagnostics  |
| `pnpm lint`    | ESLint                                       |
| `pnpm format`  | Prettier, write mode                         |
| `pnpm verify`  | format:check + lint + check — run before PRs |

When starting the dev server, use background mode: `astro dev --background`.
Manage it with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Layout

```
src/
  components/      .astro components and React islands (.tsx)
  content/blog/    posts (.md / .mdx)
  content.config.ts  collection schemas — frontmatter contract lives here
  layouts/         page shells
  lib/             shared helpers (post querying, date formatting)
  pages/           file-based routes
  styles/global.css  Tailwind entry + design tokens
  consts.ts        site metadata and nav
```

## Conventions

- Site metadata lives in `src/consts.ts`; `astro.config.mjs` reads `site` from it.
- Design tokens are Tailwind `@theme` variables in `src/styles/global.css`
  (`surface`, `ink`, `edge`, `accent`), with dark values under `:root:is(.dark)`.
  Use the token utilities (`bg-surface`, `text-ink-muted`) rather than raw palette
  colors so dark mode keeps working.
- `@apply` does not work inside scoped `<style>` blocks in `.astro` files under
  Tailwind v4 without `@reference`. Prefer plain CSS with `var(--color-*)` there.
- React components are islands: give them an explicit `client:*` directive, and
  only when they actually need interactivity.
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
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
