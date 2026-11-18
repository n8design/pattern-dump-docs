---
title: Head
---

What the skin adds to every page's `<head>`: the icon, and `<meta name="text-scale" content="scale">`, which lets
the browser scale the root font size with the operating system's text size (Chrome 146 and later; other browsers
ignore it). Every size is in `rem` or `em` and the root font size is never set, so the whole page follows. Pattern
Dump writes the title, the description, the search and link-preview tags and the stylesheets itself, so they don't
belong here.
