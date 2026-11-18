---
title: Page map
---

Every page of the site, on the home page (`layouts/home`), built from `nav`: nothing is listed by hand.

- **A section** (a folder: a top-level entry with pages under it) is a group: its title as the heading, its
  `description` as the line under it, then its pages.
- **The guide** (the section at `/guide/`) is read in order, so it is an ordered list: a two-digit number, the title,
  and each page's `description`. The number is drawn by CSS and hidden from screen readers, which announce the list's
  own position.
- **Pages** collects the top-level pages that aren't in a section, Home aside.

`nav` is one level deep, so a folder inside a section shows as one entry, its `index.md`.
