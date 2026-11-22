import { defineConfig } from "pattern-dump";
// The installed Pattern Dump's version, read when the site builds (pd bundles this file, inlining the JSON), so the
// home page's eyebrow follows the pin.
import patternDumpPackage from "pattern-dump/package.json" with { type: "json" };
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

// Its release date, from the same package's CHANGELOG.md ("## 0.8.1 (2026-11-22)"), for the home page's start row.
// Resolved from the site's folder (pd runs here), not from this file, which pd bundles somewhere else.
const changelog = readFileSync(join(dirname(createRequire(join(process.cwd(), "package.json")).resolve("pattern-dump/package.json")), "CHANGELOG.md"), "utf8");
const released = changelog.match(new RegExp(`^## ${patternDumpPackage.version.replaceAll(".", "\\.")} \\((\\d{4}-\\d{2}-\\d{2})\\)`, "m"))?.[1];
if (!released) throw new Error(`pattern-dump.config.ts: no "## ${patternDumpPackage.version} (<date>)" heading in pattern-dump's CHANGELOG.md`);
const patternDumpReleased = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(released));

// The style guide's workbench. Published, it sits beside the site under /workbench/ (the root's "pages" script); in
// `pd dev` it is the dev server's own, on the workbench's host and the same port (--port, else PD_PORT, else 4000).
// The footer's "Style guide" link and x-ray's labels are built from it (site.globals.workbenchUrl).
const devPort = (() => {
  const i = process.argv.findIndex(arg => arg === "--port" || arg.startsWith("--port="));
  if (i < 0) return process.env.PD_PORT ?? "4000";
  return process.argv[i].includes("=") ? process.argv[i].split("=")[1] : process.argv[i + 1];
})();
const workbenchUrl = process.argv[2] === "dev" ? `http://pd.localhost:${devPort}/` : "/workbench/";

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
    workbenchUrl,
    // The site's address, once you know it: canonical URLs, link previews and the sitemap are built from it.
    // url: "https://www.example.com/",
    categories: {
      notes: { label: "Notes", description: "Short articles about this site" },
    },
    // Search: pd build indexes every page with Pagefind once this workspace has it (npm install --save-dev pagefind
    // -w @pattern-dump-docs/site); organisms/search, from the style guide, is the search field.
    globals: { title: "Pattern Dump", footer: "Built with Pattern Dump.", author: { name: "n8d", href: "https://n8d.at" }, repository: { href: "https://github.com/n8design/pattern-dump" }, sponsor: { href: "https://github.com/sponsors/StfBauer" }, patternDumpVersion: patternDumpPackage.version, patternDumpReleased, workbenchUrl },
  },
  // The site only: its pages link into the style guide's own workbench at workbenchUrl.
  build: { workbench: false },
});
