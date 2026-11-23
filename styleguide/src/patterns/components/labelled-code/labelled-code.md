---
title: Labelled code
---

A code block with what it belongs to above it: the file it is from, or the command that printed it. The label is
the figure's caption, in small mono and the muted text colour, so it reads as a file name, not as a heading. The
block below it is Pattern Dump's own code block, highlighted and with its copy button.

Every code block on the site has its copy button in a row of its own above the code, at the inline end, so no line of
code runs under it at any width (`base/code-block.scss`). That row is built like the label: the same type, so the same
height, and the same space to the block below. Neither draws a line of its own; the button keeps its control's edge.
With a label, the block has both rows, the label first. Pattern Dump's script adds the button only where the browser
can write to the clipboard, so a preview without it shows no row.

````md
<pd-components-labelled-code label="package.json">
```json
"pattern-dump": "0.9.0"
```
</pd-components-labelled-code>
````

Without `label`, the block stands alone: the command in the home page's start row.

The code can hold a `pd-` tag: a fence inside a tag's content is text, so a placed component can be shown as code in
it.
