---
title: Doc
requireScript: [example-variants]
---

A reading page, `layout: doc` (and the same structure for `layouts/article`):

1. **Progress** (`molecules/guide-progress`): on a page in the Guide, the section, the step and a bar. Nothing on a
   page anywhere else.
2. **The reading row**: the article, then the aside. The article: the title, the description as the lede, the text at
   42rem, and the previous and next page (`molecules/pager`) at its end. The aside holds the table of contents (the `sidebar` region,
   `components/toc` first, then anything a page places there with `region="sidebar"`) and below it "In this section"
   (`molecules/section-nav`), the pages of the page's section, closed until opened.

The text comes first in the source, so it is first in reading and focus order, and on a narrow screen the aside follows
it. On a wide one (56em and up) a grid puts the aside in the column to the right of the text, the order the source has.
On a wide screen with room to spare
(64em wide, 40em high) it stays in view between the sticky header and footer while the text scrolls, and scrolls
itself when it is taller than that room.

Every doc page has a table of contents (`x-pd-toc`) when it has headings of level 2 or 3, and "In this section" when
its section has pages of its own. A page with neither has no aside, and the text is the only column.

A live example's variants switch in its frame, in place (`src/scripts/example-variants.ts`, loaded by
`requireScript: [example-variants]` above); without scripting each variant's link opens its preview.
