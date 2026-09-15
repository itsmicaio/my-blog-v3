## MODIFIED Requirements

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

## ADDED Requirements

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
