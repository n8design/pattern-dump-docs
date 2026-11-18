---
title: Frame
---

The frame every layout fills: the header (`organisms/site-header`: the name, the sections and the search), the main
content, and the footer (`organisms/site-footer`), in one column. There is no navigation rail: the header has the
sections, and the home page is the map of every page.

The header, the footer and the bands inside the main content run the full width; their content lines up in a 72rem
container. `--site-gutter` is that container's inline padding, for any full-width element to use.

The frame is at least as tall as the viewport, so a short page keeps its footer at the bottom. A layout fills it with
`{{#> pages-frame }} … {{/pages-frame}}`.
