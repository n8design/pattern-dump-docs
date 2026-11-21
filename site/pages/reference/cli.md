---
title: Command line
description: Every pd command of Pattern Dump, with its options, defaults, messages and exit codes: pd init, pd dev, pd audit, pd build and pd export.
layout: doc
---

```sh
pd init [folder] [options]
pd dev [options]
pd audit [options]
pd build [options]
pd export [options]
pd help
```

The `pattern-dump` package has one command, `pd`. Before you have a project, `npx pattern-dump <command>` runs it; inside one, `npx pd <command>` or an npm script does. The package requires Node.js 22.22 or later, and its library entry exports only `defineConfig` and the config's types.

`pd` with no command, `pd help`, `--help` or `-h` prints the usage text and exits with 0. `pd help <command>` and `pd <command> --help` print the same full text. An unknown command prints `[pd] Error: unknown command "<cmd>"`, a blank line and the usage text to stderr, and exits with 1.

## Options and errors

Options are read strictly. An unknown option, an option without its value, or an argument that isn't an option is an error with exit code 1 and the usage text, never ignored. `pd init` is the exception: it takes one folder as an argument, and a second one is an error, `init takes one folder (got <a>, <b>)`. `--option value` and `--option=value` both work, and an option given twice takes the last value.

`--root <path>`
: On `dev`, `audit`, `build` and `export`. The project's folder. Default: the current folder.

`--config <path>`
: On `dev`, `audit`, `build` and `export`. The config file to load, which may be outside the root. Without it, `pd` looks for `pattern-dump.config.ts`, then `pattern-dump.config.json`, in the root.
: A file that doesn't exist: `--config file not found: <path>`. No config at all: `No pattern-dump.config.ts or pattern-dump.config.json found in <root> (and no --config given)`.

Both paths resolve against the current folder, each on its own. The paths inside the config resolve against the root, never against the config file's folder. A root `package.json` with a `patternDump` field gives the folders the config doesn't name.

A problem in the config prints as `[pd] Error: <message>`, without a stack trace. Other errors from `dev`, `audit` and `export` keep their stack, except a port that is taken in `pd dev`.

## `pd init`

Sets up a project in `<folder>`, or in the current folder without one: a design system, a design system with a site, or a site on an existing style guide (`--site`). Exits with 0 when the project is in place, and with 1 when it refuses or the install fails.

### Questions

In a terminal and without `--yes`, `pd init` asks, in this order; each option below skips its question:

1. A website on an existing style guide package? (only without `--site` and without any of `--examples`, `--no-examples`, `--with-site`, `--without-site`, `--system-theme`, `--no-system-theme`)
2. Project name
3. Title in the Nav Rail (with `--site`: Title of the site)
4. Include starter components (yes; not asked with `--site`)
5. Include a website (no; not asked with `--site`)
6. Include site search (Pagefind) (yes; only with a website or `--site`)
7. Follow the viewer's light or dark setting (a system theme as the default) (yes; only with a website)
8. The workbench's address (only with `--site`)
9. Initialise a git repository (only outside a repository)
10. Run npm install (yes)

A question with a default shows it in brackets, `Question (default): `; the site-package question has none. A yes or no question shows `(Y/n)` or `(y/N)`: an empty answer takes the default, and any answer starting with `y` is yes. Without a terminal, or with `--yes`, every question not answered by an option takes its default without asking.

### Options

`--name <name>`
: The `name` in `package.json`. Default: the `name` of a `package.json` already in the folder, else the folder's name: lowercase, each run of characters outside `a-z0-9._~-` turned into `-`, `-`, `.` and `_` trimmed from both ends, and `design-system` when nothing is left. A folder named `styleguide`, `style-guide`, `design-system`, `site`, `website`, `docs` or `www` takes its parent's name as a scope (`acme-web/styleguide` is `@acme-web/styleguide`), unless the parent's name has no letter or digit.

`--brand <title>`
: The title in the Nav Rail, `shell.brand.title`; with `--site`, the site's title. Default: the name, or for a scoped name made from the folders, the parent folder's name as written. A name you typed is its own default.

`--examples`, `--no-examples`
: The starter components. Default: yes.

`--with-site`, `--without-site`
: A website beside the design system. Default: no, also with `--yes`. Until 0.8.0 `--storefront` and `--no-storefront`, which still work until 1.0, each after a line such as `! --storefront is now --with-site`.

`--search`, `--no-search`
: Site search with Pagefind. Default: yes. Without a website (and without `--site`): `✗ --search is a choice for a website: add --with-site. Nothing was written.`

`--system-theme`, `--no-system-theme`
: A `system` theme as the default, following the viewer's light or dark setting. Default: yes. Without a website: `✗ --system-theme is a choice for a website: add --with-site. Nothing was written.`

`--site <package>`
: A site on an existing style guide: an npm name (with a version after `@`, or `latest`), or a folder, resolved from the current folder. With it, `--examples`, `--no-examples`, `--with-site`, `--without-site`, `--system-theme` and `--no-system-theme` are refused: `✗ --site writes a website on an existing style guide, so <flags> has nothing to choose. Nothing was written.` See [A site on a style guide](#a-site-on-a-style-guide).

`--workbench-url <url>`
: With `--site` only: where the style guide's workbench is published. Default: `/workbench/`. An `http(s)://` address or a path starting with one `/`. Without `--site`: `✗ --workbench-url is where a style guide's workbench is published, for a site on it: add --site. Nothing was written.`

`--git`, `--no-git`
: Run `git init`. Default: yes, unless the folder is inside a git repository already, where the question isn't asked. `--git` runs it there too. A failed `git init` prints `✗ git init failed: is git installed? (the project is set up regardless)` and `pd init` carries on.

`--install`, `--no-install`
: Run `npm install`. Default: yes.

`--pd-source <src>`
: Where `pattern-dump` is installed from: an existing path becomes `file:<absolute path>`, `pattern-dump@<range>` becomes `<range>`, anything else is used as written. Default: the version of the `pd` that runs.

`-y`, `--yes`
: Take every default without asking.

A pair given together is an error, such as `--git and --no-git cannot both be given`; so are a yes and a no to the website, named as given: `--with-site and --without-site cannot both be given`.

### What it refuses

A folder that is a project already
: `✗ <file> already exists: this folder is already a Pattern Dump project`, for a `pattern-dump.config.ts` or `.json`. Exit code 1, nothing written.

A `package.json` that isn't valid JSON
: `✗ <path> is not valid JSON: fix it and run pd init again (<reason>)`. Exit code 1, nothing written.

An existing file
: Never overwritten: listed as `· <path>: already exists, left untouched`. A file that appears while `pd init` writes makes that write fail. The site's skin is written whole or not at all: when one of its files exists, it is left out with `<file>: already exists: the site skin (<n> files in src/patterns/layouts, src/patterns/partials, src/patterns/views and their styles) was left out as a whole, so it isn't mixed with the skin already here`.

### What it writes

Every mode but `--site` writes `pattern-dump.config.ts`, `README.md`, `.gitignore`, `tsconfig.json`, `src/scripts/globals.d.ts`, `src/styles/base/_tokens.scss`, `src/styles/base/document.scss`, `themes/light.theme.scss` and `themes/dark.theme.scss`, with empty `assets/` and `src/patterns/` folders. The starter components add `atoms/button` (with the variants `~icon` and `~secondary`), `molecules/search-field` (with a private `input`), `pages/example`, their styles, `src/scripts/search-field.ts` and four `index.md` files.

A website adds seven pages (`index`, `about`, `guide`, `search`, `articles/index`, `articles/hello`, `articles/related`), seven components (`compact-card`, `feature-card`, `grid-card`, `listing-card`, `note`, `search`, `toc`), nine layouts, the partials `base` and `head`, four views, `assets/icon.svg`, `src/scripts/site-search.ts`, their styles, and `.github/workflows/pages.yml`. With the system theme it adds `themes/system.theme.scss` and `src/styles/base/colors.scss`.

The config sets `sourceDir`, `patternsDir`, `outDir: "./dist"`, the styles, `documentBase: ["base"]`, the themes (default `light`, or `system` with the system theme), the assets, `scriptsDir` and `shell.brand.title`. A website adds the `site` block (`pagesDir: "./pages"`, `outDir: "./site"`, `workbenchUrl: "/workbench/"`, a `notes` category, `globals`) and `build: { basePath: "/workbench/" }`, and `.gitignore` adds `site` and `_site`.

A new `package.json` gets `name`, `version: "0.1.0"`, `private: true`, `type: "module"`, and a `patternDump` field naming the same folders as the config. An existing one is merged, every field kept, and gets no `patternDump` field. Into it go:

- the scripts `dev` (`pd dev`), `audit`, `typecheck` and `build:scripts`, and `build` with a website; a name taken by another command gets `pd:<name>` beside it, with `script "<name>" already exists: added "pd:<name>" instead`;
- `pattern-dump`, pinned to the exact version, and `typescript` at `^5.9.0`, as devDependencies; an existing `pattern-dump` at another version stays, with a note, and so does an existing TypeScript, noted when its range isn't `^5.9.0`;
- `pagefind` at `1.6.0` with site search; an existing one stays, with a note;
- `allowScripts` for `esbuild` and `@parcel/watcher`; an existing `false` stays, with `allowScripts denies <name>, left as is: Pattern Dump needs its install script`.

When the workflow is written and `pattern-dump` comes from a local file, `pd init` warns: `! pattern-dump is installed from a local file (file:…). The GitHub Pages workflow installs with npm ci, which can't reach it: depend on the published pattern-dump before you push.`

### Output

`pd init` prints the `! <old flag> is now <new flag>` lines, then `✓ <n> files written to <folder>` and `✓ package.json created: <name>, with pattern-dump <version>` (or `updated`), the notes and skipped files, the git line, and `… npm install`. It ends with "Next:" and the commands that start the project: `cd <folder>` (left out in the current folder), `npm install` when the install was skipped, and `npm run dev`, with a comment that names the addresses.

A failed install exits with 1: `✗ npm install failed. The project files are in place.`, then why, and last `  Fix that, then install again:  cd <folder> && npm install`.

npm wrote errors
: `  npm said:`, then npm's error lines, each once, at most eight, without colour codes or the pointers to npm's log files.

npm wrote no error
: `  npm stopped with exit code <n>; its output is above.`

npm could not be started
: `  npm could not be started: is Node.js (with npm) installed?`

### A site on a style guide

`--site <package>` writes `pattern-dump.config.ts`, `README.md`, `pages/index.md`, `pages/about.md` and `.gitignore`, and `.github/workflows/pages.yml` only for a style guide from the registry. Its config names the style guide in `packages`, sets the `site` block and `build: { workbench: false }`, and keeps `outDir: "./dist"`, where nothing is written. Its `package.json` gets the scripts `dev` and `build`, and `pattern-dump`, the style guide and, with search, Pagefind as devDependencies; no TypeScript and no `patternDump` field.

A folder is written into `package.json` as `file:<path>`, relative to the site. A folder that is no style guide is refused: without a `package.json`, `<folder> has no package.json: --site takes a style guide's npm name, or the folder of one`; the site's own folder, invalid JSON or a missing `name` too. A style guide without a `patternDump` field is a warning, and when its config can be loaded, `pd init` prints the field to add. A name that is neither a folder nor a package name: `"<input>" is neither a folder nor an npm package name (such as @acme/styleguide or @acme/styleguide@1.2.0)`.

After the install, a style guide given as `latest` is pinned to the version npm installed (`✓ <name> pinned to <version>`). Then `pd init` asks for every page of the site: `✓ every page renders with <name>`, or `! The pages don't render with <name> yet:` and each problem; it exits with 0 either way. With `--no-install` it says that the pages are checked once the style guide is installed.

## `pd dev`

Runs the workbench, and the site when the project has one, while you work. Prints `[dev-server] Listening at http://127.0.0.1:<port>`, then the addresses, and ends its startup with `[dev-server] Ready in <ms>ms, <n> components`, variants not counted.

`--port <n>`
: The HTTP port. Default: the `PD_PORT` environment variable, else `4000`.

`--ws-port <n>`
: The live-reload port. Default: the `PD_WS_PORT` environment variable, else the HTTP port plus 1.

Both take a whole number from 0 to 65535, `0` for any free port; anything else: `--port must be a port number (got "<value>")` (or `--ws-port`), exit code 1. The environment variables are not checked.

Both bind to `127.0.0.1` only. Before binding, `pd dev` checks the live-reload port, then the HTTP port, on `127.0.0.1` and `::1`, unless the port is `0`. A taken port stops it with exit code 1 and no stack trace: `[pd] Port <n> is already in use, so the workbench cannot start.` (or `so live reload cannot start.`), then `Another `pd dev` is probably still running: stop it, or start this one on other ports:` and `pd dev --port <port + 100>   (live reload then uses <port + 101>)`. When the taken port is a live-reload port you chose, the advice is `pd dev --ws-port <a free port>`.

### Host names

`pd dev` answers only to its own host names at its own port, in any case: `localhost`, `127.0.0.1`, `pd.localhost`, and with a site `site.host` (default `live.localhost`). Any other host, or none, gets `403` and `Forbidden: this server answers only to its own host names`. Live reload accepts a connection only from an `http:` page on one of those names at the HTTP port, or one that names no origin.

With a site, the site is on its host and the workbench on `pd.localhost`, and `localhost` and `127.0.0.1` get the workbench too. It prints `[dev-server] Website:   http://<site host>:<port><base path>` and `[dev-server] Workbench: http://pd.localhost:<port>/`, and with site search, that the index is built by `pd build`, so the search finds nothing in `pd dev`. Without a site it prints `[dev-server] Workbench: http://localhost:<port>/`.

### Changes while it runs

`pd dev` watches the config file, not the modules it imports. A change to `site.globals` alone is taken live, and every page reloads. Any other change is not taken: `<file> changed: restart pd dev to load it (only site.globals is taken without a restart)`, in the terminal and as a notice in the workbench.

A change to global data or a helper reloads them and what is open; one that fails to load keeps the last good version and says so, in the terminal and on the open pages. A change to another file in a helper's folder asks for a restart.

## `pd audit`

Checks every component and every variant, prints the report and writes it outside the project, to `<temporary folder>/pattern-dump/<hash>/diagnostics-report.<md|json>`, with the serialized graph, `diagnostics-graph.json`, beside it. [Check your work](/guide/check-your-work/#run-pd-audit) explains the report.

`--format <md|text|json>`
: Default: `md`. Anything else: `--format must be one of md|text|json (got "<value>")`, exit code 1.
: With `json`, stdout holds only the JSON report, written in full over a pipe, and the `[pd audit]` lines go to stderr. With `md` or `text` they go to stdout.

`--strict`
: Any finding fails the audit, warnings included.

After the report, `pd audit` prints:

```txt
[pd audit] re-audited <n>, reused <n> (of <n>).
[pd audit] serialized graph: <path>
[pd audit] report: <path>
[pd audit] <n> defects across <a>/<n> components.
```

and `[pd audit] warning: <image warning>` once when sharp can't load. It exits with 0 with no findings or warnings only, and with 1 when a finding is an error, when `--strict` finds any finding, or when the audit itself fails, with `[pd] Error: …`. The verdict is the last line:

```txt
[pd audit] failed: <n> error(s) found (warnings alone don't fail it; --strict makes them fail it too).
[pd audit] failed: <n> defect(s) found, with --strict (a warning fails it too).
```

With `--format json`, an error still exits with 1 and stdout stays valid JSON.

## `pd build`

Writes the workbench, and the site when the project has one, as static files. [Build output](/reference/build-output/) lists what it writes, what it checks and what it refuses.

`--out <dir>`
: The workbench's folder, resolved against the root. Default: `build.outDir`, else `outDir`.

`--base <path>`
: The path the workbench is served from. Default: `build.basePath`, else `/`.

`--audit`, `--no-audit`
: Include the audit or leave it out, over `build.audit`. Both together: `--audit and --no-audit cannot both be given`.

`--browser`
: Check the site's pages in Chromium too.

`--check-workers <n>`
: How many workers run the checks: a whole number of 1 or more. Anything else: `--check-workers takes a whole number of 1 or more (got "<value>")`, exit code 1. Left out, the build chooses.

`--skip-checks=<list>`
: The checks to skip, comma-separated, over `build.skipChecks`: `a11y`, `html`. `--skip-checks=` runs every check.

`build.workbench` has no option. `pd build` exits with 0 once it has written everything, and with 1 and `[pd] Error: <message>`, without a stack trace, on any error.

## `pd export`

Writes the corrected form of the project's flattened component families, the ones `pd dev` reports as `FLATTENED`, to another folder, and never changes the project.

`--out <dir>`
: Where to write, resolved against the current folder. Default: `<temporary folder>/pattern-dump/<hash>/export`. A folder inside the root is refused: `--out must be outside --root (the root is read-only; export writes the corrected form elsewhere).`, with both paths.

`pd export` collapses a family only when its members are byte-identical but for the class tokens of the root element: into `<base>.hbs`, `<base>.json` and a `<base>~<token>.json` overlay per member. A family that other components include is "threaded": their includes are rewritten too. Any other family is reported as "deferred" or "skipped" (`cross-folder`, `not-lossless-shape-a`) and never written.

It prints `[pd export] patterns:` and `sink:`, the counts of collapsed, threaded, deferred and skipped families, the files written, the `COLLAPSE` and `THREADED` blocks, a `REWRITE MAP`, and the `DEFERRED` and `SKIPPED` lines. It exits with 0, or with 1 and `[pd] Error: …` on a failure.
