---
title: Breadcrumbs
---

Where the page sits: Home, each folder above it, then the page itself (`aria-current="page"`). The separators are
drawn by CSS, so screen readers don't read them. A layout that declares `page.breadcrumbs` includes it,
`{{#if page.breadcrumbs.length}}{{> molecules-breadcrumbs }}{{/if}}`: the home page has an empty trail and none. The first item says Home whatever the home page's title is, which is written for the browser tab and search results.
