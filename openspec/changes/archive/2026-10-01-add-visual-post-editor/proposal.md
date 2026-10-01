# Proposal

## Why

Writing a post means hand-editing YAML frontmatter and typing `/uploads/` image paths in
a plain text editor, and there is no visual way to see the post take shape. Two VS Code
extensions are now installed to fix that — Front Matter CMS for frontmatter and media,
Markdown for Humans for the body — but Front Matter's generated defaults produce posts
that the site rejects: a test post created with it fails the content schema (it writes
`date` instead of `pubDate` and omits `type`) and carries a `yyyy-MM-dd-` filename prefix
that would silently change the post's live URL. The tooling needs to be shaped to the
content contract, and the parts of that contract the schema cannot see need a guard.

## What Changes

- The repository ships a Front Matter CMS configuration whose single content type mirrors
  the `blog` collection schema: `title`, `description`, `pubDate`, `updatedDate`, `type`
  (a fixed choice of `blog` / `article` / `tutorial`), `tags` (a fixed choice matching the
  site's tag labels), and `draft`. The unused `preview` and `categories` fields go.
- New posts are created with no date prefix in the filename, and dates are written
  date-only (`yyyy-MM-dd`) in the author's local calendar, matching every existing post.
- Images dropped into the visual editor are stored next to the posts, in
  `src/content/blog/images/`, and referenced relative to the post (`./images/<file>`).
  Astro optimises them at build time. Migrated posts keep their `/uploads/` references
  unchanged, and Front Matter's media panel still writes valid `/uploads/` references.
- `sharp` becomes a direct dependency so the build can optimise co-located images under
  pnpm. Astro already installs it; the lockfile gains no new package.
- Front Matter settings are consolidated into `frontmatter.json` (none in
  `.vscode/settings.json`), formatted to pass the repository's Prettier check. Front
  Matter's local database folder is not committed.
- The workspace recommends both extensions, so the setup is discoverable from a fresh
  clone.
- The post asset check becomes a post corpus check that additionally rejects post
  filenames that carry a date prefix or fall outside lowercase ASCII kebab-case, and image
  references that are neither an existing `/uploads/` file nor an existing file inside the
  posts folder.
- That check runs as part of the Netlify build, before `astro build`, so a post that
  violates it blocks the deploy instead of shipping at the wrong URL.
- Authoring docs (`README.md`, `AGENTS.md`) describe the visual workflow and the renamed
  check.

Not breaking: every existing post already satisfies the new checks — all 44 filenames are
lowercase ASCII kebab-case without a date prefix, and every image reference is under
`/uploads/`. No URL, rendered page, or client-side payload changes.

## Capabilities

### New Capabilities

- `post-authoring`: the repository's visual authoring setup — what a post created through
  it must look like (filename, frontmatter fields and formats, image references) and which
  existing posts it must leave untouched.

### Modified Capabilities

- `blog-content`: "Post slug derivation" gains detection before deploy for filenames that
  carry a date prefix or are not lowercase ASCII kebab-case — today the rule is stated but
  nothing enforces it. "Post images are served from a stable public path" is renamed to
  "Post images are served from the site's own origin" and now accepts a second form: an
  image stored next to the posts and referenced relative to the post, which is optimised at
  build time rather than served at a stable path. Any other reference — missing, external,
  relative into `public/` or outside the posts folder, or site-relative outside `/uploads/`
  — is detected before deploy; today only missing and external `/uploads/` references are
  caught. Both detections gate the production deploy.

## Impact

**Added**

- `frontmatter.json` — replaces the auto-generated version from exploration.
- `.vscode/extensions.json` — gains two recommendations.
- `.gitignore` — ignores `.frontmatter/database/`.
- `src/content/blog/images/` — where the visual editor stores images for new posts.

**Changed**

- `scripts/check-post-assets.mjs` → `scripts/check-posts.mjs`, and `check:assets` →
  `check:posts` in `package.json` (including `verify`).
- `package.json` — declares `sharp`, which Astro already installs but cannot resolve under
  pnpm unless it is a direct dependency. Without it, co-located images fail the build.
- `netlify.toml` — the build command runs the post check first.
- `README.md`, `AGENTS.md` — authoring section and command table.

**Removed**

- `.vscode/settings.json` — created during exploration; its two settings move into
  `frontmatter.json`.
- `src/content/blog/2026-09-30-teste-criando-um-conteudo.md` — the exploration test post,
  which currently breaks `astro dev` and `astro build`.

**Explicitly out of scope** — a web-based CMS or `/admin` route, any change to the content
schema, visual editing of the migrated posts, moving the migrated images out of
`public/uploads/`, and choosing or pinning extension versions on the author's machine.

**Risks**

- Both extensions run unsandboxed in VS Code and auto-update by default, and Markdown for
  Humans' publisher is not verified on the Marketplace. Accepted by the author; this change
  neither ships nor depends on them — the site builds identically without them.
- Front Matter derives the filename from the title with an English stop-word list that
  includes Portuguese words (`o`, `e`, `do`, `no`, `com`). The filename check catches a
  wrong format but not a dropped word, so the author must still review the proposed
  filename, since it becomes the URL.
- Markdown for Humans edits a parsed document model, so saving can re-serialise the whole
  file. Keeping it off the migrated posts is a practice, not something the tooling
  enforces.
- Gating the deploy means a single malformed post blocks every other change from
  deploying until it is fixed or removed.
- The corpus ends up with two image conventions: `/uploads/` for the migrated posts and
  co-located files for new ones. Co-located images are re-encoded and served from hashed
  `/_astro/` URLs, so their addresses change whenever the image does — acceptable for
  images embedded in posts, not for images linked to from elsewhere.
