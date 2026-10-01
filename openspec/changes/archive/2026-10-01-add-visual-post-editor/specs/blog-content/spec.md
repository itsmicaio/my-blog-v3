# Spec Delta

## RENAMED Requirements

- FROM: `### Requirement: Post images are served from a stable public path`
- TO: `### Requirement: Post images are served from the site's own origin`

## MODIFIED Requirements

### Requirement: Post slug derivation

A post's public slug SHALL be its filename without extension. Filenames SHALL NOT carry
a date prefix; the publication date is read from `pubDate` only. A date prefix is a
leading calendar date in `YYYY-MM-DD` form; a filename that merely begins with a number
or a year does not carry one. Filenames SHALL consist of lowercase ASCII letters and
digits, in groups joined by single hyphens. The slug SHALL be the sole determinant of the
post's URL, so that renaming a file is the only way to change a post's address.

A post whose filename breaks these rules SHALL be detected before deploy, including when
the post is a draft, and the production deploy SHALL NOT proceed while such a post is
present. The report SHALL name the offending file.

#### Scenario: Slug matches filename

- **WHEN** a post is stored as `entendendo-ecmascript-modules.md`
- **THEN** its public slug is `entendendo-ecmascript-modules`, regardless of its `pubDate`

#### Scenario: Two posts published on the same date

- **WHEN** two posts share the same `pubDate` but have different filenames
- **THEN** both are reachable at distinct URLs and neither collides

#### Scenario: Filename carries a date prefix

- **WHEN** a post is stored as `2026-09-30-teste-criando-um-conteudo.md`
- **THEN** the production deploy does not proceed, and the report names that file as carrying a date prefix

#### Scenario: Filename with accents or uppercase letters

- **WHEN** a post is stored as `meu-diário.md` or `Meu-Post.md`
- **THEN** the production deploy does not proceed, and the report names that file

#### Scenario: Draft with an invalid filename

- **WHEN** a post with `draft: true` is stored as `2026-09-30-rascunho.md`
- **THEN** it is reported and blocks the deploy exactly as a published post would, because publishing it later would keep that filename as its URL

#### Scenario: Filename that begins with a number

- **WHEN** a post is stored as `modulo-10-aws-essentials.md` or `2025-em-retrospectiva.md`
- **THEN** the filename is accepted, since neither begins with a full calendar date

#### Scenario: Existing corpus

- **WHEN** the filename rules are checked against the migrated posts
- **THEN** no file is reported

### Requirement: Post images are served from the site's own origin

Every image a post references SHALL be served from the site's own origin; posts SHALL NOT
depend on third-party image hosts. An image reference in a post body SHALL take one of two
forms:

- A site-relative path beginning with `/uploads/`, naming a file in the site's public
  uploads folder. The image SHALL be served unchanged at that path, so that the image
  references carried over from the previous site continue to work unmodified.
- A path relative to the post file that resolves to a file inside the posts folder. The
  image SHALL be optimised at build time and served from the site's origin, at an address
  the build chooses.

A reference that points to a file that does not exist, to an external host, to a path that
resolves outside the posts folder (including into the public folder), or to a site-relative
path outside `/uploads/` SHALL be detected before deploy, and the production deploy SHALL
NOT proceed while such a reference is present. The report SHALL name the file and the
offending reference. Image syntax inside a fenced code block is example content, not a
reference, and SHALL be ignored.

#### Scenario: Post references a migrated image

- **WHEN** a post body contains `![alt](/uploads/call-stack-size.png)`
- **THEN** the built site serves that image at `/uploads/call-stack-size.png`

#### Scenario: Post references an image stored next to it

- **WHEN** a post body contains `![alt](./images/diagrama.png)` and `src/content/blog/images/diagrama.png` exists
- **THEN** the post page shows an optimised copy of the image served from the site's own origin, with its width and height declared

#### Scenario: Post references an image that is absent

- **WHEN** a post references `/uploads/missing.png` or `./images/missing.png` and no such file exists
- **THEN** the production deploy does not proceed, and the report names the post and the missing reference, rather than the gap surfacing as a broken image to readers

#### Scenario: Post references an image in the public folder by a relative path

- **WHEN** a post body contains `![alt](../../../public/uploads/diagrama.png)`
- **THEN** the production deploy does not proceed, and the report names the post and the reference, even though the file exists on disk

#### Scenario: Post references an image outside the posts folder

- **WHEN** a post body contains `![alt](../../assets/diagrama.png)`
- **THEN** the production deploy does not proceed, and the report names the post and the reference

#### Scenario: Post references a site file outside uploads

- **WHEN** a post body contains `![alt](/favicon-32x32.png)`
- **THEN** the production deploy does not proceed, and the report names the post and the reference

#### Scenario: Image syntax inside a code block

- **WHEN** a fenced code block in a post body contains `![exemplo](imagem.png)`
- **THEN** it is not reported

#### Scenario: No post references an external image host

- **WHEN** the post corpus is inspected for image references
- **THEN** every reference is either a site-relative `/uploads/` path or a path to a file inside the posts folder
