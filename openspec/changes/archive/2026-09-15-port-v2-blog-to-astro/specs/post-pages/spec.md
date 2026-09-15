## Purpose

Defines how an individual blog post is presented to a reader: the URL it lives at, the
header information shown above the article, how Markdown body content is rendered, and
how code blocks are displayed.

## ADDED Requirements

### Requirement: Posts are served at /post/<slug>/

Every published post SHALL be reachable at `/post/<slug>/` with a trailing slash. A
request to the same path without a trailing slash SHALL resolve to the same post rather
than returning an error. These addresses SHALL match the previously published site
exactly, so that no post URL changes and no redirect is required.

#### Scenario: Reader opens a post

- **WHEN** a reader requests `/post/entendendo-ecmascript-modules/`
- **THEN** that post is rendered

#### Scenario: Request omits the trailing slash

- **WHEN** a reader requests `/post/entendendo-ecmascript-modules`
- **THEN** the same post is served or the reader is sent to the canonical trailing-slash URL

#### Scenario: Every previously published URL still resolves

- **WHEN** each of the 44 post URLs published by the previous site is requested
- **THEN** each resolves to the corresponding post and none returns the 404 page

#### Scenario: Unknown slug

- **WHEN** a reader requests `/post/nao-existe/`
- **THEN** the 404 page is returned

### Requirement: Post header shows title, date and tags

A post page SHALL display the post's title, its publication date, and its tags. The date
SHALL be rendered in Brazilian Portuguese long form — day, month name, year — and SHALL
reflect the date as authored, without shifting by a day due to timezone interpretation.
Tags SHALL be shown using human-readable labels rather than raw slugs.

#### Scenario: Date rendering

- **WHEN** a post declares `pubDate: 2023-05-26`
- **THEN** the page displays "26 de maio de 2023"

#### Scenario: Tag labels

- **WHEN** a post declares `tags: [nodejs, aleatorio]`
- **THEN** the page displays "NodeJS" and "Aleatório", not "nodejs" and "aleatorio"

#### Scenario: Post with no tags

- **WHEN** a post declares no tags
- **THEN** the header renders without an empty or broken tag area

#### Scenario: Tag with no defined label

- **WHEN** a post declares a tag that has no human-readable label defined
- **THEN** the page still renders and the condition is surfaced to the author rather than crashing the build

### Requirement: Post body renders Markdown with the site's prose styling

A post body SHALL render headings, paragraphs, lists, emphasis, links, blockquotes,
images, horizontal rules, and inline code with the typography of the previously published
site. Links within post bodies SHALL open in a new tab. Images SHALL be centred and
constrained to the content width. Content SHALL remain readable at mobile widths without
horizontal page scrolling.

#### Scenario: Prose elements render

- **WHEN** a post body contains headings, lists, a blockquote and a horizontal rule
- **THEN** each renders with the previous site's spacing, weight and green accent treatment

#### Scenario: Body link

- **WHEN** a reader clicks a link inside a post body
- **THEN** it opens in a new tab

#### Scenario: Narrow viewport

- **WHEN** a post is viewed below the site's content breakpoint
- **THEN** body text is padded from the screen edges and the page does not scroll horizontally

#### Scenario: Wide content inside a post

- **WHEN** a post contains a table or a long unbroken code line
- **THEN** that element scrolls within its own bounds and the page itself does not scroll horizontally

### Requirement: Code blocks are highlighted at build time

Fenced code blocks SHALL be syntax-highlighted using the previously published site's
colour scheme, and SHALL display the language name in uppercase on a green badge above
the code. Highlighting SHALL be performed when the site is built; no client-side
JavaScript SHALL be required to display a highlighted code block. Long lines SHALL scroll
within the code block.

#### Scenario: Fenced block with a language

- **WHEN** a post contains a code block fenced as `js`
- **THEN** the block is highlighted and shows a green "JS" badge above it

#### Scenario: Fenced block without a language

- **WHEN** a post contains a code block with no language declared
- **THEN** the block renders without a badge and without failing the build

#### Scenario: Reader has JavaScript disabled

- **WHEN** a post page is viewed with JavaScript disabled
- **THEN** code blocks are fully highlighted and the badge is present
