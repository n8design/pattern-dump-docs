---
title: Navigation and routes
description: File based routing in Pattern Dump: how a page's file names its address, the navigation built from the pages folder, declared navigations, redirects and the 404 page.
layout: doc
---

```txt
pages/index.md            /
pages/about.md            /about/
pages/guides/index.md     /guides/
pages/guides/setup.md     /guides/setup/
pages/404.md              /404.html
```

Every `.md` file in `site.pagesDir` is a page, at the address its path names: file based routing, with no key in the frontmatter that changes it. The navigation is built from the same files. Navigations of your own, such as a footer's, are declared in the config.

## Routes

A page's route is its path without `.md`, with `index` dropped, between slashes. A file or folder whose name starts with `.` is skipped, and `404.md` at the top is the 404 page. There is no `slug`, `permalink` or `url` key; such a key is an ordinary layout key.

A file or folder name is lowercase letters, digits and hyphens, and a page's file ends in `.md`:

A folder with another name
: `<path>/: a folder name is part of the URL, so it is lowercase letters, digits and hyphens only`. The folder is not read.

A file with another name
: `<path>: a page's file name is part of the URL, so it is lowercase letters, digits and hyphens only, then .md`.

A file that isn't markdown
: `<path> is not a page: only .md files belong in the pages folder (images and other files go in the project's assets)`.

No home page
: `there is no home page: the pages folder needs an index.md at its top, the page at /`, an empty folder too.

A folder of pages without its own page
: `the folder <path>/ holds pages but has no index.md: it needs one, as the folder's own page`.

Two files for one route
: `<a> and <b> are both the page at <route>`.

No pages folder
: `the pages folder <dir> does not exist`, also when the path is a file.

A page where the workbench is published
: `<path>: the page <route> is at <wbPath>, where the workbench is published on this host (site.workbenchUrl), so the workbench would overwrite it there` (or `under`), matched by whole segments.

A problem of the pages folder fails every page, each with the folder's problems and status 500.

### Serving

`pd dev` serves `/about` as `/about/`. An address that ends in a file extension, such as `.html`, is not a page and gets the 404 page, except `/404.html` itself. Every address without a page, a generated page or a redirect gets the 404 page with status 404, and so does a page deleted between reading the folder and the request (`there is no page at <route>`). `pd build` writes each page as `<route>/index.html`, and the 404 page as `/404.html`.

### The base path

The path in `site.url` is the path the site is published under. Pattern Dump puts it in front of every root-relative address on the way out, in `pd dev` and in `pd build`, in:

- the attributes `href`, `src`, `srcset`, `imagesrcset`, `poster`, `action`, `formaction`, `<object data>` and `xlink:href`;
- a refresh's `url=`;
- style attributes, `<style>`, CSS `url()` and `@import`. Text, comments, scripts, `data-*` attributes, other hosts, relative addresses and addresses into a workbench on the same host are left alone, and an address that has the base already is prefixed again.

A root-relative address outside the base path
: `<p> is outside <base>, the path the site is published under (site.url)`, with a hint when it was written with the base already.

In `pd dev`, under a base path, the host's root and the path without its last slash answer 302 to the path, and any other address outside it gets the 404 page.

## The navigation

The navigation is one level deep: the top-level pages and folders, and each folder's direct pages and subfolders, by their `index.md`, as `children`. Deeper pages exist at their routes but are not in it. A page joins it when its file is added, at the top level or one folder down, with no other change.

An entry is `{ route, title, description?, children? }`, with `description` only when the page's frontmatter has one. A page with no `title` is titled by its route. A layout gets it as `nav`, with `current: true` on every entry whose route is the page's.

`order`
: Ranks a page or folder among its siblings, lower first; default 0. Ties go by list position, then by name, with numbers compared as numbers. On a folder's `index.md`, a list orders the folder's children by name, with `...` where the unnamed ones go, else last; a child's own number wins over the list. The root `index.md` is both Home, ranked by its own number, and the list for the top level, where Home is named `index`.

`nav: false`
: Leaves the page out of the navigation, its folder's `children`, and `prev` and `next`, whose neighbours then link past it. The page still renders, is searchable, and is in the sitemap and `llms.txt`. On a folder's `index.md`, it leaves out the folder and its pages.

### `/api/pages`

`GET /api/pages` on the site's host gives `{ pages, nav }`. Each page has `route`, `title` (its `title`, else its route) and `layout`, and where they apply `layoutFrom` (the `index.md` whose `childLayout` or `childDefaults.layout` it took), `defaultsFrom` (each defaulted key with its `index.md`) and `redirectFrom`. The pages are in the order of the navigation's two levels, a page with `nav: false` where it would be, then the pages those levels don't reach, by path, then the generated tag and category pages. With a problem in the pages folder it answers 500 with `{ error }`.

## Declared navigations

```ts
export default defineConfig({
  site: {
    globals: {
      navigations: {
        footer: [
          {
            page: "about.md",
          },
          {
            href: "<url>",
            label: "<label>",
          },
        ],
      },
    },
  },
});
```

`site.globals.navigations` holds named lists. An entry is one of three:

`{ page, label? }`
: A page, by its path in the pages folder. The label defaults to the page's title, else its route.

`{ href, label }`
: A link: `http(s)://`, `mailto:` or a path from the root (`/…`, not `//host`). Never current.

`{ label, children }`
: A group, nested to any depth.

No other key is allowed. A layout gets each as `site.navigations.<name>`, resolved for the page: `{ label, route, current? }`, `{ label, href }` and `{ label, children, ancestor? }`. A name the skin lists and the config doesn't set is `null`.

`partials/base` lists the names under `site.properties.navigations.properties`, each with a `description` or `title` at most; the shape of an entry is Pattern Dump's. A name in `required` must be set.

### Problems

Each message starts with the entry's path, such as `site.globals.navigations.<n>[i].children[j]: `.

An entry of no kind
: `… needs "page", "href" or "children": an entry is one of { page }, { href, label } or { label, children }`.

`page` and `href` together
: `… has "page" and "href": …`.

A link or group without a label
: `… needs a "label"`.

Another key
: `…: "<k>" is not a key of a navigation entry: did you mean "<x>"?`.

A page that doesn't exist
: `…: "<p>" is not a page in the pages folder: did you mean "<x>"?`. A draft or scheduled page is not in the pages folder for `pd build`, so naming one fails the build.

A name the skin doesn't list
: `… <n> is not a navigation partials/base lists (it lists "a", "b"): did you mean "<x>"?`, or `… is set, but partials/base lists no navigations, so no layout can show it`.

A shape in `partials/base`
: `… the shape of a navigation is Pattern Dump's, so list the name only (a description at most)`.

## Site values

`site.globals` is checked against `partials/base`'s schema, `properties.site`, at every depth and without conversion. A top-level key it declares and the config doesn't set is `null`.

`site.globals` without `partials/base`
: `site.globals is set, but there is no partials/base to declare what it holds`.

`partials/base` without `site`
: `… but partials/base declares no site, so no layout can use it`.

`site.globals` required but not set
: `site.globals is required by partials/base`.

These are problems of the whole site: shown on every page, marked `data-pd-site`, and listed once by `pd build`. In `pd dev`, a change to `site.globals` alone is taken live and every page reloads; any other change to the config asks for a restart, and a save that changes nothing `pd dev` reads does neither.

## Redirects

`redirectFrom` on a page names its old routes, one or a list (see [Frontmatter](/reference/frontmatter/#keys-for-the-build)). Each old route is a page that forwards, served by `pd dev` and written by `pd build`. It holds:

- `<title>Moved to <title></title>`;
- a canonical link to the new page, when `site.url` is set;
- `robots noindex`;
- `<meta http-equiv="refresh" content="0; url=<route>">`, under the base path when there is one;
- the line `This page has moved to <a>…</a>.` These pages are not in the sitemap, and in `pd dev` they are served only while the pages folder has no problems.

An old route that is a page
: `<file>:<line>: redirectFrom "<r>" is the page <file>: a route can't both be a page and forward to one`.

An old route claimed twice
: `… is also claimed by <file>: one old route forwards to one page`.

An old route Pattern Dump serves
: `redirectFrom "<r>" is under <prefix>, which Pattern Dump serves itself`, under `/preview/`, `/_pd/`, `/assets/`, `/api/` or `/source/`; at or under a workbench on the same host, the workbench's message.

`redirectFrom` on the 404 page
: `<path>:<line>: the 404 page can't have redirectFrom: it is served for every address that has no page`.

## The 404 page

`pages/404.md`, at the top of the pages folder only, is rendered at `/404.html` with status 404. It is not in the pages, the files or the navigation. It gets `noindex`, no canonical link, link previews or JSON-LD, no table of contents of its own, no pages from queries, an empty `page.children`, `page.date` as `null`, and no search record.

Without `404.md`, a built-in page goes through the default layout, `page`. It has `title: Page not found` when that layout declares `title`, else a `# Page not found` heading, and the text `There is no page at this address. Start again from the [home page](/).` Without a default layout either, a plain page of Pattern Dump's is served, with the note `there is no 404.md and no layouts/page, so the 404 page is a plain one of Pattern Dump's`.

Since the 404 page is served at every address, every address in its `href`, `src`, `poster`, `action` and `srcset`, from the head, the layout and the body, must start at the root (`/…`), be a fragment (`#…`) or have a scheme. Else the page fails: `the 404 page (<path>): the URL "<u>" is relative, and the 404 page is served at every address, so it only works from the site's root: use "/<x>" instead`, or `write it from the site's root ("/…") instead`.

A problem on the 404 page is printed as `[site] null:` when the address has a file extension, as `/404.html` does, and with the address otherwise.
