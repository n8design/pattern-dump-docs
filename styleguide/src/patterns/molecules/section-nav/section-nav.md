---
title: In this section
---

The pages of the section a page is in, in the reading page's sidebar below "On this page" (`layouts/doc`). The
section is `page.section`; its pages are that entry's `children` in `nav`, in nav order, the current one marked
`aria-current="page"` and shown like the current item in the site navigation: heading ink, the semibold weight and
an underline in the accent. It renders nothing on a page whose section has no pages of its own (a top-level page
such as Search) or that is in no section.

**A native `<details>`, closed on every page.** No script and no stored state: it opens and closes like any
disclosure and starts closed on each page. The sidebar sits above the text on a narrow screen, so an open list of a
long section (Reference has 18 pages) would push the article down on a phone.

**The chevron** is an inline SVG before the label, hidden from assistive tech: it points to the inline end while
closed and down while open. The summary's text is the disclosure's name, and the `nav` is labelled by it.
