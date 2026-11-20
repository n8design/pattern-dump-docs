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

Pattern Dump reads `pattern-dump.config.ts` at the project root, or `pattern-dump.config.json` when there is no `.ts` file. With both, the `.ts` file wins. `--config <path>` loads exactly the file it names, which may be outside the root.

If that file is missing, `pd` stops with `--config file not found: <path>`. With no config file and no `--config`, it stops with `No pattern-dump.config.ts or pattern-dump.config.json found in <root> (and no --config given)`.

A `.ts` config is bundled with esbuild, with its imports inlined, and its default export is the config.

Every folder path in the config resolves against the project root (`--root`), never against the config file's folder or the current folder, even when `--config` points outside the root.

`defineConfig()` only gives the object its type and returns it unchanged, without defaults. Pattern Dump fills in the defaults when it validates the config, after merging in the folders from the `patternDump` field of the project's `package.json`. A top-level `$schema` key is accepted, as a string.

## Problems in the config

Pattern Dump validates the config when it loads it, and lists all problems at once: first `<file>: invalid config`, then one line per problem, two spaces and `- <problem>`. `<file>` is the config file, and in the problem lines `<path>` is the key's full path, such as `styles.dir`. The command line prints a config problem without a stack trace.

A missing required key
: `missing required "<path>"`.
: When an unknown key is a likely typo of it: `missing required "<path>" (found "<typo>": did you mean "<path>"?)`.

An unknown key, at any depth
: `unknown key "<path>"`.
: Free-form objects such as `site.globals` are not checked for unknown keys.
: When a known key is within 2 edits, or 3 when the first three letters match, it ends with `: did you mean "<path>"?`. Both are counted without regard to case.

A wrong type
: `"<path>" must be a string`, `"<path>" must be true or false`, `"<path>" must be a list of strings`, `"<path>" must be a string or a list of strings` or `"<path>" must be an object`.

A config that is not an object
: ``the config must be an object (a .ts config must `export default defineConfig({ … })`)``.

## Required

`outDir`
: A string. The only required top-level key.
: The folder `pd build` writes the workbench to when neither `--out` nor `build.outDir` is given. It stays required with `build.workbench: false`, and `pd init --site` writes `outDir: "./dist"`, with a comment that nothing is written there.

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
: `"parallel"`, the only value accepted.
: `"co-located"` is refused: `"styles.strategy": "co-located" is not supported yet: use "parallel", or leave it out`.

`styles.entry`
: A string or a list, relative to `styles.dir`. No default.
: Only these files are compiled. Without it, every `.scss` under `styles.dir` not starting with `_` is compiled.

## Base layer

`documentBase`
: A list of paths relative to `styles.dir`. `"."` is the whole tree.
: Turns on the base layer, `/_pd/base.css`, which is linked first in every preview. It is linked when the project's list is not empty, or when a package used with its styles declares a non-empty `styles.documentBase`.
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
: At startup a package's themes use the default slots, whatever the config says. When a theme file of a linked package changes while `pd dev` runs, its swatches are read again with the project's slots.

## Assets

`assets.strategy`
: `"central"`, the only value accepted.
: `"component-relative"` is refused as not supported yet.

`assets.dir`
: A string or a list.
: `/assets/<folder name>/<rest>` is served from the root with that folder name, also with one root. Any other `/assets/<path>` is looked up in the first root. Asset roots are the project's, in the order of `assets.dir`, then each package's `assets`, in package order. `../…/<root name>/` at any depth, and `/<root name>/` at the start of a URL, are rewritten to `/assets/<root name>/`. The rewrite applies in markup, in component and base-layer CSS, and in theme CSS. A root named `assets` is not rewritten for root-absolute references. Of two roots with the same folder name, the first wins.
: `pd dev` then warns: `[dev-server] assets: <root> is hidden by <by>, which has the same folder name; its files are not served`.
: `pd build` leaves the hidden root out.

`assets.css`
: A list.
: An entry containing `://` is linked as written. Any other entry is linked as `/assets/<entry>`. Linked after the base layer, before themes and component CSS.

`assets`
: An object.
: Accepts only `strategy`, `dir`, `css` and `symbols`.

`assets.symbols.currentColor`
: A colour token's name. Default `--color-text`.
: The colour token that `currentColor` becomes in a symbol image's standalone file. `assets.symbols` accepts only `currentColor`.
: The name is `--color-` followed by letters, digits, `_` or `-`. Any other value: `"assets.symbols.currentColor" must be a colour token's name, such as "--color-text"`.
: Whether the base layer declares the token is checked only when a standalone file of a symbol that uses `currentColor` is made: by `pd build`, or by `pd dev` when its `/_pd/symbols/<stem>.svg` route is asked for one, which then answers 500 naming the token. `<stem>` is the symbol's file name without `.svg`.

## Images

A raster image in an image slot is written as WebP variants. A raster image in a page's markdown is written as WebP variants only when its path starts with `/assets/`. `/assets/` covers every asset folder: the project's, in the order of `assets.dir`, then each package's (see `assets.dir`). An image outside `/assets/` is left as the markdown writes it. When the layout declares no slot for prose images (`x-pd-prose-images`), such an image is a problem, not a variant. `images.quality` and `images.effort` set how the variants are encoded.

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
: Every `*.json` in it is read in name order, dotfiles left out, and the files are deep-merged. Packages' data folders come first and the project's last, so a later value wins.
: A missing folder warns: `[dev-server] dataDir not found: <path>`.
: The JSON reloads while `pd dev` runs.

`helpers`
: A string.
: The project's own Handlebars helpers. A helper module exports functions by name, or registrars that are given the Handlebars environment (the Pattern Lab form). Project helpers are registered after the built-in ones and after the packages' helpers, so a project helper replaces a package's helper of the same name.

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

`pd build` takes `--root`, `--config`, `--out`, `--base`, `--audit`, `--no-audit`, `--browser`, `--check-workers` and `--skip-checks`.

`build`
: An object.
: Accepts only `outDir`, `basePath`, `audit`, `skipChecks` and `workbench`.

`build.outDir`
: A string. Default `outDir`.
: `pd build --out` overrides it. Resolved against the root.
: The folder is replaced as a whole, and only at the end of a build that passed every check. The build writes into a hidden folder beside it, `.<folder name>.pd-build-<process id>`, and renames that into the folder's place. The earlier folder is moved aside first and put back if the rename fails. A build that stops before that step leaves the folder as it was.
: The workbench takes its place before the site. When the site then can't take its own, the build stops with the workbench folder already replaced: `pd build: the workbench in <dir> is this build's, but the site could not take its place in <dir>: the two are out of step. The site in it is the earlier one; run pd build again.`, with the underlying error on a line of its own. The first `<dir>` is the workbench's folder, the second the site's.
: It may not contain the project: `pd build: --out <dir> would contain the project itself: choose a folder inside or beside it, like ./dist`. It may not overlap the patterns, styles, theme or asset folders: `pd build: --out <dir> overlaps <src>, which Pattern Dump reads: choose another folder`.

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
: `false` without a site stops: `pd build: build.workbench is false and the project has no site, so there is nothing to build`.
: With `false`, the workbench folder is neither replaced nor written, and a file already there stays. With `false`, the workbench folder's overlap checks and the same-host base path check are skipped. With `false`, `pd build` prints `[pd build] workbench: not built (build.workbench: false); the pages link to it at <workbenchUrl>`. It has no command-line flag.

## Site

`site`
: An object.
: `site.pagesDir` and `site.outDir` are required, both strings. Accepts only `pagesDir`, `outDir`, `host`, `workbenchUrl`, `globals`, `url`, `lang`, `index`, `image`, `images`, `head`, `categories`, `tags`, `tagPages`, `categoryPages`, `search`, `llms` and `checks`. Any other key, such as `layouts`, is an unknown key.

`site.pagesDir`
: A string.
: Every `.md` file in it is a page, except a name starting with `.`, which is skipped, and `404.md`, which is the 404 page. A file or folder name is lowercase letters, digits and hyphens: any other is a problem, and such a folder isn't read. A page's route is its path without `.md`, `index` dropped, slash-wrapped: `guides/setup.md` is `/guides/setup/`.

`site.outDir`
: A string.
: `pd build` writes the site there. It may not contain the project: `pd build: site.outDir <dir> would contain the project itself: choose a folder inside or beside it`. It may not overlap the patterns, styles, pages, theme or asset folders: `pd build: site.outDir <dir> overlaps <src>, which Pattern Dump reads: choose another folder`. It may not overlap the workbench folder: `pd build: site.outDir <a> and --out <b> overlap: the site and the workbench each need a folder of their own`.

`site.pagesDir`, `patternsDir` and `site.outDir` are three separate folders, none inside another. The check compares the config before the defaults are filled in: the values the config file writes, with the project's own `package.json` `patternDump` manifest merged in. A key left out of both is not checked: with no `patternsDir`, its default `<sourceDir>/patterns` is not compared, but a `patternsDir` the manifest names is. A pair is skipped when either value is not a string. The check runs only when validation found no other problem. In the messages, `<a>` and `<b>` are the keys, `<x>` and `<y>` their values as written.

The same folder twice
: `"<a>" ("<x>") and "<b>" ("<y>") are the same folder: each needs a folder of its own`.

One folder inside another
: `"<a>" ("<x>") is inside "<b>" ("<y>"): each needs a folder of its own, outside the other`.

### Addresses

`site.host`
: A host name. Default `live.localhost`.
: The host `pd dev` serves the site on. A bare host name, with no scheme, port or path, stored lower-cased.
: Any other value: `"site.host" must be a host name with no scheme, port or path, such as "live.localhost"`.
: `pd dev` serves the workbench on `pd.localhost`, `localhost` and `127.0.0.1`. Without a `site` object, all three serve the workbench and no host serves a site. A request for any other host name is refused with 403: `Forbidden: this server answers only to its own host names`.
: `pd dev` listens on `--port`, else `PD_PORT`, else port 4000. Live reload listens on `--ws-port`, else `PD_WS_PORT`, else the HTTP port plus one.

`site.workbenchUrl`
: An absolute http(s) URL, or a root-relative path.
: A URL has no query or fragment. A path has at least one segment, each of letters, digits, `.`, `_`, `~` or `-`: no `.` or `..` segment, not `//host`, and not `/` alone. Stored with exactly one trailing slash.
: Any other value: `"site.workbenchUrl" must be an absolute http(s) URL for a workbench on its own host, such as "https://workbench.example.com/", or a path for one on the site's host, such as "/workbench/"`.
: `pd build` of a project with a site requires it: `pd build: site.workbenchUrl is required to build the site: its pages link into the workbench at that address`.
: When the build writes the workbench, a workbench on the site's host (a path, or an absolute URL on the origin of `site.url`) must be built for that path. Otherwise: `pd build: site.workbenchUrl is <url>, so the workbench must be built for <path> (build.basePath or --base); it is being built for <base>`.

`site.url`
: An absolute http(s) URL.
: No query, no fragment and no empty path segment, except doubled slashes at the very end, which are collapsed. It is stored as origin and path with one trailing slash, and its path is the site's base path. With it, pages get a canonical URL and Open Graph tags (the 404 page gets neither), and only with it does Pattern Dump write JSON-LD and `sitemap.xml`. Without it, the only search engine tag is `noindex` on a page that isn't indexed.
: Any other value: `"site.url" must be the site's absolute http(s) address, with no query or fragment, such as "https://example.com/", or "https://example.github.io/project/" for a site published under a path`.

`site.lang`
: A language tag. Default `en`.
: The `lang` of every page's `<html>`.
: Any other value: `"site.lang" must be a language tag, such as "en", "de-AT" or "zh-Hant-TW"`.

### Search engines and link previews

`site.index`
: True or false. Default `true`.
: `false` gives every page `noindex`. `false` leaves out `sitemap.xml` and `llms.txt`.

`site.image`
: A path in the assets.
: The link-preview image of every page that names none. Must match `/assets/<file>`, with at least two characters after `/assets/`, no query or fragment, and not ending in `/`.
: Any other value: `"site.image" must be a path to a file in the assets, such as "/assets/images/share.png"`.
: The file must exist and be PNG, JPEG, GIF or WebP, read from its bytes.

`site.images`
: An object with `quality` and `effort`.
: Both are checked as in `images`. Merged over the project's `images`.

`site.llms`
: True or false.
: On unless `site.index` or `site.llms` is `false`. With `site.index: false`, `llms: true` doesn't turn it on. `pd build` writes `llms.txt` at the root of the site's output.

### Head

`site.head`
: A path to a Handlebars file.
: Relative to the project root, ending in `.hbs`, not absolute.
: Any other value: `"site.head" must be a Handlebars file relative to the project's root, such as "./head.hbs"`.
: Whether the file exists is checked when a page is built. Rendered into every page's head after the skin's `partials/head`, before the stylesheets.

`site.globals`
: A plain object, with any keys.
: The values every page shares. Layouts read them as `{{site.…}}`.
: Checked against the `site` property of the schema of `partials/base`, at every depth, with no coercion. `navigations`, `collections` and `categories` have checks of their own. A top-level key that schema declares and the config doesn't set is passed as `null`.

### Categories and tags

`site.categories`
: An object of categories by key.
: The categories a page's `categories:` may name.

`site.tags`
: An object of tags by key.
: The tags a page's `tags:` may name. Without it, a page may name any tag of lowercase letters, digits and hyphens. An undeclared tag's label is its key.

A category or a tag, in either object, has a key of lowercase letters, digits and hyphens. Its value is `{ label, description?, aliases? }`, with `label` required. An alias is an old key: it may not be a key of its own, and two terms may not claim the same alias. The messages below are for categories. For tags they say `site.tags` and `tag`. `<alias>` is the old key, `<other>` the term that claimed it first.

A key with other characters
: `"site.categories.<key>": a category's key is part of a URL, so it is lowercase letters, digits and hyphens only`.

An alias that is a key of its own
: `"site.categories.<key>.aliases": "<alias>" is a category of its own, so it can't be an old key of "<key>"`.

An alias claimed twice
: `"site.categories.<key>.aliases": "<alias>" is an old key of "<other>" already: one old key leads to one category`.

`site.tagPages`
: `true`, `false` or `{ path?, title? }`.
: A tag that a published page names gets a page at `/tags/<key>/`. The index of the tags is at `/tags/`, only when at least one tag has a page.

`site.categoryPages`
: `true`, `false` or `{ path?, title? }`.
: A category that a published page names gets a page at `/categories/<key>/`. The index of the categories is at `/categories/`, only when at least one category has a page.

`site.tagPages` and `site.categoryPages`
: Left out, the pages are on when the skin has the term's layout (`tag`, `category`), and the index only when the skin also has its own layout (`tags`, `categories`). Without the layout they are off, with no message.
: `false` turns them off. `true` or an object turns them on, and then a missing layout is a problem. In the object, `path` changes the first segment of the routes and is lowercase letters, digits and hyphens. `title` is the index's title, default `"Tags"` or `"Categories"`.
: Both on the same path: `"site.tagPages.path" and "site.categoryPages.path" are both "<p>": tag pages and category pages need a path each`, where `<p>` is the path. That check runs only when validation found no other problem.

### Search

`site.search`
: True or false.
: Left out: on when the project has Pagefind, off otherwise. `pd build` writes the index to `_pd/search/` in the site's output.
: `true` without Pagefind stops `pd build` before anything is built: `pd build: site.search is on, and this project has no Pagefind to build the index with: npm install --save-dev pagefind (or set site.search to false)`.
: `false` never loads Pagefind.

### Checks

`site.checks.classes`
: `"warning"`, `"error"` or `"off"`. Default `"warning"`.
: `"warning"` lists a class outside the style guide in the report. `"error"` stops the build.
: `"off"` skips the class check.

`site.checks.allowClasses`
: A list of strings. Default `[]`.
: Classes a page may carry anyway, a trailing `*` matching a prefix.

`site.checks.allowProperties`
: A list of strings. Default `[]`.
: Custom properties a fallback-less `var()` may read without a definition in CSS.

## Names before 0.8.0

Until 0.8.0 the site's key was `storefront`, and `site.globals` was `storefront.site`. A config with the old names still loads, read as the new ones. Before validation, Pattern Dump prints one warning per old key: `[pd] warning: <file>: storefront.<key> is now site.<key>`. The old names load until 1.0, which removes them.

The old shared values
: `[pd] warning: <file>: storefront.site is now site.globals`.

An old `storefront` with no keys, or not an object
: `[pd] warning: <file>: storefront is now site`.

Both names set
: `both "site" and "storefront" are set: storefront is the old name of site, keep site only`.
: It is the only problem reported, and no warning is printed.

`globals` under the old name
: `"storefront.globals" is not a key of the old storefront: write the website under site, and its globals there`.

The config's types are named `Site…`: `SiteConfig` (the `site` key, with `globals`), `SiteChecks`, `SiteTermPages`, `SiteTag`, `SiteCategory` and `SiteNavEntry`, exported from `pattern-dump`. Each `Storefront…` name is a deprecated alias of the same type, removed in 1.0. `StorefrontConfig` is deprecated but not an alias: it is the shape of the old `storefront` key, whose globals key is `site`.

`defineConfig` takes `PatternDumpConfigInput`, with `site`: that is the type to write a config against. The exported `PatternDumpConfig` type is the loaded config, and it still has `storefront?: StorefrontConfig`.

## Changes while `pd dev` runs

`pd dev` watches the config file, not the modules it imports. A change to `site.globals` alone is taken live, and every page reloads. Any other change, with or without `site.globals`, isn't taken until `pd dev` restarts. A config that no longer loads leaves `pd dev` running with the config it has. A change that needs a restart and a config that no longer loads also show in the workbench as an error notice: the same message, without `[dev-server] `.

A change to `site.globals` alone
: `[dev-server] Config changed: <file>, site.globals → page-changed (every page)`.

Any other change
: `[dev-server] <file> changed: restart pd dev to load it (only site.globals is taken without a restart)`.

A save that changes nothing `pd dev` reads
: Comments, whitespace or key order: `[dev-server] Config saved: <file>, nothing pd dev reads changed`.

A config that no longer loads
: `[dev-server] <file> cannot be loaded, so pd dev keeps running with the config it has: <error>`.
