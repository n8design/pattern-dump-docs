---
title: Site header
requireScript: [site-header]
---

The bar at the top of every page: the logo mark and the site's name, linking home; the sections
(`molecules/site-nav`); a link to the project's code on GitHub, when `site.globals.repository` is set; and a
search field. The field sends its words to the search page (`/search/?q=…`), which shows
the results (`organisms/search`).

**The menu button.** When the sections no longer fit on one line, the header becomes one row: the logo on the
left, a menu button on the right. There is no breakpoint of its own: the sections' width in one line is measured once
with the real fonts (`scripts/nav-width.mjs`, `npm run nav-width` after a change to the nav) and written to
`_site-nav-width.scss`, and the header, a container, collapses wherever its content is narrower than that plus 0.5em
(`@container`, in em, at the header's 1rem). So it follows the window and the reader's text size, holds from the first
paint, and works without JavaScript. Beside the width the script writes a fingerprint of the sections' labels and
the font files, and the build fails when that no longer matches.

The button is the frame of the site's secondary actions (the border token, a control's edge at 3:1, no fill, square)
around three strokes drawn for this site, in the search icon's line style, an X while the menu is open. Its name is
"Menu" (`aria-label`), and `aria-expanded` follows the menu.

The menu is the same links, in the same order: the sections, GitHub, the search. They sit in `.site-menu`, a native
popover in the markup (`popover="auto"`, opened by `popovertarget`), which adds no box while they fit
(`display: contents`). Collapsed, Escape and a click outside close it and focus goes back to the button, with or
without the script; the script only keeps `aria-expanded`, and the icon with it, in step. It hangs from the header's bottom edge across the window: the sections as large rows with hairlines between them,
GitHub as one more row, then the search field. Opening, it is revealed from the header's edge downwards (`clip-path`,
0.25 s, ease-out); closing reverses it; with reduced motion it just opens. The page under the header is dimmed and
blurred while it is open (the popover's `::backdrop`, the `menu-veil` token and the one blur `TASTE.md` allows), and
doesn't scroll; the header stays sharp above it.

Resizing a window across the width, the sections stay in the row for the 0.25 s of the panel's closing transition
before the button appears.

Progressive enhancement: with anchor positioning the panel and the backdrop meet the header's real edge, however tall
enlarged text makes it; without it they start at the header's one-row height, from the same rem values. Without
`@starting-style` the menu opens without the slide, and without `backdrop-filter` the veil is there without the blur.

**The shortcut.** `src/scripts/site-header.ts` focuses the field on ⌘K (Apple platforms) or Ctrl K (others), and
writes that hint into the field; with the menu collapsed, it opens the menu first. Without JavaScript the hint stays
empty and hidden, so it promises nothing.

On a wide screen with room to spare (`64em` wide, `40em` high) the header stays at the top while the page scrolls;
see `pages/frame`.
