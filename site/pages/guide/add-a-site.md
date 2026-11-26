---
title: Add a page to your site
description: Write a page for your design system website in markdown, with a live example of your own component, and see it in pd dev beside the workbench.
layout: doc
order: 7
---

The project has had a site since the first step: the pages `pd init` wrote, built from components in your style guide. This step adds a page of your own, about the badge, with a live example of it.

## Open the site

With `pd dev` running, open `http://live.localhost:4000/`. That is the site, from the same `pd dev` as the workbench at `http://pd.localhost:4000/`. Its home page is `pages/index.md`, and every page in the navigation is a file in `pages/`.

![The Configuration page of this site: the header with its sections, the page title, a highlighted code block with its Copy button, and On this page on the right.](/assets/screenshots/site-page.webp "A page of this site, the Pattern Dump docs, built with its style guide's layouts/doc. In dark mode, the picture is dark too.")

The starter's pages look different, with the starter's layouts, but they are made the same way.

## Write a page

Every `.md` file in `pages/` is a page, and its path is its address: `pages/about.md` is `/about/`, `pages/articles/hello.md` is `/articles/hello/`, and `index.md` is the folder's own page. A file or folder name is lowercase letters, digits and hyphens. There is no key in the frontmatter that changes the address.

Create `pages/badges.md`:

````md
---
title: Badges
order: 5
description: A short label for something new, or a warning about something old.
---

The badge marks something new. Its warning variant marks something on its way out.

```pattern atoms/badge~warning
```
````

Open `http://live.localhost:4000/badges/`. The page is there, and in the navigation too: adding the file is all it takes. `order: 5` puts it after the starter's pages, which carry 1 to 4; without it, a page counts as 0 and comes before them.

The block between the `---` lines is the frontmatter, the page's data. The page names no `layout`, so it takes `layouts/page`, the default. `title` and `description` are keys that layout declares; a key it doesn't declare stops the page, with the file and the line:

```txt
"subtitle" is not declared by layout "page"
```

[Sites](/concepts/sites/) explains why: a page is data for its layout, and the layout's schema says what that data may be.

## A live example

The `pattern` block shows a component from your style guide on the page: the component's preview from the workbench, in a frame of its own, so the badge looks exactly as it does on the Stage. Under it, the example lists the component's variants, `default` first, and its caption links to the component in the workbench.

The frame is an `<iframe>` of the badge's preview, in a `<figure class="doc-example">`, and it gets a `height` only when the component's schema declares one: `x-pd-example-height`, at the top of `badge.schema.json`, a whole number of CSS pixels that holds for every variant. In `pd dev`, a frame declared taller than its content is a warning that names the number to declare: `<id>: its live example is declared <n>px tall (x-pd-example-height), but its content is <m>px. … declare at most <m>.` [Live examples](/reference/markdown/#height) has the rules.

The starter has no styles for the frame, its list of variants or its caption: they are the site's to style, with the classes [Live examples](/reference/markdown/#live-examples) lists.

An id that names no component stops the page. In `pd dev`, the page then says that it cannot be built and lists why:

```txt
badges.md: pattern atoms/bagde~warning: there is no such component
```

`pd build` stops on the same problem and writes nothing. A typo in a live example can't reach a published page.

## Place a component with your values

A live example shows the component with its own data. To use it with values of your own, place it with a `pd-` tag, its handle after `pd-`. Add to the page:

```md
<pd-atoms-badge label="Beta" tone="info" />
```

The attributes are checked against the badge's schema, as the page's frontmatter is checked against its layout's: an attribute the schema doesn't declare, a required one left out, or a value of the wrong type stops the page, with the file, line and column. A component can only be placed when it has a schema. A tag goes on a line of its own: in the middle of a sentence, it stays text.

A link to a component's page in the workbench is a markdown link with `pattern:` and its id:

```md
The badge's documentation is in [the workbench](pattern:atoms/badge).
```

## An image beside the page

An image can sit next to the page that shows it. Save one as `pages/badge-states.png` and name it by its path from the page:

```md
![The badge in its default and warning variants](./badge-states.png)
```

It gets the same WebP variants, caption and dark version as an image from the assets, and its address is `/badge-states.png`. The file name is part of that address, so it is lowercase letters, digits and hyphens. A file named `Badge States.PNG` stops the site, with the name to use:

```txt
Badge States.PNG: an image's file name is part of its URL, so it is lowercase letters, digits and hyphens only, then its extension: rename it to badge-states.png
```

[Images beside a page](/reference/images/#images-beside-a-page) has the rules.

## A date for readers

Give the page a date in its frontmatter, `date: 2026-11-14`. Without one, its date is the day git first saw the page. A layout gets the date twice: `page.date` as written, for machines, and `page.dateText`, the same day for readers. The starter's `layouts/page` writes both in a `time` element:

```hbs
{{#if page.date}}<time datetime="{{page.date}}">{{page.dateText}}</time>{{/if}}
```

With `en`, the default language, the page shows "November 14, 2026". `site.lang` sets another, and `site.dates` the style:

```ts
export default defineConfig({
  site: {
    lang: "en-GB",
  },
});
```

`en-GB` writes "14 November 2026". [Page data](/reference/layouts/#page-data) has all the dates as text.

## Your site

The site has a page of your own, with the badge on it, live from the style guide. The pages `pd init` wrote show more of what a page can hold, such as the articles in `pages/articles/` and a table of contents in `pages/guide.md`.
