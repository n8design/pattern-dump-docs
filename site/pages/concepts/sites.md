---
title: Sites
description: Build a website from your design system's own components: pages as data for layouts, checked against each layout's schema.
layout: doc
order: 8
---

A docs site or a blog usually gets a theme of its own, and then two sets of components drift apart: the design system's, and the site's. Pattern Dump builds a site from the design system's components instead. A page is a markdown file, and its layout is a component like any other, with a template, a stylesheet and a schema.

So a page is data for its layout. Its frontmatter is checked against the layout's schema, Pattern Dump adds what it works out for the page, and the layout renders all of it. The same render path draws the layout in the workbench and the page on the site.

![On the left, this site's page site/pages/articles/hello.md: its frontmatter keys title, description, date, tags and categories, and its markdown body. Arrows lead into the page as it renders: title and description, which layouts/article declares, go into the layout; date, tags and categories are reserved for Pattern Dump, which hands the layout page.date and page.tags; set apart below them, page.related is the result of a query; the body goes into the layout's body. The layout sits inside pages/frame, between organisms/site-header and organisms/site-footer.](#a-page-and-its-layout "A page of this site and its layout. The page writes values; layouts/article declares what it takes, and pages/frame puts the same header and footer around every layout.")

## A layout is a component

A layout is a component directly under `layouts/`, named by its folder, or a component in `pages/` or `templates/` whose schema marks it with `x-pd-layout` and a name. A variant is never a layout. A page names its layout with `layout:`; without one it takes the `childLayout` of the nearest folder above it that sets one, else `layouts/page`, the default.

Besides its layouts, a site needs a few components with fixed names: `partials/base` declares the values every layout reads as `site`, `partials/head` adds to the `<head>` (it is optional), and `components/toc` is the table of contents. Together with the listing views, these make up the skin, the part of a design system a site is built with.

This site's layouts are in its style guide: `layouts/doc`, which this page uses, `layouts/article`, `layouts/listing`, `layouts/home` and the pages for tags and categories. Each of them includes [`pages/frame`](pattern:pages/frame), the header, the main content and the footer, so every page of the site has the same frame.

## The frontmatter is a contract

A page's frontmatter is the data its layout gets, and the layout's schema says what that may be. Every key a page writes falls into one of three groups:

Keys for the build
: Fourteen keys belong to Pattern Dump, not to the layout: `layout`, `childLayout`, `order`, `redirectFrom`, `index`, `image`, `date`, `updated`, `tags`, `categories`, `draft`, `sort`, `view` and `toc`. They are never passed to the layout, and a layout schema that declares one fails every page using it.

Keys Pattern Dump fills
: `body`, `site` and `page`. A page that sets one gets `"<key>" is filled by Pattern Dump, not by a page`. The fourth, `nav`, is filled for the layout; on a page, `nav: false` keeps the page out of the navigation.

Everything else
: Declared in the layout's schema, or refused. `title` and `description` are no exception: a page can set them only when its layout declares them. A layout with no schema declares nothing.

This site's `layouts/doc` declares `liveSite`, `repository` and `styleGuide`, which the In practice pages set to link a site, its code and its style guide. On a page whose `layout:` is `article`, the same key fails:

```txt
"liveSite" is not declared by layout "article"
```

Pattern Dump reads nothing from the layout's sample data: a key only its `.json` has is still undeclared. A key the schema lists as `required` must be set. A value is converted to the declared type where it can be, `"3"` to a number for a `number`, `true` to a boolean for a `boolean`, and a value that fails its check is left out of what the layout gets. Every problem names the file and the line, `<file>:<line>: <message>`, and fails the page, so `pd build` writes nothing until it is fixed.

The frontmatter is not YAML. It is a fixed grammar: `key: value`, lists inline (`[a, b]`) or one item per line (`- a`), and one level of keys indented under a key, the way a page changes a [query's options](/concepts/collections-and-queries/#a-page-changes-its-query). Values stay text until the layout's schema gives them a type.

## What Pattern Dump works out for a page

Some of what a layout shows isn't in the page at all: the headings for a table of contents, the breadcrumbs, the previous and next page. Pattern Dump works these out and hands them to the layout under `page`:

`headings`, `section`, `breadcrumbs`, `prev`, `next`
: From the page and its place in the site: every heading with its level, text and anchor; the top-level section; the folders above it; its neighbours in the navigation.

`date`, `created`, `updated`
: `date` is the page's own, else the day of its first commit in git; `created` is the first commit's date from git; `updated` comes only from the page, never from git.

`tags`, `categories`, `term`, `terms`
: The page's tags and categories as objects, each with its label and the route of its tag or category page; on a tag or category page, the term, or every term on the index.

`children`, `listing`, and the layout's queries
: The pages of a folder, and lists of pages from anywhere: [Collections and queries](/concepts/collections-and-queries/).

`regions`
: What the page places in the layout's regions.

A layout gets only the sub-keys it declares, each `null` when there is nothing to work out. A layout that declares none gets no `page` at all, and one that declares a sub-key Pattern Dump doesn't fill fails the page. This site's `layouts/doc` declares `breadcrumbs`, `section`, `prev`, `next` and `regions`; `layouts/article` declares `date`, `tags`, `prev`, `next`, `regions` and its query, `related`.

Pattern Dump reads git only when a page first needs a date from it.

## The frame comes from the style guide

Pattern Dump takes the view that a site is one more place a design system is used, not a second design system. Its layouts are components, so the workbench shows them beside every other component, with their sample data, and a page on the site goes through the same render path.

The components can be the project's own, or a pattern package's. This site is the second kind: its config holds content only and names one package, its style guide (shortened here):

```ts
export default defineConfig({
  outDir: "./dist/workbench",
  packages: ["@pattern-dump-docs/styleguide"],
  site: {
    pagesDir: "./pages",
  },
});
```

The layouts, the frame and the views all come from that package. `pd init --site <package>` starts a site the same way, on an existing style guide; `pd init --with-site` writes a site and a skin beside a new design system.

A live example on a site page goes the same way: it is the component's preview from the workbench, `/preview/<id>`, in an `iframe`. There is no second renderer for the site: `pd build` asks the same server for every route and writes what it gets.
