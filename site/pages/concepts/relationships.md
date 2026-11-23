---
title: Relationships
description: The dependency graph Pattern Dump reads from your files, never declared: what includes what, which stylesheet styles what, and what a change reaches.
layout: doc
order: 4
---

When you change a button, Pattern Dump can tell you which components change with it, because it reads the answer from your templates. Every include, `{{> atoms-button }}`, is one edge from the component that writes it to the component it names. Together the edges make the include graph: which component includes which, in both directions. Other tools call this a dependency graph.

Nothing declares it. There is no list of dependencies to write, and none to keep up to date: the templates are the list. Pattern Dump reads the graph from what your components actually include, so it can't disagree with them.

Since 0.9 the includes are part of one larger graph, the project graph. It also holds your stylesheets and the classes they define and name, and your site's pages and the components they show. `pd dev`, `pd build` and `pd audit` build it from the files they already read, and so do the commands that answer questions. `pd dev` keeps it current after every save.

Pattern Dump uses the graph in five places. The workbench's Relationships tab shows it. Previews and site pages load the scripts and symbol sets of everything they include. `pd audit` checks a component again when something it includes has changed. A class used without its include gets a note. And the command line and the MCP server answer from it: where a component is used, and what a change reaches.

## What counts as an include

An include in either form is an edge: `{{> <handle> }}`, and the block form, which wraps content. This site's doc layout, [`layouts/doc`](pattern:layouts/doc), puts the page into its frame with one:

```hbs
{{#> pages-frame }}
<div class="reading">
  {{> molecules-guide-progress }}
  …
</div>
{{/pages-frame}}
```

That is three edges, from `layouts/doc` to [`pages/frame`](pattern:pages/frame), to `molecules/guide-progress`, and to the others the layout includes further down.

Pattern Dump reads the template as written, without rendering it. So two things are not edges:

A partial a helper picks while rendering
: Its name exists only once the helper runs, so no edge leads to it. It doesn't show in the Relationships tab, and its scripts and symbol sets don't roll up.

A component that includes itself
: Skipped.

An unquoted name counts when it starts with a letter and goes on with letters, digits and hyphens, as every handle does.

## Uses and used by

Each edge reads two ways. Down the graph, a component uses what it includes. Up the graph, it is used by what includes it. The Relationships tab in the workbench's Inspector shows both for the component on the Stage.

![Four of this site's components in a column, each including the next: layouts/doc, pages/frame, organisms/site-header and molecules/site-nav. Between each pair, an arrow down marked uses and an arrow up marked used by. Beside organisms/site-header, its Relationships: uses molecules/site-nav, used by pages/frame.](#uses-and-used-by "Part of this site's include graph. Each include reads both ways: organisms/site-header uses the site navigation and is used by the frame, which every layout of this site includes.")

On this site, [`organisms/site-header`](pattern:organisms/site-header) uses [`molecules/site-nav`](pattern:molecules/site-nav) and is used by `pages/frame`. Change the navigation, and the tab of `molecules/site-nav` names the header as its user, the first step up to every layout.

## Stylesheets and classes

A component's stylesheet is the one named after it, by the folder rules in your config: `src/styles/atoms/button.scss` styles `atoms/button`. A plain `.css` file in the styles folder counts as a stylesheet too. The graph keeps what each stylesheet does with classes, and which classes each template writes:

Defines
: A stylesheet defines a class when a selector styles it as its own, such as `.button`. The class belongs to the component whose stylesheet defines it.

Mentions
: A stylesheet mentions a class when a selector only names it in context, as `.card-body > .button` names the button's class.

Borrows
: A template borrows every class it writes, its own included.

So the graph can say when one component's stylesheet reaches into another's classes, a coupling no include shows. On this site, `pages/frame.scss` and `base/xray.scss` both name `.site-header`, the header's class. Neither belongs to the header, but a change to the header's markup can change what they style.

Pattern Dump also reads an `assets.css` file in the asset folders and a template's own `<style>` for the classes they define. An `assets.css` given as an address and a template's `<link>` are named in the graph but never fetched, so their classes stay unknown.

The Relationships tab shows all of this under Style, in four groups: Stylesheet, Borrows classes from, Styles classes of, and Its classes are styled by. `pd audit` and the Audit tab list these style couplings beside the findings, as information. They are never counted as defects.

## Pages

A site page is in the graph too. It renders with its layout, and it places every component it shows: each `pd-` tag, each `pattern` fence, its listing's view and that view's card. A layout's queries place their card and view on every page that renders with it, unless the page turns the query off. So for a component, the graph knows every page it appears on, directly or through a component that includes it.

`pd describe`, `pd affected` and `pd mcp` read the site as `pd dev` shows it, drafts and scheduled pages included. The `api/graph.json` that `pd build` writes leaves them out, as the published site does.

## Scripts and symbol sets roll up

A component asks for a script with `requireScript` in its `.md`, and for a symbol set with `requireAssets`. Pattern Dump takes them from the component and from everything in its include tree, each once, and guards against an include that leads back round. So a preview of a parent loads its children's scripts and symbol sets, without the parent naming them.

![On the left, the same four components, indented by how deep they are included: layouts/doc asks for the script example-variants, organisms/site-header for site-header, the other two for nothing. A bracket across all four leads to the preview of layouts/doc, which holds the markup and then both scripts.](#requires-roll-up "The preview of layouts/doc loads its own script and the header's, two levels down. Only the header names site-header.")

The preview of `layouts/doc` loads `example-variants`, which the layout asks for, and `site-header`, which only [`organisms/site-header`](pattern:organisms/site-header) names. The scripts load as modules after the markup, after the `globalScripts` from the config.

A site page loads them too. Its scripts are the `globalScripts`, then the scripts its layout and the components placed on it ask for, each once. Its symbol sets come from the layout and from each component it renders besides (placed with a `pd-` tag, or as a listing's or a query's view), with everything they include, each set once, in the order first needed. A set that no asset folder has is left out of a preview without a word, while a site page fails on it.

A variant's preview is the same document as its base component's with the variant picked, so it loads the base's scripts and symbol sets.

The recommendation here: name a script on the component whose markup needs it. Every component and page that includes it then loads it, and none of them has to know.

## What the audit checks again

`pd audit` keeps each component's result and reuses it while nothing it depends on has changed. What a component depends on includes its include tree: its result is reused only while its template, data and schema and those of everything it includes are unchanged, along with the global data, the helpers' source and Pattern Dump's own checks. Stylesheets are not part of it.

So a change reaches up the graph. Edit `molecules/site-nav`, and the next audit checks the navigation again, then the header, the frame and every layout that includes the frame, and reuses the rest. Its last lines say how many: `[pd audit] re-audited <n>, reused <n> (of <n>).` An edit to a variant's data is checked again too.

A template that picks a partial with a helper has no edges to follow there. Pattern Dump then treats it as depending on the whole design system, so it is checked again after any change.

## What a change reaches

The blast radius of a component is everything a change to it reaches. Pattern Dump walks the graph outwards from the component:

- what includes it, at any depth, and its variants;
- the stylesheets that style its classes from outside, and the components those stylesheets belong to;
- the templates that write its classes without including it;
- every page that places or renders anything reached.

It walks breadth first, so each thing comes with its shortest path, the chain of edges that connects it. Classes count only from the changed component's own. On this site, a change to `organisms/site-header` reaches 11 components, 2 stylesheets and every page: `pages/frame` includes the header, and every layout includes the frame.

`affected` is the same walk for a change, not a component. It takes the component ids or files you changed and gives one flat list, the components and pages to check before you hand the change over. Other tools call this impact analysis. A file is mapped to what it is: a template, a schema, a component's docs, a stylesheet, a shared Sass module or a page.

## A rule's blast radius

The audit report's "Rules by blast radius" table uses the term for a rule, not a component. A rule's blast radius is the number of components its findings hit, with each variant counted as a component of its own, next to how often the rule fires in all. It says how widespread a problem is, not what a change reaches.

## A class without its include

An include is also how a component says it needs another one's styles. A template that uses a class another component owns, without including that component, borrows the class. The owner's stylesheet is linked into the preview too, so it still looks right, and the component's Diagnostics tab notes it as `STYLE_BORROWED`, information only:

```txt
<id> uses class "<c>" (and n more) from <owner>, so <owner>'s stylesheet is linked too: include <owner> if it belongs here, or rename the class
```

`pd audit` leaves the note out. On a site page it is a warning, which `pd build` counts. [Style a component](/guide/style-a-component/) shows which component owns a class.

## Where to see it

- The Relationships tab and the Audit tab, both in the Inspector: [Run the workbench](/guide/run-the-workbench/#find-your-way-around) shows where.
- `pd describe`, `pd affected` and `pd graph` on the command line ([Command line](/reference/cli/#pd-describe)).
- The MCP server, for an agent ([MCP server](/reference/mcp/)).
- `api/graph.json` in the workbench `pd build` writes ([Build output](/reference/build-output/#the-workbenchs-files)).
