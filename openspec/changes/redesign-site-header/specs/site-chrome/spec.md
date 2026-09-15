## MODIFIED Requirements

### Requirement: Persistent site header

Every page other than the linktree SHALL display a header containing the author's avatar,
the author's name, a short tagline, a navigation group, a set of profile links, and
placeholder controls for features not yet built. The header SHALL be a dark panel sitting
at the top of the page content, above the cream reading column. It SHALL scroll with the
page; it SHALL NOT be pinned to the viewport, and SHALL NOT obscure page content at any
scroll position.

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
overflow, and the header SHALL require no client-side scripting to render or to lay out
at any width.

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

#### Scenario: Scripting disabled

- **WHEN** a reader loads any page with JavaScript turned off
- **THEN** the header renders and lays out exactly as it does with scripting enabled

### Requirement: Site visual identity

The site SHALL render in a single light colour scheme: a cream reading column
(`#F2EEE3`) laid over a near-black ground (`#0D1117`) that is visible only in the page
gutters, with emerald accents (`#2D6A4F`, `#52B788`) and a pale mint for high-contrast
detail on dark surfaces (`#D8F3DC`). The header SHALL be a dark panel against that
ground, providing the site's principal contrast with the reading column beneath it.
Headings and body copy SHALL be set in Space Grotesk and labels in Space Mono, and these
typefaces SHALL be served from the site's own origin so that rendering a page requires no
third-party font request.

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
- **THEN** the site renders in its one scheme, unchanged — the reading column stays cream

#### Scenario: No theme control is present

- **WHEN** a reader activates the display-mode control in the header
- **THEN** no working theme choice is offered and the site's colour scheme does not change

#### Scenario: Fonts are served first-party

- **WHEN** a page is loaded with outbound requests to third-party hosts blocked
- **THEN** the page still renders in Space Grotesk and Space Mono

#### Scenario: Mobile width

- **WHEN** any page is viewed on a narrow phone viewport
- **THEN** content is legible and the page does not scroll horizontally
