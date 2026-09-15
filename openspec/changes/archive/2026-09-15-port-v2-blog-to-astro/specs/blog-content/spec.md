## Purpose

Defines the blog's post content model: the frontmatter every post must declare, how a
post's public slug and publication state are determined, how a post summary is produced
when the author writes none, and where post images live.

## ADDED Requirements

### Requirement: Post frontmatter contract

Every post SHALL declare `title` (string), `pubDate` (date), and `type`
(one of `blog`, `article`, `tutorial`). Every post MAY declare `tags` (a list of tag
slugs, defaulting to empty), `description` (string), `updatedDate` (date), and `draft`
(boolean, defaulting to `false`). A post missing a required field or carrying a `type`
outside the permitted set SHALL fail the build with an error naming the offending file.

#### Scenario: Post declares only the required fields

- **WHEN** a post declares `title`, `pubDate`, and `type` and nothing else
- **THEN** the build succeeds, the post is treated as published, and its tag list is empty

#### Scenario: Post omits a required field

- **WHEN** a post omits `pubDate`
- **THEN** the build fails and the error identifies the file and the missing field

#### Scenario: Post declares an unrecognized type

- **WHEN** a post declares `type: newsletter`
- **THEN** the build fails and the error identifies the file and the invalid value

### Requirement: Post slug derivation

A post's public slug SHALL be its filename without extension. Filenames SHALL NOT carry
a date prefix; the publication date is read from `pubDate` only. The slug SHALL be the
sole determinant of the post's URL, so that renaming a file is the only way to change a
post's address.

#### Scenario: Slug matches filename

- **WHEN** a post is stored as `entendendo-ecmascript-modules.md`
- **THEN** its public slug is `entendendo-ecmascript-modules`, regardless of its `pubDate`

#### Scenario: Two posts published on the same date

- **WHEN** two posts share the same `pubDate` but have different filenames
- **THEN** both are reachable at distinct URLs and neither collides

### Requirement: Draft posts are excluded from production

A post with `draft: true` SHALL be visible during local development and SHALL be absent
from production builds, including every post listing, the feed, and the sitemap. A draft
post SHALL NOT be reachable at its own URL in a production build.

#### Scenario: Draft in development

- **WHEN** a post has `draft: true` and the site is run in development
- **THEN** the post appears in listings and is reachable at its URL

#### Scenario: Draft in production

- **WHEN** a post has `draft: true` and the site is built for production
- **THEN** the post is absent from listings, the feed, and the sitemap, and its URL returns the 404 page

### Requirement: Post summaries are derived when not authored

When a post declares no `description`, the system SHALL derive a summary from the post's
body text. Derivation SHALL strip Markdown syntax so the result is plain prose, SHALL
exclude code block contents, and SHALL truncate at a word boundary rather than mid-word.
Two lengths SHALL be available: a short summary of at most 120 characters for post
listings, and a long summary of at most 200 characters for metadata. When a post does
declare a `description`, that text SHALL be used verbatim at both lengths.

#### Scenario: Post without a description

- **WHEN** a post declares no `description` and its body opens with prose
- **THEN** listings show a summary of at most 120 characters of that prose and metadata carries at most 200, both ending at a word boundary

#### Scenario: Post opening with a code block

- **WHEN** a post's body begins with a fenced code block followed by prose
- **THEN** the derived summary contains the prose and none of the code

#### Scenario: Post with an authored description

- **WHEN** a post declares `description: "Um guia sobre ES Modules"`
- **THEN** that exact text is used in both listings and metadata, untruncated

#### Scenario: Post shorter than the summary length

- **WHEN** a post's body prose is 60 characters long
- **THEN** the summary is those 60 characters with no ellipsis or padding

### Requirement: Post images are served from a stable public path

Images referenced by posts SHALL resolve at `/uploads/<filename>` so that the image
references carried over from the previous site continue to work unmodified. Every image
a post references SHALL be served from the site's own origin; posts SHALL NOT depend on
third-party image hosts.

#### Scenario: Post references a migrated image

- **WHEN** a post body contains `![alt](/uploads/call-stack-size.png)`
- **THEN** the built site serves that image at `/uploads/call-stack-size.png`

#### Scenario: Post references an image that is absent

- **WHEN** a post references `/uploads/missing.png` and no such file exists
- **THEN** the condition is detectable before deploy rather than surfacing as a broken image to readers

#### Scenario: No post references an external image host

- **WHEN** the migrated post corpus is inspected for image references
- **THEN** every reference is a site-relative `/uploads/` path
