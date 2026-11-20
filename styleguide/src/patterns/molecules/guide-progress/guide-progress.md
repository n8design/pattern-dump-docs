---
title: Guide progress
---

Where a page sits in its section: "Guide · Step 2 of 4", and a bar with one segment per page, the ones up to this
page done. It is derived from `nav` (the section whose `children` include the current page), never written in a
page's frontmatter. It shows only in the Guide (the nav entry at `/guide/`), which is read in order: Reference, Concepts
and the other sections are looked up, not read step by step, so it renders nothing there, nor on a page in no section.

**Whether it shows** is one test, `onGuideStep nav` (`src/helpers/guide.js`): true when a page under the nav entry
at `/guide/` is the current one. `layouts/doc` asks the same helper and shows its breadcrumbs only when the answer is
no, so a page has the progress or the trail, never both. The loop inside only finds the step's position and the
section's title once the helper has said yes.

**How it is built without a counting helper.** Handlebars can't add, so the number is a CSS counter: the line resets
`guide-step` to the page's index and the number's `::before` adds one. The total is `children.length`; a segment is
done when its index is at most the page's (`lte`).

**For screen readers** the bar is an ordered list of the section's pages, the current one marked
`aria-current="step"`, so the list's own position ("2 of 4") says what the visible line says. The visible
"· Step 2 of 4" repeats it in generated text and is hidden from assistive tech; the section's link stays readable.
