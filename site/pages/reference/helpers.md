---
title: Helpers
description: Every built-in Handlebars helper in Pattern Dump, from ids and comparisons to pd-image, and how your own Handlebars custom helpers are added.
layout: doc
---

```hbs
<label for="{{id 'input'}}">{{label}}</label>
<input id="{{id 'input'}}">
```

Pattern Dump registers these helpers in every template it renders: components, layouts and placed components. A project's own helpers are registered after them, so one of the same name replaces the built-in.

## Ids

`id`
: `{{id 'name'}}` returns `<base>-<name>`. The base is `pd-` and the rendered component's id with `/` turned into `-`; the name is lowercased, with anything outside `a-z0-9-` turned into `-`. The same name gives the same id within one instance.
: The first include of a partial under a given parent takes the parent's base, so a `<label for>` matches the `id` of an input across the include. Each further include of the same partial gets a base of its own, `pd-<partial>-<n>`.
: `base="<value>"` on an include seeds that instance's ids: with `base="email"`, `{{id 'input'}}` gives `email-input`.

`getId`
: The same as `id`.

`getLastId`
: The last id minted.

`getLastNumericId`
: The trailing digits of the last id, or `"0"`.

## Comparisons and logic

`eq`, `ne`
: `{{eq a b}}` is true when `a` and `b` are the same value and type, `===`; `{{ne a b}}` when they aren't. There is no conversion, so `{{eq 1 "1"}}` is false.

`lt`, `gt`, `lte`, `gte`
: Less than, greater than, less or equal, greater or equal, with JavaScript's `<`, `>`, `<=` and `>=` on the values as given. Two strings compare as text, so `"10"` is less than `"9"`; a number and a numeric string compare as numbers.

`and`, `or`
: True when both are truthy, or either is. They use two arguments, and a third is ignored.

`not`
: True when its argument is `false`, `0`, `""`, `null`, `undefined` or `NaN`.

`isdefined`
: True unless the value is `undefined` or `null`; `""`, `0` and `false` are defined.

`defaultValue`
: `{{defaultValue value fallback}}` gives `value`, or `fallback` when `value` is `undefined` or `null`. An empty string is kept.

`ifCond`
: `{{#ifCond a op b}}`, with `op` one of `==`, `===`, `!=`, `!==`, `<`, `>`, `<=`, `>=`, `&&` and `||`. Any other operator is false.

The comparisons take two arguments and ignore any more.

### Note

A missing argument is not an error. Handlebars passes its own options object in the argument's place, so `{{eq a}}` is false, `{{not}}` is false, `{{isdefined}}` is true, and `{{defaultValue x}}` with `x` unset renders `[object Object]`. Give every argument.

## `pd-image`

```hbs
{{#if image}}{{pd-image image alt=""}}{{/if}}
```

Writes an `<img>` for a field that holds the path of an image in the assets. The field's schema property needs an image slot, `x-pd-image`, with the widths and `sizes` to serve. This site's `components/grid-card` declares its image so, and shows it as decoration, with an empty `alt`:

```json
"image": {
  "type": [
    "string",
    "null"
  ],
  "x-pd-image": {
    "widths": [
      320,
      640
    ],
    "sizes": "(min-width: 44rem) 20rem, calc(100vw - 2rem)"
  }
}
```

`x-pd-image` goes on a property whose `type` is `"string"`, or a list that includes `"string"`, such as `["string", "null"]` for an optional image. Its `widths` are whole numbers above 0, in rising order, and its `sizes` is text without `"`; it takes no other keys. Else: `x-pd-image must be { "widths": [...], "sizes": "..." }: widths whole numbers above 0 in ascending order, sizes the <img> sizes value (with no double quote)`. On a property with no `type`, or whose types don't include `"string"`: `x-pd-image is only for a string property: the path of an image in the assets`.

The `<img>` gets a `srcset` of the slot's widths up to the image's own width (only its own width when every slot width is wider), the slot's `sizes`, `width` and `height`, `loading="lazy"` and `decoding="async"`. `loading="eager"` on the call changes `lazy`. An SVG is one file at its own size.

In the template
: A `SCHEMA_INVALID` error for a first argument that isn't a path, for `pd-slot` written by hand, for a field without `x-pd-image`, and for a call without `alt=`. So is a field the schema doesn't declare; Pattern Dump follows the field through `#each` items, `#with`, `../` and `@root`.

When it renders
: The render fails when there is no slot, `alt` is missing, the field is empty, the path is not an image in the assets (`{{pd-image}}: "<v>" is not an image in the assets`), or the image can't be served as variants. On a site page, it fails the page at the tag.

## Your own helpers

`helpers` in the config names a file or folder of helpers of your own, which a pattern package can bring too, in its `patternDump` field. They are registered after the built-ins: the packages' first, in package order, and the project's last, so a name registered later replaces an earlier one. A helpers module is either an object of name and function, or a registrar in Pattern Lab's style, given the Handlebars environment; a registrar that fails is logged and skipped. The [configuration reference](/reference/configuration/) has the `helpers` key.

A package's helpers must be JavaScript: a `.ts` file stops startup, `pattern package "<name>": its helpers are TypeScript (<path>), which Node does not load from an installed package. Ship compiled helpers: …`, and so does a folder with TypeScript and no `.js`. With both, the `.js` loads, and a warning names the TypeScript it skipped.

In `pd dev`, a change to a helper reloads it, and what is open. A helper that fails to load keeps its last good version, and the terminal and the open pages say so. A change to another file in a helper's folder, such as one it imports, asks for a restart.

## Helpers and data

A call with arguments to a helper nobody registered throws `Missing helper "<name>", called by <template> (line n, column m)`, naming the innermost template, the partial rather than the page. A bare `{{name}}` without arguments is not a helper call, and renders nothing.

A name that is a helper can hide a field of the same name:

A schema property named like a helper
: At any depth, through `properties` and `items`: a `SCHEMA_INVALID` error, `"<name>" is the name of a registered helper, so {{<name>}} would call the helper, not read this field`.

A data field a bare `{{name}}` hides
: At any depth: a `HELPER_SHADOW` warning, `{{<name>}} calls the helper "<name>", so the data's "<at>" is never read here: write {{this.<name>}} …`. Not repeated for a field the schema already reports.

A helper that writes to its data throws: a render's data is shared by every render, so it is read-only, and the message says so and where: `while rendering <component>. A render's data … is shared by every render, so it is read-only: copy a value before changing it (changed at …)`.
