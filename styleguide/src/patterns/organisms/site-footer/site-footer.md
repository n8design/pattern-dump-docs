---
title: Site footer
requireScript: [site-footer]
---

The bottom of every page, one row: the line in `site.globals.footer` on the left, followed by "A project by" and a link when `site.globals.author` is set, and on the right the links to
the style guide's workbench (`site.workbenchUrl` + `layouts/home`, the home layout with its docs, since the workbench's root is empty until it can open on a start item; then the link goes back to `site.workbenchUrl` alone), the sponsor page (when `site.globals.sponsor` is set), the credits (`site/pages/credits.md`) and the search. The frame (`pages/frame`) keeps it at the bottom of the viewport
on a short page, and on a wide screen with room to spare (64em wide, 40em high) it stays there while the page
scrolls.

**X-ray.** A gimmick of this site: `src/scripts/site-footer.ts` adds an "X-ray" button (`aria-pressed`) at the end
of the links, so without JavaScript there is no control and nothing changes. Switched on, it imports
`src/scripts/xray.ts` (named in the footer's inert `<template>`, so it loads only then): the page fades to black and
goes monochrome under a veil, and the components marked with `data-xray="<id>"` in this style guide's templates, and
the live examples, blink in above it like bones on an x-ray. Each has a thin hairline frame and a label with its id,
a link to it in the workbench (`site.workbenchUrl` + the id). Pointing at a component, or at its label, or focusing
the label, makes the frame glow; only the innermost component under the pointer does. The header and the footer stay
on top. It stays on for the session (sessionStorage); the button or Escape switches it off. With reduced motion it
just switches, without the fade and the flicker.

Marked: the header, its nav, its search field and the menu button (`organisms/site-header`, `molecules/site-nav`),
the search page's field and button (`organisms/search`), the home page's two actions (`layouts/home`), each group
of the page map, the site cards and each card, the video, the live examples and the footer. The styles are in
`base/xray.scss`; the veil's `backdrop-filter` and the components' filters are the exception `TASTE.md` allows for
x-ray.

Progressive enhancement: without anchor positioning there are no frames and labels, only the veil and the marked
components; without `backdrop-filter` the veil is a translucent black.
