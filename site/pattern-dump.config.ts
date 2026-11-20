import { defineConfig } from "pattern-dump";
// The installed Pattern Dump's version, read when the site builds (pd bundles this file, inlining the JSON), so the
// home page's eyebrow follows the pin.
import patternDumpPackage from "pattern-dump/package.json" with { type: "json" };

// Content only: no patterns, skin, styles or themes of its own. All of them come from the style guide package
// (../styleguide, linked as a file: dependency); its package.json ("patternDump") says where they are.
export default defineConfig({
  // Required by every config. This site builds no workbench of its own (build.workbench below), so nothing is
  // written here.
  outDir: "./dist/workbench",
  packages: ["@pattern-dump-docs/styleguide"],
  site: {
    pagesDir: "./pages",
    outDir: "./dist/site",
    // The style guide's own workbench, published beside the site under /workbench/ (the root's "pages" script).
    workbenchUrl: "/workbench/",
    // The site's address, once you know it: canonical URLs, link previews and the sitemap are built from it.
    // url: "https://www.example.com/",
    categories: {
      notes: { label: "Notes", description: "Short articles about this site" },
    },
    // Search: pd build indexes every page with Pagefind once this workspace has it (npm install --save-dev pagefind
    // -w @pattern-dump-docs/site); organisms/search, from the style guide, is the search field.
    globals: { title: "Pattern Dump", footer: "Pattern Dump. Built with Pattern Dump.", patternDumpVersion: patternDumpPackage.version },
  },
  // The site only: its pages link into the style guide's own workbench at workbenchUrl.
  build: { workbench: false },
});
