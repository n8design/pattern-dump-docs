---
title: Doc
---

A reading page, `layout: doc` (and the same structure for `layouts/article`):

1. **Progress** (`molecules/guide-progress`): on a page inside a section, the section, the step and a bar. Nothing on
   a page outside one.
2. **The reading row**: the aside, then the article. The aside holds the table of contents (the `sidebar` region,
   `components/toc` first, then anything a page places there with `region="sidebar"`) and below it "In this section"
   (`molecules/section-nav`), the pages of the page's section, closed until opened. The article: the title, the
   description as the lede, the text at 42rem, and the previous and next page (`molecules/pager`) at its end.

The table of contents comes first in the source, so it is first in reading and focus order, and on a narrow screen it
sits above the text. On a wide one (56em and up) a grid puts it in the column to the right of the text; that grid
placement is the one place where what you see and the source order differ. On a wide screen with room to spare
(64em wide, 40em high) it stays in view between the sticky header and footer while the text scrolls, and scrolls
itself when it is taller than that room.

Every doc page has a table of contents (`x-pd-toc`) when it has headings of level 2 or 3, and "In this section" when
its section has pages of its own. A page with neither has no aside, and the text is the only column.
