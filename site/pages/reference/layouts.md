---
title: Layouts
description: Handlebars layouts for Pattern Dump sites: what a layout template receives, every page key Pattern Dump fills, regions, the table of contents and tag pages.
layout: doc
---

```json
{
  "type": "object",
  "required": ["title"],
  "properties": {
    "title": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "page": {
      "type": "object",
      "properties": {
        "next": {},
        "date": {},
        "tags": {}
      }
    }
  }
}
```

A layout is a component that renders a site page. Its schema says what a page may set and which of Pattern Dump's page data it wants, as the starter's `layouts/page` above: a `title`, a `description`, and the next page, the date and the tags. [Sites](/concepts/sites/) explains the idea; [Frontmatter](/reference/frontmatter/#layout-keys) has the checks on what a page sets.

## What is a layout

A layout is a base component directly under `layouts/`, named by its folder (`layouts/<name>`), or a component in `pages/` or `templates/` (numbers in front of the folder are ignored, so `04-templates` counts) whose schema has `"x-pd-layout": "<name>"` at its root. A variant is never a layout.

`x-pd-layout`
: A layout name: lowercase letters, digits and hyphens, with no hyphen at either end or two in a row. Else: `x-pd-layout must be a layout name: lowercase letters, digits and hyphens, such as "article" (got …)`.
: Outside `pages/` and `templates/` it makes no layout, and is a problem on the component: `x-pd-layout makes a page or template pattern a layout; <id> is in neither pages/ nor templates/, so it is no layout: move it there, or include it in one that is`.
: On a component in `layouts/`: `<id> is the layout "<folder>" by its folder, and x-pd-layout would give it a second name ("<x>"): remove x-pd-layout`. The folder's name stands.

One name for two layouts makes neither a layout: `layout "<n>" is set twice: <file> (x-pd-layout) and <file> (a layouts/ folder): rename one`, on both components and on every page that asks for it.

### The skin's components

`layouts/page`
: The default layout, for a page that names none and takes none from a folder.

`partials/base`
: Declares `site`: what `site.globals` in the config may hold.

`partials/head`
: Optional. Adds to every page's `<head>`. See [The page document](#the-page-document).

`components/toc`
: The table of contents.

## What a layout gets

A layout's template gets every key its schema declares, `null` where the page sets none; the page's markdown as `body`; `nav`, the navigation; `site`; and `page`, only when its schema declares `page`.

`body`
: The page's rendered markdown, or in the property the schema's root `x-pd-content` names. That property must be a declared string with `"contentMediaType": "text/markdown"`; else the page fails, `layout "<n>" puts the page's markdown into "<p>" (x-pd-content), which it does not declare` (or `…, which must be a string with "contentMediaType": "text/markdown"`), and the markdown goes into `body`.

`nav`
: The navigation, one level deep, with `current: true` on every entry whose route is the page's. [Navigation and routes](/reference/navigation-and-routes/#the-navigation) has its shape.

`site`
: The values of `site.globals`, checked against `partials/base`'s schema, with `navigations` when `partials/base` lists any, `categories` when it lists them, and `collections`, deprecated, when listed.

`page`
: Pattern Dump's data for the page, below.

## Page data

Pattern Dump fills exactly these sub-keys of `page`, and each query the layout declares. A layout gets only the ones it declares, each `null` when there is nothing to fill. Any other: `<layout> declares "page.<k>", which Pattern Dump does not fill (it fills page.headings, …, page.regions)`. There is no `page.toc`, `page.related`, `page.pages` or `page.progress`; in the starter's skins, `related` and `pages` are query names.

`page.headings`
: Every heading of the page, `{ level, text, anchor }`. The anchor is a GitHub-style slug, with `-1`, `-2` added for repeats.
: A heading whose anchor is already an id on the page, the layout's or a symbol image's, gets the next free number, with a note: `<page>: heading "<t>" is #<new>, because the layout uses id="<old>"` (or `because a symbol image on the page uses id="<old>"`, `because the symbol set "<set>" on the page uses id="<old>"`). A layout that builds ids from `page.headings` gets `… even after the suffix: the layout must not make ids from page.headings`.

`page.section`
: The top-level navigation entry of the page's first path segment, `{ route, title }`. A top-level page, and Home, is its own section; `null` when no entry holds the page.

`page.breadcrumbs`
: Home, then each folder above the page by its `index.md`, `{ route, title }`: from the folders, so deeper than the navigation. The page itself is left out; empty on Home.

`page.prev`, `page.next`
: The neighbours in the navigation, read depth first (an entry, then its children), across sections. `null` at the ends and for a page that isn't in the navigation.

`page.created`
: The author date of the page's first commit in git (ISO 8601), following renames back to when it was added. `null`, with a note, when git doesn't know the page. In `pd build` from a shallow clone, it fails a page whose layout declares it.

`page.date`
: The page's `date`, else the day of its first commit (`YYYY-MM-DD`), else `null`; `null` on the 404 page.

`page.updated`
: The page's `updated`, else `null`. Never from git.

`page.dateText`, `page.createdText`, `page.updatedText`
: `page.date`, `page.created` and `page.updated` written for readers, each `null` where its date is `null`. Pattern Dump writes the day in `site.lang`, in the style `site.dates` gives, by default `{ dateStyle: "long" }`: "November 14, 2026" with `en`, the default, and "14 November 2026" with `en-GB`. It formats the day in UTC, so the build machine's time zone never moves it, and `page.createdText` is the author's day of the git date. [Configuration](/reference/configuration/) has both keys.
: Write the text in a `time` element, with the date in its `datetime`: `<time datetime="{{page.date}}">{{page.dateText}}</time>`.

`page.tags`, `page.categories`
: `{ key, label, description, route }` each, in the page's order; `[]` without. An undeclared tag's label is its key, and `route` is its tag or category page, or `null`.

`page.term`, `page.terms`
: On a tag or category page, the term, `{ key, label, description, route, count }`; on the index, every term with a page, by label. `null` elsewhere.

`page.children`, `page.listing`
: A folder's pages, as data and through a view. [Collections and queries](/reference/collections-and-queries/#collections) has both.

`page.regions`
: `{ <region>: html | null }` for each region the layout declares.

`page.modified` is retired: `<layout> declares "page.modified", which Pattern Dump no longer fills: git's last commit counts a typo fix as a change. Declare "page.updated" instead: …`. Neither is there a guide-progress or pager feature beyond `page.prev` and `page.next`.

## Sample data

Sample data is for the workbench. On a site page, a component gets only what it is given and its template's defaults (`defaultValue`), and the project's data: the layout with its partials at any depth, its views and cards, the components a page places and the head partial all render with the page's data, never with their sample `.json`. So sample data may set any key, and a header or footer in the frame can have sample data of its own to show in the workbench. The workbench, its previews and a page's live examples show each component with its sample data.

A partial of a layout whose sample `.json` doesn't parse doesn't fail the pages: the workbench reports `DATA_INVALID`, and `pd audit` reports it as an error on the partial and on each component that includes it, and exits with 1.

## Errors in a layout

A template that throws
: Fails the page with `<page>: <error>`, status 500, never an unhandled error.

A field named like a helper
: Fails the page with the workbench's `SCHEMA_INVALID` message.

Tags written as text
: Since 0.5.0 a tag is an object, and a template that writes one as text fails the page: `<id> (<file>:<line>): {{#each <list>}} writes {{<item>}}, but a tag is an object since 0.5.0 (key, label, description, route): write {{label}} to show it ({{key}} is its URL segment, {{route}} its page)`. A schema that declares tags as strings: `… declares tags as a list of strings, but a tag is an object since 0.5.0 …`.

## Regions

A layout declares regions on `page.properties.regions`, with `"x-pd-regions": [<names>]` and, optionally, `"x-pd-toc": true`; only those keys and `description` are allowed. A name is lowercase letters, digits and hyphens, starting with a letter; `header`, `footer`, `nav` and `main` are the layout's own.

A component placed on a page goes into a region by `region="<name>"` on its root `pd-` tag, else by its schema's root `"x-pd-region"`; the tag wins. In a region, components keep their order on the page. With regions declared, the `<body>` gets `data-pd-regions="<filled names>"`, empty when none is filled.

A reserved name
: `<id> (page.regions): header is reserved for the layout's own landmark: …`

A name that isn't one
: `"<n>" is not a region name: lowercase letters, digits and hyphens, starting with a letter`. Listed twice: `"<n>" is listed twice`. `x-pd-toc` that isn't a boolean: `"x-pd-toc" is true or false`.

`region=` without a value
: `<pd-…>: region names a region of the layout, such as region="sidebar"`. On a component that declares a `region` property: `… region="..." is Pattern Dump's …: rename that property to place it in a region`.

A region this layout doesn't have
: Left out without a word when another layout of the skin has it; the component is still checked. A region no layout has: `region "<n>" is no layout's region: did you mean "<x>"? (the skin's regions are …)`. A reserved one: `the <n> belongs to the layout, so no component goes into it (<layout> offers "…")`.

A landmark in a region
: A region's content may not bring a `<main>` or `role="main"`, nor a `<header>` or `<footer>` outside `article`, `aside`, `nav` or `section`, nor `role="banner"` or `role="contentinfo"`.

## Table of contents

The table of contents is the skin's `components/toc`, rendered with `items: [{ text, href, level }]`, from the page's `h2` and `h3` headings. `toc: true` on a page, or `x-pd-toc` on a layout's regions, puts it first in its region; a page's `toc: false` wins over the layout. A page without `h2` or `h3` gets none, and the 404 page never does.

A `components/toc` whose schema names no `x-pd-region`: `<what>: components/toc names no region (x-pd-region at its schema's root), so the table of contents has no place on the page`. No `components/toc` at all, or one whose schema has no `items`, is a problem too. `<pd-toc>` places one by hand: see [Markdown](/reference/markdown/#table-of-contents).

## Tag and category layouts

Pattern Dump generates a page for each tag a published page uses at `/tags/<key>/`, with the layout `tag`, and their index at `/tags/` with `tags` when there is at least one tag; likewise `/categories/<key>/` with `category` and `/categories/` with `categories`. Each is generated only when the skin has its layout.

`site.tagPages`, `site.categoryPages`
: Left out: on when the skin has the term's layout (the index only with the index's layout too), and nothing said otherwise. `false`: off. `true` or `{ path, title }`: on, with `path` for the URL segment and `title` for the index's title (default "Tags", "Categories"); a missing layout is then a problem: `site.tagPages asks for tag pages, but the skin has no layout "tags" (the index of the tags): add layouts/tags, or mark a page or template pattern with "x-pd-layout": "tags", or set tagPages to false`, and likewise for the others.

A generated page's layout must declare `title`, which gets the term's label or the index's title: `<layoutId>: a tag page's title is the tag's label, so the layout declares "title"`. `description` is passed only when the term has one and the layout declares it.

Term pages come from published pages only, no drafts or scheduled pages, in `pd dev` too, and list every page with the term: there is no pagination. Terms are sorted by label, then key. An old key with a page forwards: `/tags/<old>/` is a redirect to `/tags/<key>/`. Generated pages are in `/api/pages` and the sitemap, not in the navigation, a listing or the search index, and take no folder defaults.

A page file at a generated route
: `<file> is the page at <route>, which is <what> as well: rename <top>, or give the <kind> pages another path (site.<kind>Pages: { path: "..." })`. A `redirectFrom` that claims one: `<file>: redirectFrom "<route>" is <what>: a route can't both be a page and forward to one`.

## The page document

`<title>`
: `<title> · <site.title>`, or the title alone when the two are equal or there is no site title. The page's title is its layout's `title` when declared and text, else its route; "Page not found" on the 404 page.

`<meta name="description">`
: The layout's `description`, only when declared.

`<html lang>`
: `site.lang`, default `en`, on every page, the 404 page and redirect pages. A document listing a page's problems is always `en`.

The `<head>` holds, in order: the title, the description, the SEO tags, JSON-LD (with `site.url`, not on the 404 page), `/_pd/code.css` on a page that shows code, `partials/head`, `site.head`, the stylesheets (the base layer, `assets.css`, the layout's and its components'), and the module scripts (`globalScripts`, then the scripts the layout and the placed components ask for, each once). There are no theme stylesheets. Every page carries `<meta name="pd-base-path" content="<base>">`, `/` at a host's root.

`partials/head` is rendered with `{ site, body: null, nav: null }`. It may hold only `meta`, `link`, `script`, `style` and `noscript`, and never `<title>`, `<base>`, a canonical link, a `description`, `robots` or `twitter:*` meta, `og:*`, JSON-LD or, since 0.10.0, a feed link: `partials/head: <x> is written by Pattern Dump on every page; a head partial must not write it`, or `<tag> does not belong in <head>: …`. Text is refused.

A feed link is a `<link>` whose `rel` includes `alternate`, with the type `application/atom+xml` or `application/rss+xml`; Pattern Dump links each page's [feeds](/reference/feeds/) itself. Any other alternate, such as a page in another language with `hreflang`, is the skin's. A 0.9.0 skin whose head partial writes a feed link fails every page, with `partials/head: <link rel="alternate" type="application/atom+xml"> is written by Pattern Dump on every page; a head partial must not write it` (or `application/rss+xml`). Remove the link, and set `site.feeds` for the feeds. Its problems are problems of the whole site, and a render error fails every page.

### Landmarks

A page has exactly one main landmark and one `<h1>`: `the page has no <main>: …`, `the page has <n> main landmarks (<main> or role="main"): …`, `the page has no <h1>: one heading names the page`, `the page has <n> <h1> headings: …`. Warnings in `pd dev`, errors in `pd build`.

### A page with problems

A page with problems is answered with status 500 and a document titled `Problems · <route>`, with `<h1>The page <route> cannot be built</h1>` and the problems in a `ul.pd-problems` list. In `pd dev`, a page's links, anchors and images are checked as warnings, `warning: <page>…`; in `pd build`, image problems fail the page, and links are checked once the whole site is built. A problem of the whole site is shown on every page and listed once by `pd build`.
