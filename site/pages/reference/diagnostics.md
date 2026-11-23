---
title: Diagnostics
description: Every diagnostic Pattern Dump reports on a component, its severity, where it comes from, and where it shows: the Diagnostics tab, pd audit, the Console and site pages.
layout: doc
---

A diagnostic is what Pattern Dump finds in a component when it renders it: a kind, a severity (error, warning or info), and a source, the check it came from. The workbench shows a component's diagnostics in its Diagnostics tab; `pd audit` collects those of every component. [Check your work](/guide/check-your-work/) shows both at work.

## Kinds

`RENDER_ERROR`
: An error, source `render`: a template that throws. The message is the error's own, with its file and line in a separate `location` when the error knows them, such as a missing helper. The render outcome is `error`.

`UNFILLED_REQUIRED`
: An error, source `schema`: `Required field "<key>" is absent in the merged data`, at `#/properties/<key>`.

`SHAPE_MISMATCH`
: A warning, source `schema`: `Field "<key>" expected <types> but got <type>`.
: An error, source `render`, when a template reads `{{label}}` and the like of tags the sample data gives as strings: `{{#each tags}} reads {{label}}, but the tags in the sample data are strings: …`.

`HTML_INVALID`
: A warning, source `html`: an element where HTML's content model doesn't allow it, from html-validate's `element-permitted-content` and `element-permitted-parent` rules, with the rule's id. Each distinct markup is validated once. `--skip-checks=html` turns it off.

`A11Y`
: Source `axe`: one per element that fails an axe rule. Critical and serious are errors, moderate and minor warnings. The message is axe's summary of the failure, with the rule's id, the element's selector and HTML, the help text and its address. See [Accessibility](#accessibility).

`DATA_INVALID`
: An error, source `render`: `<file>.json is not valid JSON (<reason>); its data was not used`, with the file, line and column.

`SCHEMA_INVALID`
: An error, source `schema`, for a misused schema extension, a property named like a helper, or tags declared against what the template reads. A schema that isn't valid JSON is one too: `<file> is not valid JSON (…), so <id> isn't checked against its schema until it's fixed`. A misplaced `x-pd-layout`, or a layout name two components share, is one too, at `#/x-pd-layout`, on the component's own page only.

`HELPER_SHADOW`
: A warning, source `render`: `{{<name>}} calls the helper "<name>", so the data's "<path>" is never read here: write {{this.<name>}} to read the field, or give the field another name`. Not repeated for a field the schema already reports.

`HANDLE_COLLISION`
: An error, source `discovery`, on the quarantined component's page: ``quarantined; handle `<h>` is held by `<incumbentId>`; rename to resolve.``

`STYLE_BORROWED`
: An info, source `render`, one per component whose class the template uses without including it: `<id> uses class "<c>" (and <n> more) from <owner>, so <owner>'s stylesheet is linked too: include <owner> if it belongs here, or rename the class`. On the component's own Diagnostics tab only.

`CASCADE_WARNING` and `HIGHLIGHT_FALLBACK` are declared kinds, but nothing reports them.

## The Diagnostics tab

The Console's Diagnostics tab lists the diagnostics of the component on the Stage, grouped by source, the group with the worst finding first:

Render/Template
: `render` and highlighting.

Schema/Data
: `schema` and the cascade.

HTML validation
: `html`.

A11y
: `axe`.

Other
: Everything else, such as `discovery`.

The tab's marker shows the error count, in red, or the warning count when there are no errors. Info isn't counted, and neither are accessibility results axe can't decide, which are listed under "Needs review (<n>)" without a severity. The spoken label is "Diagnostics, <n> errors, <m> warnings", with the singular for one and a zero left out; with neither, there is no label.

The accessibility rules that need a browser run in the preview only while the tab is open; until they finish, the tab says "running rendered checks…". The Nav Rail's status shows the connection, never diagnostics.

## The Console

A handle collision is pushed to the Console as an error, `Handle collision: "<h>" is held by <incumbentPath>; <quarantinedPath> is quarantined until one is renamed`, printed by `pd dev` as `[dev-server] HANDLE_COLLISION: …` and listed in `CONFLICTS.generated.md` in Pattern Dump's scratch folder. The quarantined component is left out of the tree, but its page still answers, with the diagnostic.

The Console also has a warning level, for a data variant left out for want of a template and a preview whose height depends on its frame's. A warning line starts with `Warning: `, and an error is red.

## The audit

`pd audit`, the Audit tab and the `audit.json` of `pd build` hold the same audit of every component and every variant, each under its own id. It takes these kinds: `RENDER_ERROR`, the schema kinds, `HTML_INVALID`, `A11Y` from the jsdom tier, `DATA_INVALID`, `SCHEMA_INVALID` and `HELPER_SHADOW`. A component a handle collision left out of the tree is an entry with a `HANDLE_COLLISION` error naming the handle and the component that keeps it. The audit leaves out `STYLE_BORROWED`, the layout's `SCHEMA_INVALID`, and the accessibility rules that need a browser.

Each finding's engine is `axe`, `html-validate`, `schema`, `discovery` or `render`, and its rule id is the rule's own when it has one, else its kind. A render outcome is `ok`, `blank` (an empty render, not a defect) or `error`.

A rule's blast radius is the number of components its findings hit, each variant counted as one: the report's "Rules by blast radius" table. It is a rule's reach, not what a change to a component reaches; [Relationships](/concepts/relationships/#a-rules-blast-radius) explains the difference.

`pd audit` writes the serialized diagnostics graph, `diagnostics-graph.json`, of components and the rules they break, beside the report in Pattern Dump's folder in your cache folder: `~/Library/Caches/pattern-dump/` on macOS, `%LOCALAPPDATA%\pattern-dump\` on Windows, and `~/.cache/pattern-dump/` on Linux, or `$XDG_CACHE_HOME` when it is set, on macOS too. Pattern Dump creates the folder for you alone; a folder there that is a link or open to other users stops the run, naming the folder. [Command line](/reference/cli/#pd-audit) has its options and exit codes.

## On site pages

A placed component with a schema property named like a helper is a problem of the page: `<id> cannot be placed: its schema (<file>, <path>): <message>`; a layout with one fails all its pages.

`STYLE_BORROWED` on a site page is a warning, `warning: <page>: <message>`, in the `pd dev` terminal. In `pd build` it is a `note:` line, counted in the `styles:` line of the summary.

In `pd dev`, a page that can't be built shows "The page <route> cannot be built", with each problem in a `ul.pd-problems` list; `pd build` reports them as "the site has problems". In `pd dev`, image problems, links to missing pages or anchors, and a page without exactly one main landmark and one `<h1>` are warnings in the terminal. In `pd build`, the image problems and the page basics are errors. [Checks](/reference/checks/) has the checks on site pages.

## Accessibility

Every accessibility check runs axe-core 4.11.4: components, site pages, the browser checks and the workbench. The package depends on axe-core 4.11.4 and jsdom 27.4.0 exactly, since the rule tiers below were proven on them, and with another axe-core installed `pd dev`, `pd build` and `pd audit` stop: `axe-core <installed> is installed, but the accessibility rule tiers were proven on 4.11.4: install axe-core 4.11.4`.

A component's rendered markup is wrapped in `<!DOCTYPE html><html lang="en"><body><main>…</main></body></html>`, and axe runs on the `<main>` only. Its rules come in two tiers. Each of 12 candidate rules is tested on a failing example: a violation in jsdom puts it in the first tier, an undecided result in the second, and neither fails the run.

In jsdom, on every render
: `image-alt`, `label`, `button-name`, `link-name`, `aria-required-attr`, `aria-valid-attr`, `aria-valid-attr-value`, `autocomplete-valid` and `duplicate-id`. In `pd audit` and the Diagnostics tab.

In a browser
: `aria-hidden-focus`, `duplicate-id-aria` and `color-contrast`. They are undecided in jsdom, so `pd audit` leaves them out. They run in the live preview in the workbench's Diagnostics tab, the static workbench's too, and on a site's pages with `pd build --browser`.

A component's finding at impact critical or serious is an error, moderate or minor a warning. A colour-contrast finding carries the foreground, the background, the ratio and the ratio expected.

`pd dev` also reports flattened templates, near-copies of one template among the project's components, as `[dev-server] FLATTENED: …`. That is a separate report, not a diagnostic: it shows in no tab, no audit report and no exit code.
