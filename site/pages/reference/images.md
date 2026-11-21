---
title: Images
description: How Pattern Dump serves images: WebP image optimization with responsive srcset variants, images in a page's markdown with captions and dark versions, and symbol images.
layout: doc
---

```md
![The workbench with its four regions](/assets/screenshots/workbench-overview.webp "The workbench of this site's style guide")
![How a page reaches its layout](#a-page-and-its-layout "A page and its layout")
```

Pattern Dump places an image in one of three ways. A template places a raster image from a field with `{{pd-image}}`, in the sizes its schema's slot names. A page's markdown places one from the assets with `![Alt](/assets/…)`, in the sizes its layout names. And a drawing in a `symbols/` folder is placed with `![Alt](#name)`, inlined, in the page's colour tokens. Raster images are served as WebP variants in several widths.

## Image slots

A template places an image from a field with `{{pd-image <field> alt=…}}`, and the field's schema property names its slot with `x-pd-image`: the widths to make and the `<img>`'s `sizes`. [Helpers](/reference/helpers/#pd-image) has the helper and its errors.

`x-pd-image`
: On a property whose `type` is `"string"`, or a list that includes `"string"`, such as `["string", "null"]` for an optional image: `{ "widths": [...], "sizes": "..." }`. `widths` is a list of whole numbers above 0, in rising order; `sizes` is text without `"`. No other keys.
: Anything else: `x-pd-image must be { "widths": [...], "sizes": "..." }: widths whole numbers above 0 in ascending order, sizes the <img> sizes value (with no double quote)`. On a property with no `type`, or whose types don't include `"string"`: `x-pd-image is only for a string property: the path of an image in the assets`.

The `<img>` gets the largest variant as `src`, a `srcset` of the slot's widths up to the image's own width (its own width alone when every slot width is wider), the slot's `sizes`, the largest variant's `width` and `height`, `loading="lazy"` (or `eager`, with `loading="eager"`) and `decoding="async"`.

An SVG in the assets is one file at its own size. An SVG with no `width` and `height` and no `viewBox` can't be placed: `… is an SVG with no width and height and no viewBox, so its size can't be known: …`.

## Images in a page's markdown

On a site page, `![Alt](/assets/<path>)` places an image from the assets. A raster image is written like an image slot's, in the widths the page's layout names with `x-pd-prose-images` at the top of its schema:

`x-pd-prose-images`
: `{ "widths": [...], "sizes": "...", "eager": <n> }`, with `eager` a whole number from 0, default 0.
: The first `eager` images from the assets load at once with `sizes`; the others load lazily, with `sizes="auto, <sizes>"`. An image served as a single file gets no `sizes` or `srcset` but still counts toward `eager`; an image skipped earlier, without alt text, outside `/assets/`, not found or unavailable, does not.

Images outside `/assets/` are left as the markdown writes them.

### Captions

An image from the assets with a title, on a line of its own, `![Alt](/assets/photo.jpg "Caption")`, is a `<figure class="doc-figure">` in place of its paragraph, with the title as its `<figcaption>`, escaped, and no `title` attribute on the image. In a line of text, the title stays the image's `title`.

### Dark versions

A file named `<name>-dark.<ext>` beside an image from the assets makes the image a `<picture>`: a `<source media="(prefers-color-scheme: dark)">` with the dark file, in the same widths as WebP variants for a raster image, with its own `width` and `height`, and the light image as the `<img>`. With a caption, the `<figure>` wraps the `<picture>`. `pd build` writes the variants of both. A `-dark` file named in the markdown itself shows alone.

### Problems

An image without alt text
: `the image <src> has no alt text: write what it shows between the brackets; a decorative image goes in through a component, with alt=""`. Any markdown image, not only those from the assets.

A raster image on a layout without a slot
: `the image <src> needs its layout's slot for prose images: <layout> declares no x-pd-prose-images`.

An image under `/assets/` that isn't there
: `the image <src> is not an image in the assets`.

A dark version that can't be used
: `the image <src>: its dark version <dark src> can't be used: <reason>`.

## Symbol images

A symbol image is an SVG drawing in a `symbols/` folder of an asset folder, placed on a site page by its name, inlined in the page and coloured by the page's tokens. Every `.svg` directly in `symbols/` is a symbol, named by its file name without `.svg`; subfolders are not read. When two asset folders have a symbol of the same name, the first wins, the project's before the packages'.

```md
![Alt](#name)
![Alt](#name "Caption")
```

`![Alt](#name)` is `<svg class="doc-image" role="img" aria-label="<Alt>" viewBox="…" width="…" height="…"><use href="#img-<name>"/></svg>`. With a title, on a line of its own, it is a `<figure class="doc-figure">` holding that `<svg>` and a `<figcaption>`, in place of its paragraph. A page that draws symbols gets one hidden sprite as the first thing in its `<body>`, with one `<symbol id="img-<name>">` for each symbol it draws, once each, in the order first drawn.

### The file

A symbol's name is letters, digits, `-` and `_`, starting with a letter or digit. Its size is its root's `width` and `height` when both are plain numbers, else the third and fourth numbers of its `viewBox`, rounded up.

Colours, in `fill`, `stroke`, `stop-color`, `color`, `flood-color` and `lighting-color`, as an attribute, in a `style` attribute or in a `<style>` rule, may only be `var(--color-…)`, `currentColor`, `none`, `transparent` or `url(#…)`.

A `<style>` may hold only simple class rules, `.name { … }`, of presentation properties such as `fill`, `stroke`, `opacity` and the font properties. Each declaration becomes an attribute on the elements with that class, and the `<style>` and every `class` attribute go.

Ids are made unique on the page: the symbol's own is `img-<name>`, and each id inside the file becomes `img-<name>--<id>`, with every `url(#…)` and `#` link inside the root `<svg>` changed to match.

Removed, with one warning per file (`<file>: removed <list>`): `<script>`, `<foreignObject>`, `<image>`, every `on…` attribute, and an `href` or `xlink:href` that doesn't start with `#`. `<title>` and `<desc>` are removed without a warning.

### A source that can't be used

A bad name
: `its name can't be a symbol's: use letters, digits, "-" and "_", starting with a letter or digit`.

No `<svg>`
: `it has no <svg> element`.

No size
: `it has no viewBox and no width and height, so its size can't be known`.

A colour that isn't a token
: `<el> <prop>="<value>" is not a colour token: write var(--color-…) or currentColor (or none, transparent)`; in a `style` attribute, `<el> style: <prop>="<value>" is not a colour token: …`.

A `<style>` Pattern Dump can't turn into attributes
: Another rule or selector: `its <style> may hold only simple class rules (.name { fill: … }), not …`. Invalid CSS: `its <style> isn't valid CSS: <message>`. A property that isn't a presentation attribute: `its <style> rule <selector> sets <prop>, which isn't a presentation attribute`, or `a nested rule`. `!important`: `its <style> rule <selector> uses !important`.

### On the page

A symbol image is a problem of the page, with its line, `<page>:<line>: the image #<name> …`, and fails it in `pd dev` and `pd build`:

Without alt text
: `has no alt text: write what it shows between the brackets; …`.

A symbol no asset folder has
: `is not a symbol: there is no <name>.svg in an asset root's symbols/ folder`.

A source that can't be used
: `: symbols/<name>.svg can't be used: <reasons>`.

A caption on an image that isn't alone
: `: a caption needs the image on a line of its own`.

### The standalone file

Each symbol is also served as a file of its own at `/_pd/symbols/<name>.svg`, and `pd build` writes it as `_pd/symbols/<name>.svg`. The file declares each `--color-*` token the symbol uses on `:root`, the light values first, then the dark ones in `@media (prefers-color-scheme: dark)`. `currentColor` becomes `var(<token>)`, the token that `assets.symbols.currentColor` names.

`assets.symbols.currentColor`
: The colour token `currentColor` becomes in the standalone file: a name such as `--color-text`, the default. Else: `"assets.symbols.currentColor" must be a colour token's name, such as "--color-text"`.

The token values come from the compiled base layer, `/_pd/base.css`, never from Sass: the `--color-*` declared on `:root` or `html`, `light-dark(a, b)` as light `a` and dark `b`, and the dark values in `@media (prefers-color-scheme: dark)`. A token the base layer doesn't have: `<token> is not in the base layer`; one it can't resolve: `<token> can't be resolved from the base layer: <why>`. The route then answers 500, and `pd build` stops.

## Variants and encoding

Raster images are served as WebP variants, oriented by their EXIF data, never enlarged, without metadata. A variant's address is `/_pd/images/<name>.<key>.<width>.webp`, served with `Cache-Control: public, max-age=31536000, immutable`; its key is a hash of the source, the format, the width, the quality, the effort and sharp's version. An unknown hash, a width beyond the source's or a malformed address answers 404.

`images.quality`
: WebP quality, a whole number from 1 to 100. Default: 75. Else: `"images.quality" must be a whole number from 1 to 100 (WebP quality)`.

`images.effort`
: WebP effort, a whole number from 0 (fastest) to 6 (smallest). Default: 4. Else: `… must be a whole number from 0 to 6 (WebP effort: 0 fastest, 6 smallest)`.

`site.images`
: The same two keys, for the site's images.

Variants are cached in `node_modules/.cache/pattern-dump/images/`, and a full `pd build` sweeps every cached variant it didn't write.

Without sharp, `pd dev` and `pd audit` show the originals at their size and warn once; in `pd build` the image is unavailable, and the page fails with sharp's error.

## The image check

Every `<img>` in a page's body and layout is checked:

Size
: An `<img>` without `width` and `height`, an external one too: `<where>: <img src="…"> has no width and height, so the page shifts when it loads: give both, or place it with {{pd-image}}`.

Raster
: A raster `src` or `srcset` file (`.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.avif`, `.tif`, `.tiff`, or a raster `data:` address) that isn't one of Pattern Dump's variants: `… is a raster image served as it is: place it with {{pd-image}} in a template, or as a markdown image in a page, so it gets its WebP variants`. SVG is exempt.

External
: An address with `//`, with or without a scheme: `… is an external image: Pattern Dump can't make WebP variants of it, so it is served as it is`.

Size and raster findings fail the page in `pd build` and are warnings in `pd dev`; external images are notes in both. `<where>` is the page's file for the body, the layout's id for the layout. `og:image`, `twitter:image`, icons and CSS `url()` are not checked.
