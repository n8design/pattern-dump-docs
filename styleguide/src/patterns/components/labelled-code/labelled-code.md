---
title: Labelled code
---

A code block with what it belongs to above it: the file it is from, or the command that printed it. The label is
the figure's caption, in small mono and the muted text colour, so it reads as a file name, not as a heading. The
block below it is Pattern Dump's own code block, highlighted and with its copy button.

````md
<pd-components-labelled-code label="package.json">
```json
"pattern-dump": "0.8.1"
```
</pd-components-labelled-code>
````

Without `label`, the block stands alone: the command in the home page's start row.

The code can't hold a `pd-` tag: Pattern Dump 0.8.1 reads one inside a tag's content as a tag of its own, even in a
fence. Code that shows a placed component goes into the page's own markdown instead, as the home page's promise does.
