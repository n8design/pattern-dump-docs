---
title: Content rollups and aggregation
description: How Pattern Dump gathers a site's own pages into listings: content collections from a folder, a listing through a view, and queries for related pages.
layout: doc
order: 9
---

A site needs lists of its own pages: every article on one page, and a few related ones under each. Written by hand, each list needs an edit whenever a page is added. Pattern Dump gathers a site's own pages into these listings from the pages folder instead, in two ways. A collection lists a folder's pages on the folder's own `index.md`. A query lists pages picked by folder, tag or category, on any page whose layout asks for one.

You add a page, and the lists it belongs on include it, with no link to write.

![On the left, this site's folder site/pages/articles: index.md with sort: date, and the two articles that are not drafts, related.md dated 2026-11-15 and hello.md dated 2026-11-14. A bracket across the two articles leads to two lists. The first is the listing on index.md, through views/list: both articles, newest first, each checked against components/listing-card. The second is the related list on hello.md, through views/compact: only related.md, because a query leaves out the page it is on.](#collection-and-query "The Articles folder, listed twice. The folder's index.md lists every article; each article's layout asks for a query that lists the others from the same folder.")

## A folder is a collection

A pages folder with an `index.md` is a collection. Its entries are the folder's direct pages, and each subfolder by its `index.md`. Only the folder's `index.md` gets them: a layout that declares `page.children` gets the entries there as data, and an empty list on any other page.

This site's Articles page is one, `site/pages/articles/index.md`:

```yaml
---
title: Articles
layout: listing
childLayout: article
sort: date
---
```

Every entry has the same fields, whatever page it comes from: `route`, `title`, `description`, `date`, `updated`, `image`, `tags`, `categories`, `draft` and `scheduled`. Two of them Pattern Dump fills where the page leaves them out:

`description`
: The page's own `description`, else its teaser: the first paragraph of its body that has text, as plain text. A paragraph that is only an image or a placed component is skipped. The teaser is never shortened; how much of it shows is left to CSS.

`date`
: The page's own `date`, else the day of its first commit in git, else `null`.

The `index.md` decides the order with `sort`. `order`, the default, keeps the folder's order; `date` puts the newest page first, ties by route. With `sort: date`, a page with no date is listed last in `pd dev`, with a note, and is a problem in `pd build`, which then writes nothing. Dates from git need the full history: when the layout needs them and the clone is shallow, `pd build` reports a problem and says to build from the full history.

## A listing shows it through a view

A layout that declares `page.listing` gets the folder's entries rendered once, through a view: a component directly under `views/`, whose only data is `entries`. On any page other than a folder's `index.md`, `page.listing` is `null`.

The `index.md` names the view with `view:`, or the layout gives a default with `x-pd-view` on `page.listing`; the `index.md` wins. A listing with neither fails the page. This site's [`layouts/listing`](pattern:layouts/listing) defaults to [`views/list`](pattern:views/list):

```json
"listing": { "x-pd-view": "list" }
```

Its template places the listing as it comes, after the page's own text: `{{{page.listing}}}`.

## Each page is checked against a card

A view says how it shows each page: its schema declares `entries` with `x-pd-card`, which names a component, the card. Every page in the listing is checked against the card's schema. A page without a field the card requires fails the listing page, with a message that names the file and the field.

A card declares only the fields an entry has, so the check is about the pages, not the card. `views/list` names [`components/listing-card`](pattern:components/listing-card), which requires `route` and `title`, and every page has both. [`views/grid`](pattern:views/grid) names [`components/grid-card`](pattern:components/grid-card), which requires an `image` too. Neither article has one, so `view: grid` on the Articles page would fail it, naming each article that has no `image`.

## A query lists pages from anywhere

A query is a sub-key of a layout's `page` with `x-pd-query`, holding its default options. The layout gets `page.<name>` as `{ entries, listing }`: the pages as data, and the listing through a view when the query names one. It picks pages by folder (`collections`, where `same` is the page's own folder), by tag or by category, and lists named pages first with `pages`. It sorts by `date` (the default), `title` or `relevance`, the number of tags and categories a page shares with the current one, and stops at `limit`.

[`layouts/article`](pattern:layouts/article) declares one, `related`:

```json
"related": {
  "x-pd-query": {
    "collections": "same",
    "sort": "relevance",
    "limit": 3,
    "view": "compact"
  }
}
```

So every article lists up to three articles of its own folder, in [`views/compact`](pattern:views/compact). The current page is never in its own list, no page is listed twice, and drafts and scheduled pages never appear, not even in `pd dev`. That is why the related list on [Hello, articles](/articles/hello/) has one entry, while the Articles page in `pd dev` also shows the folder's drafts.

`listing` is rendered only when the query has a view and at least one entry; otherwise it is `null`. The article layout shows its "Related articles" heading only when there is a listing, so an article with nothing related has no empty section.

## A page changes its query

A page changes the layout's options in a block under the query's name. Each option it gives replaces the layout's, and the rest stay:

```yaml
related:
  limit: 5
```

`related: false` turns the query off on that page: no entries, no listing. A folder's `childDefaults` can set options for every page under it, option by option, and a page's own option still wins.

A problem in a query's options, such as an option that doesn't exist or a folder that isn't there, makes the query list nothing and fails the page, so a mistyped option can't pass as an empty list.

[Related articles](/articles/related/) shows the query at work on this site.

Every key, option and message is listed in the [Collections and queries reference](/reference/collections-and-queries/).
