---
title: Create a style guide
description: Start a style guide with pd init, the style guide generator in Pattern Dump, and learn what each question means and what each file it writes is for.
layout: doc
order: 2
---

A style guide needs a config, a place for components and their styles, and Pattern Dump installed at a known version. `pd init` writes all of it and runs `npm install`, so you start with a project that runs. This guide also gives it a site from the start: pages built from the same components, in the same project.

## Create the project

In the folder that should hold the project, run:

```sh
npx pattern-dump@latest init my-design-system
```

`init` takes one folder and, without one, sets up the folder you are in. Two folders are an error: `init takes one folder (got a, b)`.

In a terminal, `pd init` asks one question at a time. Press Enter on each to take its default, except two: `y` to include a website, and `n` to the system theme, as in this run:

```text
A website on an existing style guide package? Its npm name or folder (empty: a new design system):
Project name (my-design-system):
Title in the Nav Rail (my-design-system):
Include starter components (Y/n):
Include a website (y/N): y
Include site search (Pagefind) (Y/n):
Follow the viewer's light or dark setting (a system theme as the default) (Y/n): n
Initialise a git repository (Y/n):
Run npm install (Y/n):
✓ 153 files written to my-design-system
✓ package.json created: my-design-system, with pattern-dump 0.8.1
✓ git repository initialised
… npm install

Next:
  cd my-design-system
  npm run dev      # the website at http://live.localhost:4000/, the workbench at http://pd.localhost:4000/
```

npm prints its own lines after `… npm install`. They are left out here.

## The questions

The default is in brackets. For yes or no, the capital letter is the default, and any answer that starts with `y` is yes.

`A website on an existing style guide package?`
: Leave it empty for a new style guide. An npm name or a folder here sets up a site on a style guide that already exists instead, a later step of this guide. Asked only without `--site` and without any of `--examples`, `--no-examples`, `--with-site`, `--without-site`, `--system-theme` or `--no-system-theme`.

`Project name`
: The `name` in `package.json`. The default is the `name` of a `package.json` already in the folder. Without one, it is the folder's name in lowercase, each run of characters outside `a-z0-9._~-` turned into `-`, and `-`, `.` and `_` trimmed from both ends. A name with nothing left becomes `design-system`.
: A folder with a generic name (`styleguide`, `style-guide`, `design-system`, `site`, `website`, `docs`, `www`) takes its parent folder's name as a scope: `acme-web/styleguide` becomes `@acme-web/styleguide`. When the parent's name has no letter or digit, the name stays unscoped.

`Title in the Nav Rail`
: The title the workbench shows in its Nav Rail, written to `shell.brand.title` in the config. The default is the project name. For a scoped name made from the folders, it is the parent folder's name as written (`acme-web`). A name you typed yourself is its own default.

`Include starter components`
: Yes by default: a button, a search field and an example page, with their styles (see [What you get](#what-you-get)). No gives you the structure, the config and the themes only.

`Include a website`
: No by default. Yes adds a site to the style guide, with pages, layouts and a GitHub Pages workflow, and asks the next two questions. This guide uses the site, so answer `y`.

`Include site search (Pagefind)`
: Yes by default, asked only with a website. Adds Pagefind, pinned to `1.6.0`, so `pd build` can index the site for its search.

`Follow the viewer's light or dark setting (a system theme as the default)`
: Yes by default, asked only with a website. It adds a third theme, `system`, with `color-scheme: light dark` and its values in `light-dark()`, and makes it the default. This guide works with the two themes `light` and `dark`, so answer `n`: `light` stays the default.
: With `light` as the default, the site's live examples stay light on a page that turns dark with the viewer's setting: an example keeps the default theme unless the page sets `data-theme`, and the default follows the viewer only when that theme does ([Themes](/reference/themes/#themes-on-site-pages)). To make `system` the default later, add the theme and set the default in both the config and `package.json` ([package.json](#packagejson)).

`Initialise a git repository`
: Yes by default. Asked only when the folder isn't inside a git repository already. Inside one, `pd init` doesn't ask and doesn't run `git init`. When `git init` fails, it prints `✗ git init failed: is git installed? (the project is set up regardless)` and carries on.

`Run npm install`
: Yes by default. Installs Pattern Dump, TypeScript and, with site search, Pagefind into the project.

### Without the questions

Each question has a flag, and a flag skips its question. `--yes` (or `-y`) takes every default without asking, and so does a run without a terminal, such as CI or input piped in. The defaults leave the website out, so this guide's run, without questions, names two flags:

```sh
npx pattern-dump@latest init my-design-system --yes --with-site --no-system-theme
```

The flags, each with the question it answers:

`--site <package>`
: The first question, `A website on an existing style guide package?`. A later step of this guide covers it.

`--name <name>`
: `Project name`.

`--brand <title>`
: `Title in the Nav Rail`.

`--examples`, `--no-examples`
: `Include starter components`.

`--with-site`, `--without-site`
: `Include a website`. Until 0.8.0 the two were `--storefront` and `--no-storefront`. The old names still work until 1.0, which removes them, and `pd init` first prints which flag each one is now, such as `! --storefront is now --with-site`.

`--search`, `--no-search`
: `Include site search (Pagefind)`.

`--system-theme`, `--no-system-theme`
: `Follow the viewer's light or dark setting`.

`--git`, `--no-git`
: `Initialise a git repository`. `--git` runs `git init` even inside a repository, where the question isn't asked.

`--install`, `--no-install`
: `Run npm install`.

A flag and its `--no-` form together are an error, such as `--git and --no-git cannot both be given`. So are a yes and a no to the site, named as you gave them: `--with-site and --without-site cannot both be given`. The search and system-theme flags without a website stop `pd init` before it writes anything: `✗ --<flag> is a choice for a website: add --with-site. Nothing was written.`

## What you get

With the starter components and the site, the project looks like this:

```text
my-design-system/
├── .github/
│   └── workflows/
│       └── pages.yml
├── assets/
│   └── icon.svg
├── pages/
│   ├── about.md
│   ├── articles/
│   │   ├── hello.md
│   │   ├── index.md
│   │   └── related.md
│   ├── guide.md
│   ├── index.md
│   └── search.md
├── src/
│   ├── patterns/
│   │   ├── index.md
│   │   ├── atoms/
│   │   │   ├── index.md
│   │   │   └── button/
│   │   ├── components/
│   │   │   ├── compact-card/
│   │   │   ├── feature-card/
│   │   │   ├── grid-card/
│   │   │   ├── listing-card/
│   │   │   ├── note/
│   │   │   ├── search/
│   │   │   └── toc/
│   │   ├── layouts/
│   │   │   ├── article/
│   │   │   ├── categories/
│   │   │   ├── category/
│   │   │   ├── doc/
│   │   │   ├── home/
│   │   │   ├── listing/
│   │   │   ├── page/
│   │   │   ├── tag/
│   │   │   └── tags/
│   │   ├── molecules/
│   │   │   ├── index.md
│   │   │   └── search-field/
│   │   │       └── input/
│   │   ├── pages/
│   │   │   ├── index.md
│   │   │   └── example/
│   │   ├── partials/
│   │   │   ├── base/
│   │   │   ├── head/
│   │   │   ├── term-index/
│   │   │   └── term-listing/
│   │   └── views/
│   │       ├── compact/
│   │       ├── featured/
│   │       ├── grid/
│   │       └── list/
│   ├── scripts/
│   │   ├── globals.d.ts
│   │   ├── search-field.ts
│   │   └── site-search.ts
│   └── styles/
│       ├── atoms/
│       ├── base/
│       │   ├── _tokens.scss
│       │   ├── document.scss
│       │   └── page.scss
│       ├── components/
│       ├── layouts/
│       ├── molecules/
│       ├── pages/
│       ├── partials/
│       └── views/
├── themes/
│   ├── dark.theme.scss
│   └── light.theme.scss
├── .gitignore
├── package.json
├── pattern-dump.config.ts
├── README.md
└── tsconfig.json
```

Without the starter components, `atoms/`, `molecules/` and `pages/` under `src/patterns/` are left out, with their styles and `search-field.ts`. The site's files stay.

### The components

`src/patterns/` holds one folder per component, grouped in `atoms`, `molecules` and `pages`. The starter components are `atoms/button` with the variants `~icon` and `~secondary`, `molecules/search-field` with an `input` of its own, private to it, and `pages/example`. Their styles sit at the same paths under `src/styles/`, and the search field's script is `src/scripts/search-field.ts`.

`src/patterns/index.md` orders the folders: `order: [atoms, molecules, pages, ...]`, where `...` stands for every folder the list doesn't name. Each folder's own `index.md` gives it a title, a description and how its components are previewed: `centered` for atoms and molecules, `full` for pages.

### The site

`pages/` holds the site's pages, one markdown file each: a home page, an about page, a guide page, a search page, and a folder of articles. The site is built from components like the rest: `layouts/` holds the nine layouts a page can take, `partials/` the frame, the head and the two parts the tag and category layouts share (`term-index` and `term-listing`), `views/` the four ways to list a folder of pages, and `components/` what the pages and layouts place, such as cards, a note, the search and the table of contents. Together, the layouts, partials and views are the site's skin. `.github/workflows/pages.yml` publishes the site to GitHub Pages. A later step of this guide shows what a page is made of.

### The config

`pattern-dump.config.ts` is where Pattern Dump finds everything. These are the keys `pd init` writes, without its comments:

```ts
import { defineConfig } from "pattern-dump";

export default defineConfig({
  sourceDir: "./src",
  patternsDir: "./src/patterns",
  outDir: "./dist",
  styles: { strategy: "parallel", dir: "./src/styles" },
  documentBase: ["base"],
  themes: {
    dir: "./themes",
    default: "light",
    switch: "attribute",
    swatch: { slots: ["--color-surface", "--color-primary", "--color-text"] },
  },
  assets: { strategy: "central", dir: "./assets" },
  scriptsDir: "./src/scripts",
  site: {
    pagesDir: "./pages",
    outDir: "./site",
    workbenchUrl: "/workbench/",
    categories: {
      notes: { label: "Notes", description: "Short articles about this site" },
    },
    globals: { title: "my-design-system", footer: "Made with Pattern Dump." },
  },
  build: { basePath: "/workbench/" },
  shell: {
    brand: { title: "my-design-system" },
  },
});
```

Every folder path in it resolves against the project root, not against the folder you run `pd` from. `outDir` is the only key Pattern Dump requires. `sourceDir`, `patternsDir` and `styles` are written with their default values, so you can see where things go. `documentBase: ["base"]` turns on the base layer, from `src/styles/base/`, linked first in every preview. `site` is the site: its pages are in `./pages`, `pd build` writes it to `./site`, and `globals` holds the values every layout reads as `site`, such as its title. Its pages link into the workbench at `site.workbenchUrl`, and `build.basePath` builds the workbench for that same path, `/workbench/`.

Pattern Dump checks the config each time it loads it, and lists every problem at once, under `<file>: invalid config`, where `<file>` is the config file. A misspelt key is reported as `unknown key "<path>"`, where `<path>` is the key, such as `styles.dir`, with a `did you mean` when a known key is close. A misspelt `outDir` that is still close to it is reported as missing instead, with the same `did you mean`. Every key is in the [configuration reference](/reference/configuration/).

### package.json

```json
{
  "name": "my-design-system",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "pd dev",
    "audit": "pd audit",
    "typecheck": "tsc --noEmit",
    "build:scripts": "tsc",
    "build": "pd build"
  },
  "devDependencies": {
    "pattern-dump": "0.8.1",
    "typescript": "^5.9.0",
    "pagefind": "1.6.0"
  },
  "allowScripts": {
    "esbuild": true,
    "@parcel/watcher": true
  },
  "patternDump": {
    "patterns": "src/patterns",
    "styles": {
      "dir": "src/styles",
      "documentBase": [
        "base"
      ]
    },
    "themes": {
      "dir": "themes",
      "default": "light",
      "switch": "attribute"
    },
    "scripts": "src/scripts",
    "assets": [
      "assets"
    ]
  }
}
```

`pattern-dump` is pinned to the exact version that ran `init`, with no `^`, and so is Pagefind. The `build` script comes with the site. `allowScripts` names `esbuild` and `@parcel/watcher`, whose install scripts Pattern Dump needs.

`patternDump` names the same folders as the config, so the design system is a pattern package from the start. Its `default` theme is the config's, and the two must agree: change the default in one, and change it in the other too. Otherwise `pd` stops with `<config file>: the config and the project's own package manifest disagree`, and a line for each field, such as `  - "themes.default" is "system" in pattern-dump.config.ts, but "patternDump.themes.default" is "light" in package.json: name it in one of them, or give both the same value`. When the folder has a `package.json` already, `pd init` doesn't add the field.

### In a folder that isn't empty

`pd init` never overwrites a file. One that already exists is left as it is and listed as `· <path>: already exists, left untouched`, where `<path>` is the file. An existing `package.json` is merged, every field kept:

- A script name that is taken by another command gets `pd:<name>` beside it, with a note. When that script is `dev`, "Next:" says `npm run pd:dev`.
- A `pattern-dump` already in `dependencies`, or in `devDependencies` at another version, stays as it is, with a note.
- A TypeScript already in `dependencies` or `devDependencies` is kept, with a note when its range isn't `^5.9.0`.
- An `allowScripts` entry set to `false` is kept, with a note.

Two of the notes, as `pd init` prints them, where `<name>` is the script or the package:

A script name that is taken
: `script "<name>" already exists: added "pd:<name>" instead`.

An `allowScripts` entry set to `false`
: `allowScripts denies <name>, left as is: Pattern Dump needs its install script`.

The site's skin is written whole or not at all. When one of its files exists already, `pd init` leaves out every one of them, so two skins aren't mixed, and names the file: `<file>: already exists: the site skin (<n> files in src/patterns/layouts, src/patterns/partials, src/patterns/views and their styles) was left out as a whole, so it isn't mixed with the skin already here`, where `<n>` is the number of files.

Two things in the folder stop `pd init` before it writes anything, with exit code 1. `<file>` is the config file it found, `<path>` the `package.json`:

The folder is a Pattern Dump project already
: `✗ <file> already exists: this folder is already a Pattern Dump project`. It has a `pattern-dump.config.ts` or `pattern-dump.config.json`.

The folder's `package.json` isn't valid JSON
: `✗ <path> is not valid JSON: fix it and run pd init again (…)`, with the parser's message in the brackets.

## When npm install fails

`pd init` writes the files first and installs after. When the install fails, it prints `✗ npm install failed. The project files are in place.` and exits with code 1. Below that line it says why, and its last line is the step to repeat: `  Fix that, then install again:  cd <folder> && npm install`, where `<folder>` is the project folder, without the `cd` when that is the folder you are in. Running `pd init` again would stop at the config it just wrote, so `npm install` is what you run next.

npm wrote errors
: `  npm said:`, then npm's error lines (`npm error …` or `npm ERR! …`), each once and at most eight, without colour codes and without the pointers to npm's log files.

npm wrote no error
: `  npm stopped with exit code <n>; its output is above.`, where `<n>` is npm's exit code.

npm could not be started
: `  npm could not be started: is Node.js (with npm) installed?`

## Your style guide

When `pd init` ends with "Next:", the project is in place, and the two lines under it start the workbench and the site:

```sh
cd my-design-system
npm run dev
```

When you answered no to the install, "Next:" lists `npm install` between the two.

The next step, [running the workbench](/guide/run-the-workbench/), opens it at `http://pd.localhost:4000/`.
