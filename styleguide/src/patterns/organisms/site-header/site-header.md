---
title: Site header
requireScript: [site-header]
---

The bar at the top of every page: the logo mark and the site's name, linking home; the sections
(`molecules/site-nav`); a link to the project's code on GitHub, when `site.globals.repository` is set; and a
search field. The field sends its words to the search page (`/search/?q=…`), which shows
the results (`organisms/search`).

**The menu button.** The header is always one row and never wraps (`flex-wrap: nowrap`). When its parts no longer
fit, it is the logo and the name on the left and a menu button on the right. There is no breakpoint of its own: the
row's width (the logo and the name, the sections, GitHub, the search field, the gaps between them and the page gutters)
is measured once with the real fonts (`scripts/header-width.mjs`, `npm run header-width` after a change to the header)
and written to `_site-header-width.scss`, and below that width, plus 0.5em of air and 1.25em for a classic scrollbar,
a media query in em collapses it. So it follows the window and the reader's text size, holds from the first paint, and
works without JavaScript. Beside the width the script writes a fingerprint of the header as the home page writes it,
the font files and the stylesheets that set the row, and the build fails when that no longer matches.

With large text on a narrow phone, the name breaks onto two lines, only between its words. Where even its longest word
doesn't fit beside the button (a second width the script measures and writes), only the logo shows; the name stays in
the link, visually hidden, so it is still the link's name. `npm run header-check` drags a window across both widths
and back at 100 % and 200 % text and fails if the header is ever more than one row.

The button is the frame of the site's secondary actions (the border token, a control's edge at 3:1, no fill, square)
around Phosphor's List icon, its X while the menu is open (1.25rem, `TASTE.md` section 1). Its name is
"Menu" (`aria-label`), and `aria-expanded` follows the menu.

The menu is the same links, in the same order: the sections, GitHub, the search. They sit in `.site-menu`, a native
popover in the markup (`popover="auto"`, opened by `popovertarget`), which adds no box while they fit
(`display: contents`). Collapsed, Escape and a click outside close it and focus goes back to the button, with or
without the script; the script only keeps `aria-expanded`, and the icon with it, in step. `aria-expanded` isn't in
the markup: without the script the browser reports the button's state from the popover itself. It hangs from the header's bottom edge across the window: the sections as large rows with hairlines between them,
GitHub as one more row, then the search field. Opening, it is revealed from the header's edge downwards (`clip-path`,
0.25 s, ease-out); closing reverses it; with reduced motion it just opens. While it is open, the page under the header
is acrylic glass, the one blur `TASTE.md` allows (`.site-menu-glass`, an empty element of the header's own, placed
like the panel under the header's bottom edge; not the popover's `::backdrop`, which Safari puts below the window): blurred (1rem) with its colours a little
richer (saturate 1.4), dimmed by the `menu-veil` token at 40 %, with a faint grain on top, fractal noise from an inline
SVG at about 4 %, drawn as a background over the veil (a filter in `backdrop-filter` isn't supported everywhere). It
doesn't scroll, and the header stays sharp above it. With classic scrollbars, the scrollbar's gutter goes while the
menu is open, so the glass and the panel reach the window's right edge (a browser paints only the page's background
into a gutter). The script measures the scrollbar once, as `--scrollbar-width`, and the page takes padding of that
width in the gutter's place, so nothing in it moves; the header and the panel's rows reach across it, so the button
and the rows stay lined up. Without the script the page shifts by the scrollbar's width while the menu is open. The panel's bottom edge is the hairline and one drop shadow in
the `shadow` token, the one shadow `TASTE.md` allows; open, the panel's clip reaches below it so the shadow shows.

Resizing a window across the width, the script marks the header for one frame (`data-switching`), in which the menu
has no transition, so the sections leave the row the moment the button appears. It asks the style guide's own query
(`--site-menu-query` on the header) with `matchMedia`. Without the script, the sections stay in the row for the 0.25 s
of the panel's closing transition.

Progressive enhancement: with anchor positioning the panel and the backdrop meet the header's real edge, however tall
enlarged text makes it; without it they start at the header's one-row height, from the same rem values. Without
`@starting-style` the menu opens without the slide, and without `backdrop-filter` the veil is there without the blur.

**The shortcut.** `src/scripts/site-header.ts` focuses the field on ⌘K (Apple platforms) or Ctrl K (others), and
writes that hint into the field; with the menu collapsed, it opens the menu first. Without JavaScript the hint stays
empty and hidden, so it promises nothing.

On a wide screen with room to spare (`64em` wide, `40em` high) the header stays at the top while the page scrolls;
see `pages/frame`.
