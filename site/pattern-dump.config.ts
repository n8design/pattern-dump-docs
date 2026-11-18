import { defineConfig } from "pattern-dump";

// Content only: no patterns, skin, styles or themes of its own. All of them come from the style guide package
// (../styleguide, linked as a file: dependency); its package.json ("patternDump") says where they are.
export default defineConfig({
  outDir: "./dist/workbench",
  packages: ["@pattern-dump-docs/styleguide"],
  storefront: {
    pagesDir: "./pages",
    outDir: "./dist/site",
    // The style guide's own workbench, published beside the site under /workbench/ (the root's "pages" script).
    // The site's build also writes a workbench of its own (dist/workbench, the same components from the package);
    // it isn't published.
    workbenchUrl: "/workbench/",
    // The site's address, once you know it: canonical URLs, link previews and the sitemap are built from it.
    // url: "https://www.example.com/",
    categories: {
      notes: { label: "Notes", description: "Short articles about this site" },
    },
    // Search: pd build indexes every page with Pagefind once this workspace has it (npm install --save-dev pagefind
    // -w @pattern-dump-docs/site); organisms/search, from the style guide, is the search field.
    site: { title: "Pattern Dump", footer: "Made with Pattern Dump." },
  },
  // pd build requires the site's own workbench to be built for the same address as workbenchUrl, even though that
  // workbench isn't published.
  build: { basePath: "/workbench/" },
});
