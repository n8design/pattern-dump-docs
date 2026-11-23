---
title: Claude Code on this site
description: Claude Code with MCP on this site's repository: the .mcp.json that starts pd mcp, and what Pattern Dump 0.9.0 answers to three questions about this style guide.
layout: doc
order: 2
---

Claude Code reaches this site's project through Pattern Dump's MCP server. One file in the repository starts it, and from then on Claude Code can ask what a component is, where it is used and what a change to it reaches, before it touches a file.

This page shows the file and three questions, each with the tool Claude Code called, what Pattern Dump 0.9.0 answered, and Claude Code's reply. They were asked of this repository as it is published, with the pinned version, and Claude Code could use the server's tools only, so every answer comes from the graph. [MCP server](/reference/mcp/) has every tool and option.

## The file

`.mcp.json`, in the repository's root:

```json
{
  "mcpServers": {
    "pattern-dump": {
      "command": "npx",
      "args": ["pd", "mcp", "--root", "site"]
    }
  }
}
```

Claude Code starts `pd mcp` in the repository and talks to it over stdio. `--root site` points it at the site, not at the style guide: the site's project loads the style guide as a package, so its graph holds both, the components and the pages that use them. `pd mcp` runs the site's `pd dev` inside, so an answer after a save is about the files as they are.

Claude Code asks once before it uses a server from a project's `.mcp.json`.

## What uses atoms/button?

Claude Code called `usage` with `{"id":"atoms/button"}`:

```json
{
  "version": 1,
  "id": "atoms/button",
  "components": [
    "molecules/search-field"
  ],
  "pages": []
}
```

Claude Code's reply: "The only component that includes atoms/button is molecules/search-field. No page places it or renders with it, either directly or through search-field." That is right for this site: its search is `organisms/search`, which doesn't include the search field.

## What breaks if site-header changes?

Claude Code called `blast_radius` with `{"id":"organisms/site-header"}`. The answer is everything the header reaches, each with the path that connects it. Its summary, as `pd describe organisms/site-header` prints it:

```text
Blast radius: 11 components, 2 stylesheets, 56 pages
```

The components are `pages/frame`, which includes the header, and the ten that include the frame: `partials/base` and the nine layouts. The 56 pages are every page `pd dev` shows, the draft `/articles/examples/` among them, each through its layout. One path, for the home page:

```json
{
  "route": "/",
  "path": [
    {
      "from": "component:pages/frame",
      "kind": "includes",
      "to": "component:organisms/site-header"
    },
    {
      "from": "component:layouts/home",
      "kind": "includes",
      "to": "component:pages/frame"
    },
    {
      "from": "page:/",
      "kind": "renders",
      "to": "component:layouts/home"
    }
  ]
}
```

The two stylesheets are `pages/frame.scss` and `base/xray.scss`. Neither belongs to the header, but both name its class `.site-header`, so a change to the header's markup can change what they style.

Claude Code's reply: "The whole site: `pages/frame` includes `organisms/site-header`, so the change reaches `partials/base` and all nine layouts (home, article, doc, listing, categories, category, tags, tag, page). Through them it reaches every one of the 56 site pages, and two stylesheets also use the `.site-header` class: `styles/pages/frame.scss` and `styles/base/xray.scss`."

## Which stylesheet styles site-card?

Claude Code called `ownership` with `{"id":"components/site-card"}`:

```json
{
  "version": 1,
  "id": "components/site-card",
  "stylesheets": [
    {
      "file": "@pattern-dump-docs/styleguide/src/styles/components/site-card.scss",
      "source": "scss"
    }
  ],
  "defines": [
    "site-card",
    "site-card-line",
    "site-card-link",
    "site-card-name"
  ],
  "importsModules": [
    "base/tokens"
  ],
  "stylesClassesOf": [],
  "classesStyledBy": [],
  "borrows": [],
  "unowned": []
}
```

Claude Code's reply began: "`styleguide/src/styles/components/site-card.scss` is the only stylesheet that styles site-card: it defines `.site-card`, `-line`, `-link` and `-name` and loads `base/tokens`." No other stylesheet styles the card's classes, and its stylesheet styles nobody else's.

The same question, asked while 0.9.0 was being built, had a longer answer: `site-card.scss` also defined `site-cards` and `site-cards-list`, the classes of the list the cards sit in, which is a component of its own. The list's rules now live in `site-cards.scss`, so each component's stylesheet styles only its own.

## Before handing over

`affected` takes the files a change touched and gives back what to check. For a change to the card's stylesheet, with the path from the site's folder:

```sh
npx pd affected ../styleguide/src/styles/components/site-card.scss
```

```text
Changed: @pattern-dump-docs/styleguide/src/styles/components/site-card.scss
  2 components: components/site-card, components/site-cards
  2 pages: /, /in-practice/
```

The home page and In practice are the two pages that show the cards, so those are the pages to look at before the change goes out.
