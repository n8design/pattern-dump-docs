---
title: Feeds
description: Atom and RSS feeds for a Pattern Dump site: site.feeds, which folders get a feed, what an entry holds, stable entry ids, feed addresses and every message.
layout: doc
---

```ts
export default defineConfig({
  site: {
    url: …,
    feeds: {
      format: …,
      content: …,
      limit: …,
      collections: …,
      site: …,
      path: …,
      author: {
        name: …,
        uri: …,
      },
    },
  },
});
```

Pattern Dump writes a feed for each folder whose pages are listed by date, and one for the whole site across them, as Atom 1.0 or RSS 2.0. The keys are in the `site` part of the config, and a folder's `index.md` can turn its own feed off or name its file.

Feeds need the site's address, `site.url`, as the sitemap does. Without it there are none, and `pd build` says so in its note about `site.url`: `site.url is not set, so pages have no canonical URL, og:url, og:image or JSON-LD, and there is no sitemap and no feed: set site.url to the site's address, such as "https://example.com/"`. A site with `site.index: false` has no feeds either, and `pd build` notes: `site.feeds is set, and the site has index: false, so it has no feeds: a site kept out of search engines has none`.

## Feed settings

```ts
export default defineConfig({
  site: {
    feeds: {
      format: "atom",
      content: "summary",
      limit: 20,
      site: true,
    },
  },
});
```

`site.feeds` is `true`, `false` or an object of settings. Left out, or `false`, the site has no feeds. `true` turns them on with the defaults above, and an object turns them on with its own settings over those. Since Atom is the default format and an Atom feed needs an author, `true` alone is refused: give `site.feeds.author`, or `format: "rss"`.

`site.feeds.format`
: `"atom"`, `"rss"` or `"both"`. Default `"atom"`.
: Atom 1.0, RSS 2.0, or each feed in both formats. Atom writes a day as its midnight in UTC (`2026-11-13T00:00:00Z`), RSS as RFC 822 does (`Fri, 13 Nov 2026 00:00:00 GMT`).

`site.feeds.content`
: `"summary"`, the only value. What an entry carries: the page's summary (see [Entries](#entries)).
: `"full"`: `"site.feeds.content": "full" is not supported yet: use "summary", or leave it out`.

`site.feeds.limit`
: A whole number of 1 or more. Default `20`.
: The newest pages each feed lists. A folder's `feed.limit` sets its own feed's.

`site.feeds.collections`
: A list of folders, by their path in the pages folder (`articles`). Default: every folder with `sort: date`.
: Only these folders get a feed, and only their pages are in the site feed. Each must be a folder with an `index.md` that has `sort: date`.

`site.feeds.site`
: True or false. Default `true`.
: The site feed, across the pages of every folder that has a feed. `false` writes the folders' feeds only.

`site.feeds.path`
: The site feed's file name, at the site's root: a file name ending in `.xml`. Default `feed.xml`, and with `format: "both"`, `feed.xml` for Atom and `rss.xml` for RSS.
: With `format: "both"`, `{ atom, rss }`, a name for each. Use it to keep the address a feed already has (see [Addresses](#addresses)).

`site.feeds.author`
: `{ name, uri }`, `name` required. No default.
: Who writes the site. An Atom feed needs its `name`. RSS gives the name as each item's `dc:creator`. `uri` is an absolute `http` or `https` URL, a page about the author.

## Which folders get a feed

A folder gets a feed when its `index.md` has `sort: date`, unless its `feed: false` or `site.feeds.collections` leaves it out. [Collections and queries](/reference/collections-and-queries/#order) has `sort`.

`feed` (on a folder's `index.md`)
: `true`, `false`, or settings indented under it. Default: on, for a folder with `sort: date`.
: `false` turns the folder's feed off, and its pages are then not in the site feed either. Indented under `feed:`, `limit` sets how many pages the folder's feed lists, `path` names its file in one format, and `atom` with `rss` name its files in both. `content` takes `summary` only.
: It belongs on a folder's `index.md` only, and can't be set for a folder's pages in `childDefaults`.

```md
---
title: Articles
sort: date
feed:
  path: index.xml
---
```

A feed lists the folder's newest pages that have a date: never a draft, a scheduled page or a page with `index: false`. A feed with no such page is not written, and `pd build` notes: `<index.md>: sort: date, and no page with a date yet, so no feed`, where `<index.md>` is the folder's `index.md` in the pages folder.

The site feed lists the newest pages across the folders that have a feed, up to `site.feeds.limit`. It is written only when one of them has a page.

A collection's feed takes its title from the folder's `index.md`, else the folder's name, and its description from that `index.md`. The site feed takes `site.globals.title`, else the home page's title, and the home page's description. An RSS feed needs a description, and every feed a title.

## Entries

Each listed page is one entry, newest first, with pages of the same date by route:

- the entry's id;
- its title;
- its absolute URL;
- its date: the page's own `date`, else the day of its first commit in git (not from a shallow clone in `pd build`);
- its update: the page's `updated`, else its date;
- its summary: the page's description, else its first paragraph, and none without either.

The summary is plain text. A feed's own date is its newest entry's update, so a build with no change writes the same feed.

### Entry ids

An entry's id is the absolute URL of the page's first `redirectFrom`, else of its route, so it stays when the page moves and a feed reader keeps it as the same entry. In RSS the id is a `guid` with `isPermaLink="false"`, since it is not the page's URL once the page has moved.

When git first saw the page at another route, `pd build` notes it: `<path>: git first saw this page at <r>, but its feed entry's id is from <id>: list <r> first in redirectFrom (the original first), so a feed reader knows it as the same entry`. `<path>` is the page's file, `<r>` the route git first saw, and `<id>` the route the id is made from.

## Addresses

A collection's feed is at `<folder>/feed.xml`, and the site feed at `/feed.xml`. With `format: "both"` each also has `rss.xml` beside it. A feed reader doesn't follow a redirect, so a site that moves to Pattern Dump keeps its feeds' addresses by naming the files: `site.feeds.path` for the site feed, and `feed.path` (or `feed.atom` with `feed.rss`) on a folder's `index.md`, such as `index.xml`.

`pd dev` serves each feed at its address, and `pd build` writes it. The build report gets `[pd build] feeds: <n> files`. A feed's problem stops `pd build` before anything is written. In `pd dev` the feed's address answers with status 500 and the problems.

## Head links

Every page but the 404 page links the site feed in its `<head>`, after `og:url`:

```html
<link rel="alternate" type="application/atom+xml" title="<title>" href="<url>">
```

`type` is `application/rss+xml` for RSS, and a feed in both formats is linked twice. A collection's own page and its pages also link the collection's feed, titled `<feed title> · <site title>` when the site has a title. [Search and SEO](/reference/search-and-seo/#head-tags) has the other head tags.

A skin's head partial, and `site.head`, must not write a feed link: a `<link>` whose `rel` includes `alternate`, with the type `application/atom+xml` or `application/rss+xml`. Every other alternate, such as a page in another language, stays the skin's. A head partial that writes one fails every page: `partials/head: <link rel="alternate" type="application/atom+xml"> is written by Pattern Dump on every page; a head partial must not write it`, or the same with `application/rss+xml`.

`llms.txt` ends with `## Feeds`, the site feed first, each line `- [title](url): Atom` or `: RSS`. [Search and SEO](/reference/search-and-seo/#llmstxt) has the rest of the file.

## Messages

In the config:

`site.feeds` set to anything else
: `"site.feeds" must be true, false, or an object of the feeds' settings, such as { author: { name: "The team" } }`

An Atom feed without an author
: `"site.feeds.author.name": an Atom feed needs an author: set site.feeds.author to { name: "<who writes the site>" }, or format: "rss"`

A format that isn't one
: `"site.feeds.format" must be "atom" or "rss" or "both"`

`content: "full"`
: `"site.feeds.content": "full" is not supported yet: use "summary", or leave it out`

Any other `content`
: `"site.feeds.content" must be "summary"`

A limit that isn't a whole number of 1 or more
: `"site.feeds.limit" must be a whole number of 1 or more, such as 20`

An author's `uri` that isn't an address
: `"site.feeds.author.uri" must be an absolute http(s) URL, such as "https://example.com/about/"`

A path that isn't a file name
: `"site.feeds.path" must be a file name ending in .xml, such as "index.xml", or { atom, rss } for a feed in both formats, such as { atom: "feed.xml", rss: "index.xml" }`

One file name with `format: "both"`
: `"site.feeds.path": the feed is written in both formats, so it needs a file name for each: { atom: "feed.xml", rss: "<path>" }`

`{ atom, rss }` with one format
: `"site.feeds.path": { atom, rss } is for a feed in both formats; with format "<format>", give one file name, such as "<name>"`

The same name for both formats
: `"site.feeds.path": the Atom and the RSS feed are both "<name>": give each a name of its own`

The sitemap's name
: `"site.feeds.path": "sitemap.xml" is the site's sitemap: give the feed another name`

On a folder's `index.md`, each fails that page, at its line:

`feed` on a page that is no folder's `index.md`
: `feed sets a folder's feed, so it belongs on the folder's index.md, not on a page`

A value that is neither, with no settings under it
: `feed must be true or false, or have its settings indented under it (limit, path)`

An unknown setting
: `feed.<key> is not a feed setting: it takes limit, path, atom, rss`, with `: did you mean "<x>"?` when one is close.

`feed.content` set to `full`, or to anything else
: `feed.content "full" is not supported yet: use "summary", or leave it out`, and `feed.content must be "summary"`.

A limit that isn't a whole number of 1 or more
: `feed.limit must be a whole number of 1 or more, such as 20`

A file name that isn't one
: `feed.<key> must be a file name ending in .xml, such as "index.xml"`

`feed.path` beside `feed.atom` or `feed.rss`
: `feed.path names a feed in one format, feed.atom and feed.rss one in both: give one or the other`

`feed.atom` without `feed.rss`, or the other way round
: `feed.atom and feed.rss name a feed in both formats, so give both, or feed.path for one`

The same name for both
: `feed.atom and feed.rss are both "<name>": give each a name of its own`

When the feeds are made, each stops `pd build`. `<src>` is the folder's `index.md`, or `site.feeds` for the site feed:

`feed` set, other than `false`, on a folder without `sort: date`
: `<index.md>: feed is set, but a folder gets a feed only with sort: date: add sort: date, or remove feed`

`feed.path` with `format: "both"`
: `<index.md>: feed.path names a feed in one format, and site.feeds.format is "both": name each, with feed.atom and feed.rss`

`feed.atom` and `feed.rss` with one format
: `<index.md>: feed.atom and feed.rss name a feed in both formats, and site.feeds.format is "<format>": give feed.path`

`site.feeds.collections` naming no folder
: `site.feeds.collections names "<name>", and the pages folder has no folder "<name>" with an index.md`

`site.feeds.collections` naming a folder without `sort: date`
: `site.feeds.collections names "<name>", but <index.md> has no sort: date, so its pages are not in date order: add sort: date`

A feed without a title
: `<src>: the feed has no title: give it one`

An Atom feed without an author
: `<src>: an Atom feed needs an author: set site.feeds.author.name`

An RSS feed without a description
: `<src>: an RSS feed needs a description: give the folder's index.md a description`, or for the site feed, `give the home page a description`.

Two feeds at one address
: `<src>: its feed is <addr>, which is <other>'s feed too: give one of them another file name, or turn one off`

A feed at the address of a page or another file of the site
: `<src>: its feed is <addr>, which is <claim>: give the feed another file name`, where `<claim>` names the file, such as `the page /about/`.
