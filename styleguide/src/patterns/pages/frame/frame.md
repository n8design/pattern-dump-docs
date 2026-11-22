---
title: Frame
---

The frame every layout fills: the header (`organisms/site-header`: the name, the sections and the search), the main
content, and the footer (`organisms/site-footer`), in one column. There is no navigation rail: the header has the
sections, and the home page is the map of every page.

The header, the footer and the bands inside the main content run the full width; their content lines up in a
container as wide as a reading page needs. `--site-gutter` is that container's inline padding, for any full-width
element to use: 5 % of the page's width, at least 1rem and at most 2rem, so a narrow window keeps more of the column
and text never touches the edge. The page is a container (`container-type: inline-size`) and the gutter is in its
units (`cqi`), so it is the same wherever it is read: in the bars, in the column (a symbol image's bleed), in x-ray's
labels and in the open menu.

With classic scrollbars, the page keeps the scrollbar's gutter whether it scrolls or not (`scrollbar-gutter: stable`),
so its width doesn't change from page to page.

The frame is at least as tall as the viewport, so a short page keeps its footer at the bottom. A layout fills it with
`{{#> pages-frame }} … {{/pages-frame}}`.
