---
title: Table of contents
requireScript: [toc-spy]
---

The page's table of contents. It goes into the layout's sidebar (`"x-pd-region": "sidebar"` in its schema).

- `toc: true` in a page's frontmatter shows it with the page's headings of level 2 and 3.
- `<pd-toc></pd-toc>` in a page's markdown does the same; with a list of links inside, it shows those instead:

```md
<pd-toc>
- [Install](#install)
  - [Options](#options)
- [About](/about/)
</pd-toc>
```

An `#anchor` must be a heading of the page, or the build stops and names the closest one.

**The current section.** While the page scrolls, the link of the heading in view is marked `aria-current="true"`
and shown in heading ink at the semibold weight (`src/scripts/toc-spy.ts`). Where the browser has `scroll-target-group`, CSS
marks it (`:target-current`) and the script only mirrors that into `aria-current` when scrolling ends; elsewhere the
script finds the heading on scroll (the last one whose top has passed a third of the window, or the last heading at the
end of the page) and sets it. It runs on a wide screen only, where the table of contents sits beside the text.
