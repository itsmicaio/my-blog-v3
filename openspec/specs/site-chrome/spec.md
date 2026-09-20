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
the site's RSS feed. The feed link and the profile links SHALL open in a new tab, so
that a reader who follows one does not lose the page they were reading. Profile links
SHALL point to the author's GitHub, LinkedIn, Instagram and YouTube presences.

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
- **THEN** the site's RSS feed is served in a new tab, leaving the current page open

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
labels, the post's short summary, the post's publication date, an estimated reading time,
and an ordinal post number. When a post carries more than three tags, the remainder SHALL
be indicated by a count rather than omitted silently. The whole entry SHALL be a single
link to the post.

Entries SHALL be presented as a grid that adapts from a single column on narrow viewports
to multiple columns on wider viewports. Entries sharing a row SHALL appear the same height
regardless of differing title lengths or tag counts, and an entry SHALL remain
well-formed when its post carries only one tag or none.

Estimated reading time SHALL be derived from the post's body prose, SHALL exclude the
contents of code blocks, and SHALL be expressed in whole minutes of at least one.

Where the design uses a monospaced face for the entry's labels, body text SHALL remain
legible if that face fails to load.

#### Scenario: Ordering

- **WHEN** a reader opens the home page
- **THEN** posts appear newest first and every published post is present

#### Scenario: Post with many tags

- **WHEN** a listed post declares five tags
- **THEN** three labels are shown followed by an indicator that two more exist

#### Scenario: Post with a single tag

- **WHEN** a listed post declares exactly one tag
- **THEN** that entry renders with one tag label and remains the same height as its row neighbours

#### Scenario: Clicking an entry

- **WHEN** a reader clicks anywhere on a post entry
- **THEN** that post's page loads

#### Scenario: Post type does not affect the index

- **WHEN** posts of type `blog`, `article` and `tutorial` are all published
- **THEN** all of them appear on the home page

#### Scenario: Reading time ignores code

- **WHEN** a listed post's body is mostly fenced code with a short prose introduction
- **THEN** its reading time reflects only the prose and is at least one minute

#### Scenario: Narrow viewport

- **WHEN** the home page is viewed on a narrow phone viewport
- **THEN** entries stack in a single column and the page does not scroll horizontally

#### Scenario: Draft entry in development

- **WHEN** a post with `draft: true` is listed during local development
- **THEN** its entry is marked as a draft alongside the post's other metadata

### Requirement: Home page entries carry an ordinal number

Each home page entry SHALL display an ordinal number derived from its position within the
set of posts actually listed, counted so that the oldest listed post is number 1 and the
newest listed post carries the highest number. Numbers SHALL therefore descend as the
reader moves down the page.

The number SHALL be presentational only. It SHALL NOT appear in any URL, feed entry, or
page metadata, and no other page SHALL refer to a post by it. Because it is derived from
position, a post's number MAY change when a post is published with an earlier publication
date than existing posts, and MAY differ between development and production whenever a
draft post is present.

#### Scenario: Newest and oldest

- **WHEN** 44 posts are listed on the home page
- **THEN** the newest is numbered 44 and the oldest is numbered 1

#### Scenario: Numbers descend down the page

- **WHEN** a reader reads two consecutive entries from top to bottom
- **THEN** the second entry's number is one lower than the first's

#### Scenario: Draft shifts numbering in development

- **WHEN** a draft post is listed in development and absent from the production build
- **THEN** it receives a number in development, and posts newer than it are numbered one
  higher in development than in production

#### Scenario: Number is not an address

- **WHEN** a reader looks for a post by its displayed number
- **THEN** no URL, feed entry, or metadata field exposes that number

### Requirement: Home page entries respond to pointer and keyboard focus

A home page entry SHALL change its appearance while it is hovered by a pointer or focused
via the keyboard, so that readers can tell which entry they are about to open. Pointer
hover and keyboard focus SHALL produce the same visible state, and that state SHALL be
reachable by tabbing through the page.

Entering or leaving that state SHALL NOT change the position or size of any other entry,
and SHALL NOT change the height of the row the entry sits in.

When the reader's system indicates a preference for reduced motion, any movement in that
state SHALL be suppressed while the change in colour remains, so the entry is still
distinguishable.

The home page SHALL remain fully usable where hover does not exist, such as on touch
devices.

#### Scenario: Pointer hover

- **WHEN** a reader moves the pointer over an entry
- **THEN** that entry visibly changes to indicate it is actionable, and the other entries do not move

#### Scenario: Keyboard focus

- **WHEN** a reader tabs to an entry without using a pointer
- **THEN** that entry shows the same visible state that pointer hover produces

#### Scenario: Reduced motion

- **WHEN** a reader whose system prefers reduced motion hovers an entry
- **THEN** the entry changes colour without moving

#### Scenario: Touch device

- **WHEN** a reader on a touch device taps an entry
- **THEN** the post opens, and no hover-only affordance was required to reach it

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
