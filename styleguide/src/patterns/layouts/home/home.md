---
title: Home
---

The home page (`layout: home` in `site/pages/index.md`): the hero, a band with the start row and the promise, then
the map of every page (`organisms/page-map`) on the surface band.

**The hero.** The eyebrow, the headline (`headline`, a list with one sentence per line, or the page's `title`
without one), the lede (`lede`), the two actions and one line to the examples. The eyebrow names the Pattern Dump
version the docs describe, `site.patternDumpVersion`, which `site/pattern-dump.config.ts` reads from the installed
package when the site builds, so it follows the pin. The actions are "Start the guide" (`/guide/`), filled with the
accent, and "Support it" (`site.sponsor.href`), outlined: one accent only. They wrap below each other on a narrow
phone, in source order. Under them, "See it at work" links the demo and this site, as body text.

`title` and `description` are for the browser tab, search results and link previews, so they carry the search term
the hero doesn't; the breadcrumbs and the pager still call the page Home.

**The band.** Two sections on one ground that blends from `surface` (the hero's) into `surface-subtle` (the map's),
so the eye is led down into the map: the one gradient `TASTE.md` allows, for this place only. A hairline parts each
section from the next, as before the map.

- **Start in one command:** the page's `start` region, a [labelled code](pattern:components/labelled-code) block
  without a label holding the command, beside the version, its release date (`site.patternDumpReleased`, from the
  package's `CHANGELOG.md`), the Node version and the licence. The two start level; below `40em` they stack.
- **The promise:** the heading and its sentence, the page's `promise` region, two [labelled code](pattern:components/labelled-code)
  blocks side by side, a page and what `pd build` printed for it, and a line to How checks work and the benchmark.

A section whose region is empty is left out, and the band with both.

The page's markdown body goes into the map, under its groups, as the page map's `body`: a region of its own, named by
its first heading (the layout declares `page.headings` for that). On this site that is "Built with Pattern Dump",
a heading and a note like the map's groups, then the sites as [site cards](pattern:components/site-cards).

**At most three sites on the home page.** It is a map, and each card leads to a page with the details. In practice
lists every site built with Pattern Dump; a fourth one goes there, not here.
