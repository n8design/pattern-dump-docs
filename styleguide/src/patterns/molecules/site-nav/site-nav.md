---
title: Site navigation
---

The site's sections, in the header (`organisms/site-header`): each top-level page of `nav`, without Home, since the
site's name links there, and without Credits (`/credits/`), which the footer links to. Pattern Dump has no setting to
keep a page out of `nav`, so the template names that route. A folder's pages aren't listed here; the home page's map (`organisms/page-map`) has them.

The current page's link has `aria-current="page"`. On one of a section's pages, the section's link has
`aria-current="true"`, so an article marks Articles. Both show as weight and an underline.
