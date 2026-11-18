---
title: Doc
---

A reading page, `layout: doc` (and the same structure for `layouts/article`):

1. **Progress** (`molecules/guide-progress`): on a page inside a section, the section, the step and a bar. Nothing on
   a page outside one.
2. **The reading row**: the table of contents (the `sidebar` region, `components/toc` first, then anything a page
   places there with `region="sidebar"`), then the article: the title, the description as the lede, the text at
   42rem, and the previous and next page (`molecules/pager`) at its end.

The table of contents comes first in the source, so it is first in reading and focus order, and on a narrow screen it
sits above the text. On a wide one (56em and up) a grid puts it in the column to the right of the text; that grid
placement is the one place where what you see and the source order differ. On a wide screen with room to spare
(64em wide, 40em high) it stays in view below the sticky header while the text scrolls.

Every doc page has a table of contents (`x-pd-toc`) when it has headings of level 2 or 3; a page with none has no
sidebar, and the text is the only column.
