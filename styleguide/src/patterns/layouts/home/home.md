---
title: Home
---

The home page (`layout: home` in `site/pages/index.md`): the eyebrow, the headline (`headline`, a list with one
sentence per line, or the page's `title` without one), the lede (`description`), the action, then the map of every
page (`organisms/page-map`) on the surface band.

The eyebrow names the Pattern Dump version the docs describe: `storefront.site.patternDumpVersion`, which
`site/pattern-dump.config.ts` reads from the installed package when the site builds, so it follows the pin. The action
is "Start the guide" (`/guide/`). An outlined second action, "Go to reference", comes with the first reference page.

The page's markdown body goes into the map, under its groups, as the page map's `body`: a region of its own, named by
its first heading (the layout declares `page.headings` for that). On this site that is "Built with Pattern Dump",
a heading and a note like the map's groups, then the sites as [site cards](pattern:components/site-cards).

**At most three sites on the home page.** It is a map, and each card leads to a page with the details. In practice
lists every site built with Pattern Dump; a fourth one goes there, not here.
