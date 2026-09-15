# Site Chrome

## Purpose

Defines the reader-facing shell shared across the site and the navigational pages that
are not individual posts: the persistent header, the home index that lists every post,
the linktree landing page, and the not-found page.

## Requirements

### Requirement: Persistent site header

Every page other than the linktree SHALL display a header pinned to the top of the
viewport containing the author's avatar, the author's name, and links to LinkedIn,
GitHub and Instagram. The avatar and name SHALL link to the home page. External profile
links SHALL open in a new tab. Page content SHALL NOT be obscured by the fixed header.

#### Scenario: Header on a post page

- **WHEN** a reader scrolls down a long post
- **THEN** the header remains fixed at the top and no body content is hidden beneath it

#### Scenario: Returning home

- **WHEN** a reader clicks the avatar or the author name
- **THEN** the home page loads

#### Scenario: Profile link

- **WHEN** a reader clicks the GitHub link
- **THEN** the profile opens in a new tab

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

The site SHALL render in a single light colour scheme using green `#4e8663` as its accent
against grey body text. The site SHALL NOT offer a dark mode or a theme toggle, and SHALL
NOT vary its appearance with the reader's operating-system colour preference. The layout
SHALL be readable from small mobile widths up to desktop.

#### Scenario: Reader prefers dark mode

- **WHEN** a reader whose system is set to dark mode opens any page
- **THEN** the site renders in its light scheme, unchanged

#### Scenario: No theme control is present

- **WHEN** a reader inspects the header on any page
- **THEN** no theme toggle is offered

#### Scenario: Mobile width

- **WHEN** any page is viewed on a narrow phone viewport
- **THEN** content is legible and the page does not scroll horizontally
