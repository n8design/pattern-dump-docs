---
title: A site on a style guide
description: Keep a style guide and its website as two Pattern Dump projects in one repository: the style guide as a package, the site as content only.
layout: doc
order: 8
---

So far, the style guide and its site are one project. That suits a style guide with one site. When the style guide is shared, by several sites or several teams, the site works better as a project of its own: pages and a config, nothing else, with every component, style and theme from the style guide.

This step sets that up from scratch, in one repository: a style guide in `styleguide/`, a site in `site/`, and a root `package.json` that installs and builds both. The docs you are reading are built the same way.

![A folder acme-web with a package.json naming two workspaces. Inside, site/, made with init --site ./styleguide, holds pages and a config naming the style guide as its package; a line marked file:../styleguide leads from it to styleguide/, made with init --with-site, which holds the patterns, styles, themes and skin. From site/, an arrow marked site/site leads to the root of a folder _site/; from styleguide/, an arrow marked styleguide/dist leads to _site/workbench/.](#two-inits-one-repository "Two projects, one repository, one published folder: the site at the root, the style guide's workbench under /workbench/.")

## The style guide

Make a folder for the repository, and the style guide in it:

```sh
mkdir acme-web
cd acme-web
npx pattern-dump init styleguide --with-site --no-git
```

`--with-site` gives the style guide a skin, the layouts, partials and views a site is built with; the site in the next step takes them from here. `--no-git` leaves the repository to the parent folder: `acme-web` is the one to put under git.

`styleguide` is a generic folder name, so `pd init` names the package after the parent: `@acme-web/styleguide`. Its `package.json` gets a `patternDump` field naming its folders, so it is a pattern package from the start.

## The site

From the same folder, make the site on the style guide:

```sh
npx pattern-dump init site --site ./styleguide --no-git
```

The path after `--site` is the style guide's folder, from where you run the command. `pd init` adds the style guide to the site's `package.json` as a `file:` dependency, `file:../styleguide`, relative to the site. Instead of a folder, `--site` also takes an npm name, such as `@acme/styleguide` or `@acme/styleguide@1.2.0`, for a style guide from a registry.

The site gets five files: `pattern-dump.config.ts`, `README.md`, `.gitignore`, and two pages, `pages/index.md` and `pages/about.md`. Its config names the style guide as its only package and writes no workbench of its own:

```ts
export default defineConfig({
  outDir: "./dist",
  packages: ["@acme-web/styleguide"],
  site: {
    pagesDir: "./pages",
    outDir: "./site",
    workbenchUrl: "/workbench/",
    globals: { title: "acme-web", footer: "Made with Pattern Dump." },
  },
  build: { workbench: false },
});
```

`outDir` is required, though nothing is written there. `site.workbenchUrl` is where the style guide's workbench is published, and where the site's pages link into it; `--workbench-url` sets another.

After `npm install`, `pd init` asks for every page of the site and says whether they render with the style guide:

```txt
✓ every page renders with @acme-web/styleguide
```

A style guide without a skin fails here: the pages are listed with their problems, and the site is written all the same.

## One repository

The two projects install and build on their own. A root `package.json` with [npm workspaces](https://docs.npmjs.com/cli/using-npm/workspaces) installs both with one `npm install` and runs their scripts from the root:

```json
{
  "name": "acme-web",
  "private": true,
  "workspaces": ["styleguide", "site"],
  "scripts": {
    "dev": "npm run dev -w @acme-web/site",
    "dev:styleguide": "npm run dev -w @acme-web/styleguide -- --port 4300",
    "build": "npm run build -w @acme-web/site && npm run build -w @acme-web/styleguide"
  }
}
```

`npm run dev` runs the site's `pd dev`, at `http://live.localhost:4000/`. `npm run dev:styleguide` runs the style guide's on other ports, so both can run at once. The style guide is linked, so an edit there shows on the site's pages too.

`pd init` wrote a GitHub Pages workflow into `styleguide/.github/`. GitHub reads workflows only from [the repository's `.github/workflows` folder](https://docs.github.com/en/actions/writing-workflows/about-workflows), so it does nothing there: delete it. The site gets no workflow, since its style guide is a folder.

## One published folder

`npm run build` writes two folders:

`site/site/`
: The site, from `pd build` in `site/`. It prints `[pd build] workbench: not built (build.workbench: false); the pages link to it at /workbench/`.

`styleguide/dist/`
: The style guide's workbench, built for `/workbench/`: its config sets `build.basePath` to that path.

Published together, the site goes at the root and the workbench under `workbench/`. A short script of your own puts them into one folder, `_site/`; this one is this site's:

```js
import { cpSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";

const site = "site/site";
const styleguide = "styleguide/dist";
const out = "_site";
for (const dir of [site, styleguide]) {
  if (!existsSync(dir)) throw new Error(`${dir} is missing: build it first`);
}

rmSync(out, { recursive: true, force: true });
cpSync(site, out, { recursive: true });
cpSync(styleguide, join(out, "workbench"), { recursive: true });
```

Save it as `scripts/assemble-pages.mjs`, and run it after the build with `node scripts/assemble-pages.mjs`.

## The style guide's own pages

The style guide still has the pages `--with-site` wrote, in `styleguide/pages/`, and its `pd build` writes them to `styleguide/site/`. The site doesn't read them: a pattern package carries patterns, data, helpers, styles, themes, scripts and assets, never pages. Keep them to try the skin out in the style guide, or remove them with its `site` block.

## Your two projects

The repository holds a style guide that any site can install, a site with content only, and one folder to publish.
