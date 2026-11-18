---
title: Definition list
description: Terms and what is said about them, for a reference.
status: stable
---

A plain `<dl>`, styled in the base layer (`base/definition-list.scss`) with no classes, so markdown and templates get
it as they write it.

- **`dt`**, the term, usually inline code: on its own line at the heading weight, 1.5rem above it from the entry
  before.
- **`dd`**, each statement about the term: 0.5rem below the term, 0.375rem between statements, indented 1.25rem with
  one hairline at the inline start running down all of a term's statements, as the aside's blocks have.
- **Loose and tight output look the same:** a `p` inside a `dd` (as markdown writes a loose list) has no margin of its
  own. `build.audit` here is written that way, `outDir` and `sourceDir` without.

```pattern atoms/definition-list
```
