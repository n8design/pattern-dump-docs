---
title: Page map
---

Every page of the site, on the home page (`layouts/home`), built from `nav`: nothing is listed by hand.

- **A section** (a folder: a top-level entry with pages under it) is a group: its title as the heading, its
  `description` as the line under it, then its pages.
- **The guide** (the section at `/guide/`) is read in order, so it is an ordered list: a two-digit number, the title,
  and each page's `description`. The number is drawn by CSS and hidden from screen readers, which announce the list's
  own position.
- **Pages** collects the top-level pages that aren't in a section, Home aside. With none left (every one has
  `nav: false`), the group isn't shown.
- **`body`** (optional) is rendered markdown shown after the groups, across the full width of `.page-map-side`. Site
  cards in it sit one under each column of the groups on a wide screen. On the home page it is the page's markdown
  body, which the home layout gets from Pattern Dump. When the body has a heading, it is a `<section>` of its own,
  named by its first heading (`aria-labelledby` with the anchor from `page.headings`), so a screen reader announces it
  as a region of its own, inside "All pages", rather than as one more group of pages. Without a heading it is a plain
  block. Its heading and the paragraph right under it look like a group's title and note. Without `body`, nothing is
  shown.

**Layout.** The guide comes first; every other section follows in `.page-map-side`, then `body` across it. One
column on a narrow screen, two from `48em` (the other sections stacked beside the guide), three equal columns from
`64em` (the guide, then the other sections two by two). The breakpoints are in `em`, so at 200% text the map drops a
step. Source order is reading order at every width.

`nav` is one level deep, so a folder inside a section shows as one entry, its `index.md`.

Every list has `role="list"`: with `list-style: none`, Safari drops a list's semantics, so VoiceOver would announce
neither the list nor a step's position in it.
