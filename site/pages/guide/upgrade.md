---
title: Upgrade
description: Move Pattern Dump to a new version: the exact npm version your project pins, what to read first, and what changed in 0.8 and 0.7.
layout: doc
order: 10
---

`pd init` pins `pattern-dump` to the exact version that ran it, `0.8.0` with no `^`. A new release never arrives on its own: your project changes version when you move the pin, and only then.

## Move the pin

Read the release's upgrade notes first: a release's entry in the [changelog](https://github.com/n8design/pattern-dump/blob/main/CHANGELOG.md) starts with what to change when you come from the release before, under "Upgrading from". The sections below sum up the last two.

Then install the new version, exactly, in the project folder:

```sh
npm install --save-dev --save-exact pattern-dump@<version>
```

`<version>` is the release, such as `0.8.0`, and `--save-exact` keeps the pin exact in `package.json`. In a repository with a style guide and a site as two projects, as in [a site on a style guide](/guide/a-site-on-a-style-guide/), move the pin in both.

Restart `pd dev`, and run the audit and the build:

```sh
npm run audit
npm run build
```

A release can check more than the one before. An audit or a build that passed can fail after an upgrade, in CI too, and the messages say what to change.

## Upgrading to 0.8

### `storefront` is now `site`

The part of Pattern Dump that builds a website is called the site, and the config follows. The key `storefront` is now `site`, with the same keys inside, except one: the values every page shares, `storefront.site`, are now `site.globals`. Layouts still read them as `{{site.…}}`.

Before:

```ts
export default defineConfig({
  storefront: {
    pagesDir: "./pages",
    site: {
      title: "Acme",
    },
  },
});
```

After:

```ts
export default defineConfig({
  site: {
    pagesDir: "./pages",
    globals: {
      title: "Acme",
    },
  },
});
```

A config with the old names still loads, read as the new ones, with a warning per key, such as `[pd] warning: <config file>: storefront.site is now site.globals`. Both names at once is a problem, and the only one reported: `both "site" and "storefront" are set: storefront is the old name of site, keep site only`. The old names load until 1.0, which removes them.

The same goes for `pd init`: `--storefront` is now `--with-site` and `--no-storefront` is `--without-site`. The old flags still work until 1.0, and `pd init` first prints which flag each is now, such as `! --storefront is now --with-site`.

Messages follow too: they name `site.*`, and terminal lines about site pages start with `[site]`, where they started with `[storefront]`.

The config's types are named `Site…`, such as `SiteConfig`. Each `Storefront…` name is a deprecated alias of the same type, removed in 1.0, except `StorefrontConfig`: it is the shape of the old `storefront` key, with its globals under `site`.

### Code colours on site pages

Highlighted code now carries a class per kind of token, `pd-code-<kind>`, in place of generated classes such as `__shiki_17h8wv`. Pattern Dump links `/_pd/code.css` into every site page that shows code, and a site sets the colours from its own tokens with the `--pd-code-<kind>` custom properties. `/_pd/shiki.css` no longer holds token colours: a site that linked it for them links `/_pd/code.css` instead, or nothing, since Pattern Dump links it.

### The audit checks every variant

`pd audit`, the Audit tab and the audit in `pd build` now check every variant under its own id, and a component a handle collision left out of the tree is an entry with a `HANDLE_COLLISION` error. Each variant also counts in a rule's blast radius. An audit that passed in 0.7 can fail in 0.8, and [check your work](/guide/check-your-work/) shows how to read it.

## Upgrading to 0.7

### Component metadata comes from the frontmatter only

A component's `.md` sets its `title`, `description`, `status`, `requireScript` and the other keys only in the `---` block at its top. A `key:` line in the body, or in a file without the block, is text now and sets nothing. A quoted value loses its quotes.

### `requireScript` takes a list

Several scripts are one list:

```md
---
requireScript: [toggle, menu]
---
```

Repeating the `requireScript:` line no longer adds a script: only the last line counts.

### A data variant without a template is reported

A `<name>~<variant>.json` with no `<name>.hbs` to overlay is left out, as before, and is now reported: `pd dev` names it in the terminal and the Console, where it was dropped without a word.

### `pd build` replaces its output at the end

`pd build` writes into a hidden folder beside each output and replaces the output only when every check has passed. A build that stops leaves the earlier output as it was.

## Before 0.7

The upgrade notes for 0.6 and earlier are in their releases' entries in the [changelog](https://github.com/n8design/pattern-dump/blob/main/CHANGELOG.md).

## Up to date

The pin is on the new version, the audit and the build pass, and the next release's notes say what changes after that.
