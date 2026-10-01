# Tasks

## 1. Clear the exploration leftovers

- [x] 1.1 Ask the author to confirm, then delete the untracked test post
      `src/content/blog/2026-09-30-teste-criando-um-conteudo.md`. Verify `mise exec -- pnpm
      astro sync` completes without an `InvalidContentEntryDataError`.
- [x] 1.2 Add `.frontmatter/database/` to `.gitignore`. Verify `git status --short` no
      longer lists the three `.frontmatter/database/*.json` files.

## 2. The post check and the deploy gate

- [x] 2.1 Rename `scripts/check-post-assets.mjs` to `scripts/check-posts.mjs`, and rename the
      `check:assets` script to `check:posts` in `package.json`, including inside `verify`.
      Verify `mise exec -- pnpm check:posts` passes on the current corpus and
      `mise exec -- pnpm check:assets` is gone.
- [x] 2.2 Extend the check to every `.md` / `.mdx` file in `src/content/blog/`, and add the
      filename rules from design Decision 6: lowercase ASCII kebab-case stem, and no leading
      `YYYY-MM-DD-`. Verify by creating temporary files `2026-09-30-x.md`, `meu-diário.md`
      and `Meu-Post.md` (each reported) and `2025-em-retrospectiva.md` (not reported), then
      delete them.
- [x] 2.3 Change the image rule so that outside fenced code every reference must start with
      `/uploads/` and resolve under `public/`, reporting external, relative,
      outside-uploads and missing references by kind. Verify with a temporary post holding
      `![a](../../../public/uploads/call-stack-size.png)`, `![a](/favicon-32x32.png)`,
      `![a](/uploads/missing.png)`, and `![a](x.png)` inside a fenced block: the first three
      are reported with the file name, the fenced one is not, and the script exits 1. Then
      delete it.
- [x] 2.4 Set `netlify.toml`'s build command to `pnpm check:posts && pnpm build`. Verify
      locally that the same command chain fails with a date-prefixed post present and
      builds normally without it.
- [x] 2.5 Accept image references relative to the post that resolve to an existing file
      inside `src/content/blog/` (design Decision 5), and keep rejecting relative references
      that resolve outside it, including into `public/`. Verify with a temporary post holding
      `![a](./images/<an existing test image>)` (not reported), `![a](./images/missing.png)`
      (missing), `![a](../../../public/uploads/call-stack-size.png)` and
      `![a](../../assets/x.png)` (both reported as outside the posts folder). Then delete it.
- [x] 2.6 Declare `sharp` as a direct dependency, matching the version Astro already installs,
      so the production build can resolve it under pnpm. Then build a temporary non-draft
      post that references a co-located image. Verify
      `dist/post/<slug>/index.html` contains an `<img>` whose `src` is a `/_astro/` WebP
      file present in `dist/_astro/`, with `width` and `height` set. Then delete the post.

## 3. Front Matter configuration

- [x] 3.1 Rewrite `frontmatter.json` per design Decisions 2–5: framework `astro`, page folder
      `src/content/blog` with `filePrefix: ""`, `frontMatter.templates.prefix: ""`,
      `frontMatter.taxonomy.dateFormat: "yyyy-MM-dd"`, `publicFolder: "public"`, preview
      host `http://localhost:4321`, and one content type with exactly the fields in the
      Decision 3 table. The tag choices must be the 12 `TAG_LABELS` keys from
      `src/lib/posts.ts`. Verify `mise exec -- pnpm exec prettier --check frontmatter.json`
      passes, and that every field `name` exists in `src/content.config.ts`.
- [x] 3.2 Delete `.vscode/settings.json`, whose settings now live in `frontmatter.json`,
      then reload the VS Code window. Verify Front Matter's panel still recognises
      `src/content/blog` as its content folder.
- [x] 3.3 Add `eliostruyf.vscode-front-matter` and `concretio.markdown-for-humans` to
      `.vscode/extensions.json` recommendations. Verify the file passes Prettier and still
      recommends `astro-build.astro-vscode`.

## 4. Verify the authoring flow in the editor

These need the author at the keyboard, since they drive VS Code's UI.

- [x] 4.1 Create a post titled `Teste criando um conteúdo` through Front Matter. Verify:
      - the file is `teste-criando-um-conteudo.md`
      - its frontmatter holds only schema keys, with `pubDate: <today>` date-only,
        `type: blog`, and `draft: true`
      - `mise exec -- pnpm astro sync` passes
- [x] 4.2 In that post, check that the type field offers exactly `blog` / `article` /
      `tutorial` and the tags field offers exactly the 12 labelled tags, with no free
      entry. If the installed version supports a per-field `dateFormat`, set it on both
      date fields (design Open Questions).
- [x] 4.3 Drop an image into the post open in Markdown for Humans. Verify the file lands in
      `src/content/blog/images/`, the body references `./images/<file>`, the image shows in
      the editor, and `mise exec -- pnpm check:posts` passes.
- [x] 4.4 Open the post with "Open With… → Markdown for Humans", write a paragraph, a table
      and a code block, and save. Verify the frontmatter block is intact and
      `mise exec -- pnpm check:posts` and `astro sync` still pass.
- [x] 4.5 Open `call-stack-eo-javascript-single-threaded.md` from the explorer. It opened in
      Markdown for Humans, because the author's user-level settings associate `*.md` with
      it. The author keeps that, so per design Decision 7 the repository sets no editor
      association. Verify `git status` shows the migrated post unchanged after opening it.
- [x] 4.6 Delete the test post, the uploaded test image, and any other files from 4.1–4.5.
      Verify `git status --short` lists only the files this change intends to touch.

## 5. Documentation

- [x] 5.1 In `README.md`, rewrite "Escrevendo um post" and "Imagens" to cover the visual
      flow: create through Front Matter, check the proposed filename before publishing
      (stop words get dropped), insert images through Front Matter's media panel rather
      than dragging them into the visual editor, and use Markdown for Humans only on new
      posts via "Open With…". Keep the manual frontmatter table. Replace `check:assets`
      with `check:posts`. Verify `mise exec -- pnpm exec prettier --check README.md`
      passes.
- [x] 5.2 In `AGENTS.md`, rename the `check:assets` row to `check:posts` with its new scope,
      and update the `verify` row. Add a convention saying `frontmatter.json` mirrors
      `src/content.config.ts` and `TAG_LABELS`, and must change together with them. Verify
      `grep -rn 'check:assets\|check-post-assets' --exclude-dir=node_modules
      --exclude-dir=openspec .` returns nothing.
- [x] 5.3 Update both docs for co-located images. In `README.md`, "Imagens" says new posts
      drop images into the visual editor (stored in `src/content/blog/images/`, optimised by
      Astro), while migrated posts keep `/uploads/`. In `AGENTS.md`, the Layout entry for
      `public/uploads/` no longer claims every post image, `src/content/blog/images/` is
      listed, and the check:posts convention describes both accepted forms. Verify
      `mise exec -- pnpm exec prettier --check README.md AGENTS.md` passes.

## 6. Final verification

- [x] 6.1 Run `mise exec -- pnpm verify` and `mise exec -- pnpm check:posts && mise exec --
      pnpm build`. Verify both pass, and that `dist/` contains no `frontmatter.json`,
      `.frontmatter/` or authoring route.
- [x] 6.2 Run `mise exec -- openspec validate add-visual-post-editor --strict`. Verify it
      reports the change as valid.
