---
title: Head
---

What the skin adds to every page's `<head>`: the icon, a preload for the three faces every page shows at once (Archivo
italic for the site title, Archivo upright for the headings, Atkinson Hyperlegible Next for the text), and `<meta name="text-scale" content="scale">`, which lets
the browser scale the root font size with the operating system's text size (Chrome 146 and later; other browsers
ignore it). Every size is in `rem` or `em` and the root font size is never set, so the whole page follows. Pattern
Dump writes the title, the description, the search and link-preview tags and the stylesheets itself, so they don't
belong here.

The preloads start the fonts with the page, not when the stylesheet asks for them. On the next page they come from the
cache before the first paint, so the crossfade between pages (`pages/frame`) shows the real fonts, not the fallback
swapping to them. `crossorigin` is needed even on the same origin: fonts are fetched in CORS mode, and a preload without
it would be fetched twice. The mono face is left out: only code uses it.
