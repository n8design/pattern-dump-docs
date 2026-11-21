---
title: Schema extensions
description: Every x-pd JSON Schema extension Pattern Dump reads: where each may appear in a component's schema, the values it takes, and its errors.
layout: doc
---

```json
{
  "type": "object",
  "properties": {
    "sites": {
      "type": "array",
      "items": {
        "x-pd-component": "components/site-card"
      }
    }
  }
}
```

A component's schema, `<name>.schema.json`, is JSON Schema, with keys of Pattern Dump's own that start with `x-pd-`, such as this site's `components/site-cards`, whose `sites` each take a `components/site-card`. Each key has its place: at the schema's top, or on a property. A key in the wrong place, or an `x-pd-` key Pattern Dump doesn't know, is a `SCHEMA_INVALID` error, `"<key>" is not a schema extension Pattern Dump knows (x-pd-card, x-pd-component, x-pd-content, x-pd-example-height, x-pd-image, x-pd-layout, x-pd-preview, x-pd-prose-images, x-pd-query, x-pd-region, x-pd-regions, x-pd-toc, x-pd-view)`. Other `x-` keys are ignored.

## At the schema's top

`x-pd-content`
: Names the top-level property that a placed component's content text fills, and a layout's page markdown. It must be a declared property, `… which is not a declared property`, of type string, `… which is not a string`. See [Markdown](/reference/markdown/#child-tags-and-content).

`x-pd-example-height`
: A whole number above 0: the CSS pixel height a live example's frame on a site page starts at, for the component and every variant. See [Markdown](/reference/markdown/#height).

`x-pd-layout`
: A layout name, lowercase letters, digits and hyphens: makes a component in `pages/` or `templates/` a layout. In any other folder, on a component in `layouts/`, or with one name for two layouts, it is a `SCHEMA_INVALID` error at `#/x-pd-layout`. See [Layouts](/reference/layouts/#what-is-a-layout).

`x-pd-preview`
: `"full"` or `"centered"`: how the component is previewed. Anything else: `x-pd-preview must be "full" or "centered" (got …)`. See [Component files](/reference/component-files/#preview-layout).

`x-pd-prose-images`
: On a layout: `{ "widths": [...], "sizes": "...", "eager": <n> }`, the slot for the images in a page's markdown. See [Images](/reference/images/#images-in-a-pages-markdown).

`x-pd-region`
: The region the component goes into when it is placed on a page: a region's name, a string. Else: `<id>: "x-pd-region" is a region's name, such as "sidebar"`. Checked when placed. See [Layouts](/reference/layouts/#regions).

## On a property

`x-pd-card`
: On a list, or a property with no `type` such as `page.children`: names the component each listed page is checked against, an existing component with a schema. See [Collections and queries](/reference/collections-and-queries/#cards).

`x-pd-component`
: On a property or its `items`: names the component a child `pd-` tag places there, an existing component with a schema. Else: `x-pd-component must name a component`, `… names "<id>", which is not a component`, or `… which has no schema, so it cannot be placed with values`.

`x-pd-image`
: On a property whose `type` is `"string"`, or a list that includes it: `{ "widths": [...], "sizes": "..." }`, the image slot that `{{pd-image}}` fills. `widths` are whole numbers above 0, in rising order; `sizes` is text without `"`; no other keys. Else: `x-pd-image must be { "widths": [...], "sizes": "..." }: widths whole numbers above 0 in ascending order, sizes the <img> sizes value (with no double quote)`, or `x-pd-image is only for a string property: the path of an image in the assets`. See [Images](/reference/images/#image-slots).

`x-pd-query`
: On a sub-key of a layout's `page`: an object whose keys are among `pages`, `collections`, `categories`, `tags`, `match`, `sort`, `order`, `limit` and `view`, with `view` naming a component in `views/`. The values are checked against the site. See [Collections and queries](/reference/collections-and-queries/#queries).

`x-pd-regions`, `x-pd-toc`
: On a layout's `page.regions`, which may hold only these two and `description`. `x-pd-regions` is a list of names, lowercase letters, digits and hyphens starting with a letter, with no repeats and none of `header`, `footer`, `nav` and `main`; `x-pd-toc` is `true` or `false`. See [Layouts](/reference/layouts/#regions).

`x-pd-view`
: On a layout's `page.listing`: names `views/<name>`, with no `/` or `~` in the name. See [Collections and queries](/reference/collections-and-queries/#listing-views).

`contentMediaType`
: Not an `x-pd-` key, but read the same way: only `"text/markdown"`, and only on a string property. Such a property is rendered as markdown.

## Placeable components

A schema that uses `x-pd-component`, `x-pd-content` or `contentMediaType` makes its component placeable, and its template is then checked when it renders: it may output unescaped (`{{{x}}}`) only its `text/markdown` properties, else `the template outputs "<x>" ({{{x}}}) unescaped at <l>:<c>, which only a text/markdown property may be`. `x-pd-card`, `x-pd-query`, `x-pd-example-height` and `x-pd-prose-images` don't make a component placeable.
