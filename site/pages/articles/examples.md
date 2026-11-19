---
title: Examples
description: A live example from the workbench, and a component placed with your values.
date: 2026-11-19
categories: [notes]
tags: [components]
draft: true
nav: false
---

This page is `site/pages/articles/examples.md`, a draft: `pd dev` shows it, `pd build` leaves it out. It keeps the
ways to embed a component in one place until a Guide page shows them.

## A live example

A `pattern` fence shows a component from the workbench, in a frame of its own, so its own styles
render it and nothing on this page can restyle it:

```pattern components/note
```

In this page's markdown, that is one fence with the component's id:

````md
```pattern components/note
```
````

## A component with your values

A `pd-` tag places a component with the values you give it. They are checked against the component's
schema, `src/patterns/components/note/note.schema.json`, before the page is shown:

<pd-components-note heading="Note">
Delete `heading="Note"` from this tag and save: a note needs a heading. The page shows what is wrong, and where.
</pd-components-note>

In this page's markdown, that is the tag with the component's id after `pd-`, its values as attributes, and its text
inside:

```md
<pd-components-note heading="Note">
Delete `heading="Note"` from this tag and save: a note needs a heading. The page shows what is wrong, and where.
</pd-components-note>
```

## A variant with your values

A variant's tag is the component's tag with `~` and the variant's name. It brings what the variant sets, here the
warning's colour, and the tag's own values still win:

<pd-components-note~warning heading="Before you delete a page">
Deleting a page also deletes its address. Add a redirect if other sites link to it.
</pd-components-note~warning>

In this page's markdown:

```md
<pd-components-note~warning heading="Before you delete a page">
Deleting a page also deletes its address. Add a redirect if other sites link to it.
</pd-components-note~warning>
```
