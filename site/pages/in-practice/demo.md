---
title: The demo
description: The first website built with Pattern Dump, read in the order a visitor would: its landing page, its articles, an article, and the style guide behind them, with a recorded tour.
layout: doc
order: -3
liveSite: https://lab.n8d.studio/pattern-dump-demo/
repository: https://github.com/n8design/pattern-dump-demo
styleGuide: https://lab.n8d.studio/pattern-dump-demo/styleguide/
---

[The demo](https://lab.n8d.studio/pattern-dump-demo/) is a short tour of what Pattern Dump is, and the first website built with it. Its site holds pages and images only: how it looks comes from its style guide, a pattern package the site names in its config. Read it in the order a visitor would, from the landing page to the style guide behind it.

## The landing page

The landing page is `pages/index.md`, with `layout: deck` in its frontmatter. `deck` is a component in the style guide's `layouts/` folder, which makes it a layout. The page sets the words on the cover, an eyebrow, a title and a standfirst, and its markdown places the slides, one `pd-components-slide` tag each.

<pd-components-video src="/assets/videos/demo-tour" poster="/assets/videos/demo-tour-poster.webp" label="Play the tour of the demo's landing page, from its cover through its eleven slides" width="1680" height="1050" />

The player is a component of this site's style guide, [`components/video`](pattern:components/video), placed with one `pd-components-video` tag: the poster shows first, and the video loads only when it is played.

## The articles

`articles/index.md` uses the `listing` layout, sets `sort: date` and has one line of text. The list under that line is written on no page. The layout declares `page.children`, so on a folder's `index.md` Pattern Dump gives it the folder's pages, here newest first. Each entry brings its title, description, date and tags, and the layout shows it as an article card. A new page in `articles/` is in the list without a change to any other page.

![The demo's Articles page: the eyebrow "Writing", the title "Articles", the line "Every article on this site, newest first." and one article card, "Why style guides matter", with its date, its description and three tags.](/assets/screenshots/demo-articles.webp "The Articles page lists the folder it opens: each page in articles/ becomes a card, and no page lists them by hand.")

## An article

`articles/why-style-guides-matter.md` uses the `page` layout, also from the style guide. Its frontmatter sets a `date` and three `tags`. The layout declares `page.date` and `page.tags` and shows both under the standfirst, each tag by its label. Because the page has a date of its own, Pattern Dump also marks it as an article in its link-preview tags and its structured data.

![The article "Why style guides matter": the eyebrow "Article", the title, the standfirst, the date 2026-11-13 and the tags design-systems, accessibility and style-guides, then the first paragraph.](/assets/screenshots/demo-article.webp "An article on the page layout: the date and the tags under the standfirst come from its frontmatter.")

## The style guide behind it

The demo's style guide is [published beside it](https://lab.n8d.studio/pattern-dump-demo/styleguide/), in a workbench of its own. The `deck` layout of the landing page is a component there like any other, shown with its sample data and documented in the Inspector. The Sunset palette, under `foundations/colors`, holds the colours of every page: the waves, the cream and night text, and the colours of highlighted code.

![The demo's workbench with Deck selected under Layouts: the landing page's cover on the Stage, its Handlebars template below it, and its documentation in the Inspector.](/assets/screenshots/demo-layout-deck.webp "The landing page's layout as a component: the same cover, from sample data, with the documentation that says how a page uses it.")

![The Sunset palette in the demo's workbench: a sample headline on aubergine, a strip of the palette's colours, and the aubergine shades, each with its OKLCH value and its contrast against white and black.](/assets/screenshots/demo-colors-sunset.webp "The Sunset palette: the colours of the whole site, each shade with its contrast.")
