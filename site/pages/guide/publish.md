---
title: Publish
description: Build your style guide and its site with pd build, fix what the build refuses, and publish both as a GitHub Pages static site or on any host.
layout: doc
order: 9
---

Everything so far ran in `pd dev`, on your machine. Publishing takes two steps: `pd build` writes the site and the workbench as static files, and a host serves them. The project `pd init` made has a GitHub Pages workflow for the second step already.

## Build

In the project folder, run:

```sh
npm run build
```

The `build` script runs `pd build`. It checks the project first, and writes only when every check passes. While it works, it prints one line per step:

```txt
[pd build] … server ready (0.3s)
[pd build] … site checked: 33 files (0.8s)
[pd build] … search index: 7 pages (1.3s)
[pd build] … links checked: 204 references on 13 pages (1.4s)
[pd build] … styles checked against the style guide (1.4s)
[pd build] … accessibility checked on 13 pages (2.4s)
```

then the workbench's steps, and a summary that says where each part went:

```txt
[pd build] 27 components → 205 files, 1.6 MB in 4012 ms
[pd build] <project>/dist  (served from /workbench/)
[pd build] site: 12 pages → 52 files in <project>/site  (served from /)
```

`<project>` is your project's folder. The site is in `site/`, to be served from the root of its host. The workbench is in `dist/`, built for `/workbench/`, the path `build.basePath` sets: its pages expect to be served from there, inside the site. A note that `site.url` is not set comes last for now; it goes once you set the site's address, in [Publish to GitHub Pages](#publish-to-github-pages).

`pd build` exits with 0 when it has written everything. When it stops, it prints `[pd] Error:` with why, exits with 1, and leaves the earlier output as it was.

## What the build refuses

Every check runs before anything is written, and each one stops the build with `so nothing was written:` and a line per problem. The ones you meet first:

A page with problems
: `pd build: the site has problems, so nothing was written:`, then each problem with its page. In `pd dev`, the same page says it cannot be built.

A broken link
: `pd build: the site has broken links, so nothing was written:`. A link to another host is only a note: `an external link, not checked: <url> (on <pages>)`.

A custom property nothing defines
: `pd build: the skin reads custom properties nothing defines, so nothing was written:`, for a `var()` without a fallback. Define the property, give the `var()` a fallback, or list a property that JavaScript sets in `site.checks.allowProperties`.

An accessibility error
: `pd build: the site has accessibility problems, so nothing was written:`, with the page, the rule, its impact and the elements it found.

A component schema that isn't valid JSON
: `pd build: a component schema isn't valid JSON, so nothing was written:`, with or without a site.

A class on a page that no component of the style guide owns is a warning, and the build goes on, unless `site.checks.classes` is `"error"`.

A layout that shows dates from git needs the whole history. In a shallow clone, the build stops and says to check out with `fetch-depth: 0`.

Two checks can be skipped, the accessibility of the site's pages (`a11y`) and the components' markup against HTML's content model (`html`), with `--skip-checks` or `build.skipChecks`:

```sh
npx pd build --skip-checks=a11y
```

The build then ends with a `[pd build] NOT CHECKED:` line that names what it left out.

## Publish to GitHub Pages

`.github/workflows/pages.yml` publishes the project on every push to `main`, and when you start it by hand in the repository's Actions. It runs `npm ci` and `npm run build`, copies `site/` into a folder `_site/` and `dist/` into `_site/workbench/`, and deploys `_site/` to GitHub Pages: the site at the root, the workbench under `/workbench/`, where the site's pages link to it.

Before the first run, in the repository on GitHub: **Settings → Pages → Source:** "GitHub Actions". The workflow installs with `npm ci`, so `pattern-dump` has to come from the npm registry, as `pd init` set it up, and not from a local file.

Then tell the site where it lives, as a project page or at a domain of your own.

### As a project page

A project page is published under the repository's name, at `https://<owner>.github.io/<repository>/`, with no domain to set up. In `pattern-dump.config.ts`, set the site's address, and move the workbench under the same path:

```ts
export default defineConfig({
  site: {
    url: "https://<owner>.github.io/<repository>/",
    workbenchUrl: "/<repository>/workbench/",
  },
  build: { basePath: "/<repository>/workbench/" },
});
```

The path in `site.url` is the path the site is published under. Pattern Dump puts it in front of every root-relative link and file on the way out, in `pd build` and in `pd dev` too. `site.workbenchUrl` and `build.basePath` must agree, or the build stops and says which path the workbench must be built for.

### At your own domain

Set the domain in the repository's **Settings → Pages → Custom domain**, point your DNS at GitHub, and turn on **Enforce HTTPS** once GitHub offers it. [GitHub's documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site) has the records. The README that `pd init` wrote lists the same steps. The workflow writes no `CNAME` file: with a deploy from GitHub Actions, the setting is the domain.

Then set `site.url` to the same address, such as `"https://www.example.com/"`. The site stays at the root, and the workbench at `/workbench/`.

With `site.url` set, every page gets its canonical address, link previews and JSON-LD, and the build writes a sitemap, unless `site.index` is `false`.

## On another host

Any host that serves static files can serve the site: publish `site/` at the root, and `dist/` under `workbench/`, as the workflow's `_site/` folder has them. The site has a `404.html` for addresses that have no page, and both folders have an empty `.nojekyll`.

The site gets a `robots.txt` when it is at the root of its host. Under a path, it gets none, since crawlers read `robots.txt` only at a host's root, and the build prints the lines to add to the host's own.

## On a host without Chromium

A site with social images (`site.socialImages`) has `pd build` render each page's card in Chromium. A host such as Cloudflare Pages has no Chromium, so render the cards on your machine and commit them:

1. Install Playwright in the project, once: `npm install --save-dev playwright`, then `npx playwright install chromium`.
2. Run `npx pd social` with `site.url` set, as the host builds it: without `site.url`, no page has a card.
3. Commit the `social/` folder that `pd social` writes beside the pages folder.

The host's build then takes each card from `social/` and needs no Chromium. A card is made for its page and for the Pattern Dump version, so run `pd social` again after changing a page or upgrading, and commit what changed. It removes the cards no page uses any more.

This site sets `site.url` from `PD_SITE_URL`, runs `npx pd social` in `site/` and commits its cards in `site/social/`. Its Cloudflare Pages build reports:

```txt
[pd build] social images: 50 pages (50 committed)
```

A card that is missing or stale doesn't stop the build: the page takes `site.image`, when the site has one, and the summary ends with a `[pd build] NO SOCIAL IMAGE:` line that counts those pages. [Command line](/reference/cli/#pd-social) has what `pd social` prints, and [Build output](/reference/build-output/#social-images) the build's side.

## Another tool's files

Some files of a site come from another tool, such as an API reference it builds. Rather than a workflow step that copies them into the site's output, name their folder in `site.mounts`, with the route to publish it at:

```ts
export default defineConfig({
  site: {
    mounts: [
      {
        from: "<folder>",
        to: "<route>",
      },
    ],
  },
});
```

`pd build` copies the folder into the site as it is, and `pd dev` serves it from disk, so a rebuild of the other tool shows on the next reload. The other tool's build runs first: `pd build` stops when the folder is missing, and when one of its files would take the place of one the site writes. [Navigation and routes](/reference/navigation-and-routes/#mounts) has the routes, and [Build output](/reference/build-output/#mounts) what stops the build.

## Two projects in one repository

A style guide and its site as two projects, as in [the previous step](/guide/a-site-on-a-style-guide/), publish the same way, with the workflow at the repository's root. In place of `npm run build` and the copy, it runs the root's script that builds both and puts them into `_site/`, then deploys `_site/`. This site's workflow does exactly that, with `npm run pages`.

## Published

The site is at its address, and the workbench under it at `/workbench/`. Every push to `main` builds and publishes both again, and a push that breaks a check publishes nothing.
