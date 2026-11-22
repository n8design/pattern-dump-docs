---
title: Component files
description: The files of a Pattern Dump component and what each holds: Handlebars partials, data, docs and schema, variants, folder index.md files, scripts and assets.
layout: doc
---

```txt
src/patterns/
├── index.md                     the top-level folders' order
└── atoms/
    ├── index.md                 the folder's title, order and preview
    └── button/
        ├── button.hbs           the template: atoms/button
        ├── button.json          its data
        ├── button.md            its docs and metadata
        ├── button.schema.json   its schema
        ├── button~icon.hbs      a variant with markup of its own
        └── button~secondary.json  a variant with other data
```

A component is a Handlebars template, a `.hbs` file, in a folder under a patterns root. The files beside it with the same name give it data, documentation and a schema. A component's id names it in links and messages, and its handle names it in includes and tags.

## Ids and handles

Pattern Dump reads only the folders inside each patterns root: a `.hbs` lying directly in the root is not a component. Files and folders whose name starts with `.` are skipped at every depth. Each root can leave out files and folders by glob: `**` spans folders, `*` stays in one, `?` is one character, and a folder's glob also matches with a trailing `/`.

Id
: The template's path below the patterns root, without `.hbs`. A file named like its folder takes the folder's id: `atoms/button/button.hbs` is `atoms/button`.

Handle
: The id's first and last segments, joined by `-`, with the folders between dropped and `~<variant>` kept: `molecules/quick-links/ql-list-button` is `molecules-ql-list-button`. Numbers in front of a segment (`00-`, `01_`: digits followed by `-` or `_`) are dropped from the handle but kept in the id: `00-atoms/01-global/00-colors` is `atoms-colors`. Digits that are part of a name stay (`atoms/h1` is `atoms-h1`, `atoms/2col-grid` is `atoms-2col-grid`), but `2-col` loses its `2-`.

### Two components, one handle

In one patterns root
: A collision. The first by sorted path keeps the handle; the other is quarantined, left out of the tree, and its page answers with a `HANDLE_COLLISION` error naming both. Components that differ only by numbers in front, such as `00-atoms/badge` and `atoms/badge`, collide too.

Across roots
: An override. The project comes first, then the pattern packages in order, and the earlier root's component wins, so the project's wins over any package's.

A variant handle that is taken
: Dropped, without a `HANDLE_COLLISION`.

## Data, docs and schema

Files belong to a template by its exact name, in its folder: `<name>.json`, `<name>.md` and `<name>.schema.json`.

`<name>.json`
: The data the component renders with in the workbench, its previews and a page's live examples; on a site page it is left out ([Layouts](/reference/layouts/#sample-data)). A component renders with the global data, then its `.json`, then a variant's `.json`, then the data a render passes. Objects merge key by key; anything else, lists included, is replaced. A file that isn't valid JSON is a `DATA_INVALID` error, `<file> is not valid JSON (<reason>); its data was not used`, with the line and column; for an included component, the component that includes it reports it.

`<name>.md`
: The component's documentation, shown in the Inspector's Docs tab, with its metadata in the frontmatter (see [The `.md` file](#the-md-file)).

`<name>.schema.json`
: A JSON Schema for the component's data, checked against the merged data on every render. A name in the top-level `required` that is missing or `null` is an `UNFILLED_REQUIRED` error. A top-level property whose value doesn't match its `type` is a `SHAPE_MISMATCH` warning; nested properties aren't type-checked. Every variant is checked against the base component's schema. A schema that isn't valid JSON is a `SCHEMA_INVALID` error at its line and column, and with a site it stops `pd build`.

A render's data is read-only: a helper that changes it throws.

## Variants

A variant is a file beside the template, `<name>~<variant>`. Its name is the text between the first `~` and the next.

`<name>~<variant>.hbs`
: Markup of its own, with its own sidecars by the same name: `button~icon.json`, `button~icon.md`, `button~icon.schema.json`.

`<name>~<variant>.json`
: A data overlay: the base template with this data over the base's. It can have its own `.md` and `.schema.json` too. It needs a `<name>.hbs` to overlay; without one, it is left out, and `pd dev` reports it: `[dev-server] <variant path>: a data variant needs <base path> to overlay, and there is none, so it is left out`, shown in the Console as a warning.

A component made of variants with markup of their own alone, with no `<name>.hbs`, gets a base that renders empty, titled from `<name>.md` when there is one, with its variants listed.

A variant included or previewed by its own id, such as `atoms/chip~danger`, is the base rendered with that variant. It gets the base's data with the variant's on top, and the base's template unless it has its own. `/preview/<base>~<variant>` is the same document as `/preview/<base>?variant=<variant>`.

## Includes

`{{> <handle> }}` includes another component, and the block form `{{#> <handle>}}…{{/<handle>}}` wraps content, which the included component places with `{{> @partial-block}}`. `{{#if @partial-block}}` is true only in a block call, and a block partial viewed on its own renders an empty block. A handle with `~` is quoted: `{{> "atoms-button~secondary" }}`.

An included component's own `.json` is only its default. The context it is included in, with the include's arguments, goes over it: a field of the including component with the same name wins, even when it isn't passed. A variant included by its handle gets its base's `.json` beneath its own. Inside an include, `@root` is still the top-level render's data, and `@index` and the like stay visible. An include on an indented line is not indented again, so a `<pre>` inside it keeps its text.

[Relationships](/concepts/relationships/#what-counts-as-an-include) explains which includes count.

## The `.md` file

Its metadata is read from the `---` block at its top only: a `key:` line in the body, or in a file without the block, is text. A quoted value loses its quotes, and a key with an empty value counts as not set.

`title`
: The name in the Nav Rail and the Inspector. Default: the last segment of the id. A variant without its own `.md` is titled `<name>~<variant>`.

`description`
: One line of free text, shown with the component.

`status`
: `stable`, `deprecated` or `draft`. Any other value, or none, is `draft`.

`deprecated-use`
: One line of free text, shown with the component.

`visibility`
: `public` or `private`; any other value is ignored. A private component is marked private in the tree and left out of folder galleries.

`order`
: A number that ranks the component among its siblings. See [Folders](#folders).

`preview`
: `centered` or `full`: how the component is previewed. See [Preview layout](#preview-layout).

`requireScript`
: A script, or a list (`[toggle, menu]`, or one `- item` per line), loaded as a module after the markup, in order, each once. An item's path and `.ts` or `.js` are dropped: `scripts/toggle` and `toggle.js` are `toggle`, so a script in a subfolder of the scripts folder can't be named. A repeated `requireScript:` line counts only once, with its last value.

`requireAssets`
: A symbol set, or a list: `<id>.svg`, else `images/<id>.svg`, from the first asset folder that has it, the project's before the packages'. It is inlined, hidden, into the preview; a preview leaves out a set no folder has without a word, while a site page fails on it.

A variant with no `.md`, or an empty one, takes the base's documentation, and keeps its own title, description and status.

The scripts and symbol sets of everything a component includes load with it. A script is looked up as `<scripts folder>/<id>.ts`, the project's first; one that doesn't exist is reported once at startup, `[dev-server] requireScript "<raw>" on <component>: no <id>.ts in <dirs>`, and its address answers 404. A full address (`://`) in `globalScripts` is loaded as it is.

### A symbol set

A symbol set is one SVG file of `<symbol>` elements, each with an `id`, which a template draws with `<use href="#<id>">`. Pattern Dump inlines the file as it is, hidden: in a preview with `style="display:none;position:absolute" aria-hidden="true"` on its root `<svg>`, and on a site page by its size (`width="0" height="0"`), never with `display:none`, after the page's symbol-image sprite and once per page.

An icon set, `assets/icons.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg">
  <symbol id="icon-check" viewBox="0 0 16 16">
    <path d="M2 8l4 4 8-8" fill="none" stroke="currentColor"/>
  </symbol>
</svg>
```

The icon component asks for it in `icon.md`:

```md
---
requireAssets: icons
---
```

and draws it in `icon.hbs`:

```hbs
<svg class="icon" aria-hidden="true"><use href="#icon-check"/></svg>
```

Every preview and every site page that includes the icon, at any depth, then carries the set. A site page fails when two of its sets declare the same id, `the symbol sets "<a>" and "<b>" both declare id="<id>": a <use> of it could draw either`, or when a set declares an id that a symbol image on the page has.

Symbol sets and [symbol images](/reference/images/#symbol-images) come from different places: a symbol image is a file in `symbols/`, which a page's markdown places, and a set is `<id>.svg` or `images/<id>.svg`, which a component asks for.

## Folders

A folder's `index.md` gives the folder its title, order and gallery, in its frontmatter; its body renders above the folder's gallery, with live examples and source blocks working. The first `index.md` found across the patterns roots, the project's first, is used whole.

`title`
: Default: the folder's name, with `-` and `_` as spaces and the first letter capitalised, numbers kept: `04-templates` is "04 templates", `quick-links` "Quick links".

`order`
: A number ranks the folder among its siblings (default 0, lower first). A list (inline, one item per line, or text with commas) orders the folder's children. In it, `...` stands for every child it doesn't name; without it, those come after the named ones. Unknown names are ignored. A number always wins over the list, and ties go alphabetically, with `item2` before `item10`. `src/patterns/index.md`'s list orders the top-level folders.

`visibility`
: `private` keeps the folder's components out of the galleries above it; its own gallery still lists them.

`overview`
: `false` gives the folder no gallery page. `overviews: false` in the config does so for every folder.

`preview`
: `centered` or `full`. In a top-level folder it sets how its components are previewed; in a nested folder, only its own gallery page.

A folder gets a gallery page when it holds a public component somewhere below it that isn't inside a private folder. A gallery lists every public component at or under the folder, in tree order, except those in a private folder below it. A folder that is also a component, such as `atoms/button/` with `atoms/button/input/input.hbs`, is a component with children: its `index.md` orders them but gives no title, and it gets no gallery page.

### Preview layout

How a component is previewed, `centered` or `full`, is decided in this order, a later step winning over an earlier one:

1. `full` for the top-level folders `pages`, `templates` and `layouts` (numbers in front ignored), else `centered`;
2. `preview:` in the top-level folder's `index.md`;
3. `x-pd-preview` in the component's schema;
4. `preview:` in the component's `.md`. An invalid `x-pd-preview`, or a schema that isn't valid JSON, leaves the earlier one.

## Stylesheets

A stylesheet belongs to the component at the same path under the styles folder, with `.scss` and a leading `_` dropped from every segment; `<folder>/_index.scss` and `<folder>/<folder>.scss` belong to `<folder>`. An exact match wins; otherwise numbers in front are ignored on both sides, and a name two components share after that belongs to neither and goes into the base layer. [Style a component](/guide/style-a-component/#which-component-owns-a-class) has which component owns a class.

## Assets

Addresses that lead into an asset folder are rewritten by the folder's name: `../../<name>/…` and `/<name>/…` become `/assets/<name>/…`, and a folder named `assets` needs no rewrite. With one asset folder, `./assets`, `/images/logo.svg` is not rewritten.
