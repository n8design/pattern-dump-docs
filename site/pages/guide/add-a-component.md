---
title: Add a component
description: Add a component to your style guide: a Handlebars template with its data, its component documentation and a schema, then give it a variant.
layout: doc
order: 4
---

A style guide grows one component at a time. In Pattern Dump, a component is a Handlebars template in a folder of its own, and the files beside it give it data, documentation and a schema.

This step adds a badge to the starter: a short label such as "New", with a variant for a warning.

## The template

Create a folder for the badge under `src/patterns/atoms/`, and its template in it, `badge.hbs`:

```hbs
<span class="badge badge-{{tone}}">{{label}}</span>
```

Every `.hbs` file in a folder under `src/patterns/` is a component, however deep it sits. A file directly in `src/patterns/`, with no folder of its own, is not read, and neither is a file or folder whose name starts with a dot.

A component has two names, both from its path:

The slash id
: The path below `src/patterns/` without `.hbs`. A file named like its folder takes the folder's slash id, so `atoms/badge/badge.hbs` is `atoms/badge`. A number in front of a folder or file (`00-atoms`) stays in the slash id.

The handle
: The first folder and the component's name, joined by `-`: `atoms-badge`. Folders in between are left out, and so are numbers in front (`00-`, `01_`). Templates include each other by handle.

Two components in the same patterns folder with the same handle collide: the first by sorted path keeps it, and the other is left out of the tree. The Console shows the error `Handle collision: "<h>" is held by <incumbentPath>; <quarantinedPath> is quarantined until one is renamed`, where `<h>` is the handle, `<incumbentPath>` the component that keeps it and `<quarantinedPath>` the one left out, and `pd audit` lists it as a defect.

In the workbench, the badge sits under Atoms in the Nav Rail, titled `badge` until its docs give it a `title`.

## Its data

Beside the template, `badge.json` holds the data it renders with:

```json
{
  "label": "New",
  "tone": "info"
}
```

Files belong to a component when they share its name exactly: `badge.json` for data, `badge.md` for docs, `badge.schema.json` for the schema.

A component renders with global data first, when the config names a data folder, then its own `.json`, then a variant's `.json`, and last any data passed to the render. Objects merge key by key, and anything else, arrays included, is replaced.

A data file that isn't valid JSON is an error, `<file> is not valid JSON (<reason>); its data was not used`, with the line and column. `<file>` is the file's name, `<reason>` what the parser found.

## Its documentation

`badge.md` is the component's documentation. The Inspector's Docs tab shows it:

````md
---
title: Badge
description: A short label beside a title or an item.
status: draft
---

A short label. `tone` picks its colours: `info` or `warning`.

```pattern atoms/badge~warning
```

```src-data atoms/badge~warning
```
````

The block between the two `---` lines holds the metadata, and only that block is read: a line such as `title: x` in the text, or in a file without the block, is text. A quoted value loses its quotes, and a key with an empty value counts as not set.

`title`
: The name in the Nav Rail and the Inspector. Without it, the file's name: `badge`.

`description`
: One line, shown with the component.

`status`
: `draft`, `stable` or `deprecated`. Any other value, or none, is `draft`.

`deprecated-use`
: One line: what to use instead of a deprecated component.

`visibility`
: `public` or `private`. A private component is marked private in the tree and left out of folder galleries.

The block can also hold `order`, `preview`, `requireScript` and `requireAssets`, for the order in the tree, how the Stage frames the component, and the behaviour scripts and SVG symbol sets it loads.

### Live examples and source

A fenced block whose language is one of these is replaced when the docs render. The component's slash id goes on the fence line, or on the first line inside the block:

`pattern <id>`
: The component itself, rendered into the docs. `~<variant>` after the slash id shows a variant. A slash id that names no component or variant, or a render that fails, shows `[pattern: <spec> · render error]`, where `<spec>` is what you wrote.

`src-template <id>`
: The template, highlighted as Handlebars. Always the base component's: a `~<variant>` is ignored. A component made of variants alone, or an unknown slash id, shows `[src-template: <spec> · no template file]`.

`src-data <id>`
: The component's `.json` as written, or `[src-data: <spec> · no data file]` without one. For a variant, the base's data and the variant's merged, global data left out, and `[src-data: <spec> · unknown variant]` when there is no such variant.

`src-html <id>`
: The rendered HTML, escaped and highlighted. A render that fails shows `[src-html: <spec> · render error]`.

On a site page, a `pattern` block shows the component in a frame of its own, and a missing component there fails the build. The step that adds a site covers it.

![The Inspector's Docs tab for a button: its description, the live buttons it renders and its Handlebars markup, highlighted.](/assets/screenshots/workbench-component-docs.webp "The Docs tab renders a component's documentation, with live examples and source from its fenced blocks. Here, the button of this site's own style guide.")

## Its schema

`badge.schema.json` is a JSON Schema for the badge's data:

```json
{
  "type": "object",
  "required": ["label", "tone"],
  "properties": {
    "label": { "type": "string" },
    "tone": { "type": "string" }
  }
}
```

Pattern Dump checks the merged data against it on every render, and only at the top level:

A required field that is missing
: Each name in `required` whose value is absent or `null` is an `UNFILLED_REQUIRED` error: `Required field "<key>" is absent in the merged data`. `<key>` is the field's name.

A value of the wrong type
: Each property with a `type` that the value doesn't match is a `SHAPE_MISMATCH` warning: `Field "<key>" expected <types> but got <type>`, where `<types>` is what the schema allows, joined with ` | `, and `<type>` the value's type. A list counts as `array`, a whole number as `integer` and `number`. Nested properties are not checked.

A schema that isn't valid JSON
: A `SCHEMA_INVALID` error at its line and column: `<file> is not valid JSON (<reason>), so <id> isn't checked against its schema until it's fixed`. With a site, it also stops `pd build`.

Every variant is checked against the base component's schema.

## A variant

A variant is a file beside the template, named `<name>~<variant>`. Add `badge~warning.json`:

```json
{
  "label": "Deprecated",
  "tone": "warning"
}
```

The badge now has a variant, `warning`: the same template, with this data merged over `badge.json`. The variant's name is the text between the first `~` and the next one. There are two kinds:

`badge~warning.json`
: A data overlay: the base template with other data, so it needs a `badge.hbs` to overlay. Without one, it is left out: `pd dev` names it in the terminal, and the Console shows the warning `Warning: Data variant left out: <variant path> needs <base path> to overlay, and there is none`. The two paths are the variant's file and the template it is missing.

`badge~warning.hbs`
: Markup of its own. It still gets the base's data, and a `badge~warning.json` beside it goes on top.

A component can be made of variants with markup of their own alone, with no `badge.hbs`. The workbench then shows the variants, and the component itself renders empty.

A variant can have its own `.md` and `.schema.json` (`badge~warning.md`), though the checks still use the base's schema. Without its own `.md`, it shows the base's documentation, with its own title, description and status: its title is then `badge~warning`.

![The Stage showing a note twice, as the base component and as its warning variant, with All variants picked in the Variant menu above.](/assets/screenshots/workbench-component-preview.webp "With All variants picked, the Stage shows the base component and each variant, one below the other.")

## Include it in another component

A template includes another component by its handle, with data as arguments:

```hbs
{{> atoms-badge label="Beta" tone="info" }}
```

A variant's handle contains `~`, so it is quoted:

```hbs
{{> "atoms-badge~warning" }}
```

An included component's own `.json` is only its default. The context it is included in goes over it, and the arguments over that. So a field of the including component with the same name as one of the badge's wins inside the include, even when it isn't passed. A variant included by its handle gets its base's `.json` beneath its own.

The Inspector's Relationships tab shows every include, in both directions. Pattern Dump reads them from the template as written: a partial that a helper picks while rendering is not one of them.

## Your component

The badge is in the Nav Rail, with its docs, its data checked against its schema, and a variant. It has no styles yet: next, [style it](/guide/style-a-component/).
