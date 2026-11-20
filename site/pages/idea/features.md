---
title: What it does
description: What Pattern Dump does, one line per feature: a design system documentation tool with a live workbench, checks on every component, a site built from your components, and a static build.
layout: doc
---

What does Pattern Dump do for a design system? Each line below names one thing, and links to the page that explains it where there is one.

## The workbench

Live previews
: Every component and every variant in a preview of its own, while `pd dev` runs. [Run the workbench](/guide/run-the-workbench/)

Theme picker
: Switches every preview between your themes, with the swatches it reads from each theme. [Switch themes](/guide/run-the-workbench/#switch-themes)

Colour-vision simulation
: Protanopia, deuteranopia, tritanopia and achromatopsia on the preview, at a severity you set. [Simulate colour vision](/guide/run-the-workbench/#simulate-colour-vision)

Reload on save
: In `pd dev`, a saved theme, global data or helper reaches the open preview without a restart.

## Components

Handlebars and JSON
: A component is a Handlebars template with its data, a schema for that data and its documentation in markdown, side by side. [Add a component](/guide/add-a-component/)

Variants
: A file beside the template, `<name>~<variant>`: other data for the same template, or markup of its own. [A variant](/guide/add-a-component/#a-variant)

Documentation from the component
: Live examples and source in a component's docs, rendered from the component itself. [Live examples and source](/guide/add-a-component/#live-examples-and-source)

Relationships
: Which components a component includes, and which include it. [Relationships](/concepts/relationships/)

Your helpers
: Handlebars helpers of your own, also in the form Pattern Lab uses.

## Styles and themes

A stylesheet per component
: Styles at the same path as the component's template, linked into its preview. [Style a component](/guide/style-a-component/)

The base layer
: Rules no single component owns, linked first in every preview once `documentBase` names them. [A rule in the base layer](/guide/style-a-component/#a-rule-in-the-base-layer)

Themes
: Theme files compiled with Sass, switched by an attribute or by a stylesheet. [Themes](/reference/themes/)

Code colours
: Highlighted code with a class per kind of token, coloured by custom properties a site can set. [Code blocks](/reference/themes/#code-blocks)

## Checks

Per component
: Render errors, data that doesn't match its schema, HTML validation and accessibility, shown in the workbench. [The checks](/concepts/architecture/#the-checks)

`pd audit`
: One report over every component and every variant, as markdown, text or JSON.

The build's checks
: Links, classes, custom properties, images and accessibility on every page of a site, before anything is written. [The checks every build passes](/in-practice/this-site/#the-checks-every-build-passes)

## The site

Pages from markdown
: A markdown file in the pages folder is a page, with its route from its path. [Site settings](/reference/configuration/#site)

Live examples
: A component placed in a page's markdown is a preview of the component itself, with its variants and a link into the workbench.

Layouts are components
: A page renders with a layout from your style guide, previewed in the workbench like any component. [This style guide](/in-practice/this-style-guide/)

Navigation
: Worked out from the pages, with `nav: false` for a page that stays out of it.

Collections and queries
: A folder's pages as a listing, and queries a layout declares for pages by folder, category or tag. [Collections and queries](/concepts/collections-and-queries/)

Tag and category pages
: A page for each tag and category in use, and an index of them, when the layouts are there.

Images
: A raster image from the assets written as WebP variants. On a site page, a caption from its title when the image stands on a line of its own, and a dark version from a `-dark` file beside it.

Symbol images
: SVG diagrams that take their colours from the page's custom properties.

## Search and SEO

Site search
: A Pagefind index of the site's pages, written by `pd build` when the project has Pagefind. [Search and SEO](/reference/search-and-seo/)

Head tags and JSON-LD
: A title for every page, and its description when it has one. Once the site has its address, also a canonical URL, link-preview tags and JSON-LD. [Head tags](/reference/search-and-seo/#head-tags)

Files for crawlers
: `llms.txt`, `robots.txt` for a site at a host's root, and `sitemap.xml` once the site has its address.

## The static build

Plain files
: `pd build` writes the workbench and the site as plain files, for any static host, at its root or under a base path. [`pd build`: the dev server, headless](/concepts/architecture/#pd-build-the-dev-server-headless)

All or nothing
: Every check runs before anything is written, and an output folder is replaced only when they all pass.

## Pattern packages

A design system from npm
: Another style guide's components, styles and themes, installed as a package and used next to your own. [This site](/in-practice/this-site/)

A pattern package from the start
: A style guide `pd init` creates describes its folders in the `package.json` it writes, ready to be used as one. [Create a style guide](/guide/create-a-style-guide/)

## The command line

One command, `pd`
: `pd init`, `pd dev`, `pd audit`, `pd build`, `pd export` and `pd help`. [The commands](/guide/#the-commands)
