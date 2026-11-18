---
title: Example page
description: A full-width layout composing the search field and buttons.
status: draft
---

The page sits in the site's frame (`{{#> pages-frame }}`): header, navigation and footer, as every page on the
website does. `pages` previews fill the stage (`preview: full` in `pages/index.md`). It includes a variant by its
quoted handle (`{{> "atoms-button~secondary" }}`) because `~` must be quoted in a partial name.

```pattern pages/example
```
