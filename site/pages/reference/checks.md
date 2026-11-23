---
title: Checks
description: Every check Pattern Dump runs on a site's pages: links and anchors, classes no style defines, custom properties, accessibility with axe and browser checks.
layout: doc
---

```txt
[pd build] … site checked: 33 files (0.8s)
[pd build] … links checked: 204 references on 13 pages (1.4s)
[pd build] … styles checked against the style guide (1.4s)
[pd build] … accessibility checked on 13 pages (2.4s)
```

`pd build` checks a site's pages before it writes anything, in this order:

1. the crawl of the site, with each page's own problems;
2. the search index;
3. links;
4. custom properties;
5. classes;
6. the page basics and accessibility;
7. the checks in a browser, with `--browser`.

A check that fails stops the build, and nothing is written. [Build output](/reference/build-output/#checks) lists every message that stops it.

`pd dev` checks less, and as warnings: a page's links to other pages and its own anchors, its images, and the page basics. Everything else is left to the build. The components' own checks, in the workbench and `pd audit`, are on [Diagnostics](/reference/diagnostics/).

## The crawl

The build reads:

- every page, every redirect route and the 404 page;
- `robots.txt`, for a site at its host's root, and the sitemap, with `site.url` set and indexing on;
- every `/_pd/`, `/assets/` and `/preview/` address in `href`, `src`, `srcset` and `og:image`;
- every `/_pd/` and `/assets/` address in CSS `url()`.

A problem of the whole site is listed once.

## Links

Every site page and the 404 page are checked; previews and redirect pages are not, as sources. Every `href`, `src` and `srcset` address on the site's own host, or into the workbench, must resolve.

A path
: Resolves to a built address, the same with a trailing slash, or `…/index.html`. A `#fragment` must match an `id` or an `<a name>` in the target.

An address into the workbench
: Must hit a route of the built workbench: a component, a folder or `…/variants`. A `#fragment` must be one of the component's variants: `<route> has no variant "<h>" in the workbench`.

An address outside the base path
: `<p> is outside <base>, the path the site is published under (site.url)`, with a hint when it was written with the base already.

Another host
: Not fetched. A note: `an external link, not checked: <url> (on <pages>)`.

`mailto:`, `tel:`, `data:`, `javascript:` and empty addresses are skipped. Any broken link stops the build: `pd build: the site has broken links, so nothing was written:`.

In `pd dev`, a page gets warnings only for its links to site pages and redirect routes, and for its own anchors; `/_pd/`, `/assets/`, `/preview/` and other hosts are left to the build.

## Page basics

A page has exactly one main landmark, `<main>` or `role="main"`, and exactly one `<h1>`, counted from its tags (a code example's text doesn't count). Errors in `pd build`, warnings in `pd dev`:

No main landmark
: `the page has no <main>: …`

More than one
: `the page has <n> main landmarks (<main> or role="main"): …`

No `<h1>`
: `the page has no <h1>: one heading names the page`

More than one `<h1>`
: `the page has <n> <h1> headings: one names the page, the others are <h2> or lower`

A heading whose anchor is already an id on the page, the layout's or a symbol's, gets the next free number, `main-1`, `main-2`, with a note. When the layout makes ids from `page.headings`, so no number holds, it is a problem of the page.

## Classes

Every class on the site's pages, the 404 page included, must be defined by one of:

- a selector in a stylesheet: the project's, the packages', and every stylesheet the site loads;
- a template's class word, or a `prefix{{…}}` family;
- the page's own `<style>`.

The check reads the classes in each written page's HTML, after the templates have run. A class word a template writes counts as defined, and so does a family it builds from a value with a fixed start: `class="icon icon-{{name}}"` defines `icon` and every class that starts with `icon-`. A class that arrives whole from a value, such as `class="{{look}}"`, is defined only by a stylesheet rule for it, the page's `<style>` or `site.checks.allowClasses`, and every page that uses it gets a line of its own.

Always allowed
: `is-*`, `has-*` and `js-*`, and the classes in `site.checks.allowClasses`, where a trailing `*` makes a prefix.
: Pattern Dump's own: `shiki`, `shiki-*`, `__shiki_*`, `line`, `copy-btn`, `pd-*`, `pattern-link`, `pattern-link--unresolved`, `doc-example`, `doc-example-id`, `doc-example-variants`, `doc-error`, `doc-image` and `doc-figure`.

A class no style defines
: `<file>:<line>: class "<name>" isn't defined by any component or style`, the file alone when no line is found, and the route for a generated page.

`site.checks.classes`
: `"warning"`, the default: listed in the build's report. `"error"`: stops the build, `pd build: the site uses classes outside the design system (site.checks.classes is "error"), so nothing was written:`. `"off"`: skips the check.

## Custom properties

Every `var(--x)` without a fallback in the project's styles folder, in SCSS or CSS, must be defined. It may be declared as `--x:` or `@property --x` in a compiled stylesheet of the style guide or the site, or in a `style` attribute of any written page or preview; or it may be listed in `site.checks.allowProperties`. Comments and names Sass builds (`--#{…}`) are skipped. The check always runs and can't be turned off; a failure is always an error:

```txt
pd build: the skin reads custom properties nothing defines, so nothing was written:
<file>:<line>: var(--x) reads a custom property nothing defines: define --x in the skin, give it a fallback (var(--x, ...)), or, if JavaScript sets it, list it in site.checks.allowProperties
```

## Accessibility

Every page and the 404 page are checked with axe-core 4.11.4, against the tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa` and `best-practice`, on worker threads, each page in its own jsdom window. The report comes back in page order, the same with any number of workers.

The rules split into two tiers. A rule runs in jsdom when its failing test page is a violation and its passing page clean in jsdom; every other rule runs only in a browser, with `--browser`.

jsdom
: 66 rules, in every `pd build`, such as `document-title`, `html-has-lang`, `image-alt`, `label`, `button-name`, `link-name`, `heading-order`, `region`, `landmark-unique`, `list`, `listitem`, `nested-interactive` and `meta-viewport`.

Browser
: 33 rules, with `--browser` only, such as `color-contrast`, `landmark-one-main`, `page-has-heading-one`, `bypass`, `skip-link`, `target-size`, `scrollable-region-focusable`, `link-in-text-block`, `aria-hidden-focus`, `duplicate-id-aria` and `meta-viewport-large`.

A rule with a `wcag*` tag at impact critical or serious is an error, and fails the build. Moderate and minor, and every `best-practice` rule at any impact, are warnings. Results axe can't decide are not reported.

The errors stop the build, `pd build: the site has accessibility problems, so nothing was written:`, with lines `<page>: <rule> (<impact>): <help>, on <targets> (<helpUrl>)`. Warnings are grouped by rule, each a line under the accessibility line: `[pd build]   warning: <rule> (<impact>): <help>, <n> element(s) on <pages> (<helpUrl>)`.

### What it can't check

Automated checks don't cover colour contrast in what a single render doesn't show, such as hover and focus states or text over images; keyboard order and focus; what a screen reader announces; cognitive accessibility; or WCAG AAA. A review by hand against WCAG 2.1 AA is still needed.

## In a browser

`pd build --browser` checks the pages in Chromium, with the project's own `playwright` or `@playwright/test`, at two sizes: 1000×720 at 1x and 390×844 at 2x. Requests to other origins are aborted. Its errors stop the build: `pd build: the site has problems in a browser, so nothing was written:`.

Accessibility
: The browser tier's rules on every page, with the same severities. A finding at both sizes is listed once, with `(at <sizes>)`. The accessibility line then says "in jsdom and Chromium".

Images
: Warnings, for each `img[srcset]` scrolled into view: too large when a smaller candidate covers the box at the device's pixel ratio, too small when the width chosen is less than needed and a larger one exists. The image is named by its path in the assets.

The base path
: Under a base path, a page that asks for an address on the site's host outside the path is an error, `/favicon.ico` excepted.

Search
: With search, on the first page with an `input[type="search"]`, at each size: a word from an indexed title is typed and Enter pressed. No result within 5 seconds is an error, and axe runs again with the results shown. A request under `_pd/search/` for a file the index doesn't have is an error.

Without Playwright: `pd build --browser needs Playwright in this project: npm install --save-dev playwright, then npx playwright install chromium`. In a project without a site, `--browser` checks nothing and says so.

## Skipping checks

`--skip-checks` or `build.skipChecks` can skip two checks: `a11y`, the accessibility check and the page basics, and `html`, the components' markup against HTML's content model. The build says each was skipped, as `… accessibility check skipped (skipChecks: a11y)`, and its last line names what was left out: `[pd build] NOT CHECKED: …`. `--browser` with `a11y` skipped is refused. Links, classes and custom properties can't be skipped; the class check has `site.checks.classes: "off"`.
