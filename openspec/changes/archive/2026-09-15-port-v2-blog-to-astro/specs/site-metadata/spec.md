## Purpose

Defines the output the site produces for machines rather than readers: per-page metadata
for search engines and link previews, the syndication feed, the sitemap, and visitor
analytics.

## ADDED Requirements

### Requirement: Per-page metadata

Every page SHALL declare a document language of Brazilian Portuguese, a title, a
description, and a canonical URL. A post page's title SHALL be the post title and its
description SHALL be the post's long summary. Non-post pages SHALL carry their own title
and the site description. The site SHALL emit the search-console verification token the
previous site published, so that ownership verification survives the migration.

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
