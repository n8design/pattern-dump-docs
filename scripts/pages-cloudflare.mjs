// Cloudflare Pages' build command for pattern-dump.design: `node scripts/pages-cloudflare.mjs`, after npm ci.
// Cloudflare builds the production branch and also every other branch and pull request, as previews on *.pages.dev.
// Only a production build may be indexed: the main branch, with PD_SITE_URL set (Cloudflare sets CF_PAGES_BRANCH).
// Every other build runs `npm run pages -- --noindex`, as the draft's workflow does (.github/workflows/pages.yml), so
// robots.txt disallows everything and every page carries a robots noindex meta (scripts/assemble-pages.mjs).
// Production variables read further down the build: PD_SITE_URL, PD_ANALYTICS_KEY (site/pattern-dump.config.ts) and
// PD_INDEXNOW_KEY (scripts/assemble-pages.mjs writes <key>.txt at the root with it).
import { spawnSync } from "node:child_process";

// pd build needs the full history (page dates from git) and refuses a shallow clone; the draft's workflow checks out
// with fetch-depth: 0. If Cloudflare's clone is shallow, it is deepened first.
const shallow = spawnSync("git", ["rev-parse", "--is-shallow-repository"], { encoding: "utf8" }).stdout.trim() === "true";
if (shallow) {
  console.log("pages-cloudflare: the clone is shallow; fetching the full history");
  const fetch = spawnSync("git", ["fetch", "--unshallow", "--quiet"], { stdio: "inherit" });
  if (fetch.status !== 0) process.exit(fetch.status ?? 1);
}

const branch = process.env.CF_PAGES_BRANCH ?? "";
const production = branch === "main" && Boolean(process.env.PD_SITE_URL);
const args = ["run", "pages", ...(production ? [] : ["--", "--noindex"])];

console.log(`pages-cloudflare: branch "${branch || "(none)"}", PD_SITE_URL ${process.env.PD_SITE_URL ? "set" : "unset"}: ${production ? "production, indexed" : "a preview, noindex"}`);
const run = spawnSync("npm", args, { stdio: "inherit" });
process.exit(run.status ?? 1);
