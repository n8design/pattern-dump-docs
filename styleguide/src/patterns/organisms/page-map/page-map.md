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

**Layout.** The guide comes first; every other section follows in `.page-map-side`. One column on a narrow screen,
two from `48em` (the other sections stacked beside the guide), three equal columns from `64em` (the guide, then the
other sections two by two). The breakpoints are in `em`, so at 200% text the map drops a step. Source order is
reading order at every width.

`nav` is one level deep, so a folder inside a section shows as one entry, its `index.md`.

Every list has `role="list"`: with `list-style: none`, Safari drops a list's semantics, so VoiceOver would announce
neither the list nor a step's position in it.
