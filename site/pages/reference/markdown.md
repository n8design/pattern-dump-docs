---
title: Markdown
description: The markdown Pattern Dump reads in component docs and site pages: live examples, source blocks, pattern: links, placed components, code highlighting and definition lists.
layout: doc
---

````md
```pattern atoms/button~secondary
```

```src-template atoms/button
```

See [the button](pattern:atoms/button).

<pd-atoms-badge label="Beta" tone="info" />
````

Pattern Dump renders markdown in two places: a component's documentation, its `.md` file, which the workbench's Docs tab shows, and a site page's body. Most of what follows works in both; placed components (`pd-` tags) and the table of contents work on site pages only, and a live example takes a different form in each.

## Links and HTML

In a component's documentation, raw HTML is escaped, and a bare URL isn't turned into a link. A link or an image is kept only when its address starts with `http:`, `https:`, `mailto:` or `tel:` (in any case), with `.`, `#` or `/`, or with `pattern:`. Anything else, a bare relative path such as `sibling.md` included, stays as literal text.

## Live examples

A fenced block whose info is `pattern <id>` shows the component, or a variant with `~<variant>` after the id. The id can also go on the block's first line, after a bare `pattern`.

In the workbench's Docs
: The component's rendered HTML, inline in a `<div class="doc-example">`, styled by the workbench. A component or variant that doesn't exist renders `<p class="doc-error">[pattern: <spec> · render error]</p>`, and a block with no id an empty code block.

On a site page
: A `<figure class="doc-example">` with the component's preview in an `<iframe src="/preview/<id>" title="<id>" loading="lazy">`. Under it, a list of its variants, `ul.doc-example-variants`, with the base first as `default` and `aria-current` on the one shown, left out without variants. Last, a `<figcaption>` with the id and `Open <id> in the workbench`. The workbench link is the workbench's address plus the id (and `#<variant>`): in `pd dev` the same process's workbench, in `pd build` `site.workbenchUrl`.

On a site page, a component or variant that doesn't exist marks the spot and is a problem of the page, so the build fails: `pattern <spec>: there is no such component`.

### Height

The frame starts at the base component's `x-pd-example-height`, one value for every variant: a whole number above 0, else `x-pd-example-height must be a whole number of pixels above 0 (got …)`. An invalid value, or a schema that can't be read, marks the example and fails the page.

In `pd dev`, an example whose content is shorter than its declared height is a warning, in the terminal and as a notice: `<id>: its live example is declared <n>px tall (x-pd-example-height), but its content is <m>px. … declare at most <m>.` Content as tall as the frame says nothing.

### Themes

A site page with a live example gets a script that keeps the examples on the page's theme, when the project has themes. It reads `data-theme` on `<html>`, else on `<body>`. Only a value that names one of the project's themes reaches a preview; any other value, or none, puts the preview back on the theme it was built with.

With `themes.switch: "attribute"` the script sets `data-theme` on the preview's `<body>`; with `"stylesheet"` it changes the file name in the preview's `link[data-pd-theme]`, keeping the base path, folder and stamp. Previews are themed when they load and on every change of `data-theme` on `<html>` or `<body>`; a frame that hasn't loaded yet is left alone. [Themes](/reference/themes/#themes-on-site-pages) has the rest.

## Source blocks

`src-template <id>`
: The base component's `.hbs`, highlighted as Handlebars. A `~<variant>` is ignored, so an own-markup variant's template can't be shown. A component without a template, or an unknown id: `[src-template: <spec> · no template file]`.

`src-data <id>`
: The component's `.json` as written. For `<id>~<variant>`, the base's and the variant's data merged, without the global data. No data file: `[src-data: <spec> · no data file]`; a variant that doesn't exist: `[src-data: <spec> · unknown variant]`.

`src-html <id>`
: The rendered HTML, escaped and highlighted. A failed render: `[src-html: <spec> · render error]`.

On a site page, these errors are only marked in the HTML: unlike a `pattern` block, they are not problems of the page and don't fail the build.

## `pattern:` links

`[text](pattern:<id>)` and `[text](pattern:<id>~<variant>)` link to a component in the workbench. The link gets the class `pattern-link` and `data-pattern-id` (and `data-variant`). Its address is `/<id>#<variant>` in the workbench, and `<workbenchUrl><id>#<variant>` on a site page.

A target that doesn't exist, variant included, gets `href="#"`, the class `pattern-link--unresolved` and `aria-disabled="true"`. On a site page it is a problem too: `pattern:<id>: there is no such component`.

## Code blocks

Every code block, fenced or indented, is wrapped in a `div.shiki-container` with the raw code in `data-raw`. In the workbench it carries a Copy button, `<button class="copy-btn" type="button" aria-label="Copy source">Copy</button>`; on a site page the markup has none, and the page's script adds one.

These languages are highlighted, each under any of its names:

- `handlebars`, `hbs`
- `html`
- `css`
- `scss`
- `json`
- `javascript`, `js`
- `typescript`, `ts`
- `markdown`, `md`
- `bash`, `sh`, `shell`, `zsh`, `shellscript`
- `console`, `shell-session`, `shellsession`

Anything else, `text` included, is a plain `<pre class="shiki shiki-plain" tabindex="0">`.

In component docs and page bodies, the whole info string is the language, so `js title=x` is a plain block; only the content of a placed component, and other markdown, uses the first word. The colours are in [Themes](/reference/themes/#code-blocks).

## Headings

In the workbench's docs, headings get no `id`. On a site page, every heading from `h1` to `h6` gets an `id`: a GitHub-style slug of its text, made unique across the page and the layout's own ids, and `section` when the slug is empty.

## Definition lists

A term on its own line, then each definition on a line that starts with `:` or `~` and a space, renders as `<dl>`, `<dt>` and `<dd>`, without classes. This works in every markdown Pattern Dump renders: component docs, a page's body, and a placed component's markdown content. Without a blank line between term and definition, the text sits straight in its `<dd>`; with one, in a `<p>` inside it. A term is not a heading and gets no anchor.

## Placed components

On a site page, a `pd-` tag places a component with values of your own. In a component's documentation, `pd-` tags are escaped and shown as text.

```md
<pd-atoms-badge label="Beta" tone="info" />
```

### The tag

A tag's name is `pd-` and the component's handle: lowercase letters, digits and hyphens, optionally with `~<variant>`. A block starts at the beginning of a line, at most three spaces in, also inside a list item or a quote, and runs to its root tag's closing tag, blank lines included. In the middle of a paragraph it is text; indented four spaces, it is a code block. `<pd-x />` closes itself.

Attribute values may be in double quotes, single quotes or none. An attribute's name maps from kebab-case to camelCase (`per-view` is `perView`). An attribute without a value is `true` for a boolean, and otherwise `<where> needs a value: only a boolean can be written without one`.

An attribute's text is turned into the declared type only: a number (`-?\d+(\.\d+)?`), a whole number (`-?\d+`), or exactly `true` or `false`. `enum` is checked after that (`must be one of … (got …)`), and an object or `null` type can't be written as text.

A component in a tag needs a schema; a variant's tag is checked against the variant's own schema, else its base's. Every declared key the tag leaves out is `null`, at every level; on a page, a component never renders with its sample data ([Layouts](/reference/layouts/#sample-data)).

### Child tags and content

A child `pd-` tag goes into the property whose `items` (a list) or value (one) has `x-pd-component` naming the child's component. Otherwise: `<pd-c> cannot be placed inside <pd-p>: it takes <…>`, or `it takes no child components`. A single slot filled twice: `<pd-p> takes one <pd-c>`.

Text between the tags fills the property that `x-pd-content` names, dedented to its least indented line. A `text/markdown` property is rendered as block markdown with HTML escaped; any other is plain text. Without `x-pd-content`: `<pd-x> takes no content text, found "<first 40 characters>"`.

### Regions

`region="<name>"` on the root tag puts the component in a region of the layout. It is Pattern Dump's, never a value of the component: an empty one is an error, and a component that declares a `region` property can't take it. It wins over the schema's `x-pd-region`.

### Problems

Every problem is reported with the file, line and column, and fails the page:

A tag that can't be read
: `<pd-x> is never closed`, `</pd-y> closes <pd-x> (opened at <l>:<c>)`, `</pd-y> closes nothing`, or `<pd-x> has something it cannot read before its closing >`.

A component that doesn't exist
: `there is no component "<handle>": did you mean <pd-…>?`

A component without a schema
: `<id> has no schema, so it cannot be placed with values`.

An attribute the schema doesn't declare
: With a did-you-mean when a declared key is close. An attribute set twice, a required one missing, a value of the wrong type, and a list where none is allowed are problems too.

A schema Pattern Dump can't use
: `<id> cannot be placed: its schema (<file>, <pointer>): <message>`, for a misused schema extension or a field named like a helper, in the component or one it names.

Unescaped output
: The placed component's templates, and those they include, may output unescaped (`{{{x}}}`, `{{& x}}`) only a name some schema of the placement declares `text/markdown`: `<id> outputs "<name>" unescaped ({{{<name>}}}) at <file>:<line>:<col>, which only a text/markdown property may be`.

A render error of a placed component
: A problem of the page at the tag, never a server error.

## Table of contents

`<pd-toc>` on a site page places the skin's `components/toc` with `items: [{ text, href, level }]`. Empty, it lists the page's `h2` and `h3` headings. With content, the content is a markdown list of single links, nested by level. It takes no attribute but `region`, and no child tags.

A list item that isn't a single link, or an `#anchor` that is no heading on the page (with a did-you-mean), is a problem. Without `components/toc`, the page fails: `<what> places the table of contents, which is the skin's components/toc, and the skin has none: add it (it gets items: [{ text, href, level }])`.
