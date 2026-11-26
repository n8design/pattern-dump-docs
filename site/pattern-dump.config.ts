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
// The site's language and date style, set once: site.lang and site.dates below write every page's and entry's dates
// (page.dateText, an entry's dateText); the release date is no page's date, so it is written here, with the same two.
const lang = "en-GB";
const dates = { day: "numeric", month: "long", year: "numeric" } as const;
const patternDumpReleased = new Intl.DateTimeFormat(lang, { ...dates, timeZone: "UTC" }).format(new Date(released));

// The production build sets these (Cloudflare Pages, scripts/pages-cloudflare.mjs); the draft, local builds and CI
// leave them unset. PD_SITE_URL is the site's address: canonical URLs, link previews and the sitemap are built from it,
// and without it there are none. PD_ANALYTICS_KEY is the Ahrefs Web Analytics key: the head partial (partials/head)
// loads the script only when it is set.
const siteUrl = process.env.PD_SITE_URL || undefined;
const analyticsKey = process.env.PD_ANALYTICS_KEY || undefined;

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
    // British English, which also decides how dates are written for readers, in the style site.dates sets
    // ("26 November 2026"); both from the constants above.
    lang,
    dates,
    // The style guide's workbench, published beside the site under /workbench/ (the root's "pages" script). Pattern
    // Dump gives templates site.workbenchUrl: this address in pd build, its own workbench in pd dev. The footer's
    // "Style guide" link and x-ray's labels are built from it.
    workbenchUrl: "/workbench/",
    // The site's address, from PD_SITE_URL (above); left out when it is unset.
    ...(siteUrl ? { url: siteUrl } : {}),
    // The link-preview image of every page that names none; used once site.url is set.
    image: "/assets/social-preview.png",
    categories: {
      notes: { label: "Notes", description: "Short articles about this site" },
    },
    // Search: pd build indexes every page with Pagefind once this workspace has it (npm install --save-dev pagefind
    // -w @pattern-dump-docs/site); organisms/search, from the style guide, is the search field.
    globals: { title: "Pattern Dump", footer: "Built with Pattern Dump.", author: { name: "Stefan Bauer", href: "https://n8d.at/", location: "Vienna, Austria" }, repository: { href: "https://github.com/n8design/pattern-dump" }, sponsor: { href: "https://github.com/sponsors/StfBauer" }, patternDumpVersion: patternDumpPackage.version, patternDumpReleased, ...(analyticsKey ? { analyticsKey } : {}) },
  },
  // The site only: its pages link into the style guide's own workbench at site.workbenchUrl.
  build: { workbench: false },
});
