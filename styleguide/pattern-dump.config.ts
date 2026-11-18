import { defineConfig } from "pattern-dump";

// The style guide as a project of its own: its own `pd dev` and workbench. Its folders (patterns, styles and the
// base layer, themes, scripts, assets) are described once, in package.json's "patternDump" field, which both this
// workbench and the site (../site, which installs this package) read.
export default defineConfig({
  outDir: "./dist",
  styles: { strategy: "parallel" },
  assets: { strategy: "central" },

  // Pattern packages used alongside this project's own patterns: install them, then name them here.
  // packages: ["@n8d/htwoo-patterns"],

  shell: {
    brand: { title: "Pattern Dump" },
  },
});
