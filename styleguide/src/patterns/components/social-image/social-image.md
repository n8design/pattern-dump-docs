---
title: Social image
---

A page's link-preview image, 1200 x 630: the page's section in mono above, its title set like the hero, and the
site's wordmark at the bottom. Pattern Dump renders it for every page without an image of its own
(`site.socialImages.component` in the site's config), and `pd social` writes the cards into `site/social/` to commit.
It is light, and dark only in the workbench's dark theme, so the published cards are always light.

The title takes three lines at most; a longer one is a problem in the build, which names the page. A top-level page
has no section, so its card starts with the title.

The two variants (`~short-title`, `~long-title`) are sample data only, a short and a long title: a page's own fields
always win over a variant's data, so a page that picked one would get the same card as the base.
