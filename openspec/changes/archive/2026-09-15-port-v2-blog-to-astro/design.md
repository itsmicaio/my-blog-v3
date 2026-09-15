## Context

See `proposal.md` — Why. This section records only the facts about the source material
that shape the approach; each was verified against the v2 repository and the live site
rather than assumed.

**The content is simpler than its file extension suggests.** All 44 posts are `.mdx`, but
scanning every file for JSX elements and `import`/`export` statements outside fenced code
blocks and inline code produced zero hits. Every `<Admin>`, `<Suspense>` and `import` in
the corpus lives inside a code fence. The corpus is plain Markdown wearing an `.mdx`
extension, which removes the usual MDX-migration hazard entirely.

**The public URL surface is small and fully known.** The live sitemap lists exactly 46
addresses: 44 posts at `/post/<slug>/`, plus `/` and `/linktree/`. Slugs are the post
filename minus its `YYYY-MM-DD-` prefix.

**Local assets are complete; external assets are rotting.** Of 62 files in
`static/uploads`, 60 are referenced by posts and none is missing — the two unreferenced
files are the avatar and site icon used by the chrome. Of 12 externally-hosted images, 5
are already dead: three `c4model.com` 404s and one `docs.aws.amazon.com` 404 in two
posts, plus a `media.licdn.com` signed URL that expired in July 2023 (403). The
surviving 7 all depend on `static.structurizr.com`.

**The `type` taxonomy is editorial, not incidental.** Ordering posts by date shows a
genuine shift: everything before 2023‑08 is `blog` (short diary entries), everything
after 2023‑10 is `article` (long-form), with a mixed transition between, and the
AWS Essentials module series staying `blog` throughout as course notes. The linktree's
`article` filter is a deliberate "long-form only" choice and must be preserved.

**Constraints from this repository.** `CLAUDE.md` records that `@apply` does not work
inside scoped `<style>` blocks in `.astro` files under Tailwind v4 without `@reference`,
and that plain CSS with `var(--color-*)` is preferred there. Commit `8fe8f93` disabled
Netlify edge-function emulation in dev because the adapter demanded a Deno runtime this
project does not have.

**Toolchain facts confirmed in `node_modules`.** Shiki 4.4.3 is present and ships
`night-owl` as a bundled theme; the Markdown pipeline already emits a `data-language`
attribute on each `<pre>`. `Intl.DateTimeFormat('pt-BR', {day:'2-digit', month:'long',
year:'numeric', timeZone:'UTC'})` produces `26 de maio de 2023` and `06 de novembro de
2023` — byte-identical to v2's Gatsby `formatString: "DD [de] MMMM [de] YYYY"`, including
zero-padding.

## Goals / Non-Goals

**Goals:**

- Change exactly one variable: the build stack. Content, URLs and appearance stay put, so
  any visual or behavioural difference after cutover is a regression, not a design choice.
- Make content transformation mechanical and re-runnable, so it can be reviewed as a diff
  rather than trusted as 44 hand edits.
- Leave the site with no client-side JavaScript of its own.
- End the dependency on third-party image hosts.

**Non-Goals:**

- Byte-identical CSS. The goal is visual equivalence, not a literal copy of v2's
  stylesheet through a different Tailwind major version.
- Preserving v2's internal component structure. The React component tree is an
  implementation detail of Gatsby; only its output matters.
- Byte-identical excerpts. Gatsby's `excerpt` has undocumented pruning behaviour; matching
  its intent (plain prose, word-boundary truncation) is sufficient.

## Decisions

### Transform content with a throwaway script, not by hand

A single Node script reads the 44 v2 posts and writes the migrated files: strip the
`YYYY-MM-DD-` filename prefix, rename `date` → `pubDate` and `layout` → `type`, change the
extension to `.md`, and leave post bodies untouched. The script is run once and deleted;
it is not a maintained part of the build.

*Why:* 44 files × 3 mechanical frontmatter edits is exactly the kind of work where hand
editing introduces silent typos, and a typo in `pubDate` reorders the index while a typo
in the filename breaks a live URL. A script makes the transformation uniform and lets the
result be reviewed as a diff.

*Alternative considered:* hand-editing each file during review. Rejected — slower and
strictly more error-prone, with no upside since no post needs individual judgment.

*Alternative considered:* keeping a permanent migration script in the repo. Rejected —
it is a one-shot operation; retaining it invites confusion about whether it still runs.

### Post bodies are copied verbatim

The script must not reflow, reformat or prettify post bodies. Only frontmatter and
filenames change.

*Why:* body edits cannot be reviewed meaningfully across 44 files, and any formatting
change risks altering rendered output — which is precisely what this port is trying to
hold constant. It also keeps `pnpm format` from being run over content; post bodies
should be added to `.prettierignore` if they are not already covered.

### Derive excerpts from raw body text in the shared post helper

Excerpt derivation lives alongside the existing post-querying helpers and exposes the two
lengths the specs require. It operates on the post's raw Markdown source: strip fenced and
indented code blocks first, then strip Markdown syntax (headings, emphasis, links —
keeping link text — images, blockquote markers, list markers), collapse whitespace, then
truncate at the last word boundary at or before the limit.

*Why:* stripping code before syntax matters — several posts open with a fenced block, and
leaking code into a meta description is worse than a short one. Truncating at a word
boundary reproduces Gatsby's behaviour and avoids splitting Portuguese words mid-accent.

*Alternative considered:* deriving from rendered HTML. Rejected — it requires rendering
every post before listing it, which makes the index build quadratic-ish for no gain, and
Astro's content APIs expose the raw body directly.

*Alternative considered:* generating 44 descriptions with an LLM and committing them as
frontmatter. Rejected for this change — it is a content-authoring decision, not a
migration one, and the optional `description` field leaves the door open to add them
incrementally later.

### Render the code-block language badge with CSS, not a rehype plugin

The Markdown pipeline already emits `data-language` on each `<pre>`. The green uppercase
badge is therefore a `::before` rule using `content: attr(data-language)` plus
`text-transform: uppercase`, with a selector that skips blocks whose language is absent
or plaintext.

*Why:* this was scoped as a rehype transform during exploration, but the attribute is
already there — so the whole feature is a handful of CSS lines with no plugin, no AST
manipulation, and nothing to keep in step with pipeline upgrades.

*Alternative considered:* a rehype plugin wrapping each `<pre>` in a figure with a real
badge element. Rejected as unnecessary complexity for identical output. If the badge ever
needs to be interactive or copyable, revisit.

### Use Shiki's bundled `night-owl` theme rather than porting prism-react-renderer

*Why:* both v2's `prism-react-renderer` nightOwl theme and Shiki's `night-owl` derive from
the same Night Owl VS Code theme, so colours are very close. Shiki runs at build time, so
code blocks cost zero client JavaScript — where v2 hydrated a React island per block.

*Trade-off:* the two tokenizers differ (Prism grammars vs TextMate), so a few tokens will
be coloured slightly differently. Accepted: this is invisible without a side-by-side diff
and is the one place where strict pixel fidelity is knowingly traded for a real
performance gain.

### Put content styling in a global stylesheet, not scoped `.astro` styles

v2's `mdx.css` is ported as a global stylesheet keyed off a content wrapper class.

*Why:* the styles target HTML generated at build time from Markdown, which scoped
`.astro` styles do not reach without `:global()` on nearly every rule. It also sidesteps
the `@apply`/`@reference` limitation `CLAUDE.md` documents, since the ported rules are
plain CSS with literal colour values rather than Tailwind utilities.

### Drop the Netlify adapter and build a static site

Remove `@astrojs/netlify` from the Astro config and let the project build as a plain
static site, with `netlify.toml` continuing to publish `dist/`.

*Why:* after this change the site has no dynamic routes, no server islands and no
middleware — every page is prerendered. The adapter exists to enable server-side
behaviour that nothing uses, and it has already cost this project friction: commit
`8fe8f93` disabled its edge-function emulation because it wanted a Deno runtime that is
not installed. Removing it deletes that workaround rather than maintaining it.

*Alternative considered:* keeping the adapter for future SSR. Rejected — re-adding it is
a one-line config change plus an install, which is cheaper than carrying a dependency
that actively complicates local development today.

*Note:* this is the one decision here that was flagged as unsettled during exploration.
It is low-stakes and reversible; it is resolved this way rather than deferred because it
changes the config work in the task list.

### Keep React as a dependency but disable the integration

**Revised during implementation.** `proposal.md` decided to keep React installed on
the reasoning that "Astro ships no JS for zero islands, so this costs nothing." The
first clause is true — no page requests a bundle — but the second is not: with
`react()` in `integrations`, the build emitted a 220,834-byte React runtime into
`dist/_astro/` that zero of the 47 pages referenced. Removing `react()` left only the
stylesheet.

The npm dependency and the Astro integration are separable, which the proposal
conflated. `react`, `react-dom` and `@astrojs/react` stay in `package.json` exactly as
decided, so re-enabling islands is adding one line back to the config rather than an
install — while the dead 220KB stops being deployed.

*Alternative considered:* leaving it emitted. Rejected — it is pure deploy weight with
no reader-visible effect either way, so there is nothing to trade off against removing it.

### Keep directory build output, but leave `trailingSlash` at `'ignore'`

**Revised during implementation.** The original decision was `trailingSlash: 'always'`, on
the reasoning that v2's live URLs carry trailing slashes and the sitemap must list the
addresses actually served. Both of those hold — but they are produced by the *directory*
build format, not by `trailingSlash`.

Setting `'always'` additionally makes Astro's dev and preview servers return 404 for the
slashless form (`/linktree`, `/post/<slug>`). Netlify serves that form in production with
a 301 to the canonical URL — verified against the live site — so `'always'` manufactured a
local-only failure with no production benefit, and it was hit in practice during review.

Under `'ignore'`, verified: the sitemap still lists all 46 URLs with trailing slashes, the
canonical tags still point at the trailing-slash form, the build still emits
`/post/<slug>/index.html`, and both URL forms resolve locally.

*Note:* production's slashless handling comes from Netlify, not from this repo. Nothing
depends on it — canonical tags and the sitemap only ever advertise the trailing-slash
form — but it is the reason no redirect rules are needed in `netlify.toml`.

### Tag labels live in one map with a safe fallback

The slug → label map is ported as shared data. Unlike v2 — where `TagClasses[tag].name`
would throw on an unmapped tag — the lookup falls back to the raw slug and surfaces a
build warning.

*Why:* v2 has a latent crash that is currently masked only because all 11 tags in use
happen to be mapped. Adding a tag to a post while forgetting the map should not break the
build. The schema keeps `tags` as free-form strings rather than an enum, so the fallback
is what makes that safe.

### Self-host all external images

Download the 7 live `static.structurizr.com` images into `public/uploads/` and rewrite
those references. For the 5 dead ones, source equivalent replacements — the C4 model and
AWS Lambda diagrams are canonical and re-findable; the LinkedIn image likely is not and
may need the surrounding prose adjusted or the figure dropped.

*Why:* 5 images rotted in under two years while every locally-hosted image survived. The
migration is the cheapest moment to fix this, since post bodies are already being handled.

*Trade-off:* the LinkedIn image is the one case where "faithful port" may be impossible —
if no replacement is found, that post loses a figure. Flagged in the task list as needing
author input rather than silently resolved.

## Risks / Trade-offs

**A mistyped slug silently breaks a live URL.** A post whose filename differs by one
character from its v2 slug 404s for every existing inbound link and search result, and
nothing in the build will complain. → The migration script derives filenames
mechanically from v2's, and a verification step diffs the built route list against the 46
URLs in the live sitemap. This check is the single most important gate before cutover and
is listed as a blocking task.

**Excerpt text will not match v2 exactly.** Index cards and meta descriptions will read
slightly differently from the live site. → Accepted and scoped as a non-goal. The
derivation matches v2's intent; only SEO snippets are affected, and they are regenerated
by crawlers anyway.

**Tailwind v4 will not reproduce v3-era utility output identically.** v2's classes were
compiled by Tailwind 3; some utilities changed defaults between majors, and v2's custom
`news: 672px` breakpoint and `green` colour need redefining under v4's `@theme` syntax. →
Port the visual result rather than the class strings, and review the header, index and
post pages side by side against the live site before cutover.

**The meyerweb reset and Tailwind v4 preflight may conflict.** v2 layered a 2011 reset on
top of Tailwind 3's preflight; ordering differences under v4 could produce subtly
different default margins. → Load the reset after Tailwind's base layer and verify prose
spacing against the live site, rather than assuming the stack composes the same way.

**Replacement figures may not match the originals.** Sourcing a "canonical" C4 or AWS
diagram risks substituting a different version than the one the prose describes. → Check
each replacement against the surrounding text; prefer dropping a figure over installing a
misleading one.

**Removing dark mode is hard to walk back.** The token system is being deleted, so
restoring dark mode later means rebuilding it rather than re-enabling it. → Called out
explicitly here because it was an active decision, not an oversight; `git` retains the
scaffold at commit `13429a5` if it is ever wanted back.

**`CLAUDE.md` will describe a site that no longer exists.** Its Conventions section
instructs using token utilities so dark mode keeps working, and describes React island
usage. → Updating it is a task in this change, not a follow-up; stale agent instructions
cause wrong work on every subsequent session.

## Migration Plan

1. **Transform** — run the migration script; review the resulting 44 files as a diff,
   confirming frontmatter mapping and untouched bodies.
2. **Assets** — copy `static/uploads` to `public/uploads`; download the 7 live external
   images and rewrite their references; resolve the 5 dead ones.
3. **Schema and helpers** — update the collection schema and add excerpt derivation.
4. **Routing** — move the post route to `/post/`, set `trailingSlash`, fold the blog index
   into `/`, add `/linktree`, remove `/sobre` and `/blog`.
5. **Styling and chrome** — replace the global stylesheet and rebuild the layout; delete
   `ThemeToggle` and `Counter`.
6. **Metadata** — analytics, verification token, feed and sitemap link updates.
7. **Verify** — build, then diff the generated route list against the live sitemap's 46
   URLs; confirm no client JS bundle is emitted; check pages side by side against the live
   site; run `pnpm verify`.
8. **Docs** — update `CLAUDE.md`.
9. **Cutover** — repointing the Netlify site and DNS is out of scope for this change.

**Rollback:** the live v2 site is untouched throughout; this change only produces a build.
Until cutover, rollback is "do not cut over". After cutover, rollback is repointing
Netlify at the v2 deploy, whose URLs are identical by construction — so no redirect
cleanup is needed in either direction.

## Open Questions

- **The LinkedIn figure in `como-se-tornar-um-senior`.** Its source URL is an expired
  signed CDN link with no recoverable original. Whether to substitute a different image,
  rewrite the surrounding sentence, or drop the figure needs the author's call. Deferrable:
  it affects one paragraph of one post and changes neither the specs nor the approach.
- **PWA manifest.** v2 generated one from `src/images/icon.png`; v3 has favicons but no
  manifest. Nothing observable depends on it and no spec covers it, so it can be added
  later if wanted.
