---
title: Collections and queries
description: Content collections in Pattern Dump: a folder's entries, sort, listing views, cards, and the query options a layout declares and a page changes.
layout: doc
---

A pages folder with an `index.md` is a collection: Pattern Dump lists its pages on that `index.md`, in the order `sort` gives, as data (`page.children`) or rendered through a view (`page.listing`). A query is a sub-key of a layout's `page` that lists pages by folder, tag or category on any page with that layout. A card is the component every listed page is checked against.

Why it works this way is on [Content rollups and aggregation](/concepts/collections-and-queries/) in Concepts. The examples here are this site's: the Articles folder and the article layout's `related` query.

## Collections

A pages folder with an `index.md` is a collection. Its entries are the folder's direct pages, and each subfolder by its `index.md`.

`page.children`
: On a folder's `index.md`, its entries, sorted by its `sort`. An empty list (`[]`) on any other page and on the 404 page. A layout gets it only when it declares `page.children`.

## Entries

Every listed page is an entry, with the same fields wherever it is listed:

- `route`
- `title`
- `description`
- `date`
- `dateText`
- `updated`
- `updatedText`
- `image`
- `tags`
- `categories`
- `draft`
- `scheduled`

These have rules of their own:

`description`
: The page's `description`, else its teaser: the first paragraph of its body that has text.
: The teaser is plain text. Links keep their text, emphasis and code lose their markup, and an image's alt and everything inside a `pd-` tag are dropped. A paragraph that is only an image or a placed component is skipped, and nothing inside a definition list counts. Whitespace collapses, and the text is trimmed. It is `null` when no paragraph has text.
: The teaser is never shortened: its length is left to CSS. Pattern Dump caches it by a SHA-256 of the body, up to 10,000 entries, the oldest dropped first, and parses an edited body again.

`date`
: The page's own `date`, else the day of its first commit in git (`YYYY-MM-DD`), else `null`.
: In `pd build`, a date that would come from git in a shallow clone is `null`, and the listing gets the shallow-clone problem (see [Dates from git](#dates-from-git)).

`dateText`, `updatedText`
: `date` and `updated` written for readers, each `null` where its date is `null`. `site.lang` decides the language and `site.dates` the style, by default `{ dateStyle: "long" }`: "November 14, 2026" with `en`, the default, and "14 November 2026" with `en-GB`. [Configuration](/reference/configuration/) has both keys.
: A card declares them like any other entry field. A page without the date fails a listing whose card requires the text, with the hint `date: YYYY-MM-DD, which it is written from` (for `updatedText`, `updated: YYYY-MM-DD, which it is written from`).

`tags`
: Objects, each with `key`, `label`, `description` and `route`. A tag in frontmatter is lowercase letters, digits and hyphens.
: A tag listed twice on a page: `tags: "<x>" is listed twice`.

`draft`
: `true` or `false`. Any other value: `draft must be true or false`.

## Order

`sort` orders a folder's pages. It goes on the folder's `index.md`, the root's included.

```yaml
---
title: Articles
layout: listing
childLayout: article
sort: date
---
```

`sort`
: `"order"` (the default) or `"date"`.
: `order` keeps the folder's order. `date` puts the newest page first, with ties ordered by route.
: A folder with `sort: date` can have a feed of its newest pages: see [Feeds](/reference/feeds/).
: On any page but a folder's `index.md`: `sort orders a folder's pages, so it belongs on the folder's index.md, not on a page`. Any other value: `sort must be "date" (newest first) or "order" (the folder's order, the default)`.

A page with no date under `sort: date`
: A problem in `pd build`, and a note in `pd dev`, where the page is listed last. `<index>` is the folder's `index.md`, `<page>` the page:
: `<index>: sort: date, but <page> has no date: give it one (date: YYYY-MM-DD), or commit it so git dates it`
: In `pd dev` the note ends `; it is listed last`.

Notes on why a date is missing from git are attached to a listing only when it sorts by date.

## Dates from git

Pattern Dump reads dates from git only when a page first needs them: a layout that declares `page.created`, a listing, a query or `page.date` falling back to git, or `site.url` set for JSON-LD. It reads them in one `git log -M --name-status -z --format=%x01%aI` pass over the pages folder, using the author date. Renames are followed, copies are not, and an add ends a page's history. The status is read again after a page changes; new commits are seen on restart.

No repository, or no commits
: Every page has `null` dates, with one note: `the pages folder is not in a git repository`, or `the repository has no commits`.

A page git doesn't track yet
: A note: `not committed yet, so it has no dates`.

A page git ignores, or one outside the repository
: A note: `no git history (ignored, or outside the repository)`.

A page with uncommitted changes
: A note in `pd build` only.

A shallow clone, when the layout needs dates
: A problem in `pd build`, a note in `pd dev`. The message ends `build from the full history (in CI, check out with fetch-depth: 0)`.

## Listing views

A view is a component directly under `views/`, with the id `views/<name>` and no `/` or `~` after it. Its schema declares `entries`, a list with `x-pd-card`, and its template gets `{ entries }` as its only data. The starter that `pd init --with-site` writes ships four views, `compact`, `featured`, `grid` and `list`; the `pd init --site` starter ships none.

`page.listing`
: On a folder's `index.md`, the folder's entries rendered once through the view, as HTML. `null` on other pages, and without a view. A layout gets it only when it declares `page.listing`.

`x-pd-view`
: On a layout's `page.listing`: the view the layout uses by default.

`view`
: On a folder's `index.md`: one view name. It wins over the layout's default.
: On any other page: `view names how a folder's pages are listed, so it belongs on the folder's index.md, not on a page`. A list: `view must be one view name, not a list`.

This site's `layouts/listing` defaults to the list view:

```json
"listing": {
  "x-pd-view": "list"
}
```

### View messages

A view with no `entries` list carrying `x-pd-card`
: `views/<n>: its schema declares no "entries" list with "x-pd-card": a view names the card it shows each page as, so each page can be checked against it`

A view name that is not a view
: `<at>: view "<n>" is not a view: did you mean "<x>"? (the views are ...)`. With no views at all, the message ends `the skin has no views (components in a views/ folder of its patterns)`.

A listing with no view and no default
: `<path>: layout "<l>" shows a listing (page.listing), so name its view: view: <name> (...), or give the layout a default ("x-pd-view" on page.listing)`

A bad default
: Reported at `<layout> (x-pd-view on page.listing)`.

`view:` on a page whose layout shows no listing
: `view names how a listing is shown, but layout "<l>" shows none (it doesn't declare page.listing)`

## Cards

`x-pd-card`
: On a list property, or a property with no `type`: a layout's `page.children`, a view's `entries`, a query's `entries`. It names a component with a schema, the card, and each listed page is checked against the card's schema.
: A listing whose layout names no card is not checked against one.

This site's `views/list` names its card:

```json
"entries": {
  "type": "array",
  "x-pd-card": "components/listing-card"
}
```

Every page of a listing is checked against the view's card. A present value is checked against the card property's declared type, without coercion. A card declares only entry fields.

### Card messages

A card naming no component
: `<owner>: x-pd-card names "<id>", which is not a component`

A card naming a component without a schema
: The message ends `which has no schema, so a listing's pages can't be checked against it`.

A card that declares or requires a key an entry doesn't have
: `<id> (<role>, <owner>) declares "<k>", which a page in a listing doesn't have: a card declares only the fields Pattern Dump fills (route, title, ...)`

A card that declares `tags` items as `"string"`
: Refused: tags are objects since 0.5.0, with `key`, `label`, `description` and `route`.

A page missing a field the card requires
: Fails the listing page, once per page. A field counts as missing when it is `null`, undefined or an empty list. `<file>` is the page, `<key>` the field, `<card label>` the card:
: `<index>: <file> has no <key>, which <card label> requires: give it one (<hint>)`
: For `image` the hint is `image: /assets/images/<name>.jpg, a raster image in the assets`.

## Queries

A query is a sub-key of a layout's `page` that carries `x-pd-query`, with its default options. The layout gets `page.<name>` as `{ entries, listing }`. The query's name is also a key a page can write: the layout-key check skips it and hands it to the query. This site's `layouts/article` declares `related`:

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

`x-pd-query` must be an object whose keys are among the options below, and the query may declare only `entries` and `listing` sub-properties. Its `view` must name a component in `views/`.

### Query names

A name is letters, digits, `_` and `-`, starting with a letter or `_`. Any other name: `a query's name is a key a page can write: letters, digits, "_" and "-", starting with a letter, such as "related"`.

A name that is a `page` sub-key Pattern Dump fills, the retired `modified`, or a key the page already uses (the reserved and assembly keys, the layout's own properties) is a problem.

### Options

Each option has a default for when the layout doesn't set it: `match: any`, `sort: date`, no `order` (dates newest first, titles A to Z), no `limit`, all folders, no view.

`pages`
: Paths in the pages folder, listed first, in this order.
: A path listed twice, a path that is no page (with a did-you-mean), and more paths than `limit` are problems.
: A draft or a scheduled page among them is a problem in `pd build`, and a warning in `pd dev`, where it is left out. The message ends `so pd build leaves it out: publish it first, or take it out of the list`.

`collections`
: Folder paths, or `same` for the page's own folder.
: A folder whose `index.md` is a draft or scheduled is an empty collection, not an error. A folder that doesn't exist is a problem, with a did-you-mean or the list of folders.

`tags`, `categories`
: Declared keys, or `same`. An old key still works, with a rename warning.
: `same` on a page with no tags or categories lists no page; on a tag or category page, `same` is that term.
: Without declared tags, a tag no page has is a problem: `no page has the tag "<t>"`.

`match`
: `any` (the default): a page needs one of the listed values. `all`: a page needs every one. With both `tags` and `categories`, a page must match both lists.

`sort`
: `date` (the default): newest first. A page with no date stays last in either order, and ties are ordered by route.
: `title`: A to Z, with an English collator at base sensitivity, ties by route.
: `relevance`: the number of tags and categories a page shares with the current one, then the date (newest first), then the route.

`order`
: `asc` turns `sort: date` round, oldest first; `desc` turns `sort: title` round, Z to A.
: With `sort: relevance` it is a problem; the message begins `order doesn't go with sort: relevance`.

`limit`
: A whole number from 1, as a number or a string of digits. It caps the picked and the matched pages together.
: Any other value: `limit <v> is not a number of pages: a whole number from 1, such as 3`.

`view`
: The view that renders `listing`.

An option that doesn't exist
: In the layout `"<k>" is not an option of a query`, on a page `"<k>" is not an option of <name>`, both with a did-you-mean and the list of options.

### On a page

A page changes a query in a block under its name. Each option it gives replaces the layout's:

```yaml
related:
  limit: 5
```

`related: false` turns the query off on that page: no entries, no listing. `related: true` keeps the layout's options. Any other value:

```txt
<name> must be true, false (no <name> on this page), or its options indented under it, such as
<name>:
  limit: 5
```

A folder's `childDefaults` can set query options for every page under it. They apply option by option: the page's own option wins, else the nearest folder that sets that option, and options from different folders merge. A problem in a defaulted option names the folder's `index.md` and the option's line.

### What a query lists

The current page is never listed, no page is listed twice, and drafts and scheduled pages never appear, in `pd dev` too. `listing` is the view rendered only when the query has a view and at least one entry; otherwise it is `null`. Each listed page is checked against the card of the query's view, and against the card that `x-pd-card` on the query's `entries` names.

Any problem in a query's options makes it list nothing and fails the page. On the 404 page every query lists nothing.

## `site.collections` (deprecated)

`site.collections` is the older way to list a folder on every page. A skin lists folder paths under `site.properties.collections.properties` in the schema of `partials/base`, and every page gets `site.collections.<name>`, the folder's entries sorted as its `index.md` says. It still works, with a warning on every page, said once per build:

```txt
warning: partials/base lists site.collections (<names>), which is deprecated: declare a query on the layouts that show it instead (x-pd-query on a sub-key of page, such as page.latest with { "collections": ["<first>"], "sort": "date", "limit": 3 })
```

A listed collection with no folder
: An empty list, and a note that ends `but the pages folder has no folder "<name>" with an index.md, so it is an empty list`, with a did-you-mean or the list of folders. A problem if the name is in `required`.

A listed collection whose folder `index.md` is a draft left out of the build
: An empty list, with nothing said.

A shape declared for `site.collections`, or any key but `description` or `title` on a name
: A problem. Setting `site.globals.collections` in the config is a problem too; its message begins `site.globals.collections is filled by Pattern Dump from the pages folders`.
