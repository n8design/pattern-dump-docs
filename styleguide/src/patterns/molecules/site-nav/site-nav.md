---
title: Site navigation
---

The site's sections, in the header (`organisms/site-header`): each top-level page of `nav`, without Home, since the
site's name links there. A page that stays out of the navigation says so itself, with `nav: false` in its
frontmatter: Credits (`/credits/`), which the footer links to, and Search (`/search/`), which is the header's search
field and shows its results there. Home can't do that: `nav: false` on the root `index.md` would leave out every
page, so the template skips its route. A folder's pages aren't listed here; the home page's map
(`organisms/page-map`) has them.

The current page's link has `aria-current="page"`. On one of a section's pages, the section's link has
`aria-current="true"`, so an article marks Articles. Both show as weight and an underline.
