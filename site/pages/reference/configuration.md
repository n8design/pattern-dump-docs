---
title: Configuration
description: Every key of the Pattern Dump configuration, pattern-dump.config.ts, with its type, its default and what it does.
layout: doc
---

```ts
import { defineConfig } from "pattern-dump";

export default defineConfig({
  outDir: "./dist",
});
```

Pattern Dump reads `pattern-dump.config.ts` at the project root. Without it, Pattern Dump reads `pattern-dump.config.json`. When both exist, the `.ts` file wins. `--config <path>` loads exactly that file, which may be outside the root.

A missing `--config` file stops `pd` with `--config file not found: <path>`. With no config file and no `--config`, `pd` stops with `No pattern-dump.config.ts or pattern-dump.config.json found in <root> (and no --config given)`.

A `.ts` config is bundled with esbuild. Its imports are inlined. Its default export is the config.

Every folder path in the config resolves against the project root (`--root`). A path never resolves against the config file's folder or the current folder, also when `--config` points outside the root.

`defineConfig()` only types the object and returns it unchanged. `defineConfig()` fills in no defaults. Validation fills them in. Validation runs after the project's own `patternDump` folders are merged in. A top-level `$schema` key, a string, is accepted.

## Problems in the config

The config is validated when it is loaded. All problems are listed at once. The first line is `<file>: invalid config`. Then one line per problem: two spaces, then `- <problem>`. The command line prints a config problem without a stack trace.

A missing required key
: `missing required "<path>"`.
: When an unknown key is a likely typo of it: `missing required "<path>" (found "<typo>": did you mean "<path>"?)`.

An unknown key, at any depth
: `unknown key "<path>"`.
: When a known key is within 2 edits, or 3 when the first three letters match (case-insensitive), it ends with `: did you mean "<path>"?`.

A wrong type
: `"<path>" must be a string`, `"<path>" must be true or false`, `"<path>" must be a list of strings`, `"<path>" must be a string or a list of strings` or `"<path>" must be an object`.

A config that is not an object
: ``the config must be an object (a .ts config must `export default defineConfig({ … })`)``.

## Required

`outDir`
: A string. The only required top-level key.
: The folder `pd build` writes the workbench to when neither `--out` nor `build.outDir` is given. Stays required with `build.workbench: false`. `pd init --site` writes `outDir: "./dist"`, with a comment that nothing is written there.

## Source folders

```ts
export default defineConfig({
  sourceDir: "./src",
  patternsDir: "./src/patterns",
});
```

None of these folders has to exist. The snippets on this page show the defaults.

`sourceDir`
: A string. Default `./src`.
: Its trailing slashes are dropped in the defaults of `patternsDir` and `styles.dir`.

`patternsDir`
: A string. Default `<sourceDir>/patterns`.

### Style settings

```ts
export default defineConfig({
  styles: {
    dir: "./src/styles",
    strategy: "parallel",
  },
});
```

An object. Default `{ strategy: "parallel", dir: "<sourceDir>/styles" }`.

`styles.dir`
: A string, required whenever a `styles` object is given.
: The folder whose `.scss` files are compiled.

`styles.strategy`
: `"parallel"`. `"parallel"` is the only value accepted.
: `"co-located"` is refused: `"styles.strategy": "co-located" is not supported yet: use "parallel", or leave it out`.

`styles.entry`
: A string or a list, relative to `styles.dir`. No default.
: Only these files are compiled. Without it, every `.scss` under `styles.dir` not starting with `_` is compiled.

## Base layer

`documentBase`
: A list of paths relative to `styles.dir`. `"."` is the whole tree.
: Turns on the base layer. The base layer is `/_pd/base.css`. It is linked first in every preview. The base layer is linked when the project's list is not empty, or when a package used with its styles declares a non-empty `styles.documentBase`.
: An entry that matches no file warns at startup: `[dev-server] documentBase "<entry>" matches no stylesheet in <dir>`. For a package's entry the warning ends with ` (<package>)`.
: Base-layer rules that no component owns and the list doesn't name are summed up in one line at startup. `BASE-LAYER.generated.md` in the scratch folder lists each file that has such rules, with the number of them, most first. It is rewritten at every start.

## Themes

`themes`
: An object. `themes.default` is required in a `themes` object. `themes.dir`, `themes.switch` and `themes.swatch` are optional.

`themes.dir`
: A string.
: Theme folders are the project's `themes.dir` first, then each package's `themes.dir`, in package order. A theme name found first hides a later one of the same name.

`themes.default`
: A string.
: The theme previews start with. With no `themes` object, the default is the `default` of the first package, in package order, that has `themes`.
: A default that matches no theme warns: `[dev-server] themes.default "<name>" matches no theme; available: <a, b>`. With no theme folder at all: `[dev-server] themes.default "<name>" matches no theme; no theme folder is configured or provided by a package`.

`themes.switch`
: `"attribute"` or `"stylesheet"`.
: The switch is `"stylesheet"` when this key or any package with themes says so, else `"attribute"`.
: `"attribute"` links every theme stylesheet. With `"attribute"`, the theme picker sets `data-theme` on the preview's `<body>`. `"stylesheet"` links only the active theme, as `<link data-pd-theme="<name>">`. With `"stylesheet"`, the theme picker changes that link's `href`.
: Any other value: `"themes.switch" must be "attribute" or "stylesheet"`.

`themes.swatch.slots`
: A list of strings. Default `["--bodyBackground", "--themePrimary", "--accent"]`. `slots` is required in a `themes.swatch` object.
: Applies to the project's own themes.
: A package's themes always use the default slots, whatever the config says.

## Assets

`assets.strategy`
: `"central"`. `"central"` is the only value accepted.
: `"component-relative"` is refused as not supported yet.

`assets.dir`
: A string or a list.
: `/assets/<folder name>/<rest>` is served from the root with that folder name, also with one root. Any other `/assets/<path>` is looked up in the first root. Asset roots are the project's, in the order of `assets.dir`, then each package's `assets`, in package order. `../…/<root name>/` at any depth, and `/<root name>/` at the start of a URL, are rewritten to `/assets/<root name>/`. The rewrite applies in markup, in component and base-layer CSS, and in theme CSS. A root named `assets` is not rewritten for root-absolute references. Of two roots with the same folder name, the first wins.
: `pd dev` then warns: `[dev-server] assets: <root> is hidden by <by>, which has the same folder name; its files are not served`.
: `pd build` leaves the hidden root out.

`assets.css`
: A list.
: An entry containing `://` is linked as written. Any other entry is linked as `/assets/<entry>`. Linked after the base layer, before themes and component CSS.

## Images

- A raster image in an image slot is written as WebP variants.
- A raster image in a page's markdown is written as WebP variants only when its path starts with `/assets/`.
- An image outside `/assets/` is left as the markdown writes it.
- When the layout declares no slot for prose images (`x-pd-prose-images`), such an image is a problem, not a variant.
- `images.quality` and `images.effort` set how the variants are encoded.

`images.quality`
: A whole number from 1 to 100. Default `75`.
: Any other value: `"images.quality" must be a whole number from 1 to 100 (WebP quality)`.

`images.effort`
: A whole number from 0 to 6. Default `4`.
: Any other value: `"images.effort" must be a whole number from 0 to 6 (WebP effort: 0 fastest, 6 smallest)`.

## Scripts

`scriptsDir`
: A string.
: Behaviour script folders are searched in the project first, then in each package's `scripts`. A script id resolves only as `<scriptsDir>/<id>.ts`. Scripts in sub-folders can't be named: the path is cut to its base name.

`globalScripts`
: A list of strings.
: Packages' `globalScripts` come first, then the project's, each once. They are put before each component's own `requireScript`. An entry with a full URL (`://`) is loaded as it is. Scripts load as `<script type="module">` after the markup.

## Data and helpers

`dataDir`
: A string.
: Every `*.json` in it is read, dotfiles left out. The files are read in name order. They are deep-merged. Packages' data folders come first, the project's last: a later value wins.
: A missing folder warns: `[dev-server] dataDir not found: <path>`.
: The JSON reloads while `pd dev` runs.

`helpers`
: A string.
: The project's own Handlebars helpers. A helper module exports functions by name, or registrars that are given the Handlebars environment (the Pattern Lab form). Project helpers are registered after the built-in ones. Packages' helpers load first, the project's last. A project helper replaces a package's helper of the same name.

## Workbench

`overviews`
: True or false. Default `true`.
: `false` turns off the gallery pages of every folder.

`shell.brand`
: An object.
: Accepts only `title`, `logo`, `logoAlt` and `href`.

`shell.brand.title`
: A string. Default `"Pattern Dump"`.
: The title of the browser tab and of previews. The Nav Rail's wordmark when `shell.brand.logo` is not set.

`shell.brand.logo`
: A path, or `{ light, dark }`.
: The Nav Rail shows the logo instead of the title. A path is used as the `<img src>` exactly as written. `{ light, dark }` renders a `<picture>` with a `(prefers-color-scheme: dark)` source.
: Any other value: `"shell.brand.logo" must be a path or { light, dark }`.

`shell.brand.logoAlt`
: A string. Default: an empty `alt`.

`shell.brand.href`
: A string.
: Wraps the brand in `<a class="rail-brand-link">`.

## Pattern packages

`packages`
: A list of package names or `{ name, exclude?, styles? }` objects.
: Any other value: `"packages" must be a list of package names or { name, exclude, styles } objects`.
: A package is used once, also when it is named and is a peer of another. A package's `exclude` and `styles` apply however it is reached. `exclude` adds globs, relative to the package's patterns folder, to the package's own `exclude`. `styles: false` drops the package's styles, and with them its `documentBase`. With `styles: false` its templates, data, themes, scripts and assets stay.

`exclude`
: A list of strings.
: Globs, relative to `patternsDir`, of the project's own templates to leave out. `**` spans folders, `*` stays in one, `?` is one character. A folder glob also matches with a trailing `/`.

## Build

- `pd build` takes `--root`, `--config`, `--out`, `--base`, `--audit`, `--no-audit`, `--browser`, `--check-workers` and `--skip-checks`.

`build`
: An object.
: Accepts only `outDir`, `basePath`, `audit`, `skipChecks` and `workbench`.

`build.outDir`
: A string. Default `outDir`.
: `pd build --out` overrides it. Resolved against the root. The folder is deleted and written again at every build. It may not contain the project: `pd build: --out <dir> would contain the project itself: choose a folder inside or beside it, like ./dist`. It may not overlap the patterns, styles, theme or asset folders: `pd build: --out <dir> overlaps <src>, which Pattern Dump reads: choose another folder`.

`build.basePath`
: A string. Default `/`.
: Normalised to one leading and one trailing slash: `docs` is `/docs/`. `--base` overrides it.

`build.audit`
: True or false. Default `true`.
: `--no-audit` leaves the audit out. `--audit` puts it back in over `build.audit: false`. `--audit` and `--no-audit` together: `--audit and --no-audit cannot both be given`.

`build.skipChecks`
: A list of `"a11y"` and `"html"`.
: Any other value: `"build.skipChecks" must be a list of the checks pd build may skip: "a11y", "html"`.
: `--skip-checks` replaces it.

`build.workbench`
: True or false. Default `true`.
: `false` makes `pd build` write the site only.
: `false` without a site stops: `pd build: build.workbench is false and the project has no storefront, so there is nothing to build`.
: With `false`, the workbench folder is neither emptied nor written, and a file already there stays. With `false`, the workbench folder's overlap checks and the same-host base path check are skipped. With `false`, `pd build` prints `[pd build] workbench: not built (build.workbench: false); the pages link to it at <workbenchUrl>`. It has no command-line flag.

## Site

`storefront`
: An object.
: `storefront.pagesDir` and `storefront.outDir` are required, both strings. Accepts only `pagesDir`, `outDir`, `host`, `workbenchUrl`, `site`, `url`, `lang`, `index`, `image`, `images`, `head`, `categories`, `tags`, `tagPages`, `categoryPages`, `search`, `llms` and `checks`. Any other key, such as `layouts`, is an unknown key. Without a `storefront` object, every host `pd dev` answers serves the workbench.

`storefront.pagesDir`
: A string.
: Every `.md` file in it is a page. A page's route is its path without `.md`, `index` dropped, slash-wrapped: `guides/setup.md` is `/guides/setup/`.

`storefront.outDir`
: A string.
: `pd build` writes the site there. It may not contain the project: `pd build: storefront.outDir <dir> would contain the project itself: choose a folder inside or beside it`. It may not overlap the patterns, styles, pages, theme or asset folders: `pd build: storefront.outDir <dir> overlaps <src>, which Pattern Dump reads: choose another folder`. It may not overlap the workbench folder: `pd build: storefront.outDir <a> and --out <b> overlap: the storefront and the workbench each need a folder of their own`.

- `storefront.pagesDir`, `patternsDir` and `storefront.outDir` are three separate folders, none inside another.
  - The same folder twice: `"<a>" ("<x>") and "<b>" ("<y>") are the same folder: each needs a folder of its own`.
  - One inside another: `"<a>" ("<x>") is inside "<b>" ("<y>"): each needs a folder of its own, outside the other`.
  - Only the values the config writes are compared.
  - A key left out is not checked: with no `patternsDir`, its default `<sourceDir>/patterns` is not compared.
  - Checked only when validation found no other problem.

### Addresses

`storefront.host`
: A host name. Default `live.localhost`.
: The host `pd dev` serves the site on. A bare host name, with no scheme, port or path, stored lower-cased.
: Any other value: `"storefront.host" must be a host name with no scheme, port or path, such as "live.localhost"`.
: `pd dev` serves the workbench on `pd.localhost`.
: `pd dev` listens on `--port`, else `PD_PORT`, else port 4000. Live reload listens on `--ws-port`, else `PD_WS_PORT`, else the HTTP port plus one.

`storefront.workbenchUrl`
: An absolute http(s) URL, or a root-relative path.
: A URL has no query or fragment. A path is plain segments: no `.` or `..` segment, and not `//host`. Stored with exactly one trailing slash.
: `pd build` of a project with a site requires it: `pd build: storefront.workbenchUrl is required to build the storefront: its pages link into the workbench at that address`.
: A workbench on the site's host (a path, or an absolute URL on the origin of `storefront.url`) must be built for that path. Otherwise: `pd build: storefront.workbenchUrl is <url>, so the workbench must be built for <path> (build.basePath or --base); it is being built for <base>`.

`storefront.url`
: An absolute http(s) URL.
: No query, no fragment, no empty path segment. Stored as origin and path, with one trailing slash. Its path is the site's base path. With it, pages get a canonical URL and Open Graph tags. The 404 page gets neither. JSON-LD is written only with it. `sitemap.xml` is written only with it. Without it, the only search engine tag is `noindex` on a page that isn't indexed.

`storefront.lang`
: A language tag. Default `en`.
: The `lang` of every page's `<html>`.
: Any other value: `"storefront.lang" must be a language tag, such as "en", "de-AT" or "zh-Hant-TW"`.

### Search engines and link previews

`storefront.index`
: True or false. Default `true`.
: `false` gives every page `noindex`. `false` leaves out `sitemap.xml` and `llms.txt`.

`storefront.image`
: A path in the assets.
: The link-preview image of every page that names none. Must match `/assets/<file>`, with no query or fragment, not ending in `/`.
: Any other value: `"storefront.image" must be a path to a file in the assets, such as "/assets/images/share.png"`.
: The file must exist and be PNG, JPEG, GIF or WebP, read from its bytes.

`storefront.images`
: An object with `quality` and `effort`.
: Both are checked as in `images`. Merged over the project's `images`.

`storefront.llms`
: True or false.
: On unless `storefront.index` or `storefront.llms` is `false`. With `storefront.index: false`, `llms: true` doesn't turn it on. `pd build` writes `llms.txt` at the root of the site's output.

### Head

`storefront.head`
: A path to a Handlebars file.
: Relative to the project root, ending in `.hbs`, not absolute.
: Any other value: `"storefront.head" must be a Handlebars file relative to the project's root, such as "./head.hbs"`.
: Whether the file exists is checked when a page is built. Rendered into every page's head after the skin's `partials/head`, before the stylesheets.

`storefront.site`
: An object.
: Any keys. Checked against the `site` property of the schema of `partials/base`, at every depth, with no coercion. A key that schema declares and the config doesn't set is passed as `null`.

### Categories and tags

`storefront.categories`
: An object of categories by key.
: The categories a page's `categories:` may name.

`storefront.tags`
: An object of tags by key.
: The tags a page's `tags:` may name. Without it, a page may name any tag of lowercase letters, digits and hyphens. An undeclared tag's label is its key.

- A category or a tag, in either object:
  - Its key is lowercase letters, digits and hyphens.
  - Its value is `{ label, description?, aliases? }`, `label` required.
  - An alias is an old key.
  - An alias may not be a key of its own.
  - An alias may not be claimed by two terms.
  - A wrong key: `"storefront.categories.<key>": a category's key is part of a URL, so it is lowercase letters, digits and hyphens only`.
  - An alias that is a key: `"storefront.categories.<key>.aliases": "<alias>" is a category of its own, so it can't be an old key of "<key>"`.
  - An alias claimed twice: `"storefront.categories.<key>.aliases": "<alias>" is an old key of "<other>" already: one old key leads to one category`.
  - For tags the messages say `storefront.tags` and `tag`.

`storefront.tagPages`
: `true`, `false` or `{ path?, title? }`.
: Tag pages are at `/tags/<key>/`. The index of the tags is at `/tags/`, only when the skin also has the layout `tags` and at least one tag has a page.

`storefront.categoryPages`
: `true`, `false` or `{ path?, title? }`.
: Category pages are at `/categories/<key>/`. The index of the categories is at `/categories/`, only when the skin also has the layout `categories` and at least one category has a page.

`storefront.tagPages` and `storefront.categoryPages`
: Left out: on when the skin has the term's layout (`tag`, `category`).
: The index needs its own layout too (`tags`, `categories`).
: Left out, without that layout: off, with no message.
: `false`: off. `true` or an object: on, and a missing layout is a problem. `path` changes the first segment of the routes. `path` is lowercase letters, digits and hyphens. `title` is the index's title, default `"Tags"` or `"Categories"`. Both on the same path: `"storefront.tagPages.path" and "storefront.categoryPages.path" are both "<p>": tag pages and category pages need a path each`. That path check runs only when validation found no other problem.

### Search

`storefront.search`
: True or false.
: Left out: on when the project has Pagefind, off otherwise. `pd build` writes the index to `_pd/search/` in the site's output.
: `true` without Pagefind stops `pd build` before anything is built.
: `false` never loads Pagefind.

### Checks

`storefront.checks.classes`
: `"warning"`, `"error"` or `"off"`. Default `"warning"`.
: `"warning"` lists a class outside the style guide in the report. `"error"` stops the build.
: `"off"` skips the class check.

`storefront.checks.allowClasses`
: A list of strings. Default `[]`.
: Classes a page may carry anyway, a trailing `*` matching a prefix.

`storefront.checks.allowProperties`
: A list of strings. Default `[]`.
: Custom properties a fallback-less `var()` may read without a definition in CSS.

## Changes while `pd dev` runs

- `pd dev` watches the config file, not the modules it imports.
- A change to `storefront.site` alone is taken live: every page reloads.
  - Log: `[dev-server] Config changed: <file>, storefront.site → page-changed (every page)`.
- Any other change isn't taken.
  - Terminal: `[dev-server] <file> changed: restart pd dev to load it (only storefront.site is taken without a restart)`.
  - The workbench shows the same message, without `[dev-server] `, as an error notice.
- A save that changes nothing `pd dev` reads (comments, whitespace, key order): `[dev-server] Config saved: <file>, nothing pd dev reads changed`.
- A config that no longer loads leaves `pd dev` running with the config it has.
  - Terminal: `[dev-server] <file> cannot be loaded, so pd dev keeps running with the config it has: <error>`.
  - The workbench shows the same message, without `[dev-server] `, as an error notice.
