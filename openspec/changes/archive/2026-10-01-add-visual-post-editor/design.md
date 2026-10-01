# Design

## Context

See proposal.md — Why. The relevant current state:

- Front Matter CMS 10.12 and Markdown for Humans 0.3 are installed on the author's
  machine. Front Matter's first-run setup left an untracked `frontmatter.json` (a generic
  content type with `date`, `preview`, `categories`), a `.vscode/settings.json` (the page
  folder and `publicFolder: "public/uploads"`), three empty `.frontmatter/database/*.json`
  files, and a test post that fails `astro sync`. Both config files fail
  `prettier --check`.
- Front Matter's defaults, read from its source: new filenames get
  `frontMatter.templates.prefix`, whose default is `{{date|yyyy-MM-dd}}`; dates default to
  ISO timestamps; filenames come from `SlugHelper.slugify`, which transliterates accents
  but drops English stop words.
- The schema lives in `src/content.config.ts`. It cannot see filenames, and it accepts any
  string as an image path, so both rules in `blog-content` are enforced only by
  `scripts/check-post-assets.mjs`. That script runs in `pnpm verify`, locally only;
  Netlify runs `pnpm build`.
- Tag display labels live in `TAG_LABELS` in `src/lib/posts.ts` (12 tags).

## Goals / Non-Goals

**Goals:**

- A post created through Front Matter builds immediately and needs no hand-fixing of
  filename, frontmatter, dates, or image paths.
- Whatever the tools get wrong, the post check catches it before it reaches production.

**Non-Goals:**

- Configuring Markdown for Humans beyond keeping it off the default editor. Its image
  defaults are exactly what Decision 5 needs.
- Moving the migrated posts' images out of `public/uploads/`.
- Keeping the Front Matter content type in sync with the schema automatically.
- Checking what the schema already validates (required fields, `type` values).

## Decisions

### 1. Two VS Code extensions, no web CMS

Front Matter CMS provides the frontmatter form, content creation, and media panel;
Markdown for Humans provides the visual body editor. Together they add no dependency,
route, or script to the site.

Alternatives considered:

- **Sveltia / Decap at `/admin`:** ships the site's first JavaScript bundle from a
  third-party CDN. Decap's Netlify Identity login is deprecated. Sveltia's local mode is
  Chromium-only.
- **Keystatic in local mode:** its trust model is better (npm packages, pinned in the
  lockfile), but it needs two dependencies and `@astrojs/react` enabled in dev, and it
  lists the migrated posts in its UI.
- **Mark Sharp:** images and tables are paid features.
- **Typora / Obsidian:** they leave VS Code, and neither understands `/uploads/` without
  workarounds.

The author accepted the trust trade-off (unsandboxed, auto-updating extensions). The site
builds without either extension, so nothing here depends on them.

### 2. All Front Matter settings in `frontmatter.json`

Front Matter reads both `frontmatter.json` and `.vscode/settings.json`. Keeping every
`frontMatter.*` key in one file gives a single place to update when the schema changes,
and avoids creating a `.vscode/settings.json` whose only content is another tool's
config. The file is Prettier-formatted like the rest of the repo. `.vscode/settings.json`
is removed (see Decision 7).

### 3. One content type that mirrors the schema

| Schema (`content.config.ts`)   | Front Matter field                                                                       |
| ------------------------------ | ---------------------------------------------------------------------------------------- |
| `title: string`                | `string`, required                                                                       |
| `description?: string`         | `string`                                                                                 |
| `pubDate: date`                | `datetime`, `isPublishDate`, default `{{now}}`, required                                 |
| `updatedDate?: date`           | `datetime`, set by hand only                                                             |
| `type: enum`                   | `choice` of `blog` / `article` / `tutorial`, default `blog`, required                    |
| `tags: string[]`               | `choice`, `multiple: true`, the 12 `TAG_LABELS` keys                                     |
| `draft: boolean`               | `draft` field (boolean), new posts start `true`                                          |

- **Dates:** `frontMatter.taxonomy.dateFormat` is `yyyy-MM-dd`. It uses date-fns, which
  formats in local time, so a post created at 22:30 in UTC−3 gets that day's date. That
  keeps the date "as authored", which `post-pages` requires. The default ISO/UTC stamp
  would put a late-evening post on the next day. Version 10.12 also accepts a per-field
  `dateFormat`, so both date fields set it as well.
- **The content type must be named `default`:** Front Matter reads a post's `type` key to
  pick a content type. No content type is named `blog`, `article` or `tutorial`, so it
  falls back to the one named `default`. Renaming it would leave every post without a
  content type.
- **`updatedDate`:** deliberately not `isModifiedDate` and not auto-updated. An
  auto-stamp would fire on every draft save and misrepresent a post that was never
  revised after publication.
- **`type` defaults to `blog`:** it's the most common type (26 of 44), and it keeps a new
  post off `/linktree` until the author chooses `article`.
- **Tags as `choice` rather than Front Matter's `tags` type:** the `tags` type stores its
  vocabulary in `taxonomyDb.json` and accepts free input, and a free-typed tag renders
  with no label. The choice list duplicates `TAG_LABELS`. That was accepted: new tags
  arrive about once a year, and drift is visible (an unlabelled tag already logs a warning
  from `tagLabel`). Considered and rejected: a script that generates the choices from
  `posts.ts` — machinery for a yearly one-line edit.
- `preview` and `categories` are dropped. The schema would silently strip them, but they
  would clutter every new post.

### 4. Filenames: no prefix, default slugify

`frontMatter.templates.prefix` is set to `""`. The page folder's `filePrefix` is set to
`""` as well, since a folder-level prefix overrides the global one.

No `slugTemplate` is set, so filenames go through `slugify`, which removes accents
("conteúdo" becomes `conteudo`, confirmed by the test post). The `{{title}}` template
was rejected: it only lowercases and replaces spaces, so accents and punctuation stay.
The cost is that English stop words that are also Portuguese words (`o`, `e`, `do`,
`no`, `com`) are dropped. The post check can't see a missing word, so reviewing the
filename before first publish stays the author's job, and the README says so.

### 5. New images live next to the posts

The first in-editor test showed what authoring looks like in practice: the author drops
images into the visual editor rather than going through Front Matter's media panel.
Markdown for Humans cannot write a `/uploads/` link. Its `handleSaveImage` always builds
the link with `path.relative(dirname(post), savedFile)`, and the only settings are the
target folder and whether that folder is relative to the post or to the workspace. Its
defaults save to `images/` next to the post and link as `./images/<file>`.

Those defaults are kept. Astro treats a relative image in a content-collection post as
an asset: it was confirmed in dev that each image renders as a WebP `/_image` URL with
`width` and `height` set, which becomes a hashed `/_astro/` file in the production build.
New posts therefore get optimised images, and the editor previews them, because the link
resolves from the post's own folder.

Optimisation needs Sharp at build time. Astro 7 already installs it as an optional
dependency, but pnpm doesn't hoist it, so a production build with a published co-located
image failed with `MissingSharp` (dev only renders the HTML, so it didn't show up there).
`sharp` is therefore declared directly in `package.json`, in Astro's own range
(`^0.35.4`). The lockfile gains no new package. Sharp 0.35 ships prebuilt per-platform
binaries and has no install script, and `pnpm-workspace.yaml` already allows its build.
In the fixture build, a 252 KB PNG screenshot became a 45 KB WebP. Considered and
rejected: Astro's passthrough image service, which avoids the dependency but copies
images without re-encoding them.

Front Matter's `publicFolder` stays `"public"`, the folder that maps to the site root, so
its media panel still links a file in `public/uploads/` as `/uploads/<file>`. The
exploration value, `"public/uploads"`, would have produced `/<file>`. The migrated posts
are not touched.

Alternatives considered:

- **Save to `public/uploads/` and rewrite links with a `--fix` pass:** the editor can put
  the file in the right folder, but the link comes out as `../../../public/uploads/x.png`.
  Every image would need an extra command, and the rewritten link no longer resolves from
  the post, so the editor stops showing the image.
- **Front Matter's media panel only:** keeps one convention, but it is the flow the author
  skipped on the first try.

### 6. One post-corpus check, run before the build

`check-post-assets.mjs` becomes `check-posts.mjs`, and the `check:posts` script replaces
`check:assets`. It makes one pass over every `.md` / `.mdx` file the collection loads:

- **Filename:** the stem must match `^[a-z0-9]+(?:-[a-z0-9]+)*$` and must not match
  `^\d{4}-\d{2}-\d{2}-`. The two rules are separate because the date-prefixed test post
  passes the first one.
- **Images:** outside fenced code, every image reference must either start with
  `/uploads/` and name a file under `public/`, or be relative to the post and resolve to
  an existing file inside `src/content/blog/`. Anything else is reported by kind:
  external, outside uploads, relative outside the posts folder (including
  `../../../public/...`), or missing.

The script keeps the current style: collect every violation, print one line per
violation naming the file, and exit 1 if any were found. Drafts are checked like any
other post, because publishing a draft keeps its filename.

The check runs from `netlify.toml`: `command = "pnpm check:posts && pnpm build"`. That
applies to production deploys and deploy previews alike.

Alternatives considered:

- **Running `pnpm verify` on Netlify:** a formatting slip in a component would block a
  post from publishing, and `astro check` repeats work the build already does.
- **A `prebuild` script:** whether pnpm runs pre/post hooks depends on its settings, so
  the gate would be invisible and fragile. The explicit command sits right in
  `netlify.toml`.
- **Enforcing filenames in `content.config.ts`** (for example, throwing from the loader's
  `generateId`): this puts a lint rule inside build config, and the error would surface as
  a loader crash rather than a report.

### 7. The default editor is the author's choice

Markdown for Humans registers its editor with priority `option`, so it never takes over
`.md` files by itself. In apply, the author's user-level settings turned out to map
`"*.md": "markdownForHumans.editor"` in every project, and the author prefers to keep it.
The repository therefore doesn't set `workbench.editorAssociations`, and no
`.vscode/settings.json` is kept.

What protects the migrated posts is that opening one doesn't modify it.
`call-stack-eo-javascript-single-threaded.md` opened in the visual editor and was
byte-identical on disk afterwards. Its `/uploads/` images don't render there, because the
editor resolves links from the post's folder; the author accepted that. Rewriting happens
only when an edited post is saved, and `git diff` shows that before commit.

Rejected: a workspace override,
`"workbench.editorAssociations": { "src/content/blog/*.md": "default" }`. It would turn
the visual editor off for new posts too, against the author's stated preference.

### 8. `.frontmatter/database/` is ignored

It is Front Matter's local cache (media metadata, pinned items, taxonomy). With tags as a
fixed choice, nothing in it is a source of truth. Committing it would add noise diffs on
every media action.

## Risks / Trade-offs

- [The Front Matter content type drifts from `content.config.ts` when the schema changes]
  → An AGENTS.md convention says to change them together. A drifted required field shows
  up at once, because new posts fail `astro dev`.
- [A malformed post blocks every deploy] → Intended. The report names the file, and the
  author can fix it or delete it.
- [An extension update changes defaults (prefix, date format)] → The settings are
  explicit, not inherited. The post check and the schema catch filename and field
  regressions before deploy.
- [Stop words dropped from filenames] → The author reviews the filename before first
  publish (see Decision 4). A post can be renamed freely until it's published.
- [A migrated post edited in the visual editor gets re-serialised] → Opening one doesn't
  modify it (see Decision 7), and the README says to edit migrated posts in the text
  editor. Anything that slips through shows up in `git diff`
  before commit.
- [Two image conventions in one corpus] → Both are checked by the same rule, and the
  README says which one new posts use. Moving the migrated images is a separate change.
- [Co-located images get hashed URLs that change whenever the image changes] → They are
  only embedded in post bodies. An image meant to be linked from elsewhere (an avatar, a
  social card) still belongs in `public/`.
- [Markdown for Humans' image settings are changed at user level] → Its settings UI
  writes to global settings. A different folder either still resolves inside
  `src/content/blog/` (fine) or points outside it, which the post check rejects.

## Migration Plan

No data migration. The existing 44 posts already pass both new rules. The exploration
test post is removed; it is untracked, so nothing published changes.

Rollback: revert the commit. Reverting `netlify.toml` alone removes the deploy gate and
leaves the authoring setup intact.

## Open Questions

- Whether Front Matter's media panel can open in `public/uploads/` by default instead of
  `public/`. This is a convenience, and less important now that the visual editor is the
  main way images arrive; the post check covers correctness either way.
