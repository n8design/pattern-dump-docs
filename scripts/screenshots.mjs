// Every screenshot of the docs, taken from this repo's own style guide in the Pattern Dump workbench, and of one page
// of this site. Run on purpose, not on every build:
//
//   npm run screenshots
//
// Writes styleguide/assets/screenshots/<name>.webp, and for the site page <name>-dark.webp too, in lossless WebP at
// twice the window's size, so the site serves them at /assets/screenshots/<file>. A page embeds a shot as a markdown
// image on a line of its own, `![Alt](/assets/screenshots/<name>.webp "Caption")`: Pattern Dump makes it a <figure>,
// a <picture> with the -dark file as its dark source, and the WebP variants with width and height. The same input gives the same bytes: a fixed
// window, the fonts loaded before each shot, no animations, the clock pinned. Re-running without changes changes no file.
//
// A shot names the pattern it photographs. If that pattern no longer exists in the style guide, the shot is not taken
// (and never swapped for another one), the other shots still are, and the script exits with 1 and lists what was missing.
//
// It uses the workbench at http://localhost:4300 and the site at http://live.localhost:4000 if they are running, and
// starts (and stops again) the ones that are not.

import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "styleguide/assets/screenshots");

const WORKBENCH = "http://localhost:4300";
const SITE = "http://live.localhost:4000";
const SITE_PAGE = { url: "/reference/configuration/", file: "site/pages/reference/configuration.md" };
// 2024-01-01 00:00 UTC: pins Date for everything the pages compute. Dates in sample data are in the data already.
const PINNED_TIME = new Date("2024-01-01T00:00:00Z");

const SCHEMES = [
  { suffix: "", colorScheme: "light" },
  { suffix: "-dark", colorScheme: "dark" },
];
// The workbench frame has no dark mode yet (only its previews follow the system), so a -dark workbench shot would be a
// light frame around a dark Stage. Until it has one (1.0), workbench shots are light only and only the site page gets a
// -dark pair. See "The workbench frame has no dark mode" in pattern-dump-internal/docs/BACKLOG.md.
const schemesFor = (shot) => (shot.site ? SCHEMES : SCHEMES.filter((s) => s.colorScheme === "light"));
// One file per shot, at 2x: Pattern Dump writes the smaller variants from it, so a 1x file would be one more image
// that no page links to.
const DEVICE_SCALE_FACTOR = 2;

const WINDOW = { width: 1440, height: 900 };

const clickTab = (name) => async (page) => {
  await page.getByRole("tab", { name, exact: true }).click();
};

// The shots. `pattern` is the id the workbench must have in its tree (checked first). `setup` gets the page after it
// loaded and the fonts are ready.
const SHOTS = [
  {
    name: "workbench-overview",
    pattern: "components/note",
    setup: clickTab("Console"),
  },
  {
    name: "workbench-component-preview",
    pattern: "components/note",
    setup: async (page) => {
      await page.locator("select.variant-select").selectOption("__all__");
      // the preview frames reload; wait for the last variant's heading to be in the stage
      await page.waitForTimeout(1000);
    },
  },
  {
    name: "workbench-component-docs",
    pattern: "atoms/button",
    // The Inspector is 20rem by default, too narrow for the button template's `class="button button-{{variant}}"`
    // line in the docs' src-template block: it is cut off (see "Workbench: a long line in the Inspector's code runs
    // under the Copy button" in pattern-dump-internal/docs/BACKLOG.md). A wider window doesn't help, the extra width
    // goes to the Stage. So this shot stores a wider Inspector, as its splitter would, before the page loads: 24rem is
    // the smallest whole rem at which that line is whole (23rem misses by one pixel). Stored, not dragged, so every run
    // gets the same width.
    viewState: { dims: { sidebarW: "", panelW: "24rem", dockH: "" }, dockVisibility: { rightPanelOpen: true } },
    setup: clickTab("Docs"),
  },
  {
    name: "workbench-theme-picker",
    pattern: "atoms/button",
    setup: async (page) => {
      await page.locator("summary", { hasText: "system" }).first().click();
    },
  },
  {
    // Needs a component that has findings. It is kept for this purpose, in the style guide, and is not created here.
    // Kept for this shot: it borrows the note's classes, one STYLE_BORROWED info, not in pd audit (its docs say why).
    name: "workbench-diagnostics-tab",
    pattern: "components/diagnostics-sample",
    setup: async (page) => {
      await clickTab("Diagnostics")(page);
      // The rendered checks run on request here; run them so the tab shows its complete state.
      const run = page.getByRole("button", { name: "Run rendered checks" });
      if (await run.count()) await run.click();
      await page.getByText("running rendered checks").waitFor({ state: "detached", timeout: 30000 });
      // The groups are a closed accordion: open the one with the finding, so the finding itself shows.
      const group = page.locator("details[name='pd-diagnostics'] > summary", { hasText: "Render/Template" });
      await group.waitFor();
      if (!(await group.evaluate((s) => s.parentElement.open))) await group.click();
    },
  },
  {
    name: "workbench-audit-tab",
    pattern: "atoms/button",
    inspector: "Audit",
    setup: async (page) => {
      await clickTab("Audit")(page);
      await page.getByText("Rules by blast radius").waitFor();
    },
  },
  {
    name: "workbench-layout-doc",
    pattern: "layouts/doc",
    window: { width: 1440, height: 1300 },
    setup: async (page) => {
      await page.getByRole("button", { name: "Full height" }).click();
      // the Source dock (bottom) closed, so the layout has the room
      await page.getByRole("button", { name: "Source dock" }).click();
      await page.waitForTimeout(1000);
    },
  },
  {
    name: "workbench-folder-gallery",
    pattern: "molecules",
    setup: async () => {},
  },
  {
    name: "site-page",
    site: SITE_PAGE,
    window: { width: 1280, height: 800 },
    setup: async () => {},
  },
];

// ---------------------------------------------------------------------------------------------------------------

const children = [];

async function reachable(url) {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(2000) });
    return r.status < 500;
  } catch {
    return false;
  }
}

async function ensureServer(label, url, command) {
  if (await reachable(url)) return;
  console.log(`${label}: not running, starting it (${command.join(" ")})`);
  const child = spawn(command[0], command.slice(1), { cwd: root, detached: true, stdio: "ignore" });
  children.push(child);
  for (let i = 0; i < 120; i++) {
    if (await reachable(url)) return;
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`${label} did not answer at ${url} within a minute`);
}

function stopServers() {
  for (const child of children) {
    try {
      process.kill(-child.pid, "SIGTERM");
    } catch {
      /* already gone */
    }
  }
}

// Waits for every font of the page and of its frames, then a frame, so layout has settled.
async function settle(page) {
  await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
  for (const frame of page.frames()) {
    await frame.evaluate(() => document.fonts.ready).catch(() => {});
  }
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
}

async function toWebp(png) {
  // lossless: crisp text, the same bytes for the same pixels. One thread, so nothing depends on timing.
  return sharp(png).webp({ lossless: true, effort: 6, smartSubsample: false }).toBuffer();
}

function write(file, buffer) {
  if (existsSync(file) && readFileSync(file).equals(buffer)) return;
  writeFileSync(file, buffer);
}

async function main() {
  mkdirSync(outDir, { recursive: true });
  sharp.concurrency(1);

  await ensureServer("workbench", WORKBENCH, ["npm", "run", "dev:styleguide"]);
  const needsSite = SHOTS.some((s) => s.site);
  if (needsSite) await ensureServer("site", SITE, ["npm", "run", "dev"]);

  const browser = await chromium.launch();
  const missing = [];

  // 1. Which patterns exist? The workbench's tree names them; a shot with a pattern that isn't there is skipped.
  const probe = await browser.newPage({ viewport: WINDOW });
  await probe.goto(`${WORKBENCH}/`, { waitUntil: "networkidle" });
  await probe.locator('a[href^="/"]').first().waitFor();
  const present = new Set(
    await probe.evaluate(() =>
      [...document.querySelectorAll("a[href^='/']")].map((a) => a.getAttribute("href").replace(/^\//, "")),
    ),
  );
  await probe.close();

  // `npm run screenshots -- name [name ...]` takes only those shots.
  const only = process.argv.slice(2);
  const todo = [];
  for (const shot of SHOTS.filter((s) => only.length === 0 || only.includes(s.name))) {
    if (shot.pattern && !present.has(shot.pattern)) {
      missing.push(`${shot.name}: the pattern "${shot.pattern}" is not in the style guide`);
    } else if (shot.site && !existsSync(join(root, shot.site.file))) {
      missing.push(`${shot.name}: the page ${shot.site.file} does not exist`);
    } else {
      todo.push(shot);
    }
  }

  // 2. Each shot at 2x, in light, and for the site page in dark too (schemesFor).
  for (const shot of todo) {
    const url = shot.site ? `${SITE}${shot.site.url}` : `${WORKBENCH}/${shot.pattern}`;
    for (const scheme of schemesFor(shot)) {
      {
        const context = await browser.newContext({
          viewport: shot.window ?? WINDOW,
          deviceScaleFactor: DEVICE_SCALE_FACTOR,
          colorScheme: scheme.colorScheme,
          reducedMotion: "reduce",
          locale: "en-US",
          timezoneId: "UTC",
        });
        await context.clock.setFixedTime(PINNED_TIME);
        // A shot's viewState is the workbench's stored view (localStorage "pd-view-state"), written before the first
        // load only, so the workbench's own writes survive the reload below. Storing it at all ends the first-load
        // defaults, which is why a viewState that wants the Inspector says rightPanelOpen.
        if (shot.viewState) {
          await context.addInitScript((state) => {
            if (localStorage.getItem("pd-view-state") === null) localStorage.setItem("pd-view-state", state);
          }, JSON.stringify(shot.viewState));
        }
        const page = await context.newPage();
        const response = await page.goto(url, { waitUntil: "networkidle" });
        if (!response?.ok()) {
          missing.push(`${shot.name}: ${url} answered ${response?.status()}`);
          await context.close();
          continue;
        }
        await settle(page);
        // The workbench measures a preview once; if that happened before the fonts arrived the stage keeps the
        // fallback font's size. A second load has them from the cache, so every run measures the same.
        await page.reload({ waitUntil: "networkidle" });
        await settle(page);
        try {
          await shot.setup(page);
        } catch (error) {
          missing.push(`${shot.name}: ${error.message.split("\n")[0]}`);
          await context.close();
          continue;
        }
        // The Inspector's tab marker is placed from the width of the tab's label, which can be measured before the
        // font has arrived and then differs by a hairline between runs. Selecting the tab again places it for good.
        const relationships = page.getByRole("tab", { name: "Relationships", exact: true });
        if (!shot.site && (await relationships.count()) > 0) {
          await relationships.click();
          await page.getByRole("tab", { name: shot.inspector ?? "Docs", exact: true }).click();
        }
        // no hover label, no focus ring left from a click
        await page.evaluate(() => document.activeElement?.blur());
        await page.mouse.move(2, 2);
        await settle(page);
        // Fonts and frame sizes can settle a moment after load: shoot until two shots in a row are the same picture.
        const shoot = () => page.screenshot({ animations: "disabled", caret: "hide", scale: "device" });
        let png = await shoot();
        for (let i = 0; i < 20; i++) {
          await page.waitForTimeout(400);
          const next = await shoot();
          const same = next.equals(png);
          png = next;
          if (same) break;
          if (i === 19) missing.push(`${shot.name}: the picture did not settle`);
        }
        await context.close();
        const file = join(outDir, `${shot.name}${scheme.suffix}.webp`);
        write(file, await toWebp(png));
        console.log(`wrote ${file.replace(`${root}/`, "")}`);
      }
    }
  }

  await browser.close();

  if (missing.length > 0) {
    console.error(`\n${missing.length} screenshot(s) missing:`);
    for (const line of [...new Set(missing)]) console.error(`  - ${line}`);
    process.exitCode = 1;
  }
}

try {
  await main();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  stopServers();
}
