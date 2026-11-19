---
title: About
description: What is in this starter, and where it lives.
layout: doc
toc: true
order: 1
---

## What is where

The pages are in `site/pages/`; the site itself is content only. What they look like is the skin, which comes from
the style guide package (`styleguide/`, installed into `site/` as `@pattern-dump-docs/styleguide`), written as ordinary
components so its workbench shows each part of it:

- `src/patterns/layouts/page`: the layout every page renders with, unless it names another
- `src/patterns/layouts/home`: the home page, the map of every page (`organisms/page-map`)
- `src/patterns/layouts/article`: an article's, with its related articles
- `src/patterns/pages/frame`: the frame around it: `organisms/site-header` (the name, the sections in
  `molecules/site-nav` and a search field) and `organisms/site-footer`
- `src/patterns/molecules/guide-progress` and `src/patterns/molecules/pager`: where a page sits in its section, and
  the previous and next page, which the reading layouts show
- `src/patterns/partials/head`: what the skin adds to every page's `<head>`
- `src/patterns/layouts/doc`: a reading page, which this page uses: its table of contents is beside the text
- `src/patterns/components/note`: a component the pages show
- `src/patterns/components/toc`: the table of contents
- `src/patterns/organisms/search`: the site's search, on the search page; `pd build` writes its index once the
  site has Pagefind (`npm install --save-dev pagefind -w @pattern-dump-docs/site`)

## Settings

The site's name and footer are `storefront.site` in `site/pattern-dump.config.ts`.
