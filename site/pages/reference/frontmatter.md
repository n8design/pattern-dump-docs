---
title: Frontmatter
description: Every front matter key a site page and a folder can set in Pattern Dump: the grammar, the keys for the build, layout keys, childLayout and childDefaults.
layout: doc
---

```md
---
title: Hello, articles
layout: article
date: 2026-11-14
tags: [getting-started, notes]
categories: [notes]
draft: false
---
```

A site page's frontmatter is the block between the two `---` lines at the top of its markdown file. Other tools call it front matter. Some of its keys are for the build and never reach the layout. A few are filled by Pattern Dump. Everything else is data for the page's layout, which must declare it. [Sites](/concepts/sites/#the-frontmatter-is-a-contract) explains why.

A problem is shown as `<file>:<line>: <message>`, the file relative to the pages folder and without a line when there is none, and it fails the page.

## Grammar

The frontmatter is a fixed grammar, not YAML:

- `key: value` on a line;
- a list inline, `[a, b]`, or one item per line under the key, `- a`;
- one level of keys under a key, each indented the same as the first.

Every value is text until the layout's schema gives it a type, and quotes around a value are removed. `childDefaults:` is the one key read a level deeper: a page's frontmatter, written under it. A byte order mark and CRLF line endings are read as clean input.

A key written twice takes its last value, and is still a problem on a site page. The other problems, each with its line:

A block that is never closed
: `the frontmatter block opened here is never closed: end it with a line holding only ---`

A key written twice
: `duplicate key "<k>"`

A key every object already has
: `"<key>" cannot be a frontmatter key: choose another name`, for `__proto__`, `constructor`, `toString` and the like.

A line that is no key, value or list item
: `cannot read this line: <line>`

A list item with no key above it
: ``list item with no key above it: a list follows a line `key:` ``

Keys under a key, indented unevenly or deeper than one level
: `nested value: one level of keys under "<k>", each indented the same as the first`

An inline list without its closing bracket
: `"<k>": the list opened with [ is never closed with ]`

A value with an opening quote and no closing one
: `"<k>": the value has an opening quote with no closing one`

A line ending in a carriage return alone
: `line ends in a bare CR: use LF or CRLF line endings`

## Keys for the build

Sixteen keys belong to the build and are never passed to the layout:

- `layout`
- `childLayout`
- `order`
- `redirectFrom`
- `index`
- `image`
- `socialImage`
- `date`
- `updated`
- `tags`
- `categories`
- `draft`
- `sort`
- `view`
- `feed`
- `toc`

A layout schema that declares one fails every page that uses it: `layout "<name>" declares "<key>", which a page sets for the build, not for its layout: rename it in the layout's schema`. `nav` is checked with them. The build keys are checked even when the layout doesn't exist.

`layout`
: One layout name. Default: the `childLayout` or `childDefaults.layout` of the nearest folder above that sets one, else `page`.
: A list: `layout must be one layout name, not a list`. A name that is no layout, such as a partial, a variant or a path: `layout "<x>" is not a layout: the layouts are "a", "b", …`, or, with none at all, `… is not a layout: the project has no layouts (components in a layouts/ folder of its patterns, or page and template patterns marked with x-pd-layout)`. A schema that can't be read: `the schema of layout "<x>" cannot be read: <error>`.

`nav`
: `true` or `false`. `false` leaves the page out of the navigation, of its folder's `children` and of `prev` and `next`; it still renders, is searchable, and is in the sitemap and `llms.txt`. On a folder's `index.md`, it leaves out the folder with its pages. Any other value: `nav must be true or false`. A layout still gets `nav`, the navigation.

`order`
: A number that ranks a page or folder among its siblings, lower first. Default: 0. Ties go by list position, then by name. On a folder's `index.md`, a list (or text with commas) orders the folder's pages by name, with `...` where the others go, else last; a child's own number wins over the list. The root `index.md` is both Home and the top level's list, where Home is named `index`. Not checked on site pages: a value that isn't a number is read as a list.

`redirectFrom`
: One old route or a list, each forwarding to this page. A route starts and ends with `/`, with no query, fragment, whitespace, `.` or `..` segment. Else: `redirectFrom: "<r>" is not a route: each old route starts and ends with "/", such as "/old/page/", with no query or fragment`, and with several, `redirectFrom: "<r1>", "<r2>" are not a route: …`.

`index`
: `true` or `false`. `false` gives the page `<meta name="robots" content="noindex">`, leaves it out of the sitemap and keeps it out of the search index. Any other value: `index must be true or false`.

`image`
: The page's image for link previews: a path to a file in the assets, such as `/assets/images/share.png`, or a path relative to the page to an image beside it, such as `./share.png`. In `childDefaults`, a relative path is relative to the folder's `index.md`. Else: `image must be a path to a file in the assets, such as "/assets/images/share.png", or an image beside the page, such as "./share.png"`.
: A relative path must stay in the pages folder (`image "<p>" is outside the pages folder: a relative image stays inside site.pagesDir`) and name a file there (`image "<p>" is not beside the page: there is no <rel> in the pages folder`). A file in the assets must exist (`image "<p>" does not exist in the assets`). Either must be a PNG, JPEG, GIF or WebP by its bytes: `image "<p>" is an SVG; link previews need a raster image (PNG, JPEG, GIF or WebP)`, `image "<p>" is not a PNG, JPEG, GIF or WebP image (read from its bytes, whatever its name)`. [Search and SEO](/reference/search-and-seo/#link-preview-image) has every message.

`socialImage`
: A variant of the site's social image component, by its name after `~`, or `false`. A folder's `childDefaults` can set it, and the nearest wins.
: Left out, the page's link-preview card is the component itself; a variant gives it that design, and `false` gives it none. A page with an `image` gets no card. Set without `site.socialImages`: `socialImage is set, but site.socialImages is not, so there is no social image component: set site.socialImages.component, or remove socialImage`. A name that is no variant: `socialImage "<v>" is not a variant of <c>: its variants are "<a>", "<b>"`, or `: it has no variants`. [Social images](/reference/search-and-seo/#social-images) has the rest.

`date`
: A real date, `YYYY-MM-DD`. A date after today holds the page back from `pd build` (see [Drafts and scheduled pages](#drafts-and-scheduled-pages)).
: A date with a time, a date written email style (as feeds and Hugo write them) and a value with a `#` after it each name the day to write, as the value writes it, in its own offset. See [Date messages](#date-messages).

`updated`
: A date, read as `date` is and with the same messages, not before `date`: `updated <u> is before the page's date, <d>: a page is updated after it is published`.

`tags`
: One value or a list. Without `site.tags` in the config, each is lowercase letters, digits and hyphens (`tags: "<t>" is not a tag: a tag is lowercase letters, digits and hyphens, such as "design-systems"`) and none twice (`tags: "<t>" is listed twice`). With `site.tags`, each is a declared key or an old key.

`categories`
: One value or a list of declared keys or old keys from `site.categories`.
: For both: an unknown value, `categories: "x" is not a category: did you mean "<x>"?`, else `the categories are "a", "b" (site.categories)`, else `the site declares none (site.categories in the config)`; several problems follow one prefix, joined with `; `. An old key builds as the key it now is, with `warning: <place>: <kind> "<old>" is now "<new>" (renamed in site.<kinds>): write "<new>"`, and beside its own key it is `"<key>" is listed twice ("<old>" is its old key)`.

`draft`
: `true` or `false`, else `draft must be true or false`. `true` keeps the page out of `pd build`.

`toc`
: `true` or `false`, else `toc must be true or false`.

`sort`, `view`, `childLayout`
: Only on a folder's `index.md`, the root's included, else `sort orders a folder's pages, so it belongs on the folder's index.md, not on a page`, `view names how a folder's pages are listed, so it belongs on the folder's index.md, not on a page` and `childLayout sets the layout of a folder's pages, so it belongs on the folder's index.md, not on a page`. `sort` is `order` (the default) or `date`, newest first; `view` and `childLayout` take one name. [Collections and queries](/reference/collections-and-queries/#order) has `sort` and `view`.

`feed`
: Only on a folder's `index.md`, else `feed sets a folder's feed, so it belongs on the folder's index.md, not on a page`. `true`, `false`, or `limit`, `path`, `atom`, `rss` and `content` indented under it.
: `false` turns off the feed of a folder with `sort: date`; the indented keys set its length and its file name. [Feeds](/reference/feeds/#which-folders-get-a-feed) has its keys and messages.

There is no `slug`, `permalink` or `url` key: a page's route comes from its file path only. Such a key is an ordinary layout key.

### Date messages

`<key>` is `date` or `updated`, `<v>` the value as written, and `<day>` the day it names, `YYYY-MM-DD`.

A date with a time
: `<key> "<v>" has a time: a page's <key> is a day, so write the day only, as written: <key>: <day>`

An email-style date
: `<key> "<v>" is an email-style date: write the day only, YYYY-MM-DD: <key>: <day>`

A value with a `#` after it
: `<key> "<v>": a "#" starts no comment in frontmatter, so "<#…>" is part of the value: remove it`, with `, and write the day only: <key>: <day>` when what is before the `#` names a day. `<#…>` is the value from the `#` on.

Any other value
: `<key> "<v>" is not a date: write it YYYY-MM-DD, such as "2026-11-14"`

## Keys Pattern Dump fills

`body`, `site` and `page` are filled by Pattern Dump, and a page that sets one gets `"<key>" is filled by Pattern Dump, not by a page`. A `required` in the layout's schema that names one is satisfied. The body slot that a layout's `x-pd-content` names is filled too: `"<slot>" is filled by Pattern Dump with the page's markdown (x-pd-content of layout "<n>"), not by a page`.

Pattern Dump writes each date in `page` for readers too: `page.dateText`, `page.createdText` and `page.updatedText`, each `null` where its date is. They are written in `site.lang`, in the style of `site.dates`, and `page.createdText` is the author's day from git. [Layouts](/reference/layouts/#page-data) has every sub-key of `page`.

The keys that name the layout's queries are the build's as well, and go to the query. [Collections and queries](/reference/collections-and-queries/#on-a-page) has their options.

## Layout keys

Every other key must be declared in the `properties` of the layout's schema. `title` and `description` are no exception.

An undeclared key
: `"<key>" is not declared by layout "<name>"`, with `: did you mean "<x>"?` when a declared, reserved or query key is close. A layout with no schema declares nothing: `"<key>" is not declared by layout "<name>", which has no schema`. Nothing is read from the layout's sample data.

Hugo's date keys, undeclared
: `lastmod`, `publishDate` and `expiryDate`, when the layout doesn't declare them, end the message with what each is here, in place of the suggestion. `lastmod`: `: Hugo's lastmod is "updated" here (updated: YYYY-MM-DD, set for a real change)`. `publishDate`: `: Hugo's publishDate is "date" here (date: YYYY-MM-DD; a date after today keeps the page out of pd build until then)`. `expiryDate`: `: Hugo's expiryDate has no equivalent: a page stays until it is removed, or set draft: true`.

A required key missing
: `"<key>" is required by layout "<name>"`.

A value of the wrong type
: A value is turned into the declared type: a `number` (`-?\d+(\.\d+)?`), an `integer` (`-?\d+`), a `boolean` (`true` or `false`), an `array` (its items checked by `items.type` or `enum`), a `string` (a list is refused). A type union tries each type in order, and `enum` is checked after. The messages: `"<k>" must be a number (got "x")`, `must be a whole number (got …)`, `must be true or false (got …)`, `must be a list (got "x")`, `has an item that …`, `must be one of "a", "b" (got "x")`, `must be text, not a list`.
: A key declared as `object` or `null` can't be set: `"<k>" has a type (object) a page cannot set in frontmatter`. A key declared with no `type` takes the value as written, text or a list. A value that fails its check is left out of what the layout gets.

Keys indented under another key
: Only a query of the layout takes them: `"<key>" has keys indented under it, which only a query of the layout takes: write its value on the line`.

When the page takes its layout from a folder, each message names it: `layout "<x>" (the childLayout of <index.md>)`.

## Folders

A folder's `index.md` is the folder's own page, and a page of the folder above it: it takes its layout and defaults from the folders above, not from its own `childLayout` or `childDefaults`.

`childLayout`
: The layout of every page under the folder that names none, at any depth; the nearest folder that sets one wins, and a page's own `layout` wins over all. A name that is no layout fails the `index.md` at its line, `childLayout "<x>" is not a layout: …`, and each page that takes it: `<page>: layout "<x>" (the childLayout of <index.md>) is not a layout: …`.

`childDefaults`
: Frontmatter for every page under the folder, at any depth, written as a page writes it. `childDefaults.layout` beside `childLayout` is a problem: `childDefaults.layout and childLayout both set the layout of this folder's pages: keep one`.

Defaults apply key by key: the page's own value wins, else the nearest folder that sets the key. A query's options apply option by option, and options from different folders merge. A list is replaced, never joined: a folder's `tags: [guide]` and a page's `tags: [setup]` give `[setup]`. A page that writes a plain value where the folder gives a query's options keeps its plain value.

Some keys can't be defaulted, since they are one page's own or belong to a folder's own `index.md`: `title`, `order`, `redirectFrom`, `date`, `updated`, `sort`, `view`, `feed`, `childLayout`, `childDefaults`, `body`, `site` and `page`. Each is a problem on the `index.md` at its line, `childDefaults.<k>: "<k>" can't be set for a folder's pages (…): set it on each page`, and never reaches a page. `nav` can be defaulted; on the `index.md` itself it applies to the folder's pages, and a page's own `nav: true` wins.

The `index.md` checks the build keys it gives (`tags`, `categories`, `draft`, `index`, `toc`, `image`, `socialImage`) and `layout` once, so a folder without pages is checked too, with messages that start `childDefaults.`, such as `childDefaults.toc must be true or false`. On each page, a default is checked against that page's layout, and a problem names where it came from: `<page> (from the childDefaults of <index.md>, line <n>): <message>`.

The 404 page and the generated tag and category pages take no folder defaults and no `childLayout`.

## Drafts and scheduled pages

`draft: true`
: `pd dev` shows the page and notes once, `<path> is a draft: pd build leaves it out`. `pd build` reads the pages folder as if the file weren't there, and reports `[pd build] drafts: <n> left out (<paths>)`. On a folder's `index.md`, it takes every page under the folder out of `pd build`; in `pd dev` those pages are not drafts themselves. From `childDefaults`, it counts as each page's own, and `pd build` prints per folder `[pd build]   <n> pages are drafts via the childDefaults of <index.md>`.

A `date` after today
: The page is scheduled: `pd dev` notes `<path> is scheduled for <date>: pd build leaves it out until then`, and `pd build` holds it back, with every page under a folder whose `index.md` is so dated, until the latest of the dates, and reports `[pd build] scheduled: <n> held back (<path> until <date>, …)`. Today is the build machine's date in UTC, taken once per build. A draft is never scheduled.

Since drafts and scheduled pages are left out of `pd build`, a navigation entry that names one fails the build: `site.globals.navigations.<name>[i]: "<path>" is not a page in the pages folder`.
