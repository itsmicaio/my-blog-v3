# caiofuzatto.com.br — v3

Terceira versão do meu blog pessoal. Astro 7 com ilhas React, Tailwind v4,
posts em MDX via content collections, deploy na Netlify.

## Requisitos

[mise](https://mise.jdx.dev) — as versões de Node, pnpm e OpenSpec estão
fixadas em `mise.toml`.

```sh
mise install
mise exec -- pnpm install
```

## Desenvolvimento

```sh
mise exec -- pnpm dev       # servidor de desenvolvimento em localhost:4321
mise exec -- pnpm build     # build de produção em dist/
mise exec -- pnpm preview   # serve o build local
mise exec -- pnpm verify    # format:check + lint + astro check
```

## Escrevendo um post

Crie um arquivo em `src/content/blog/`:

```mdx
---
title: 'Título do post'
description: 'Resumo de uma linha, usado no card e no RSS.'
pubDate: 2026-09-14
tags: ['astro']
draft: false
---

Conteúdo em Markdown. Em `.mdx` também dá para importar componentes React.
```

O schema do frontmatter está em `src/content.config.ts`. Posts com `draft: true`
aparecem em desenvolvimento e ficam de fora do build, do RSS e do sitemap.

## Estrutura

```
src/
  components/        componentes .astro e ilhas React (.tsx)
  content/blog/      posts
  content.config.ts  schema das collections
  layouts/           shells de página
  lib/               helpers compartilhados
  pages/             rotas
  styles/global.css  entrada do Tailwind + design tokens
  consts.ts          metadados do site e navegação
openspec/            propostas e specs (desenvolvimento orientado a spec)
```

## Deploy

Netlify, via `@astrojs/netlify`. `netlify.toml` define o comando de build e as
versões de Node/pnpm. Todas as rotas são pré-renderizadas hoje; para tornar uma
rota dinâmica, exporte `export const prerender = false` nela.
