---
title: Site header
requireScript: [site-header]
---

The bar at the top of every page: the logo mark and the site's name, linking home; the sections
(`molecules/site-nav`); and a search field. The field sends its words to the search page (`/search/?q=…`), which shows
the results (`organisms/search`).

**The shortcut.** `src/scripts/site-header.ts` focuses the field on ⌘K (Apple platforms) or Ctrl K (others), and
writes that hint into the field. Without JavaScript the hint stays empty and hidden, so it promises nothing.

On a wide screen with room to spare (`64em` wide, `40em` high) the header stays at the top while the page scrolls;
see `pages/frame`.
