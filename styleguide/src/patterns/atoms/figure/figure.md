---
title: Figure
description: An image with a caption, numbered in the article.
status: stable
---

Pattern Dump writes the figure itself, from the markdown: an image with a title, on a line of its own, is a
`<figure class="doc-figure">` with the title as its `<figcaption>`. A symbol image (`![Alt](#stem "Caption")`) and an
image from the assets (`![Alt](/assets/… "Caption")`) both become one. Without a title, an image stays an image, and
isn't numbered.

```md
![What the image shows](/assets/screenshots/workbench-component-preview.webp "What it shows and why it is there")
```

The styles are this entry's (`atoms/figure.scss`), so a page that has a figure links them:

- **Numbered in the article:** the caption starts with "Fig. 1:", "Fig. 2:", in the page's order, counted afresh in
  each article. The number is generated, never written in the caption.
- **The caption** is in Georgia, upright, muted, a little smaller than the text, 0.875rem below the image: the look
  of a figure in a paper or a textbook. "Fig. n:" is at the semibold weight, in the text colour.
- **A live example** (a `pattern` fence, `figure.doc-example`) is a figure too: numbered with the images, its caption
  set the same way. Its frame and variants are in the base layer (`base/doc-example.scss`).

The template here only shows the figure in the workbench. In x-ray, every `figure.doc-figure` on a page is labelled
`atoms/figure`.

```pattern atoms/figure
```
