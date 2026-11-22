// The width the header needs for its one row (organisms/site-header): the logo and the site's name, the sections, GitHub
// and the search field, the gaps between them and the page gutters either side. Below it, the header is the phone
// menu's row instead, by a media query in the style guide and the same query in its script. The row is the same on
// every page of a build, so the width is measured once, here, with the real fonts, and written into the style guide as
// a literal (a media query can't read a custom property).
//
//   npm run header-width                    measure, and write styleguide/src/styles/organisms/_site-header-width.scss
//   node scripts/header-width.mjs --check   no browser: fail when the header is no longer the one that was measured
//
// Run it after a change to the header (a section added, renamed or moved, the site's name, the logo, the search field,
// a font, the gutters), then build again. It reads the built site (site/dist/site), served from a small server of its
// own, in Chromium (Playwright). It takes the row's own width (each part at its natural width, the gaps between), then
// narrows the window until the header's content box, inside the gutters, is no wider than that: the header's width
// there, in em of its 1rem, rounded up to 0.01em, is the width written. It is the header's width, not the window's:
// the style guide adds room for a classic scrollbar on top.
//
// Beside the width it writes a fingerprint of what it measured: the header as the built home page writes it (the logo,
// the site's name, the sections, GitHub, the search field), the font files in styleguide/assets/fonts, and the
// stylesheets that set the row (the header's, the nav's, the frame's gutters and the tokens). `npm run build` and
// `npm run pages` run the check, which computes the fingerprint again without a browser and fails when it differs.
import { createServer } from "node:http";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const siteDir = join(root, "site/dist/site");
const partial = join(root, "styleguide/src/styles/organisms/_site-header-width.scss");
const check = process.argv.includes("--check");
const fontsDir = join(root, "styleguide/assets/fonts");
const styles = [
  "styleguide/src/styles/organisms/site-header.scss",
  "styleguide/src/styles/molecules/site-nav.scss",
  "styleguide/src/styles/pages/frame.scss",
  "styleguide/src/styles/base/_tokens.scss",
];

// The header as the built home page writes it, every font file, and the stylesheets that set the row, hashed together.
const fingerprint = () => {
  const home = readFileSync(join(siteDir, "index.html"), "utf8");
  const header = home.match(/<header class="site-header"[\s\S]*?<\/header>/)?.[0];
  if (!header) throw new Error("header-width: no .site-header in site/dist/site/index.html: build the site first");
  const hash = createHash("sha256").update(header);
  for (const file of readdirSync(fontsDir).filter(f => f.endsWith(".woff2")).sort()) {
    hash.update(file).update(readFileSync(join(fontsDir, file)));
  }
  for (const file of styles) hash.update(file).update(readFileSync(join(root, file)));
  return hash.digest("hex").slice(0, 16);
};

const committedText = readFileSync(partial, "utf8");
if (check) {
  const committed = committedText.match(/\$site-header-width-fingerprint:\s*"([0-9a-f]+)";/)?.[1];
  const now = fingerprint();
  if (committed !== now) {
    console.error(`header-width: the header's content, fonts or styles changed since its width was measured (fingerprint ${now}, _site-header-width.scss has ${committed ?? "none"}): run \`npm run header-width\`, then build again`);
    process.exit(1);
  }
  console.log("header-width: the header is the one that was measured");
  process.exit(0);
}

const { chromium } = await import("playwright");

const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".woff2": "font/woff2", ".svg": "image/svg+xml", ".webp": "image/webp", ".json": "application/json" };
const server = createServer((req, res) => {
  let path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^(\.\.[/\\])+/, "");
  let file = join(siteDir, path);
  try { if (statSync(file).isDirectory()) file = join(file, "index.html"); } catch { /* not found below */ }
  try {
    res.writeHead(200, { "content-type": types[extname(file)] ?? "application/octet-stream" });
    res.end(readFileSync(file));
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));

let width;
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 2400, height: 1080 } });
  await page.goto(`http://127.0.0.1:${server.address().port}/`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  // The row's own width: in a window wide enough for it, with the sections at their natural width (the nav otherwise
  // takes up the room to spare), from the left edge of the first part to the right edge of the last.
  const row = await page.evaluate(() => {
    const style = document.createElement("style");
    style.textContent = ".site-nav { flex: none !important; }";
    document.head.append(style);
    const header = document.querySelector(".site-header");
    const parts = [...header.querySelectorAll(":scope > *, :scope > .site-menu > *")]
      .filter(part => !part.matches(".site-menu") && part.getClientRects().length > 0)
      .map(part => part.getBoundingClientRect());
    if (new Set(parts.map(part => Math.round(part.top + part.height / 2))).size !== 1) throw new Error("the header isn't one row at 2400px");
    style.remove();
    return Math.max(...parts.map(part => part.right)) - Math.min(...parts.map(part => part.left));
  });
  // The narrowest window whose header still holds a row of that width inside its gutters (the gutters grow with the
  // window): the header's width there, in em.
  const fits = async (viewport, need) => {
    await page.setViewportSize({ width: viewport, height: 1080 });
    return page.evaluate(need => {
      const header = document.querySelector(".site-header");
      const style = getComputedStyle(header);
      const content = header.getBoundingClientRect().width - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      return { ok: content >= need, header: header.getBoundingClientRect().width, em: parseFloat(style.fontSize) };
    }, need);
  };
  const narrowest = async need => {
    let low = 160, high = 2400;
    if (!(await fits(high, need)).ok) throw new Error(`a row of ${need}px doesn't fit the header even at 2400px`);
    while (high - low > 1) {
      const mid = Math.floor((low + high) / 2);
      if ((await fits(mid, need)).ok) high = mid; else low = mid;
    }
    const at = await fits(high, need);
    return Math.ceil((at.header / at.em) * 100) / 100;
  };
  width = await narrowest(row);
} finally {
  await browser.close();
  server.close();
}

const text = committedText
  .replace(/\$site-header-width:\s*[\d.]+em;/, `$site-header-width: ${width}em;`)
  .replace(/\$site-header-width-fingerprint:\s*"[0-9a-f]*";/, `$site-header-width-fingerprint: "${fingerprint()}";`);
writeFileSync(partial, text);
console.log(`header-width: ${width}em written to styleguide/src/styles/organisms/_site-header-width.scss, with its fingerprint`);
