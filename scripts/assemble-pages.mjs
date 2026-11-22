// Puts the two builds together as one GitHub Pages artifact in _site/: the website (site/dist/site) at the root,
// and the style guide's own workbench (styleguide/dist) under workbench/. Both are built for their addresses
// already (site.workbenchUrl and --base), so this only copies them.
// Run by `npm run pages`, locally and in .github/workflows/pages.yml.
// --noindex (pages.yml only): the draft site at draft.pattern-dump.design must never be indexed, so robots.txt
// disallows everything and every page carries a robots noindex meta. The production build runs without it.
import { cpSync, existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const site = "site/dist/site";
const styleguide = "styleguide/dist";
const out = "_site";
for (const dir of [site, styleguide]) {
  if (!existsSync(dir)) throw new Error(`${dir} is missing: build it first`);
}

rmSync(out, { recursive: true, force: true });
cpSync(site, out, { recursive: true });
cpSync(styleguide, join(out, "workbench"), { recursive: true });
console.log(`${out}: the website, and the style guide's workbench under workbench/`);

if (process.argv.includes("--noindex")) {
  writeFileSync(join(out, "robots.txt"), "User-agent: *\nDisallow: /\n");
  const meta = '<meta name="robots" content="noindex">';
  let pages = 0;
  for (const file of readdirSync(out, { recursive: true })) {
    if (!String(file).endsWith(".html")) continue;
    const path = join(out, String(file));
    const html = readFileSync(path, "utf8");
    if (html.includes('name="robots"')) continue;
    // The workbench also ships HTML fragments (its source panels) that are loaded into a page, not opened as one:
    // they have no <head> and need no meta; robots.txt keeps crawlers off them anyway.
    const head = html.match(/<head[^>]*>/i);
    if (!head) continue;
    writeFileSync(path, html.replace(head[0], `${head[0]}\n${meta}`));
    pages++;
  }
  console.log(`${out}: noindex, robots.txt disallows everything and ${pages} pages carry the robots meta`);
}
