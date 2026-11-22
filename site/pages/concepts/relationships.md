---
title: Relationships
description: How Pattern Dump knows which component uses which: read from your templates, never declared, and what it does with that.
layout: doc
order: 4
---

When you change a button, Pattern Dump can tell you which components change with it, because it reads the answer from your templates. Every include, `{{> atoms-button }}`, is one edge from the component that writes it to the component it names. Together the edges make the include graph: which component includes which, in both directions. Other tools call this a dependency graph.

Nothing declares it. There is no list of dependencies to write, and none to keep up to date: the templates are the list. Pattern Dump reads the graph from what your components actually include, so it can't disagree with them.

Pattern Dump uses it in four places: the workbench's Relationships tab shows it, previews and site pages load the scripts and symbol sets of everything they include, `pd audit` checks a component again when something it includes has changed, and a class used without its include gets a note.

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

## Blast radius is a rule's reach

The audit report has a table called "Rules by blast radius". A rule's blast radius is the number of components its findings hit, with each variant counted as a component of its own, next to how often the rule fires in all.

It counts components a rule hits, not components a change reaches. What a change reaches is the "used by" side of the graph, as above.

## A class without its include

An include is also how a component says it needs another one's styles. A template that uses a class another component owns, without including that component, borrows the class. The owner's stylesheet is linked into the preview too, so it still looks right, and the component's Diagnostics tab notes it as `STYLE_BORROWED`, information only:

```txt
<id> uses class "<c>" (and n more) from <owner>, so <owner>'s stylesheet is linked too: include <owner> if it belongs here, or rename the class
```

`pd audit` leaves the note out. On a site page it is a warning, which `pd build` counts. [Style a component](/guide/style-a-component/) shows which component owns a class.

## Where to see it

The Relationships tab and the Audit tab are both in the Inspector: [Run the workbench](/guide/run-the-workbench/#find-your-way-around) shows where.
