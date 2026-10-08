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
mise exec -- pnpm verify         # format:check + lint + astro check + check:posts
```

## Escrevendo um post

Cada post é um arquivo em `src/content/blog/`. **O nome do arquivo vira a URL**
(`meu-post.md` → `/post/meu-post/`), então renomear um post publicado quebra o link
antigo. O nome usa só letras minúsculas sem acento, números e hífens, e não começa com
data — o `pnpm check:posts` barra o deploy caso contrário.

### Editor visual

O workspace recomenda duas extensões do VS Code: **Front Matter CMS** (formulário do
frontmatter, criação de posts e painel de mídia) e **Markdown for Humans** (editor
visual do corpo).

1. No painel do Front Matter, crie o post e digite o título. Ele nasce como rascunho,
   com `type: blog` e a data de hoje.
2. **Confira o nome do arquivo.** O Front Matter tira os acentos, mas também descarta
   palavras como "o", "e", "do", "no" e "com". Enquanto for rascunho, renomeie à vontade.
3. Escreva no Markdown for Humans — pelo _Open With…_ ou deixando-o como editor padrão de
   `.md`. Só edite posts novos nele: ao salvar, ele pode reescrever o arquivo inteiro.
   Abrir um post migrado nele não altera nada (as imagens de `/uploads/` só não
   aparecem), mas para editar um deles use _Open With…_ → _Text Editor_.
4. Tipo, tags e datas ficam no painel do Front Matter. Para publicar, desmarque
   _Rascunho_.

A configuração está em `frontmatter.json` e espelha `src/content.config.ts` e as tags
de `src/lib/posts.ts` — mude os três juntos.

### Frontmatter à mão

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

Em posts novos, cole ou arraste a imagem direto no Markdown for Humans. Ela vai para
`src/content/blog/images/` e é referenciada como `./images/nome.png`; no build, o Astro
converte para WebP e declara as dimensões.

Os posts migrados continuam com as imagens em `public/uploads/`, referenciadas como
`/uploads/nome.png` — o painel de mídia do Front Matter também grava nesse formato. Use
`public/` para imagens que precisam de um endereço fixo (avatar, card social).

`pnpm check:posts` roda antes de todo deploy e falha se algum post tiver nome com data,
acento ou maiúscula, ou apontar para uma imagem inexistente, externa, fora de
`/uploads/` ou fora de `src/content/blog/`.

## Estrutura

```
src/
  components/         componentes .astro
  content/blog/       posts (.md) e, em images/, as imagens dos posts novos
  content.config.ts   schema das collections
  layouts/            shells de página
  lib/                helpers (posts, resumos, datas, rótulos de tags)
  pages/              rotas — / , /post/<slug>/ , /linktree , /404
  pages/og/           imagens de compartilhamento (og:image) geradas no build
  styles/global.css   entrada do Tailwind + reset + tema
  styles/content.css  tipografia do corpo dos posts
  consts.ts           metadados do site e links sociais
public/uploads/       imagens dos posts migrados
scripts/              verificações do repositório
openspec/             propostas e specs (desenvolvimento orientado a spec)
frontmatter.json      configuração do Front Matter CMS
```

## Deploy

Netlify serve o `dist/` estático; `netlify.toml` define o comando de build — que roda
`pnpm check:posts` antes do `astro build` — e as versões de Node/pnpm. Não há adapter — o site não tem rotas dinâmicas nem
JavaScript no cliente além da tag de analytics.

O build também gera as imagens de compartilhamento (`og:image`): uma por post publicado em
`/og/<slug>.png` e uma padrão em `/og/site.png`, desenhadas como o card da home com Satori
e rasterizadas com sharp. Nada roda em tempo de requisição.
