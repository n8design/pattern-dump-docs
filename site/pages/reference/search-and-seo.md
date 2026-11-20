---
title: Search and SEO
description: Static site search with Pagefind, the head tags and JSON-LD Pattern Dump writes for a page, and the sitemap.xml, robots.txt and llms.txt it writes for a site.
layout: doc
---

```ts
export default defineConfig({
  site: {
    url: …,
    lang: …,
    index: …,
    image: …,
    search: …,
    llms: …,
    globals: {
      title: …,
    },
  },
});
```

Pattern Dump writes a site's search index, the tags in each page's `<head>`, its JSON-LD, and the files crawlers read: `sitemap.xml`, `robots.txt` and `llms.txt`. The keys are in the `site` part of the config.

Most of it needs the site's address, `site.url`. Without it, a page gets only what needs no address.

## Static site search

`site.search`
: True or false. No default: left out, search is on when the project has Pagefind, else off, with no message.
: `true` asks for search. `false` turns it off, and Pagefind is never loaded.

`pd build` indexes the site with the project's own Pagefind. Pattern Dump looks for `node_modules/pagefind/package.json` from the project root upward, so a Pagefind that another package brought counts too. The index is written to `_pd/search/` in the site's output, and the build report gets `search: { pages, files, bytes }`. Pagefind's own interfaces (`pagefind-ui`, `pagefind-modular-ui`, `pagefind-component-ui` and `pagefind-highlight`, as `.js` and `.css`) are not written.

`pd dev` builds no index, and says so at start when search would be on: `[dev-server] Search: the index is built by pd build, so the site's search finds nothing in pd dev`.

A search problem stops `pd build`. With `site.search: true` and no Pagefind, it stops before anything is built.

`site.search` set to anything else
: `"site.search" must be true or false`

`site.search: true` in a project without Pagefind
: `pd build: site.search is on, and this project has no Pagefind to build the index with: npm install --save-dev pagefind (or set site.search to false)`

Pagefind can't start
: `pd build: Pagefind couldn't start: <errors>`, with Pagefind's own errors joined by `; `.

Pagefind can't index the site
: `pd build: Pagefind couldn't index the site:`, then one line per error, `  - <route>: <error>`, where `<route>` is the page's route. An error in reading the finished index back has no route.

### What is indexed

Each page is given to Pagefind as a document of its own: its rendered body (its markdown and the components it places) and its title. The layout's markup is never indexed. The title becomes the document's `<h1>` when the body has none. The pages `pd build` writes carry no Pagefind attributes.

The 404 page is not indexed, and neither are tag and category pages and their indexes. A page with `index: false`, its own or from a folder's `childDefaults`, is left out. Redirect stubs are not pages, so they are not indexed either. `site.index: false` doesn't turn site search off: only the page's `index: false`, not the site's, keeps it out. A page with `nav: false` is left out of the navigation only: it is still indexed, and it stays in `sitemap.xml` and `llms.txt`.

### Filters and results

`section` (filter)
: The title of the folder index that lists the page. A folder index is in its own section. A top-level page has no section.

`tag` and `category` (filters)
: The labels of the page's tags and categories.

`title` (meta)
: The page's title.

`teaser` (meta)
: Written only when the page has a teaser: its description, else its first paragraph outside a definition list.

A result's URL is the site's base path followed by the page's route. Pages are added to the index in route order, and its files are sorted by path.

## Head tags

```ts
export default defineConfig({
  site: {
    index: true,
    lang: "en",
  },
});
```

`site.url`
: A string: the site's absolute `http` or `https` address, with no query or fragment and no empty path segment, though doubled slashes at the very end are allowed and collapsed to one. No default. It is stored with one trailing slash, and its path is the site's base path: `/` at a host's root, `/project/` for a site published under a path.
: With it, every page but the 404 page gets a canonical URL, Open Graph tags, a Twitter card and JSON-LD, and, unless `site.index` is `false`, the site gets a sitemap. Without it, the only search engine tag is `<meta name="robots" content="noindex">`, on a page that isn't indexed. In `pd dev` the absolute URLs use the host the browser is on (`http://<host><basePath>`); in a build, `site.url`.
: Any other value: `"site.url" must be the site's absolute http(s) address, with no query or fragment, such as "https://example.com/", or "https://example.github.io/project/" for a site published under a path`. Without it, `pd build` notes once: `site.url is not set, so pages have no canonical URL, og:url, og:image or JSON-LD, and there is no sitemap: set site.url to the site's address, such as "https://example.com/"`.

`site.index`
: True or false. Default `true`.
: `false` gives every page `noindex`, writes no sitemap, makes `robots.txt` keep every crawler out and turns `llms.txt` off. Site search stays on.
: Any other value: `"site.index" must be true or false`.

`index` (a page's frontmatter)
: True or false. Default `true`. A folder's `childDefaults` can set it for the pages under it.
: `false` gives that page `noindex`, and keeps it out of the sitemap, the search index and `llms.txt`.
: Any other value: `index must be true or false`.

`site.lang`
: A language tag. Default `en`.
: The `lang` of every page's `<html>`.
: Any other value: `"site.lang" must be a language tag, such as "en", "de-AT" or "zh-Hant-TW"`.

A page's `<title>` is `<page title> · <site title>`, with the site title from `site.globals.title`. It is the page title alone when there is no site title, or when the two are the same. `<meta name="description">` is written when the page has a description.

With `site.url`, a page gets `canonical`, `og:type`, `og:site_name` (with a site title), `og:title`, `og:description` (with a description), `og:url` and `twitter:card`. `twitter:card` is `summary_large_image` with an image, else `summary`. A page with a link-preview image also gets the image tags (see [Link-preview image](#link-preview-image)), and an article the `article:*` tags (see [Articles](#articles)).

The 404 page always gets `noindex`, and never a canonical URL, Open Graph tags or JSON-LD.

### Articles

An article is a page whose own frontmatter has a `date`. The home page is no article, and neither is a folder index with pages. A date from git never makes a page an article.

An article gets `og:type` `article`, `article:published_time` and one `article:tag` per tag, by its label. With an `updated` it also gets `article:modified_time`, and with a category `article:section`, the label of its first.

## Link-preview image

`site.image`
: A path to a file in the assets. No default.
: The link-preview image of every page that names none.
: A bad `site.image` is a problem for the whole site: `site.image: <message>`, with the messages below as `<message>`.

`image` (a page's frontmatter)
: A path to a file in the assets.
: The page's own link-preview image, used before `site.image`.
: A bad page `image` fails that page, at its line.

Both must match `^/assets/[^?#]+[^/?#]$`: start with `/assets/`, have no query or fragment, not end in `/`, and have at least two characters after `/assets/`, so `/assets/a` is refused. The file must then exist in the assets and be a PNG, JPEG, GIF or WebP, read from its bytes. With `site.url`, a valid image gives `og:image` (absolute), `og:image:width` and `og:image:height`.

In the messages, `<path>` is the image's path as written. A project with no assets folder fails first, before the file is looked up.

A `site.image` that doesn't match
: `"site.image" must be a path to a file in the assets, such as "/assets/images/share.png"`

A page's `image` that doesn't match
: `image must be a path to a file in the assets, such as "/assets/images/share.png"`

A project with no assets folder
: `image "<path>": the project has no assets folder (assets.dir in the config)`

A missing file
: `image "<path>" does not exist in the assets`

An SVG
: `image "<path>" is an SVG; link previews need a raster image (PNG, JPEG, GIF or WebP)`

Any other file
: `image "<path>" is not a PNG, JPEG, GIF or WebP image (read from its bytes, whatever its name)`

## JSON-LD

JSON-LD is written only with `site.url`, and never on the 404 page. It is one `@graph` with a `WebSite` node (`#website`) and a page node: a `WebPage`, or a `CollectionPage` on a generated tag or category page or one of their indexes. The page node carries `datePublished` and `dateModified`, each only when the page has one. It carries a `BreadcrumbList`, nested as its `breadcrumb`, when the page has breadcrumbs, so not on the home page.

An article adds an `Article` node (`#article`) with `headline` (the page's title), `mainEntityOfPage` and `datePublished`. It adds `description` when the page has one, `dateModified` when it has an `updated`, `keywords` (its tag labels) when it has tags, and `articleSection` when it has categories: one string for one category, else a list.

`datePublished` is the page's own `date`, else the date of its first commit in git (ISO 8601), else left out. `dateModified` is the page's own `updated` only, never a date from git. From a shallow clone, the date from git is left out, with one note: `the repository is a shallow clone, so pages without a date of their own have no datePublished in their JSON-LD: build from the full history (in CI, check out with fetch-depth: 0)`.

Every `<` in the JSON-LD is written as the escape `\u003c`, so no value can end the `<script>` element or open a comment.

## sitemap.xml

`pd dev` serves `sitemap.xml` (sitemaps.org 0.9) and `pd build` writes it, only with `site.url` and with `site.index` not `false`. Pages are sorted by route, and a page with `index: false` is left out. A page's `lastmod` is its `updated`, else its `date`, else left out. Git is never read for it.

Generated tag and category pages, and their indexes, are in it. A tag or category page's `lastmod` is the newest `updated`, else `date`, of its pages. The tag index takes the newest over every published page with a tag, and the category index over every published page with a category.

## robots.txt

`robots.txt` is `User-agent: *` and `Disallow: /preview/`. With a workbench on the site's host it adds `Disallow: <workbench path>preview/`, where `<workbench path>` is the workbench's path on that host, and with `site.url` it adds `Sitemap: <url>sitemap.xml`, where `<url>` is `site.url`. With `site.index: false` it is `User-agent: *` and `Disallow: /`, with no sitemap.

A site under a base path has no `robots.txt`: in `pd dev` that address is the 404 page, and `pd build` doesn't write it. `pd build` notes the rules to add to the host's own instead: `robots.txt is not written: the site is published under <base>, and crawlers read robots.txt only at a host's root. Where you can, add to the host's own robots.txt: <rules>`.

`<base>` is the base path, and `<rules>` are joined by `; `: `Disallow: <base>preview/`, `Disallow: <workbench path>preview/` with a workbench on the site's host, and `Sitemap: <url>sitemap.xml` with `site.url`. With `site.index: false` they are `Disallow: <base>` alone.

## llms.txt

`site.llms`
: True or false. Left out, `llms.txt` is on.
: `false` turns `llms.txt` off, and so does `site.index: false`, which `site.llms: true` doesn't override.
: Any other value: `"site.llms" must be true or false`.

`pd build` writes `llms.txt` at the root of the site's output, and the build report gets `llms: { pages }`. `pd dev` doesn't serve it.

Its first line is `# <title>`: `site.globals.title`, else the home page's title, else `Site`. When the home page is listed, its description, else its teaser, follows as a `> ` quote. `## Pages` lists the top-level pages that are no folder, the home page left out. Then comes one `## <folder title>` section per folder, its index first, then its pages that are no folder, in page-list order. A section with no page left is not written.

Each line is `- [title](url): teaser`, with `[`, `]` and `\` in the link text escaped, and the URL absolute with `site.url`, else the route. The teaser is the page's description, else its first paragraph outside a definition list, and a page with neither has no `: ` part.

Drafts, scheduled pages and pages with `index: false` are left out, and tag and category pages are never in it.
