---
title: Pattern packages
description: Share a design system as an npm package with Pattern Dump: the patternDump field in package.json, package order, overrides, and a package of your own.
layout: doc
---

```json
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
```

A pattern package is an npm package with a `patternDump` field in its `package.json`: a style guide another project uses. The field says where its patterns, styles, themes, scripts and assets are, as the one above, which `pd init` writes into every design system it makes. A project names the packages it uses in `packages` in its config, installs them with npm, and renders their components beside its own.

## Using a package

```ts
export default defineConfig({
  packages: ["@acme/styleguide"],
});
```

`packages`
: A list of package names, or of `{ name, exclude?, styles? }`. Anything else: `"packages" must be a list of package names or { name, exclude, styles } objects`.

`exclude`
: Globs, relative to the package's patterns folder, of templates to leave out, on top of the package's own `exclude`.

`styles: false`
: Leaves out the package's styles, its `documentBase` included. Its templates, data, themes, scripts and assets stay.

A package is found at `node_modules/<name>/package.json`, looking from the project's root upward, so a hoisted install works. Its `peerDependencies` that have a `patternDump` field are used too, and theirs, at any depth; a peer that isn't installed, or has no field, is skipped without a word. Each package is used once, even when it is named and a peer, and its options apply however it is reached.

A package that isn't installed
: Stops startup: `pattern package "<name>" is not installed. Run: npm install --save-dev <name>`.

A package without the field
: Stops startup: `"<name>" has no "patternDump" field in its package.json, so Pattern Dump cannot tell where its patterns, styles and themes are. See PackageManifest in @pattern-dump/contracts.`

### At startup

`pd dev` prints a line per package, `[dev-server] pattern package <name>@<version>`, with ` (peer)` for a peer, and `: an installed copy, not watched` or `: linked, nothing in it to watch` where that applies; the version defaults to `0.0.0`. A package is used from its real folder, links resolved, and counts as linked when that folder isn't inside a `node_modules`. A linked package is watched like the project's own files; an installed copy is not. Installing, updating or adding a package needs a restart of `pd dev`.

## The `patternDump` field

Every field is optional. Paths are relative to the package's folder, except `styles.entry`, relative to `styles.dir`, the `exclude` globs, relative to `patterns`, and `styles.documentBase`, relative to `styles.dir`.

`patterns`
: The patterns folder.

`data`
: The global data folder.

`helpers`
: The helpers: compiled JavaScript. A `.ts` file stops startup, `pattern package "<name>": its helpers are TypeScript (<path>), which Node does not load from an installed package. Ship compiled helpers: …`, and so does a folder with TypeScript and no `.js`; with both, the `.js` loads and a warning names the TypeScript it skipped.

`assets`
: A list of asset folders.

`styles`
: `{ dir, entry?, documentBase? }`: the styles folder, the files to compile (else every `.scss` under `dir` that isn't a partial), and the base layer's files.

`themes`
: `{ dir, default?, switch? }`: the themes folder, the default theme and the switch mode.

`scripts`, `globalScripts`
: The scripts folder, and the scripts every preview loads.

`exclude`
: Globs of the package's own templates to leave out.

The field is read as written, not validated. Unknown fields are ignored without a message; only `helpers` is checked.

## How sources combine

The project comes first, then the packages, in the order the config names them, each followed directly by its peers, depth first.

Components
: The same handle in the project and a package: the project's wins. Between two packages, the earlier one's. Both are logged, `[dev-server] <id> overrides <package>'s component of the same handle ("<handle>")`. Two components with one handle in the same source are a collision. "Hide packages" in the Nav Rail hides the packages' components from the tree and the galleries; they stay usable, and reachable by address. The control shows only when the tree has package components.

Classes
: A class belongs to the first stylesheet that defines it, the project's first. The base layer is written packages first, so the project's own base rules come last and win.

Global data and helpers
: Packages first, in package order, the project last: later data merges deeply over earlier, and a later helper of the same name replaces an earlier one.

Scripts
: Looked up in the project's scripts folder first, then the packages'. `globalScripts` lists the packages' first.

Assets
: A package's asset folders are served under `/assets/<folder name>/`. A project folder, or an earlier package's, of the same name hides it.

Themes
: Theme folders are the project's first, then each package's, in package order, and a theme name found first hides a later one. See [Themes](/reference/themes/#configuration).

## A package of your own

A design system that `pd init` makes is a pattern package from the start: its `package.json` gets a `patternDump` field naming the same folders as its config. A project whose own root `package.json` has the field takes from it every folder its config leaves out:

| Field | Config key |
|---|---|
| `patterns` | `patternsDir` |
| `data` | `dataDir` |
| `helpers` | `helpers` |
| `scripts` | `scriptsDir` |
| `globalScripts` | `globalScripts` |
| `exclude` | `exclude` |
| `assets` | `assets.dir` |
| `styles.dir`, `styles.entry` | `styles.dir`, `styles.entry` |
| `styles.documentBase` | `documentBase` |
| `themes.dir`, `themes.default`, `themes.switch` | the same under `themes` |

The field is merged before the config is validated and before the folders' defaults, so a folder it names is never mistaken for a default. A root `package.json` that is missing, isn't valid JSON or has no field leaves the config as it is.

A key set in both must have the same value. Paths are compared normalised, so `./patterns` is `patterns`, and one path equals a list of one; `globalScripts`, `exclude`, `themes.default` and `themes.switch` are compared as values. A difference stops with:

```txt
<config file>: the config and the project's own package manifest disagree
  - "<config key>" is <value> in <config file>, but "patternDump.<field>" is <value> in package.json: name it in one of them, or give both the same value
```

Since `themes` is merged before validation, a field with `themes.dir` but no `themes.default`, and a config without `themes.default`, fail with `missing required "themes.default"`.

A site on a style guide in a folder of its own, made with `pd init --site`, uses it as a package: [A site on a style guide](/guide/a-site-on-a-style-guide/) shows the setup.
