---
title: Components
description: How Pattern Dump reads a component of your pattern library: ids and handles, variants, includes, the data cascade, and the schema as its contract.
layout: doc
order: 3
---

A component is a Handlebars template in your patterns folder, with the files of the same name beside it: its data, its docs and its schema. Your style guide is a folder of them, what other tools call a pattern library. [Component files](/reference/component-files/) lists every file and rule; this page explains how the parts fit together.

Pattern Dump gives each component two names, lets it have variants and include other components, and renders it with data from several places, in a fixed order. The schema holds all of it to account. It is the component's contract, and Pattern Dump checks each use of the component against it.

## Ids and handles

A component has two names, because it is named in two kinds of places. Its id is the template's path below the patterns root, without `.hbs`, so it reads like the folder you find it in. Links, messages and the workbench use the id. Its handle is what you write in a template or on a page, `{{> atoms-button }}` or `<pd-components-note>`. Pattern Dump makes it from the id's first and last segments, so a handle stays short however deep the folders go.

![Part of this style guide's patterns folder as a tree: atoms/button with button.hbs, button~icon.hbs and button~secondary.json, and molecules/search-field with search-field.hbs and, in a folder of its own, input/input.hbs. Beside each file, its id and its handle: atoms/button and atoms-button, atoms/button~icon and atoms-button~icon, atoms/button~secondary and atoms-button~secondary, molecules/search-field and molecules-search-field, molecules/search-field/input and molecules-input. Callout 1 is at the id atoms/button, 2 at the handle molecules-input, 3 at the id atoms/button~secondary.](#ids-and-handles "The id follows the folders, the handle keeps the first and last segments. A file named like its folder takes the folder's id (1), the folders between are dropped from the handle (2), and a variant keeps its name in both (3).")

A file named like its folder takes the folder's id (1): `atoms/button/button.hbs` is `atoms/button`. The folders between the first segment and the last are dropped from the handle (2): this style guide's search field keeps its input in a folder of its own, and includes it as `molecules-input`. A variant keeps its name after a `~`, in the id and the handle alike (3).

Numbers in front of a name, such as `00-` or `01_`, are dropped from the handle and kept in the id. So you can number folders to order them, and no include changes: `00-atoms/01-global/00-colors` is still `atoms-colors`. The catch is that two components can end up with one handle. In one patterns root that is a collision: the first by sorted path keeps the handle, and the other is left out of the tree with a `HANDLE_COLLISION` error naming both. Across roots, the project's component replaces a pattern package's. [Two components, one handle](/reference/component-files/#two-components-one-handle) has the details.

## Variants

A variant is the same component in another state, written as a file beside the template, `<name>~<variant>`. It comes in two kinds. A `.hbs` variant has markup of its own, as `atoms/button~icon` does. A `.json` variant has data only, laid over the base template, as `atoms/button~secondary` does: the same button with another label and look. A `.json` variant needs the base's `.hbs` to lay its data over; without one, Pattern Dump leaves it out and says so in the Console.

Either kind can have its own docs and schema beside it, by the same name. A variant included or previewed by its own id is its base rendered with it: the base's data with the variant's on top, and the base's template unless the variant has its own.

## Includes

A component uses another by including it with its handle. This style guide's search field is two includes and a status line:

```hbs
<form class="search-field" role="search">
  {{> molecules-input }}
  {{> atoms-button label=buttonLabel variant="primary" type="submit" }}
  <p class="search-field-status" role="status"></p>
</form>
```

The block form, `{{#> <handle>}}…{{/<handle>}}`, wraps content, which the included component puts in place with `{{> @partial-block}}`. A handle with a `~` is quoted: `{{> "atoms-button~secondary" }}`. Every include is also an edge in the include graph, which [Relationships](/concepts/relationships/) explains.

## The data cascade

A component renders with data from several places, one over the other, and the later one wins. For a component on its own, that is the global data, then its `.json`, then a variant's `.json`, then the data the render passes. Objects merge key by key; anything else, lists included, is replaced as a whole.

An include adds a layer of its own. The included component's `.json` is only its default: the context it is included in, with the include's arguments, goes over it.

![Two tables of the keys label, variant and type. On the left, atoms/button~secondary: global data, none in this style guide; atoms/button/button.json with Save, primary and button; button~secondary.json with Cancel and secondary; it renders with Cancel, secondary and button. On the right, atoms-button in molecules/search-field: button.json with Save, primary and button; the include and its arguments with Search, primary and submit; it renders with Search, primary and submit.](#data-cascade "Each row goes over the one above it, key by key. A variant keeps what it doesn't set from its base (left), and an include's arguments go over the included component's own data (right).")

On the left, `atoms/button~secondary` takes `label` and `variant` from its own `.json` and `type` from the base's. On the right, the search field includes the same button with `label=buttonLabel`, so the label is the field's own `buttonLabel`, "Search", and `type="submit"` replaces the default `button`.

The context counts as much as the arguments. A field of the including component wins over the included one's `.json` even when the include doesn't pass it, so a `type` in the parent's data becomes the child's `type`. A variant included by its handle gets its base's `.json` beneath its own. During a render the data is read-only: a helper that changes it throws.

Helpers and data share one set of names in a template. A schema property named like a registered helper is a `SCHEMA_INVALID` error, because `{{<name>}}` would call the helper instead of reading the field. A data key that a bare `{{<name>}}` hides behind a helper is a `HELPER_SHADOW` warning, which tells you to write `{{this.<name>}}`.

## The schema is the contract

Sample data shows what a component can look like. It doesn't say what the component needs. The schema does: `<name>.schema.json` is a JSON Schema for the component's data, with the keys it takes, their types, which of them are required and which values a key allows. That is the component's contract. Other tools call this its props.

This site's note promises a `heading` and a `text`, both strings, the text as markdown, and a `kind` that is `note` or `warning`:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Note",
  "description": "A short aside. On a page: <pd-components-note heading=\"…\">text</pd-components-note>.",
  "type": "object",
  "required": [
    "heading",
    "text"
  ],
  "x-pd-content": "text",
  "properties": {
    "heading": {
      "type": "string",
      "description": "One line, in bold: what kind of note it is (\"Note\", \"Warning\")"
    },
    "text": {
      "type": "string",
      "contentMediaType": "text/markdown",
      "description": "The note itself: the tag's content, as markdown"
    },
    "kind": {
      "type": "string",
      "enum": [
        "note",
        "warning"
      ],
      "default": "note",
      "description": "What kind of note: \"warning\" marks it with the warning colour"
    }
  }
}
```

Pattern Dump holds a component to its contract wherever it is used:

Its own data, at every render
: A name in the top-level `required` that is missing or `null` is an `UNFILLED_REQUIRED` error. A top-level value that doesn't match its `type` is a `SHAPE_MISMATCH` warning; nested properties aren't type-checked. Every variant's data is checked against the base's schema.

A component placed on a page
: A page that places `<pd-components-note>` is checked against the schema, and each problem is named with its file, line and column: a key the schema doesn't declare (with a did-you-mean), a key set twice, a required key missing, a wrong type, a value its `enum` doesn't allow. A key the page leaves unset is `null`, so the sample data never fills it on a page. A variant's tag, such as `<pd-components-note~warning>`, is checked against the variant's own schema, else the base's.

A component inside another
: A property with `x-pd-component` takes child tags of the component it names, and that component must have a schema.

A card
: `x-pd-card` names the component each page in a listing is checked against. It needs a schema too, and may declare only the fields Pattern Dump fills for a listed page, such as `route` and `title`.

A layout
: A page's frontmatter is checked against its layout's schema: every key a page sets, apart from those Pattern Dump reserves, must be declared there. Nothing is inferred from the layout's sample data.

So a component without a schema has nothing to be held to, and the site gives it no values. It can't be placed with values (`<id> has no schema, so it cannot be placed with values`), named by `x-pd-component`, or be a card, and a layout without one declares nothing, so a page can set none of its keys.

Where the contract is broken decides what fails. A problem on a site page fails `pd build`, and nothing is written. A component's own findings never fail the build, `UNFILLED_REQUIRED` included: `pd audit` fails on those, since it exits with 1 on any error. [Check your work](/guide/check-your-work/#what-fails-the-audit) shows the audit's side.

The recommendation here: give every component a schema, even one no page uses yet. The audit then checks its sample data from the start, and the day a page places it, the contract is already there. [Schema extensions](/reference/schema-extensions/) lists the `x-pd-` keys a schema can carry beyond JSON Schema.
