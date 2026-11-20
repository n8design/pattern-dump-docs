---
title: Themes
description: Theme files in Pattern Dump, the CSS theme switcher of the workbench, its swatches, and how live examples on site pages follow the page's theme.
layout: doc
---

A theme is a `<name>.theme.scss` file directly in a themes folder. Its name is the file name without `.theme.scss`. Sub-folders of a themes folder are not read.

## Theme files

Pattern Dump compiles theme files with Sass and autoprefixer. `@use` loads an installed package by its bare name, found in `node_modules` from the theme file's folder upward, or by a `pkg:` URL.

`pd dev` serves a theme's CSS at `/_pd/themes/<name>.css`. Asset references in it are rewritten as in component CSS. An edit of a theme's `.scss` in `pd dev` recompiles it and refreshes the open preview.

A theme fails to compile at startup
: `[dev-server] Theme compile error (<name>):`, followed by the error. Such a theme is served empty.

A theme fails to compile after an edit in `pd dev`
: `SCSS error: <error>` in the workbench, as a build error, and no `Theme compile error` warning. The theme keeps its last compiled CSS.

A theme is recompiled after an edit
: `[dev-server] Theme CSS updated: <name>`.

## Configuration

The [configuration reference](/reference/configuration/#themes) lists these keys with the rest of the config.

`themes`
: An object, with `themes.default` required and `themes.dir`, `themes.switch` and `themes.swatch` optional.
: Without `themes.default`: `missing required "themes.default"`. When another key in `themes` looks like a typo of it, the message adds `(found "themes.<key>": did you mean "themes.default"?)`.

`themes.dir`
: A string.
: The project's themes folder. Theme folders are the project's `themes.dir` first, then each package's `themes.dir`, in package order. A theme name found first hides a later one: the project's beats a package's, an earlier package's beats a later one's.
: Any other value: `"themes.dir" must be a string`.

`themes.default`
: A string.
: The theme every preview starts with. With no `themes` object, the default is the `default` of the first package, in package order, that has `themes`.
: Any other value: `"themes.default" must be a string`. A default that matches no theme warns: `[dev-server] themes.default "<name>" matches no theme; available: <a, b>`. With no theme folder at all: `[dev-server] themes.default "<name>" matches no theme; no theme folder is configured or provided by a package`.

`themes.switch`
: `"attribute"` or `"stylesheet"`.
: The switch is `"stylesheet"` when this key or any package with themes says so, else `"attribute"`. It applies to every theme, the packages' included.
: Any other value: `"themes.switch" must be "attribute" or "stylesheet"`.

`themes.swatch.slots`
: A list of strings, default `["--bodyBackground", "--themePrimary", "--accent"]`, required in a `themes.swatch` object.
: The custom properties the theme picker shows as swatches. Applies to the themes in the project's own `themes.dir`. At startup a package's themes use the default slots, whatever the config says. A theme that fails to compile at startup gets the project's slots, with no values.

## Switch modes

`"attribute"`
: Every theme stylesheet is linked into each preview. The theme picker sets `data-theme="<name>"` on the preview's `<body>`, or removes it.

`"stylesheet"`
: Only the active theme is linked, as `<link data-pd-theme="<name>">`, when there is one. The theme picker changes that link's `href`. With no active theme, no theme is linked and the picker has no link to change.

In both modes every preview's `<body>` carries `data-theme="<theme>"` when there is a default theme or a known `?theme=`. That theme is the default, or the theme a preview URL's `?theme=<name>` names when it is a known theme. `?theme=` with an unknown name gives the default. With neither, the `<body>` has no `data-theme`.

In a preview, themes are linked after the base layer and `assets.css`, before the component CSS.

## Swatches

A swatch value comes from compiled rules whose selector is exactly `[data-theme=<name>]`, quoted or not. `:root` and every other selector are not read. A theme that sets its values on `:root` alone shows no swatches unless it has a `.theme.json`.

When `<name>.theme.json` exists beside the `.theme.scss`, it is the only swatch source, with the slots as its keys without `--` (`bodyBackground` for `--bodyBackground`). A slot missing from it shows no colour. A `.theme.json` that isn't valid JSON warns `[pd] extractThemeTokens: failed to parse <path>:` and the CSS is read instead.

After an edit of a theme's `.scss` in `pd dev`, its swatches are read again with the project's slots, also for a linked package's theme. An edit of a `.theme.json` alone doesn't refresh the swatches.

## The theme picker

The picker applies a theme to the preview on the Stage and to every preview in a folder's gallery. With no theme at all it reads "(no theme)".

The choice is stored in the browser's `localStorage`. Until one is picked, the project's default applies, and a later change of the default carries through.

`?theme=<name>` on a workbench address selects that theme once, when it names a known theme. That theme is then stored, and the parameter is removed from the address. A `?theme=` with an unknown name stays in the address and changes nothing.

## Static build

`pd build` writes every theme's CSS into the workbench it builds. With `build.workbench: false` no theme CSS is written.

## Code blocks

Code is highlighted with two fixed syntax themes, `pd-monokai-light` in light mode and `pd-mcm-dark` in dark mode, which are not configurable. Their colours decide each token's kind. A token carries the class `pd-code-<kind>`, where `<kind>` is `comment`, `string`, `keyword`, `storage`, `constant`, `value`, `tag`, `attribute`, `function`, `support`, `property`, `parameter` or `expression`, and plain text carries no class. The block is `<pre class="shiki">`, with no inline style.

`/_pd/code.css` colours the tokens: it sets each kind's custom property, `--pd-code-<kind>`, on `:root` to `light-dark()` of Pattern Dump's light and dark colours, and colours `.shiki` with `--pd-code-text` and each `.pd-code-<kind>` with its property. All of it is in the cascade layer `pd-code`, so any rule of a site's wins: a site that wants its own colours sets the properties from its tokens. Pattern Dump links `/_pd/code.css` into a site page with a code block, as its first stylesheet, before the skin's head, and `pd build` writes it into the site's `_pd/`, with or without the workbench. The workbench links it too, and its code-block ground keeps the syntax themes' own background colours.

Pattern Dump's default colours reach 4.5:1 contrast against its own block grounds, in the workbench and on site pages that keep the defaults. On a site that sets its own values, those decide.

Until 0.8.0, tokens had generated classes such as `__shiki_17h8wv`, and `/_pd/shiki.css` carried the token colours. It now holds only the workbench's code-block frame: a site that linked it for the colours links `/_pd/code.css` instead.

## Themes on site pages

Pattern Dump never sets a theme on a site page: that is the skin's. Pattern Dump writes a theme-sync script into a page with a live example (`class="doc-example"`) when the project has themes, and none into a page without one or a project without themes.

The page's theme is `data-theme` on `<html>`, else on `<body>`. Only a value that names a known theme reaches the examples. Any other value, or none, puts each example back on the theme it was built with.

With `"attribute"`, the script sets `data-theme` on the example's `<body>`. With `"stylesheet"`, it points `link[data-pd-theme]` at `<name>.css`, keeping the base path and any `?v=` stamp. Examples are themed when they load, and again whenever `data-theme` on `<html>` or `<body>` changes.

Without JavaScript an example keeps its built theme, the default. The default follows the viewer's light or dark setting when that theme does, for example with `color-scheme: light dark`.

## Starter themes

The starter's `light` and `dark` themes declare `color-scheme: light` and `color-scheme: dark`. `pd init` with a site (`--with-site`) and the system-theme answer (yes by default) adds `themes/system.theme.scss`, with `color-scheme: light dark` and its values in `light-dark()`, and sets `themes.default: "system"`. Without a site, or with a no to the system theme, the default is `"light"`.
