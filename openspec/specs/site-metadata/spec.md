# Site Metadata

## Purpose

Defines the output the site produces for machines rather than readers: per-page metadata
for search engines and link previews, the syndication feed, the sitemap, and visitor
analytics.

## Requirements

### Requirement: Per-page metadata

Every page SHALL declare a document language of Brazilian Portuguese, a title, a
description, and a canonical URL. A post page's title SHALL be the post title and its
description SHALL be the post's long summary. Non-post pages SHALL carry their own title
and the site description. The site SHALL emit the search-console verification token the
previous site published, so that ownership verification survives the migration.

Every page SHALL also declare a share image for link previews: its absolute URL, its
width and height in pixels, and an alternative text, in both the Open Graph and the
Twitter card vocabularies. A post page SHALL reference its own share image, with the post
title as the alternative text, and SHALL declare the `article` type. Every other page
SHALL reference the site's default share image and SHALL declare the `website` type.

#### Scenario: Post page metadata

- **WHEN** a post page is built
- **THEN** its title is the post title, its description is the post's long summary, and its canonical URL is its own trailing-slash address

#### Scenario: Home page metadata

- **WHEN** the home page is built
- **THEN** it declares the site title and site description

#### Scenario: Language declaration

- **WHEN** any page is built
- **THEN** its root element declares `pt-BR`

#### Scenario: Ownership verification

- **WHEN** the home page is built
- **THEN** it carries the same search-console verification token as the previous site

#### Scenario: Post page share image declaration

- **WHEN** the page for `entendendo-ecmascript-modules` is built
- **THEN** its head declares `https://caiofuzatto.com.br/og/entendendo-ecmascript-modules.png` as the share image, with width 1200, height 630, the post title as alternative text, and `article` as the page type

#### Scenario: Non-post page share image declaration

- **WHEN** the home, linktree or 404 page is built
- **THEN** its head declares `https://caiofuzatto.com.br/og/site.png` as the share image, with width 1200, height 630, an alternative text naming the site, and `website` as the page type

#### Scenario: Share image URL is absolute

- **WHEN** the share image declaration of any page is read
- **THEN** it is a full URL on the site's own origin, never a path, because preview crawlers do not resolve relative references

### Requirement: Syndication feed

The site SHALL publish a feed at `/rss.xml` listing published posts newest first. Each
item SHALL carry the post's title, its long summary, its publication date, and an
absolute link to its `/post/<slug>/` address. Draft posts SHALL be absent. The feed SHALL
declare Brazilian Portuguese as its language, and SHALL be discoverable from every page.

#### Scenario: Feed contents

- **WHEN** the feed is requested
- **THEN** it lists every published post newest first with absolute `/post/<slug>/` links

#### Scenario: Draft exclusion

- **WHEN** a draft post exists and the feed is built for production
- **THEN** that post is absent from the feed

#### Scenario: Feed discovery

- **WHEN** a feed reader loads any page of the site
- **THEN** it can discover the feed from that page's markup

### Requirement: Sitemap

The site SHALL publish a sitemap covering every published post plus the home and linktree
pages. Sitemap URLs SHALL exactly match the addresses the site serves, including trailing
slashes. Draft posts SHALL be absent.

#### Scenario: Sitemap coverage

- **WHEN** the sitemap is built
- **THEN** it contains every published post URL plus `/` and `/linktree/`

#### Scenario: URL form matches served addresses

- **WHEN** a URL is read from the sitemap and requested
- **THEN** it resolves directly without a redirect

#### Scenario: Draft exclusion

- **WHEN** a draft post exists and the sitemap is built for production
- **THEN** that post's URL is absent

### Requirement: Visitor analytics

The site SHALL report page views to the analytics property the previous site used, so that
historical traffic data remains continuous across the migration. Analytics SHALL load on
every reader-facing page and SHALL NOT block page rendering.

#### Scenario: Page view reporting

- **WHEN** a reader loads any page
- **THEN** a page view is reported to the same analytics property the previous site used

#### Scenario: Analytics does not block rendering

- **WHEN** the analytics script is slow or unreachable
- **THEN** the page content still renders

### Requirement: The site ships no client-side JavaScript for its own features

No reader-facing feature SHALL depend on client-side JavaScript to render its content.
Aside from the analytics script, a page SHALL ship no JavaScript bundle. A reader with
JavaScript disabled SHALL be able to read every post and navigate the whole site.

#### Scenario: JavaScript disabled

- **WHEN** a reader with JavaScript disabled browses the site
- **THEN** every page renders fully, including highlighted code blocks, and every link works

#### Scenario: No framework runtime is served

- **WHEN** any built page is inspected for its script requests
- **THEN** no UI framework runtime bundle is requested

### Requirement: Share images are produced when the site is built

The site SHALL produce one share image per published post, at `/og/<slug>.png`, and one
default share image at `/og/site.png`. Each SHALL be a PNG of 1200 × 630 pixels served
from the site's own origin. Images SHALL be produced when the site is built, as files in
the build output; no request-time rendering and no client-side JavaScript SHALL be
involved. A post with `draft: true` SHALL have no image in a production build.

#### Scenario: Every published post has an image

- **WHEN** the site is built for production
- **THEN** for every post URL in the sitemap, the file `/og/<slug>.png` exists in the output and is a 1200 × 630 PNG

#### Scenario: Default image exists

- **WHEN** the site is built
- **THEN** `/og/site.png` exists in the output and is a 1200 × 630 PNG

#### Scenario: Draft exclusion

- **WHEN** a post with `draft: true` exists and the site is built for production
- **THEN** no `/og/<slug>.png` is produced for it, while in development the image can still be previewed at that address

#### Scenario: Static output only

- **WHEN** the build output is inspected
- **THEN** the images are plain files under `/og/`, and no server function, adapter or script is required to serve them

#### Scenario: Rendering failure blocks the deploy

- **WHEN** a post's image cannot be rendered during the build
- **THEN** the build fails and names the post, rather than publishing a page whose declared share image is missing

### Requirement: Post share image content

A post's share image SHALL present the post as the home page's post card, in the site's
visual identity: the post's ordinal among published posts, its reading time, its tags,
its title in uppercase, its short summary, its publication date as `YYYY-MM-DD`, and the
author's name with the site avatar.

#### Scenario: Typical post

- **WHEN** the image for a post titled "Entendendo ECMAScript Modules" with tags `javascript` and `nodejs`, published on 2023-05-26, is rendered
- **THEN** it shows the title in uppercase, the short summary beneath it, the tag labels "JavaScript" and "NodeJS", the date `2023-05-26`, the reading time, the post's ordinal, and the author line

#### Scenario: No tags

- **WHEN** a post declares no tags
- **THEN** the image renders without an empty tag row or a stray marker

#### Scenario: Authored description

- **WHEN** a post declares a `description`
- **THEN** that text is the summary shown on the image, as it is on the card

#### Scenario: Accented text

- **WHEN** a title or summary contains `ã`, `ç`, `é`, `õ` or `ê`
- **THEN** each glyph is drawn by the site's own typefaces, with no fallback font or missing-glyph box

### Requirement: Post share image text fitting

Text on a post's share image SHALL be fitted so that nothing overflows the card or
overlaps another element: the title is reduced one size step and then clamped to three
lines; the summary is clamped to three lines; at most three tags are shown, followed by
the count of the rest.

#### Scenario: Long title

- **WHEN** the image for a post titled "Fiz um script de projeção do resultado das Eleições no Brasil" is rendered
- **THEN** the title is drawn at the smaller size and ends with an ellipsis if it still exceeds three lines, and it does not overlap the summary beneath it

#### Scenario: Long summary

- **WHEN** a post's short summary would exceed three lines at the summary size
- **THEN** it is clamped to three lines with an ellipsis, and it does not overlap the date row

#### Scenario: More than three tags

- **WHEN** a post declares five tags
- **THEN** the image shows the first three tag labels and a `+2` marker

### Requirement: Site default share image content

The default share image SHALL present the site in the same visual identity as the post
image: the site title, the tagline, the site description, the site's address, and the
avatar. It SHALL carry no post-specific element such as a reading time, tags or a post
ordinal.

#### Scenario: Default image contents

- **WHEN** `/og/site.png` is rendered
- **THEN** it shows "Caio Fuzatto", the tagline, the site description, `caiofuzatto.com.br` and the avatar, with no reading time, tags or post number
