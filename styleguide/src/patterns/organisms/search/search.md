---
title: Search
requireScript: site-search
---

The site's search, on the search page (`site/pages/search.md`):

```md
<pd-organisms-search></pd-organisms-search>
```

`pd build` indexes every page's own content with [Pagefind](https://pagefind.app/) when the project has it
(`npm install --save-dev pagefind`), and writes the index into the site at `_pd/search/`. The script
(`src/scripts/site-search.ts`) loads it from there and searches in the browser:

- The field looks like the header's search; the button is **`atoms-button`**, primary:
  `{{> atoms-button label="Search" variant="primary" type="submit" }}`.
- It searches as you type and when the form is sent, and keeps the words in the address (`?q=`), so a search can be
  linked and the Back button returns to it.
- Each result has its section above the title, small and in capitals (the home page's eyebrow), then the title as a
  link, then the passage that matched. The section comes first in the HTML too, in an `hgroup` with the heading.
- The words found are marked in the other mode's accent (`--color-highlight`, `--color-on-highlight`).
- A passage cut from the middle of a page gets "…" where it was cut: at its start, and at its end unless it ends a
  sentence (`.`, `?` or `!`).
- The status line says how many results there are, and screen readers announce it.
- Once the index is loaded, a row of tabs narrows the results: All, then the sections in the order of the site's
  navigation. It is a radio group (a `fieldset` named "Section"), so the arrow keys move between them; the checked one
  has the navigation's current-item underline. The choice is kept in the address (`?section=`). Where the row doesn't
  fit, it scrolls sideways and keeps the checked tab in view.

Without JavaScript the form still works as a form and the page says that search needs JavaScript. In `npm run dev`
there is no index, so the status line says that search works on the built site.
