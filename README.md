# caiofuzatto.com.br — v3

Terceira versão do meu blog pessoal. Astro 7, Tailwind v4, posts em Markdown via
content collections, site totalmente estático com deploy na Netlify.

Migrado do blog em Gatsby (`itsmicaio/my-blog-v2`) preservando as URLs e o visual.

## Requisitos

[mise](https://mise.jdx.dev) — as versões de Node, pnpm e OpenSpec estão
fixadas em `mise.toml`.

```sh
mise install
mise exec -- pnpm install
```

## Desenvolvimento

```sh
mise exec -- pnpm dev            # servidor de desenvolvimento em localhost:4321
mise exec -- pnpm build          # build de produção em dist/
mise exec -- pnpm preview        # serve o build local
mise exec -- pnpm verify         # format:check + lint + astro check + check:assets
```

## Escrevendo um post

Crie um arquivo em `src/content/blog/`. **O nome do arquivo vira a URL**
(`meu-post.md` → `/post/meu-post/`), então renomear um post quebra o link antigo.

```md
---
title: 'Título do post'
pubDate: 2026-09-14
type: article
tags: ['nodejs']
draft: false
---

Conteúdo em Markdown.
```

| Campo         | Obrigatório | Observação                                           |
| ------------- | ----------- | ---------------------------------------------------- |
| `title`       | sim         |                                                      |
| `pubDate`     | sim         |                                                      |
| `type`        | sim         | `blog`, `article` ou `tutorial`                      |
| `tags`        | não         | rótulos definidos em `src/lib/posts.ts`              |
| `description` | não         | sem ela, o resumo é gerado a partir do corpo do post |
| `updatedDate` | não         |                                                      |
| `draft`       | não         | `true` aparece só em desenvolvimento                 |

`type` separa os diários e anotações de curso (`blog`) dos artigos longos
(`article`) — o `/linktree` lista apenas `article`.

O schema completo está em `src/content.config.ts`.

### Imagens

Coloque o arquivo em `public/uploads/` e referencie como `/uploads/nome.png`.
`pnpm check:assets` falha se algum post apontar para um arquivo inexistente ou
para uma imagem hospedada fora do site.

## Estrutura

```
src/
  components/         componentes .astro
  content/blog/       posts (.md)
  content.config.ts   schema das collections
  layouts/            shells de página
  lib/                helpers (posts, resumos, datas, rótulos de tags)
  pages/              rotas — / , /post/<slug>/ , /linktree , /404
  styles/global.css   entrada do Tailwind + reset + tema
  styles/content.css  tipografia do corpo dos posts
  consts.ts           metadados do site e links sociais
public/uploads/       imagens dos posts
scripts/              verificações do repositório
openspec/             propostas e specs (desenvolvimento orientado a spec)
```

## Deploy

Netlify serve o `dist/` estático; `netlify.toml` define o comando de build e as
versões de Node/pnpm. Não há adapter — o site não tem rotas dinâmicas nem
JavaScript no cliente além da tag de analytics.
