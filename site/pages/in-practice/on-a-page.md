---
title: On a page
description: What a page of this site can hold, from a live example to highlighted code, each rendered from this site's own style guide, with the markdown that made it.
layout: doc
order: 1
---

Besides text, a page's markdown can hold anything from a live example to highlighted code. Each section shows one, rendered from this site's own style guide and assets, followed by the markdown that made it.

## A live example

A `pattern` fence shows a live example: the component's preview from the workbench, a document of its own. Its own styles render it, and nothing on this page can restyle it:

```pattern components/note
```

In this page's markdown, that is one fence with the component's slash id:

````md
```pattern components/note
```
````

Below the preview, Pattern Dump adds a list of the component's variants, if it has any, then its slash id and a link into the workbench. If no component has that slash id, Pattern Dump marks the spot and fails the build.

## A component with your values

A `pd-` tag places a component with the values you give it. Pattern Dump checks them against the component's schema, `styleguide/src/patterns/components/note/note.schema.json`, before it shows the page:

<pd-components-note heading="Note">
The note needs a heading. Without `heading="Note"`, Pattern Dump reports the missing value with the file, line and column of this tag.
</pd-components-note>

In this page's markdown, that is the tag with the component's handle after `pd-`, its values as attributes, and its text inside:

```md
<pd-components-note heading="Note">
The note needs a heading. Without `heading="Note"`, Pattern Dump reports the missing value with the file, line and column of this tag.
</pd-components-note>
```

## A link into the workbench

A link whose address starts with `pattern:` leads to a component in the workbench: [the note in the workbench](pattern:components/note). When it builds this site, Pattern Dump writes it as `/workbench/components/note`, from `site.workbenchUrl` in the config. In `pd dev`, it leads to the workbench that `pd dev` runs.

```md
[the note in the workbench](pattern:components/note)
```

For a link to a component that doesn't exist, Pattern Dump fails the page, as it does for an unknown fence.

## An image with a caption and a dark version

An image from `/assets/` with a title on a line of its own becomes a figure, and the title becomes its caption. A file of the same name with `-dark` added, next to it, is the version for dark mode. Pattern Dump writes both into a `<picture>`, and the browser picks the one for your setting:

![The Configuration page of this site at 1280 wide: the header with its five sections, the page title, a highlighted code block with its Copy button, and On this page on the right.](/assets/screenshots/site-page.webp "A page of this site. Switch your system to dark mode to see the dark version.")

```md
![The Configuration page of this site at 1280 wide: the header with its five sections, the page title, a highlighted code block with its Copy button, and On this page on the right.](/assets/screenshots/site-page.webp "A page of this site. Switch your system to dark mode to see the dark version.")
```

The markdown names only `site-page.webp`. Pattern Dump finds `site-page-dark.webp` beside it, and makes WebP versions of both in several widths.

## A symbol image

An image whose address is `#` and a name draws an SVG from the `symbols/` folder of the assets. Its colours are the site's colour tokens, so it follows light and dark mode with the page:

![Left to right: the files of atoms/button (button.hbs, button.json, button.schema.json); the button rendered in the workbench, 120 wide; and a site page with the same button in it.](#how-pattern-dump-works "A component's files (1) render in the workbench (2) and on a site page (3) with the same markup (4).")

```md
![Left to right: the files of atoms/button (button.hbs, button.json, button.schema.json); the button rendered in the workbench, 120 wide; and a site page with the same button in it.](#how-pattern-dump-works "A component's files (1) render in the workbench (2) and on a site page (3) with the same markup (4).")
```

`#how-pattern-dump-works` is `styleguide/assets/symbols/how-pattern-dump-works.svg`. Pattern Dump puts each symbol into the page once, however often the page shows it. Pattern Dump fails a page whose symbol uses a colour other than a token, `currentColor`, `none` or `transparent`.

## Code

Pattern Dump highlights a fenced block that names a language it knows, such as `json`, `scss`, `ts` or `hbs`. It gives each kind of token but plain text a class, `pd-code-<kind>`, and links `/_pd/code.css`, which colours them for light and dark mode. A script of Pattern Dump's adds the Copy button, and the style guide's `code-block.scss` styles it:

```json
{
  "kind": "note",
  "heading": "Note",
  "text": "<p>Something worth knowing, next to what it is about.</p>"
}
```

In this page's markdown, that is a fence with `json` after the backticks:

````md
```json
{
  "kind": "note",
  "heading": "Note",
  "text": "<p>Something worth knowing, next to what it is about.</p>"
}
```
````

The block is `note.json`, the note's sample data in the style guide. A page without code doesn't link `/_pd/code.css` at all.

To give a component of your own a schema, so a page can place it with values like the note, see [Add a component](/guide/add-a-component/).
