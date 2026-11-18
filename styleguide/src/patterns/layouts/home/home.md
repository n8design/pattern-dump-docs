---
title: Home
---

The home page (`layout: home` in `site/pages/index.md`): the eyebrow, the headline (`headline`, a list with one
sentence per line, or the page's `title` without one), the lede (`description`), the action, then the map of every
page (`organisms/page-map`) on the surface band.

The eyebrow names the Pattern Dump version the docs describe: `storefront.site.patternDumpVersion`, which
`site/pattern-dump.config.ts` reads from the installed package when the site builds, so it follows the pin. The action
is "Start the guide" (`/guide/`). An outlined second action, "Go to reference", comes with the first reference page. The layout renders no markdown body: the home page is the map.
