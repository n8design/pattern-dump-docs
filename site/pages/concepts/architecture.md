---
title: Architecture
description: How Pattern Dump is put together, for the people who use it: one renderer behind previews, the workbench and site pages, a build that is the dev server run headless, and your files only ever read.
layout: doc
order: 2
---

What happens to your files when you run `pd dev`, and why does `pd build` publish what the workbench showed you? Because Pattern Dump renders everything one way. The preview of a component, its docs and checks in the workbench, and a site page that uses it all come from one renderer, with the same templates, data and helpers.

`pd build` is not a second engine. It starts the same dev server without live reload, asks it for every page and writes the answers to disk, and it replaces your output folders only at the end, once every check has passed. `pd audit` renders with the same setup as `pd dev`, without starting a server.

Your files only feed in. Pattern Dump reads them and never changes them: its reports go to a folder outside your project, the WebP variants it encodes to `node_modules/.cache/pattern-dump/`, and `pd build` refuses an output folder that overlaps your sources. The one command that writes into your source folders is `pd init`, which refuses a folder that already has a config.

![Left to right: your project's files, and pattern packages; Pattern Dump, which reads them, with discovery, the renderer, the checks, the optional site and, for pd dev only, the watcher and reload; one line from the renderer to every output: the live workbench and, when there is one, the site in pd dev, the workbench folder and the optional site folder of pd build, and the report of pd audit.](#pattern-dump-parts "Pattern Dump reads your project (1) and renders it with one renderer (2). The same line leads to the live workbench of pd dev and, when the project has one, its site (3), the folders of pd build (4) and the report of pd audit (5). The site is optional: without one, Pattern Dump runs the workbench only.")

## The parts

Behind the one command, `pd`, Pattern Dump has a few parts, each with one job:

Discovery
: Finds your components in your pattern folders and in those of your pattern packages: each template with the data, schema and docs of the same name beside it, and its variants. It gives each component its slash id (`atoms/button`) and its handle (`atoms-button`). Two of your components with one handle are reported, while one of yours with a pattern package's handle replaces the package's.

Renderer
: Turns a component's Handlebars template and its data into HTML, with your helpers and global data, and highlights code.

Checks
: Validate the HTML and check the data against the component's schema while the renderer renders, then check accessibility with axe-core, links, classes, custom properties, images and symbol images. Where each one runs is under [The checks](#the-checks).

Site
: The CMS part of Pattern Dump, and a part a project can leave out: your markdown pages, each filled into one of your components as its layout. Pattern Dump works out the navigation, listings and tags from them.
: Without a `site` object in the config, Pattern Dump runs the workbench only: `pd dev` answers with the workbench on each of its host names, and `pd build` writes the workbench alone.

Build
: Compiles your stylesheets and themes with Sass and Autoprefixer, bundles your scripts with esbuild, and encodes images as WebP variants.

Dev server
: Holds the parts together and answers the browser. `pd dev` runs it with a file watcher and live reload, `pd build` without them.

Workbench
: The part of Pattern Dump where your components render, each with its docs, themes and checks. In `pd dev` it runs in your browser and gets everything it shows from the dev server. `pd build` writes it unless `build.workbench: false`, for a site whose style guide another build publishes.

In the diagram, the dev server and the build have no box of their own. The dev server holds the parts in (2) together in `pd dev` and `pd build`. The build's stylesheets, scripts and images go into every output, beside the renderer's HTML.

On npm, Pattern Dump is one package, `pattern-dump`. Inside, its parts are packages of their own (`@pattern-dump/discovery`, `@pattern-dump/renderer` and others), all private and bundled into it, so you install one package and its third-party dependencies.

## One way to render

A component shown three ways can only look the same three times if it comes from one place.

In `pd dev`, the dev server has one renderer, and everything that renders goes through it: the preview of a component or variant, the docs in the workbench, and a site page with its layout. Markdown hands its components to the same renderer. In a component's docs, a `pattern` fence renders the component in place. On a site page, a component placed with a `pd-` tag renders into the page as it does in its preview, and a live example is the preview itself, in a frame.

A site page differs from a preview in its document, not in how it renders. Pattern Dump renders the page's markdown, then the layout around it, and writes the head itself with the stylesheets in a preview's order: the base layer, then the `assets.css` entries, then the component CSS. The one layer a site page leaves out is the themes: Pattern Dump never sets a theme on a site page (see [Themes on site pages](/reference/themes/#themes-on-site-pages)).

### `pd build`: the dev server, headless

`pd build` starts the dev server without live reload or a file watcher, requests every route the workbench and the site use, and writes each response to a file: there is no second renderer. Pattern Dump changes two things in what the server returns. Its own root-relative addresses in HTML, CSS and JSON get the base path, and each workbench route gets a page of its own that carries the static runtime. Under a base path, each preview also gets a robots `noindex` tag, since crawlers don't read the workbench's `robots.txt` there.

Where a published site needs it, a build differs from `pd dev`. It leaves out drafts and scheduled pages, an image problem fails the page instead of being a warning, and it checks the links and the page basics of the whole site at once instead of page by page.

Every check runs before anything is written. Pattern Dump then writes each output into a hidden folder beside it, `.<folder name>.pd-build-<process id>` (the name of the output folder, and the number of the running build). It renames that into the output's place only after every check and the last input check have passed, the workbench first, then the site. A build that stops before the renames leaves both outputs as they were. If the site's rename fails after the workbench's, the workbench is the new one and the site the earlier one, and `pd build` says so.

The input check is there because a build takes a while. Pattern Dump notes your files when the build starts and looks again before it writes, and once more after each output, while it is still in its hidden folder. A file saved in between stops the build with `pd build: the project changed while it was being built, so nothing was written. Run pd build again once the files are saved:` and up to 20 of the files that changed.

### `pd audit`: the same setup, no server

`pd audit` checks your components, and only them, without starting a server. Its renderer has the same setup as the dev server's: the same components, pattern packages, helpers, global data and themes. It runs the sweep of the workbench's Audit tab, so both find the same. Site pages are checked by `pd build`.

The report is printed and written as `diagnostics-report.<format>` (`md`, `txt` or `json`) to a folder outside your project. `pd audit` fails when a finding is an error, or with `--strict` when there is any finding.

## Where your files come in

Each kind of file in your project has one part that reads it:

The config, `pattern-dump.config.ts` or `.json`
: `pd` reads it when a command starts: it bundles and imports a `.ts` file, or parses a `.json` file, then validates it. A project that is also a pattern package takes the folders its config doesn't name from the `patternDump` field of its `package.json`.

Components: `.hbs`, `.json`, `.schema.json`, `.md`
: Discovery finds each template and pairs it with the files of the same name beside it. The renderer reads the template, its data and its schema, and the `.md` becomes the component's docs in the workbench.

Variants: `<name>~<variant>.hbs`, `<name>~<variant>.json`
: Discovery finds them beside their base component. The renderer takes a variant's own template, or the base component's template with the variant's data.

Stylesheets
: The build compiles them, and the dev server works out which component owns each class.

The base layer
: The stylesheets your config names as `documentBase`, or a pattern package's `styles.documentBase`, which the build compiles into `/_pd/base.css`, linked first in every preview and site page.

Themes, `<name>.theme.scss`
: The dev server finds them in your themes folder and the build compiles them, for the previews.

Assets and `assets.css`
: The dev server serves your assets folder as it is, and links each `assets.css` entry into every preview and site page, after the base layer.

Symbol images, `symbols/*.svg`
: The dev server reads them from the `symbols/` folder of your assets, for the symbol images on pages.

Images
: The dev server indexes them in your assets, and the build encodes their WebP variants the first time one is asked for, then keeps them in a cache.

Scripts, `<id>.ts`
: The build bundles each one with esbuild when a preview or a page first asks for it, your project's before a pattern package's of the same name.

Global data and helpers
: The dev server loads your global data beneath every component's own, and imports your Handlebars helpers for the renderer. From a helpers folder it loads the JavaScript files (`.js`, `.cjs`, `.mjs`), and `helpers` may also name one file of your own, which may be TypeScript. A pattern package's helpers must be compiled JavaScript.

Pages
: Pattern Dump reads the markdown files in your pages folder, with their frontmatter, and works out the routes and the navigation from them.

Layouts
: Layouts are components: discovery finds them, the renderer renders them. A component is a layout when it sits directly in `layouts/`, or when a component in `pages/` or `templates/` declares `x-pd-layout` in its schema.

Pattern packages
: The dev server resolves each package to its real folder once, so every part names a file the same way. Its components, styles, themes, assets, data and helpers then come in beside your own.

## Watching and reloading in `pd dev`

In `pd dev`, a file watcher follows your folders and those of every linked pattern package (a `file:` dependency or a workspace), never an installed copy. Pattern Dump handles each change by what it touches and tells the browser over a WebSocket. The workbench swaps a changed stylesheet in place, swaps a preview's content after a template or data change, and refreshes its list of components when one is added or removed or its docs change. A site page reloads itself when it changed, when a change reaches every page, and when a component or a stylesheet changes.

The terminal says what happened, in lines such as `CSS updated`, `→ tree-changed` and `→ page-changed`. A change to the config needs a restart of `pd dev`, except `site.globals`, which reaches every page without one; a file the config imports isn't watched. `pd build` has no watcher: it runs the input check instead.

## The checks

Pattern Dump checks at three points, and not every check runs at each. `pd dev` shows a component's findings in the workbench and a page's in the terminal, `pd audit` covers components only, and `pd build` stops at the first check that fails, before it writes anything. The audit `pd build` writes into the workbench (unless `--no-audit` or `build.audit: false`) records findings but doesn't stop the build.

HTML
: Validated with every render, and its findings are warnings in the workbench and in `pd audit`, which `pd build` only records in the workbench's audit. `pd build --skip-checks=html`, or `build.skipChecks`, leaves it out of a build.

A component's schema
: A schema that isn't valid JSON shows in the workbench and in `pd audit`. It fails every site page, since every check that reads it would be off, and it is the first check that stops `pd build`. Data that doesn't match its schema shows in the workbench and in `pd audit`, and `pd build` only records it.

A page's frontmatter
: Checked against its layout's schema. In `pd dev` the page answers with an error page and the terminal names the problem; in `pd build` the page fails, which stops the build.

Accessibility of a component
: axe-core runs on each component's markup, for the workbench and for `pd audit`; `pd build` only records it. Checks that need a real browser, such as contrast, run in the workbench only, on the component on the Stage, while the Diagnostics tab is open.

Accessibility of site pages
: `pd build` only: critical and serious WCAG findings stop it, the rest are warnings. `--skip-checks=a11y` turns it off, and `--browser` adds checks in a real browser.

Page basics
: One `<main>` and one `<h1>` per page: a warning in `pd dev`, an error in `pd build`. `--skip-checks=a11y` turns it off too.

Links
: Pattern Dump checks a page's own links in `pd dev`, as warnings, and every link of the whole site in `pd build`, links into the workbench included, as errors.

Classes and custom properties
: `pd build` only. A class the style guide doesn't define is a warning by default, or an error or nothing, as `site.checks.classes` says. A `var()` in your own styles that has no fallback and that nothing defines is an error.

Images and symbol images
: An image without a size, or a raster image without its WebP variants, is a warning in `pd dev` and fails the page in `pd build`. A symbol image that can't be used is a page problem in `pd dev`, and the second check that stops `pd build`.

Two components with one handle
: Shown in the workbench and the terminal, and counted by `pd audit`; `pd build` only records it.

A class borrowed from another component
: Shown on the component in the workbench, as information, and counted in `pd build`'s report. `pd audit` leaves it out on purpose.

A change while building
: `pd build` only, before it writes and again after each output.

The workbench is where most findings show first, and [Run the workbench](/guide/run-the-workbench/) shows where to look for them.
