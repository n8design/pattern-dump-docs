---
title: Site footer
---

The bottom of every page, one row: the line in `site.globals.footer` on the left, followed by "A project by" and a link when `site.globals.author` is set, and on the right the links to
the style guide's workbench (`site.workbenchUrl` + `layouts/home`, the home layout with its docs, since the workbench's root is empty until it can open on a start item; then the link goes back to `site.workbenchUrl` alone), the sponsor page (when `site.globals.sponsor` is set), the credits (`site/pages/credits.md`) and the search. The frame (`pages/frame`) keeps it at the bottom of the viewport
on a short page, and on a wide screen with room to spare (64em wide, 40em high) it stays there while the page
scrolls.
