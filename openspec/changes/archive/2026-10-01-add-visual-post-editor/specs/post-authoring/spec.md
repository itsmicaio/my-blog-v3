# Spec Delta

## Purpose

Defines the repository's visual authoring setup: what a post created through it looks like,
so that a new post satisfies the content contract without hand-editing frontmatter, and
what the setup must leave alone.

## ADDED Requirements

### Requirement: New posts are created with a valid filename

A post created through the authoring setup SHALL be named after its title, with no date
prefix, with accented letters transliterated to their unaccented ASCII form, and within
the filename rules of the content model. The author SHALL be able to rename the file
before the post is first published, because the filename becomes the post's permanent
URL.

#### Scenario: Title with an accent

- **WHEN** the author creates a post titled `Teste criando um conteúdo`
- **THEN** the file is created as `src/content/blog/teste-criando-um-conteudo.md`

#### Scenario: No date prefix on creation day

- **WHEN** the author creates a post on 30 September 2026
- **THEN** the filename does not begin with `2026-09-30`

### Requirement: New posts build as soon as they are created

A post created through the authoring setup SHALL declare every frontmatter field the
content model requires, and SHALL build without errors before the author edits any
field other than the title. It SHALL start as a draft, with `type` defaulting to `blog`
and `pubDate` defaulting to the creation date. It SHALL declare no frontmatter key that
the content model does not define.

#### Scenario: Freshly created post

- **WHEN** the author creates a post and immediately runs the development server
- **THEN** the post loads without a schema error, is listed as a draft, and its frontmatter holds only keys the content model defines

#### Scenario: Default type stays off the linktree

- **WHEN** the author creates a post and does not change its type
- **THEN** its type is `blog`, so it does not appear on `/linktree` until the author deliberately chooses `article`

### Requirement: Dates are written as calendar dates

`pubDate` and `updatedDate` values written by the authoring setup SHALL be calendar dates
in `YYYY-MM-DD` form, taken from the author's local calendar, with no time-of-day or
time-zone offset component, matching the format of every existing post.

#### Scenario: Post created late in the evening

- **WHEN** the author creates a post at 22:30 on 30 September 2026 in UTC−3
- **THEN** its frontmatter reads `pubDate: 2026-09-30`, and its post page shows 30 de setembro de 2026

### Requirement: Field choices follow the content model

The authoring setup SHALL present `type` as a choice of exactly `blog`, `article`, and
`tutorial`, and `tags` as a multiple choice of exactly the tags for which the site defines
a display label. Neither field SHALL accept a free-typed value.

#### Scenario: Choosing a type

- **WHEN** the author opens the type field of a new post
- **THEN** exactly `blog`, `article`, and `tutorial` are offered

#### Scenario: Choosing tags

- **WHEN** the author opens the tags field
- **THEN** exactly the labelled tags are offered, and a tag not on that list cannot be entered through the field

### Requirement: Images dropped into the visual editor are stored next to the posts

An image pasted or dropped into a post in the visual editor SHALL be stored in an
`images` folder alongside the posts and SHALL be referenced from the post body by a path
relative to the post, so that the post satisfies the content model's image rules without
hand-editing. The editor SHALL show the image while the author writes. An image added
through the frontmatter tool's media panel SHALL be stored in the public uploads folder
and referenced as `/uploads/<file>`.

#### Scenario: Dropping an image into the visual editor

- **WHEN** the author drops `diagrama.png` into a post open in the visual editor
- **THEN** the file is stored at `src/content/blog/images/diagrama.png`, the body references `./images/diagrama.png`, the image is visible in the editor, and the pre-deploy post check passes

#### Scenario: Two images with the same name

- **WHEN** the author drops a second, different `diagrama.png` into any post
- **THEN** it is stored under a new name rather than overwriting the first, and both posts keep showing their own image

### Requirement: Opening a post does not modify it

Opening a post, in the standard text editor or in the visual editor, SHALL leave the file
byte-identical on disk; only saving an edit may rewrite it. Which editor opens a post by
default is the author's own editor setting, and the repository SHALL NOT set or override
it. The visual editor is not required to display a migrated post's `/uploads/` images.

#### Scenario: Opening a migrated post in the visual editor

- **WHEN** the author opens `call-stack-eo-javascript-single-threaded.md` and it opens in the visual editor
- **THEN** the file is unchanged on disk, even though its `/uploads/` images are not shown

#### Scenario: No repository-level editor association

- **WHEN** a fresh clone is opened in the editor
- **THEN** the repository's workspace settings do not choose a default editor for posts

### Requirement: The site does not depend on the authoring setup

The site SHALL build and deploy identically whether or not the authoring tools are
installed. No authoring configuration SHALL be read by the build or published in the
built site, and the authoring setup SHALL add no page, route, or client-side script to
the site. A fresh clone of the repository SHALL surface the authoring tools as workspace
recommendations.

#### Scenario: Building without the tools

- **WHEN** the site is built from a fresh clone on a machine without the authoring tools
- **THEN** the build succeeds and the built output is identical to one produced with them installed

#### Scenario: Built output

- **WHEN** the built site is inspected
- **THEN** it contains no authoring configuration file and no route belonging to the authoring setup

#### Scenario: Fresh clone

- **WHEN** a fresh clone is opened in the editor
- **THEN** the authoring tools are offered as recommended extensions
