---
title: Site footer
requireScript: [site-footer]
---

The bottom of every page, one row: the line in `site.globals.footer` on the left, followed by "A project by" and a link when `site.globals.author` is set (then its `location`, when set), and on the right the links to
the style guide's workbench (`site.workbenchUrl` + `layouts/home`, the home layout with its docs, since the workbench's root is empty until it can open on a start item; then the link goes back to `site.workbenchUrl` alone), the sponsor page (when `site.globals.sponsor` is set), the credits with the publisher and data protection, labelled "Credits & legal" (`site/pages/credits.md`), and the search. The frame (`pages/frame`) keeps it at the bottom of the viewport
on a short page, and on a wide screen with room to spare (64em wide, 40em high) it stays there while the page
scrolls.

**X-ray.** A gimmick of this site: `src/scripts/site-footer.ts` adds an "X-ray" button (`aria-pressed`) at the end of
the links, so without JavaScript there is no control and nothing changes. Switched on, it imports
`src/scripts/xray.ts` (named in the footer's inert `<template>`, so it loads only then): the page fades to black and
goes monochrome under a veil, and the components marked with `data-xray="<id>"` in this style guide's templates, the
live examples and the figures blink in above it like bones on an x-ray. Each has a thin hairline frame (on its own
edge, for a component inside another) and a label with its id and a "»", a small chip on the frame's top edge, a link
to it in the workbench (`site.workbenchUrl` + the id). The link's name says where it goes ("components/video in the
style guide"); the "»" is hidden from assistive tech. It is underlined on hover and focus. Pointing at a component, or
at its label, or focusing the label, makes the frame glow; only the innermost component under the pointer does. The
header and the footer stay on top. It stays on for the session (sessionStorage); the button or Escape switches it
off, and the button fades the page back. A figure sits too close to the text around it for a frame and a chip, so
while the page is dark, x-ray gives it more room above and below, and takes it back while the page is dark again; the
reader's place in the page stays where it was. With reduced motion it just switches, without the fades and the
flicker.

X-ray runs only on a site page in the top window. In a frame (the workbench's Stage, a live example) and in a
workbench preview opened on its own, the footer has no button, and a session with x-ray on leaves it on for the next
site page.

Marked: the header, its nav, its search field and the menu button (`organisms/site-header`, `molecules/site-nav`), the
search page's field and button (`organisms/search`), the home page's row of actions (`layouts/home`, one component, so
the two buttons' frames don't cross), each group of the page map, the site cards and each card, the video, the live
examples, the figures with a caption (`figure.doc-figure`, labelled `atoms/figure`) and the footer. The styles are in
`base/xray.scss`; the veil's `backdrop-filter` and the components' filters are the exception `TASTE.md` allows for
x-ray.

Progressive enhancement: without anchor positioning there are no frames and labels, only the veil and the marked
components; without `backdrop-filter` the veil is a translucent black.
