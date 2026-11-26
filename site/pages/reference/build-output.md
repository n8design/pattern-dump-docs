---
title: Build output
description: What pd build writes for the workbench and the site, the checks it runs before writing anything, and every refusal, for deploying a static site.
layout: doc
---

```txt
dist/                    the workbench, for build.basePath
├── index.html
├── _pd/                 Pattern Dump's own styles and scripts
├── api/                 each component's details, as JSON
├── assets/              your asset folders
├── preview/             one document per component and variant
├── <component id>/      one page per component and folder in the tree
├── .nojekyll
└── robots.txt
site/                    the site, for the path in site.url
├── index.html
├── 404.html
├── _pd/
├── assets/
├── <page>/              one folder per page
├── <mount route>/       each folder of site.mounts, as it is
├── .nojekyll
├── robots.txt
├── sitemap.xml
└── llms.txt
```

`pd build` writes the workbench to its output folder and, in a project with a site, the site to `site.outDir`. It starts the same server `pd dev` runs, without live reload or a watcher and on any free port, asks it for every route, and writes each response to a file. There is no second renderer: a built page is what `pd dev` serves, with three changes. Pattern Dump's own root-relative addresses (`/_pd/`, `/api/`, `/preview/`, `/source/`, `/assets/`) in HTML, CSS and JSON get the base path; each route gets a page that runs the workbench without a server; and under a base path, each preview gets `<meta name="robots" content="noindex">` first in its head.

The [command line reference](/reference/cli/#pd-build) has the options. [Publish](/guide/publish/) shows a build from start to finish.

## Folders

`--out`, `build.outDir`, `outDir`
: The workbench's folder, the first of the three that is set, resolved against the root.

`--base`, `build.basePath`
: The path the workbench is served from. Default: `/`. Normalised to one slash at each end: `docs/htwoo` is `/docs/htwoo/`, empty is `/`.

`site.outDir`
: The site's folder. The site is served from the path in `site.url`, else from `/`.

`build.workbench`
: `false` writes the site only: the workbench's folder is neither replaced nor written, its base path is not used, and its folder checks are skipped. The summary's first line is then `[pd build] workbench: not built (build.workbench: false); the pages link to it at <workbenchUrl>`.

Each output replaces its folder as a whole, and only at the end of a build that passed every check. The build writes into a hidden folder beside it, `.<folder name>.pd-build-<process id>`, and renames that into the folder's place, the workbench first, then the site. The earlier folder is moved aside, removed once the new one is in place, and put back if the rename fails. A build that stops before the renames leaves both folders as they were. When a build starts, it clears what a killed build left beside an output, and keeps the folders of a build that still runs.

### Refused folders

A folder that contains the project
: `pd build: --out <dir> would contain the project itself: choose a folder inside or beside it, like ./dist`, and `pd build: site.outDir <dir> would contain the project itself…` for the site.

A folder that overlaps one Pattern Dump reads
: `pd build: --out <dir> overlaps <kind> <source>, which Pattern Dump reads: choose another folder` when the workbench is built, and `pd build: site.outDir <dir> overlaps <kind> <source>, which Pattern Dump reads: choose another folder` for the site. Both folders are checked against everything Pattern Dump reads: the patterns, styles, data, scripts, theme, asset and pages folders, the helpers file or folder, and the site's head file. With `site.socialImages`, the social images folder is one of them, and so is each folder of `site.mounts`. `<kind>` says which one, such as `the data folder` or `the mounted folder <from> (site.mounts)`.

The two outputs overlapping
: `pd build: site.outDir <a> and --out <b> overlap: the site and the workbench each need a folder of their own`.

Nothing to build
: `pd build: build.workbench is false and the project has no site, so there is nothing to build`.

## The site and its workbench

A site's pages link into the workbench at `site.workbenchUrl`, which a build of a site requires: `pd build: site.workbenchUrl is required to build the site: its pages link into the workbench at that address`.

A `workbenchUrl` that is a path, or an absolute address on the origin of `site.url`, is on the same host as the site, and its path is the workbench's. When the build writes the workbench, it must be built for that path: `pd build: site.workbenchUrl is <url>, so the workbench must be built for <path> (build.basePath or --base); it is being built for <base>`. With `build.workbench: false` this isn't checked.

## Checks

Every check runs before anything is written, in this order:

1. component schemas that aren't valid JSON
2. symbol images: every source usable, every standalone file answering
3. the social images, each missing one rendered in Chromium
4. the site's pages, and the mounts
5. the search index, built in memory
6. links
7. custom properties
8. classes
9. accessibility, with jsdom, and the page basics
10. the checks in Chromium, with `--browser`
11. the project's files, for changes since the build started

Each failing check stops the build with a message that ends `so nothing was written:` and one line per problem.

A component schema that isn't valid JSON
: `pd build: a component schema isn't valid JSON, so nothing was written:`, with or without a site.

A symbol image that can't be used
: `pd build: a symbol image can't be used, so nothing was written:`, for a source no page shows too. Each symbol is then written as `_pd/symbols/<name>.svg` into both outputs.

A social image with problems
: `pd build: the site's social images have problems, so nothing was written:`, one line per problem. See [Social images](#social-images).

A site page with problems
: `pd build: the site has problems, so nothing was written:`, one line per problem, a problem of the whole site once. A mount's problems are listed here too ([Mounts](#mounts)).

A broken link
: `pd build: the site has broken links, so nothing was written:`. Every `href`, `src` and `srcset` address on the site's own host or into the workbench must resolve, on every page and the 404 page, to a built address, the same with a trailing slash, or `…/index.html`; a fragment must match an `id` or an `<a name>` there. Links to other hosts are notes, `an external link, not checked: <url> (on <pages>)`, and `mailto:`, `tel:`, `data:` and `javascript:` are skipped.

A custom property nothing defines
: `pd build: the skin reads custom properties nothing defines, so nothing was written:`, for a `var()` without a fallback.

A class outside the design system
: A warning by default, and the build goes on. With `site.checks.classes: "error"`: `pd build: the site uses classes outside the design system (site.checks.classes is "error"), so nothing was written:`. `"off"` skips the check.

An accessibility error
: `pd build: the site has accessibility problems, so nothing was written:`, with lines `<page>: <rule> (<impact>): <help>, on <targets> (<helpUrl>)` and the page basics. A crash in one page's check: `pd build: the accessibility check of <page> failed: <message>`.

An error in Chromium
: `pd build: the site has problems in a browser, so nothing was written:`, with `--browser`.

A file changed during the build
: `pd build: the project changed while it was being built, so nothing was written. Run pd build again once the files are saved:`, with up to 20 files and `and <n> more`. The project's folders are stamped at the start and checked again before writing and after each output is written. When the change makes a check fail first: `… so the build stopped (it said: <the check's first line>)`.

A site file changed while it was written
: `pd build: the site changed while it was being written:`, one line per file, `<status> <url>`, for a script, image, font, `robots.txt` or sitemap that no longer answers.

The two outputs out of step
: `pd build: the workbench in <dir> is this build's, but the site could not take its place in <dir>: the two are out of step. The site in it is the earlier one; run pd build again.`, with the rename's error on the next line.

A component's own findings, `RENDER_ERROR` and the audit's errors among them, never fail the build.

### Before the build starts

Pagefind
: Loaded before anything is built. With `site.search: true` and no Pagefind: `pd build: site.search is on, and this project has no Pagefind to build the index with: … (or set site.search to false)`. Unset, the site is indexed when Pagefind is installed; `false` turns search off.

Playwright, for `--browser`
: The project's own `playwright`, else `@playwright/test`. The social images use it too, with or without `--browser`; without `--browser`, a missing Playwright doesn't stop the build ([Social images](#social-images)). Missing: `pd build --browser needs Playwright in this project: npm install --save-dev playwright, then npx playwright install chromium`. Chromium not starting: `pd build --browser couldn't start Chromium (…): …`. In a project without a site, `--browser` checks nothing, with the note `--browser checks a site's pages in Chromium, and this project has no site: nothing was checked`.

### Skipping checks

`--skip-checks` and `build.skipChecks` can skip `a11y`, the accessibility of the site's pages, and `html`, the components' markup against HTML's content model. `--skip-checks` replaces `build.skipChecks`, and `--skip-checks=` runs every check.

Any other name
: `pd build: "<name>" is not a check pd build can skip; it can skip "a11y", "html"`.

`--browser` with `a11y` skipped
: `pd build: --browser checks the pages' accessibility in Chromium, so it can't be combined with skipping the accessibility check (--skip-checks=a11y or build.skipChecks)`.

With `html` skipped, the workbench, its Diagnostics tab and the audit carry no `HTML_INVALID`. The last line names what was left out: `[pd build] NOT CHECKED: the accessibility of the site's pages (a11y), the components' markup against HTML's content model (html), as asked (--skip-checks or build.skipChecks)`.

## The workbench's files

`_pd/`
: `main.js`, `main.css`, `shiki.css`, `code.css`, `base.css`, `axe-core.js`, `rule-tiers.json`, each theme's CSS, the files the previews load, every image variant in a `src` or `srcset` of a preview or of an example in a component's docs, as `images/<name>.<key>.<width>.webp`, and `symbols/<name>.svg`.

`api/`
: `config.json`, `version.json`, `tree.json`, `themes.json`; per component and variant `component/<id>/index.json` and `~<variant>.json`; per folder `overview/<folder>/index.json`; and `audit.json`, when the audit is included.
: `graph.json`, the project graph, the same JSON as `pd graph --json` ([Relationships](/concepts/relationships/)). `build.graph: false` leaves it out.

`preview/`
: Each component's and variant's preview, `preview/<id>/index.html` and `~<variant>.html`.

`<route>/index.html`
: One page per route of the workbench: `/`, every component, every component's `variants`, every folder. A route whose file is already written keeps it, with a warning.

`assets/`
: Each asset folder as `assets/<folder name>/`; with exactly one, also at `assets/`. A folder hidden by an earlier one of the same name is left out with a warning.

`.nojekyll`, `robots.txt`
: An empty `.nojekyll`, and a `robots.txt` with `User-agent: *` and `Disallow: <base>preview/`.

No `404.html` is written for the workbench, on purpose: a host that served it for a missing preview would start a second workbench inside the frame. Under a base path, the build notes that `robots.txt` is read only at a host's root, and to add `Disallow: <base>preview/` there; the note is left out when the workbench is the site's, on its host, and the site is at the root.

The built workbench is read-only: its Nav Rail status reads `Static build · <local date>`, and the Audit tab is headed `Snapshot from <local date>`. With the audit left out (`--no-audit` or `build.audit: false`), the audit never runs and the Audit tab falls back to Docs.

## The site's files

The site holds every address the check of the site reached, written for its base path, plus each symbol's file and an empty `.nojekyll`.

`404.html`
: Always.

`robots.txt`
: Only when the site is at its host's root. Under a path, the build prints the rules to add to the host's own `robots.txt` instead.

`sitemap.xml`
: Only with `site.url` set and `site.index` on.

`llms.txt`
: At the site's root, when `site.llms` is on.

`_pd/search/`
: The search index.

`_pd/social/<route>/card.<hash>.png`
: Each page's social image, with `site.socialImages` and `site.url` set; the home page's is `_pd/social/card.<hash>.png`. See [Social images](#social-images).

The feeds
: Each feed is a file of the site, at its address. [Feeds](/reference/feeds/) has their files and settings.

`redirectFrom` pages are written as pages that forward, and not counted as pages. An address that doesn't answer 200 (404 for the 404 page) is not written and doesn't fail the build. Without `site.url`, the build notes: `site.url is not set, so pages have no canonical URL, og:url, og:image or JSON-LD, and there is no sitemap: set site.url …`.

Every reference to a file Pattern Dump serves (`/_pd/…`, `/assets/…`) in `href`, `src`, `srcset`, `og:image`, `twitter:image` and a JSON-LD `"image"` gets `?v=<content hash>`, and so does a CSS `url()` to anything but another stylesheet. Image variants, a reference with another query or a fragment, and a missing file are left as they are. The workbench links in live examples point at `site.workbenchUrl`.

## Social images

With `site.socialImages` set, `pd build` gives each page that gets a social image its card, before it checks the pages. A card's address is `/_pd/social/<route>/card.<hash>.png`, where `<hash>` is 10 hex digits over the card's document, the render settings and the Pattern Dump version. The build takes the card's bytes from the cache, `node_modules/.cache/pattern-dump/social/`, else from `social/` beside the pages folder, where [`pd social`](/reference/cli/#pd-social) writes them, and renders the rest in Chromium with the project's own Playwright. A card with problems stops the build. [Search and SEO](/reference/search-and-seo/) has the component and which pages get a card.

Without Playwright, the build goes on. Each page without its card takes `site.image`, or has no link-preview image without one, and the summary says so for each page:

```txt
[pd build]   warning: <page>: no social image: its card is missing or stale and Playwright isn't installed: run pd social, or install Playwright
```

When Chromium doesn't start, the warning ends `and Chromium didn't start (<reason>): run pd social, or npx playwright install chromium` instead. With `--browser`, a Chromium that doesn't start stops the build.

The summary's next-to-last line counts those pages:

With `site.image`
: `[pd build] NO SOCIAL IMAGE: <n> pages use the site image instead (run pd social, or install Playwright)`, and for one page `1 page uses the site image instead`.

Without `site.image`
: `[pd build] NO SOCIAL IMAGE: <n> pages have no link-preview image (run pd social, or install Playwright)`, and for one page `1 page has no link-preview image`.

## Mounts

`site.mounts` publishes the finished files of another tool, such as an API reference, at a route of the site ([Navigation and routes](/reference/navigation-and-routes/#mounts), [Configuration](/reference/configuration/)). `pd build` copies each mount's folder into the site's output byte for byte, last, after every file of its own, and never over one. The link check counts the mounted files as written, so a page can link to one. The summary names them:

```txt
[pd build] mounts: <n> files (<size>), copied as they are: <to> <n> files (<size>), …
```

A mounted file may not take the place of a file the site writes. That is a page, an old route from `redirectFrom`, a feed, an image beside the pages, or one of these:

- `sitemap.xml`
- `robots.txt`
- `llms.txt`
- `404.html`
- `.nojekyll`
- anything under `/_pd/`, `/assets/`, `/preview/` or `/_pagefind/`

Each of these problems stops the build with `pd build: the site has problems, so nothing was written:`, before anything is written. `<from>` is the mount's folder as the config writes it, `<to>` its route:

A mounted file in the place of one the site writes
: `site.mounts: <from>/<file> would be published at <path>, which is <claim>: remove the file from the mount, or publish the mount at another route`. `<claim>` names the site's file, such as `the page /about/`, `the site's sitemap.xml`, `the image <path>` or `in _pd/, which Pattern Dump writes`.

Two mounts with the same file
: `site.mounts: <from>/<file> would be published at <path>, which clashes with <from>/<file>, published at <path>: remove the file from the mount, or publish the mount at another route`, naming the later mount's file first.

A mount whose folder is missing
: `site.mounts: <from>, published at <to>, doesn't exist: build it before the site (the other tool's build runs first), or remove the mount`.

A mount that is a file
: `site.mounts: <from> is a file, not a folder: a mount publishes a folder's files at <to>`.

A link in a mount
: A link to a file inside the mount is published as that file. A link to nothing, to a file outside the mount, or back to a folder above it stops the build: `site.mounts: <from>/<file> is a link <where>: a mount publishes files, and a link is published as the file it points to, inside the mount; copy the file in, or remove the link`, where `<where>` is `to nothing`, `to <target>, outside <from>` or `back to a folder above it`.

A site output inside a mounted folder
: `pd build: site.outDir <dir> overlaps the mounted folder <from> (site.mounts), which Pattern Dump reads: choose another folder`.

## The summary

While it builds, `pd build` prints one line per step, `[pd build] … <step> (<s>s)`. Then the summary, each line led by `[pd build] `, in this order, where they apply:

```txt
<n> components → <f> files, <x> MB in <ms> ms
<outDir>  (served from <base>)
styles: <n> stylesheet(s) linked by a borrowed class (STYLE_BORROWED on the component's Diagnostics tab)
site: <n> pages → <f> files in <dir>  (served from <base>)
links: <n> references on <p> pages, none broken
accessibility: <n> pages, no errors
images: …
social images: <n> pages (<r> rendered, <c> from the cache, <k> committed, <m> without one:)
classes: …
llms.txt: <n> pages
feeds: <n> files
mounts: <n> files (<size>), copied as they are: <to> <n> files (<size>), …
search: <n> pages indexed → <f> files in _pd/search/ (<k> KB)
drafts: …
scheduled: …
  not built: …
  note: …
NO SOCIAL IMAGE: …
NOT CHECKED: …
```

The `social images:` line names only the counts that aren't 0, and leaves the brackets out when none is left. With pages without a card, a `warning:` line per page follows it, and the `NO SOCIAL IMAGE:` line comes next to last ([Social images](#social-images)).

`pd build` exits with 0 after the summary, and with 1 and `[pd] Error: <message>` on any error.

Two builds of an unchanged project with the same clock are byte-identical, and no text file in the output names a folder of the machine that built it.
