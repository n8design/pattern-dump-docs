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
    socialImages: {
      component: …,
    },
    search: …,
    llms: …,
    globals: {
      title: …,
    },
  },
});
```

Pattern Dump writes a site's search index, the tags in each page's `<head>`, its JSON-LD, and the files crawlers read: `sitemap.xml`, `robots.txt` and `llms.txt`. It renders a page's link-preview image from a component when the site names one. The keys are in the `site` part of the config, and a site's feeds are on [Feeds](/reference/feeds/).

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

With `site.url`, a page gets `canonical`, `og:type`, `og:site_name` (with a site title), `og:title`, `og:description` (with a description), `og:url` and `twitter:card`. `twitter:card` is `summary_large_image` with an image, else `summary`. A page with a link-preview image also gets the image tags (see [Link-preview image](#link-preview-image)), and an article the `article:*` tags (see [Articles](#articles)). Every page but the 404 page links the site's feeds after `og:url`, when the site has them: [Feeds](/reference/feeds/#head-links) has the links.

The 404 page always gets `noindex`, and never a canonical URL, Open Graph tags or JSON-LD.

### Articles

An article is a page whose own frontmatter has a `date`. The home page is no article, and neither is a folder index with pages. A date from git never makes a page an article.

An article gets `og:type` `article`, `article:published_time` and one `article:tag` per tag, by its label. With an `updated` it also gets `article:modified_time`, and with a category `article:section`, the label of its first.

## Link-preview image

`site.image`
: A path to a file in the assets. No default.
: The link-preview image of every page that names none and gets no [social image](#social-images).
: A bad `site.image` is a problem for the whole site: `site.image: <message>`, with the messages below as `<message>`.

`image` (a page's frontmatter)
: A path to a file in the assets, or a path relative to the page to an image beside it in the pages folder, such as `./share.png`. In a folder's `childDefaults`, a relative path is relative to that folder's `index.md`.
: The page's own link-preview image, used before a social image and `site.image`.
: A bad page `image` fails that page, at its line.

A path in the assets, `site.image` or a page's, must match `^/assets/[^?#]+[^/?#]$`: start with `/assets/`, have no query or fragment, not end in `/`, and have at least two characters after `/assets/`, so `/assets/a` is refused. A relative path must stay inside the pages folder. The file must then exist and be a PNG, JPEG, GIF or WebP, read from its bytes. With `site.url`, a valid image gives `og:image` (absolute), `og:image:width`, `og:image:height` and `twitter:image`, which names the same absolute URL as `og:image`.

In the messages, `<path>` is the image's path as written. A project with no assets folder fails first, before the file is looked up.

A `site.image` that doesn't match
: `"site.image" must be a path to a file in the assets, such as "/assets/images/share.png"`

A page's `image` that is neither
: `image must be a path to a file in the assets, such as "/assets/images/share.png", or an image beside the page, such as "./share.png"`

A relative path that leaves the pages folder
: `image "<path>" is outside the pages folder: a relative image stays inside site.pagesDir`

A relative path to no file
: `image "<path>" is not beside the page: there is no <rel> in the pages folder`, where `<rel>` is the image's path in the pages folder.

A project with no assets folder
: `image "<path>": the project has no assets folder (assets.dir in the config)`

A missing file in the assets
: `image "<path>" does not exist in the assets`

A file that can't be read
: `image "<path>" cannot be read: <error>`, where `<error>` is the file system's message.

An SVG
: `image "<path>" is an SVG; link previews need a raster image (PNG, JPEG, GIF or WebP)`

Any other file
: `image "<path>" is not a PNG, JPEG, GIF or WebP image (read from its bytes, whatever its name)`

## Social images

```ts
export default defineConfig({
  site: {
    socialImages: {
      component: …,
    },
  },
});
```

A social image is a link-preview card that Pattern Dump renders from a component of the style guide, for each page that has no `image` of its own. The component is an ordinary one: it shows in the workbench with its sample data, and its variants are the designs a folder or a page picks. This site's is `components/social-image`.

`site.socialImages`
: An object with one key, `component`, which it requires. No default: left out, no page gets a social image.
: Not an object: `"site.socialImages" must be an object`. Without `component`: `missing required "site.socialImages.component"`, with the name it found when one is close.

`site.socialImages.component`
: A component's id, its folders and its name, with no variant.
: The component every card is rendered from. A page's card takes this component itself, or the variant its `socialImage` names.
: Not an id: `"site.socialImages.component" must be a component's id, such as "components/social-image"`.

### What the component gets

Every card is rendered with the same fields, whatever the page:

- `title`: the page's title;
- `description`: the page's description;
- `section`: the title of the `index.md` of the page's top-level folder, so none for the home page and a top-level page;
- `date`: the page's own `date`, `YYYY-MM-DD`;
- `dateText`: that date as the site writes it for readers, in `site.lang` and the style of `site.dates`;
- `site`: the site's globals, `site.globals`.

A field the page lacks is left out, not `null`. A data-overlay variant's data (`social-image~guide.json`) reaches its cards too, under these fields: the page's fields win.

The component must have a schema, `<stem>.schema.json` beside its template, and it may declare only these fields and what a variant's data gives. A field its schema requires and a page lacks fails that page.

### Which page gets one

`socialImage` (a page's frontmatter)
: A variant of the component, by its name after `~` (letters, digits, `_` and `-`), or `false`. A folder's `childDefaults` can set it for the pages under it, and the nearest wins.
: The design of the page's card. Left out, the card is the component itself. `false` turns the page's card off.

No card is rendered for the 404 page, for a page with an `image` of its own or from `childDefaults`, for `socialImage: false`, and for any page without `site.url`. Generated tag and category pages get the component itself.

A page with a card gets it as its link-preview image, with the image tags of [Link-preview image](#link-preview-image), 1200 x 630, and `twitter:card` `summary_large_image`.

### Where a card goes

A card's address is `/_pd/social/<route>/card.<hash>.png`, and the home page's `/_pd/social/card.<hash>.png`. `<hash>` is the first 10 hex digits of a SHA-256 over the render settings, the Pattern Dump version and the card's document as the site serves it. That document holds the rendered variant, with the stamps of every stylesheet, font and image it loads, so a change to anything the card shows gives it a new hash, and so does an upgrade. A change to the date style renders again only the cards that show `dateText`. A card is served as `image/png` with `Cache-Control: public, max-age=31536000, immutable`.

### How `pd build` renders it

`pd build` renders each card in Chromium with the project's own Playwright, with or without `--browser`, before it crawls the site. The card is 1200 x 630 at 1x, with reduced motion, a screenshot of the body's first element once its fonts are loaded. A card is looked for first in the cache, `node_modules/.cache/pattern-dump/social/<hash>.png`, then in the committed `social/` folder, and only the cards in neither are rendered, into the cache. The report gets `[pd build] social images: <n> pages (<r> rendered, <c> from the cache, <k> committed)`, each part only when it isn't 0, then `<m> without one:` and a warning per page when cards are missing.

`pd dev` renders a card the first time its address is asked for, into the same cache. [Command line](/reference/cli/#social-images) has what it prints.

### Hosts without Chromium

`pd social` renders the cards into the project, to be committed: `social/` beside the pages folder, at `social/<route>/card.<hash>.png`. `pd build` then takes each card from there, on a host where Chromium doesn't run. This site's cards are rendered this way and committed in `site/social/`, since its host builds without Chromium. [Command line](/reference/cli/#pd-social) has `pd social`.

Without the project's Playwright, `pd build` goes on: each page whose card is missing or stale takes `site.image`, or has no link-preview image and `twitter:card` `summary`. Each such page is a warning, and the report's next-to-last line counts them. A Chromium that won't start is the same, with its reason in the warning, but with `--browser` it stops the build.

### Checks

Every card is checked as it is rendered, and a problem stops `pd build` before anything is written. A card with a problem is never cached, so the next build renders it again.

- Its size: the component's root element is 1200 x 630, as its own CSS sets it.
- Cut-off text: an element that holds the text of `title`, `description`, `section`, `date` or `dateText` and overflows its box, or lies outside the card, cuts that field off.
- Contrast: axe's `color-contrast` rule, reported once per variant with the pages it was found on.

### Messages

`<c>` is the component's id, `<page>` the page's file in the pages folder, and `<variant>` the component or variant a card is rendered from. The component's problems fail the whole site:

No such component
: `site.socialImages.component is "<c>", and there is no such component`, with `: did you mean "<x>"?` when one is close.

A component without a schema
: `site.socialImages.component: <c> has no schema: a social image component declares the fields it uses in <stem>.schema.json, beside its template`

A schema that can't be read
: `the schema of <c> cannot be read: <error>`

A variant's data that can't be read
: `the data of <c>~<name> cannot be read: <error>`

A field the component doesn't get
: `<c> declares "<field>", which a social image doesn't get: it gets title, description, section, date, dateText and site, and what a variant's data gives`

A page's `socialImage` fails that page, at its line:

`socialImage` without `site.socialImages`
: `socialImage is set, but site.socialImages is not, so there is no social image component: set site.socialImages.component, or remove socialImage`

A value that is no variant name
: `socialImage must be a variant of <c>, such as "<v>", or false`

A name that is no variant
: `socialImage "<v>" is not a variant of <c>: its variants are "<a>", "<b>"`, or `: it has no variants`.

Each of these fails the page:

A required field the page lacks
: `<page>: the social image needs "<field>", which <variant> requires (<stem>.schema.json): <fix>, or set socialImage: false`, where `<fix>` says what to give: `give the page a <field>`, `give the page a date` for `dateText`, `give its top-level folder an index.md with a title` for `section`, `set site.globals` for `site`.

A variant that doesn't render
: `<page>: the social image (<variant>) doesn't render: <error>`

The checks in Chromium stop `pd build` under `pd build: the site's social images have problems, so nothing was written:`, one line each:

A card of the wrong size
: `<variant>: the social image is <w> x <h>, and a card is 1200 x 630: set its size in its own CSS`

Text cut off
: `<page>: the social image cuts its <field> off: shorten it, or let the component take more lines`

Too little contrast
: `<variant>: the social image fails color-contrast (<impact>): <help>, on <elements> (<help URL>), on <n> pages: <pages>`

A card that can't be rendered is a warning per page, and the build goes on. `pd dev` prints the same warning once per page, led by `[site] warning: `.

Without the project's Playwright
: `[pd build]   warning: <page>: no social image: its card is missing or stale and Playwright isn't installed: run pd social, or install Playwright`

A Chromium that won't start
: `[pd build]   warning: <page>: no social image: its card is missing or stale and Chromium didn't start (<reason>): run pd social, or npx playwright install chromium`

The pages without a card, next to last in the report
: `[pd build] NO SOCIAL IMAGE: <n> pages use the site image instead (run pd social, or install Playwright)`, or `1 page uses the site image instead`. Without `site.image`: `<n> pages have no link-preview image`, or `1 page has no link-preview image`.

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

With `site.url` and feeds, the file ends with `## Feeds`: the site feed first, then each folder's, one line each, `- [title](url): Atom` or `: RSS`. [Feeds](/reference/feeds/) has them.
