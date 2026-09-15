# Site Chrome

## Purpose

Defines the reader-facing shell shared across the site and the navigational pages that
are not individual posts: the persistent header, the home index that lists every post,
the linktree landing page, and the not-found page.

## Requirements

### Requirement: Persistent site header

Every page other than the linktree SHALL display a header containing the author's avatar,
the author's name, a short tagline, a navigation group, a set of profile links, and
placeholder controls for features not yet built. The header SHALL be a full-bleed bar at
the top of the page, spanning the viewport edge to edge with no surrounding border or
frame, arranged as two rows: a dark upper row carrying the brand, navigation and
controls, and a lighter band beneath it carrying the profile links. It SHALL scroll with
the page; it SHALL NOT be pinned to the viewport, and SHALL NOT obscure page content at
any scroll position.

The avatar and name SHALL link to the home page. The navigation group SHALL offer a link
to the home page, marked as the current section when the reader is on it, and a link to
the site's RSS feed. Profile links SHALL point to the author's GitHub, LinkedIn,
Instagram and YouTube presences, and SHALL open in a new tab.

The header SHALL also present controls for capabilities that are not implemented: a
section link reserved for an about page, a language selector, and a display-mode control.
Each SHALL be visible, SHALL NOT navigate or alter the page when activated, SHALL be
identifiable as unavailable to assistive technology, and SHALL remain reachable by
keyboard so that its existence is discoverable rather than silent.

At narrow viewport widths the header's groups SHALL stack vertically rather than
overflow, and the profile links SHALL wrap onto multiple lines so that every one of them
is visible at once. No part of the header SHALL require horizontal scrolling to reach a
control. The header SHALL require no client-side scripting to render or to lay out at any
width.

#### Scenario: Header on a post page

- **WHEN** a reader scrolls down a long post
- **THEN** the header scrolls up out of view with the content, and no body content is
  hidden beneath it at any scroll position

#### Scenario: Returning home

- **WHEN** a reader clicks the avatar or the author name
- **THEN** the home page loads

#### Scenario: Profile link

- **WHEN** a reader clicks the GitHub link
- **THEN** the profile opens in a new tab

#### Scenario: Reaching the feed

- **WHEN** a reader clicks the RSS item in the header navigation
- **THEN** the site's RSS feed is served

#### Scenario: Current section is marked

- **WHEN** a reader is on the home page
- **THEN** the navigation item for the post index is shown as the current section

#### Scenario: Activating an unimplemented control

- **WHEN** a reader clicks the about link, the language selector or the display-mode
  control
- **THEN** the page does not navigate and nothing about the page changes

#### Scenario: Unimplemented control reaches assistive technology

- **WHEN** a reader tabs through the header with a screen reader
- **THEN** the about link, the language selector and the display-mode control are each
  reached and announced as unavailable

#### Scenario: Narrow viewport

- **WHEN** the header is viewed on a narrow phone viewport
- **THEN** its groups stack vertically and the page does not scroll horizontally

#### Scenario: Profile links on a narrow viewport

- **WHEN** four profile links are configured and the header is viewed on a narrow phone
  viewport
- **THEN** all four are visible at once, wrapped onto two lines, with no horizontal
  scrolling anywhere in the header

#### Scenario: Scripting disabled

- **WHEN** a reader loads any page with JavaScript turned off
- **THEN** the header renders and lays out exactly as it does with scripting enabled

### Requirement: Home page lists every published post

The home page at `/` SHALL list every published post in reverse chronological order,
newest first, with no pagination. Each entry SHALL show the post title, up to three tag
labels, and the post's short summary. When a post carries more than three tags, the
remainder SHALL be indicated by a count rather than omitted silently. The whole entry
SHALL be a single link to the post.

#### Scenario: Ordering

- **WHEN** a reader opens the home page
- **THEN** posts appear newest first and every published post is present

#### Scenario: Post with many tags

- **WHEN** a listed post declares five tags
- **THEN** three labels are shown followed by an indicator that two more exist

#### Scenario: Clicking an entry

- **WHEN** a reader clicks anywhere on a post entry
- **THEN** that post's page loads

#### Scenario: Post type does not affect the index

- **WHEN** posts of type `blog`, `article` and `tutorial` are all published
- **THEN** all of them appear on the home page

### Requirement: Linktree page

A page at `/linktree/` SHALL present a compact profile view: the author's avatar and
name, prominent links to LinkedIn, GitHub and Instagram, and the four most recent posts
of type `article`. Posts of other types SHALL be excluded, so that diary entries and
course notes do not appear. The page SHALL provide a link to the full post index.

#### Scenario: Only articles are listed

- **WHEN** the most recent posts include entries of type `blog` and `article`
- **THEN** only the four most recent `article` posts are listed

#### Scenario: Fewer than four articles exist

- **WHEN** only two posts of type `article` are published
- **THEN** both are listed and the page renders without empty placeholder entries

#### Scenario: Reaching the full index

- **WHEN** a reader clicks the link to see everything
- **THEN** the home page loads

### Requirement: Not-found page

A request for an address the site does not serve SHALL render a not-found page written in
the site's language, offering a link back to the home page, and presented in the site's
own visual design.

#### Scenario: Unknown address

- **WHEN** a reader requests a path that does not exist
- **THEN** the not-found page renders in Portuguese with a working link home

### Requirement: Site visual identity

The site SHALL render in a single light colour scheme on a cream page (`#F4F1EA`), with
emerald accents (`#2D6A4F`, `#52B788`). The header SHALL supply the site's principal
contrast as a dark bar (`#131B17`) whose second row is a lighter cream band (`#DFD9CB`).
Colours intended for dark surfaces SHALL be confined to the header bar, and colours
intended for light surfaces SHALL be confined to the band and the page, so that no text
is placed on a ground it was not measured against. Headings and body copy SHALL be set in
Space Grotesk and labels in Space Mono, and these typefaces SHALL be served from the
site's own origin so that rendering a page requires no third-party font request.

The site SHALL NOT offer a working theme or colour-scheme choice, and SHALL NOT vary its
appearance with the reader's operating-system colour preference. A disabled display-mode
control MAY be present as a placeholder for a future capability; its eventual behaviour is
not defined by this requirement and it SHALL NOT change the site's appearance while it
remains a placeholder. The layout SHALL be readable from small mobile widths up to
desktop.

#### Scenario: Reader prefers light mode

- **WHEN** a reader whose system is set to light mode opens any page
- **THEN** the site renders in its one scheme, unchanged

#### Scenario: Reader prefers dark mode

- **WHEN** a reader whose system is set to dark mode opens any page
- **THEN** the site renders in its one scheme, unchanged — the page stays cream

#### Scenario: No theme control is present

- **WHEN** a reader activates the display-mode control in the header
- **THEN** no working theme choice is offered and the site's colour scheme does not change

#### Scenario: Fonts are served first-party

- **WHEN** a page is loaded with outbound requests to third-party hosts blocked
- **THEN** the page still renders in Space Grotesk and Space Mono

#### Scenario: Mobile width

- **WHEN** any page is viewed on a narrow phone viewport
- **THEN** content is legible and the page does not scroll horizontally
