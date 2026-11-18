---
title: Examples
description: A live example from the workbench, and a component placed with your values.
layout: doc
order: 5
---

This page is `site/pages/examples.md`. Every markdown file in `site/pages/` is a page, at the address its path
names: `site/pages/about.md` is [/about/](/about/).

## A live example

A `pattern` fence shows a component from the workbench, in a frame of its own, so its own styles
render it and nothing on this page can restyle it:

```pattern components/note
```

## A component with your values

A `pd-` tag places a component with the values you give it. They are checked against the component's
schema, `src/patterns/components/note/note.schema.json`, before the page is shown:

<pd-components-note tone="tip" heading="Try breaking it">
Change `tone="tip"` to `tone="tips"` and save. The page shows what is wrong, and where.
</pd-components-note>
