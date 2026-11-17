import { defineConfig } from "pattern-dump";

// Every path below resolves against this project's root (the folder this file lives in).
export default defineConfig({
  sourceDir: "./src",
  patternsDir: "./src/patterns",
  outDir: "./dist",

  // Styles mirror the patterns tree: src/styles/atoms/button.scss belongs to atoms/button.
  styles: { strategy: "parallel", dir: "./src/styles" },
  // Shared, component-less rules (reset, document defaults) linked beneath every preview.
  documentBase: ["base"],

  themes: {
    dir: "./themes",
    default: "light",
    switch: "attribute",
    // Custom properties sampled for the swatch strip in the theme picker.
    swatch: { slots: ["--color-surface", "--color-primary", "--color-text"] },
  },

  assets: { strategy: "central", dir: "./assets" },

  // Behaviour scripts: src/scripts/<id>.ts, compiled on request. A component loads one with
  // `requireScript: [<id>]` in its .md frontmatter; ids listed here load into every preview.
  scriptsDir: "./src/scripts",
  // globalScripts: ["<id>"],

  // Pattern packages used alongside this project's own patterns: install them, then name them here.
  // Each package describes its patterns, styles and themes in its package.json ("patternDump").
  // packages: ["@n8d/htwoo-patterns"],

  // The website: every markdown file in ../site/ (the repository's site/ folder, beside this style guide) is a
  // page, rendered with the skin in src/patterns/layouts and src/patterns/partials. `npm run dev` prints its
  // address, http://live.localhost:4000/.
  storefront: {
    pagesDir: "../site",
    // The built website. Not ./site: that name is now the pages' source folder at the repository root.
    outDir: "./public",
    // The workbench is published on the website's own host, under /workbench/ (and built for that path,
    // build.basePath below).
    workbenchUrl: "/workbench/",
    // The site's address, once you know it: canonical URLs, link previews and the sitemap are built from it.
    // url: "https://www.example.com/",
    // Or a subfolder, such as a GitHub project page: the site is then served under the path, in `npm run dev` too,
    // and the workbench goes under it as well (workbenchUrl and build.basePath "/<repository>/workbench/").
    // url: "https://<owner>.github.io/<repository>/",
    // What a page can be about, independent of its folder: a page names them in `categories:`. Each category and each
    // tag gets a page (layouts/category, layouts/tag) and an index (/categories/, /tags/). Tags can be declared the
    // same way (tags: { ... }), so a typo fails the build; undeclared, any tag works.
    categories: {
      notes: { label: "Notes", description: "Short articles about this site" },
    },
    // Search: pd build indexes every page with Pagefind once the project has it (npm install --save-dev pagefind);
    // components/search is the search field. search: true makes a build without Pagefind stop, false turns it off.
    site: { title: "Pattern Dump", footer: "Made with Pattern Dump." },
  },
  build: { basePath: "/workbench/" },

  shell: {
    brand: { title: "Pattern Dump" },
  },
});
