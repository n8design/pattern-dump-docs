---
title: The idea
description: What Pattern Dump is for: one place for a design system's components, their documentation, their checks and the site built from them.
layout: doc
order: 1
---

Promised in the schema, held by the build.

Pattern Dump takes the view that a set of components becomes a system when each one has a contract: its schema, which says the values it takes and their types. Other tools call this its props. Wherever the site uses a component, Pattern Dump checks it against that contract: a component placed on a page, a card in a listing, a layout's frontmatter. A broken promise is a problem at its file and line, and `pd build` writes nothing until it is fixed. `pd audit` covers the rest: it renders every component and every variant, and fails when one is missing a value its schema requires. The examples on a page are the component itself, from the same renderer as the workbench, so the documentation can't drift from what ships. Without a contract, nothing fails when a team ignores the parts.

[What it does](/idea/features/) lists each thing Pattern Dump does, one line each.

[From Pattern Lab to Pattern Dump](/idea/history/) tells where it comes from, in Stefan Bauer's own words.
