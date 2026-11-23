---
title: Labelled code
requireScript: [copy-button]
---

A code block with what it belongs to above it: the file it is from, or the command that printed it. The label is
the figure's caption, in small mono and the muted text colour, so it reads as a file name, not as a heading. The
block below it is Pattern Dump's own code block, highlighted and with its copy button.

Every code block on the site has its Copy button in a row of its own above the code, at the inline end, so no line
of code runs under it at any width (`base/code-block.scss`). The row keeps the same space to the block as the label
does, and neither draws a line of its own; the button keeps its control's edge. With a label, the block has both rows,
the label first.

The button is a square of 1.5rem (`$copy-button-size`) holding Phosphor's Copy icon, 1.25rem (`$copy-icon-size`),
about the label's line box. `src/scripts/copy-button.ts` draws it over Pattern Dump's text, loaded here and on every
page by `pages/frame`. The icon is hidden from assistive tech, so the button's name stays "Copy source", and the
focus outline is the site's. After a copy, the icon turns into Phosphor's Check for two seconds. "Copied" is said by
Pattern Dump's own polite live region, so it is said once. When copying fails, the button shows Pattern Dump's text,
"Not copied", until it resets.

On a touch screen (`any-pointer: coarse`), the button takes a tap from a 2.75rem square (`$touch-target`), drawn by an
empty `::before`. It reaches up into the gap above the row, down through the gap into the block's padding, and out
along the empty row towards the inline start. It never reaches past the block's inline end, so it covers no code
text, no label and no other control.

Pattern Dump's script adds the button only where the browser can write to the clipboard, so a preview without it
shows no row. Phosphor's icons are allowed here and in the few places `TASTE.md`, section 1, names.

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
