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
//
// The demo shots are the one exception to "this repo's own style guide": they photograph the demo (the
// pattern-dump-demo repository, on its 0.8.0 branch), for the In practice index: three of its site's pages and two
// components in its site's workbench, all light only. The demo has no dark mode, so a -dark shot of its pages would be
// the same picture; they get a dark pair (in schemesFor) once the demo has one. The script doesn't start the demo:
// start it yourself, on its own port (DEMO_PORT), because this site's `pd dev` holds 4000:
//
//   cd ../pattern-dump-demo && PD_PORT=4100 npm run dev:site
//
// If the demo isn't running, or one of its pages or patterns doesn't answer, that shot is not taken and is listed as
// missing, like a missing pattern.
//
// One demo shot is a video: demo-tour, the deck's tour of the landing page (recordTour). It takes a minute and is never
// the same bytes twice, so it is recorded only when named, `npm run screenshots -- demo-tour`, never in a full run. It
// writes styleguide/assets/videos/demo-tour.mp4 (H.264) and demo-tour.webm (VP9), with ffmpeg; its poster is the
// demo-home still.

import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "styleguide/assets/screenshots");
const videoDir = join(root, "styleguide/assets/videos");

const WORKBENCH = "http://localhost:4300";
// SITE_PORT moves this site's `pd dev` off 4000, when another project's holds it: `SITE_PORT=4010 npm run screenshots`.
// The script starts it there (as PD_PORT) if it isn't running.
const SITE_PORT = process.env.SITE_PORT || "4000";
const SITE = `http://live.localhost:${SITE_PORT}`;
const SITE_PAGE = { url: "/reference/configuration/", file: "site/pages/reference/configuration.md" };
// The demo's `pd dev`: its site, and its site's workbench (the style guide's components, from the package), on one port.
const DEMO_PORT = 4100;
const DEMO_SITE = `http://live.localhost:${DEMO_PORT}`;
const DEMO_WORKBENCH = `http://pd.localhost:${DEMO_PORT}`;
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

// The shots. `pattern` is the id the workbench must have in its tree (checked first); `demoPattern` the same in the
// demo's workbench; `demoPage` a path on the demo's site. `setup` gets the page after it loaded and the fonts are ready.
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
  // The demo's site, light only (it has no dark mode yet, see the top of this file), in the order the In practice
  // index tells it: the landing page, the articles, one article.
  {
    name: "demo-home",
    demoPage: "/pattern-dump-demo/",
    window: { width: 1280, height: 800 },
    setup: async () => {},
  },
  {
    name: "demo-articles",
    demoPage: "/pattern-dump-demo/articles/",
    window: { width: 1280, height: 800 },
    setup: async () => {},
  },
  {
    name: "demo-article",
    demoPage: "/pattern-dump-demo/articles/why-style-guides-matter/",
    window: { width: 1280, height: 800 },
    setup: async () => {},
  },
  // The style guide behind it, in the demo's workbench; light only, as the other workbench shots.
  {
    // the landing page's layout, with its docs
    name: "demo-layout-deck",
    demoPattern: "layouts/deck",
    window: { width: 1280, height: 800 },
    setup: clickTab("Docs"),
  },
  {
    name: "demo-colors-sunset",
    demoPattern: "foundations/colors/sunset",
    window: { width: 1280, height: 800 },
    setup: async () => {},
  },
  // The landing page as a video, the deck's tour from the cover to the last card (recordTour). Only when named.
  {
    name: "demo-tour",
    demoTour: "/pattern-dump-demo/",
    named: true,
  },
];

// The tour: the window and the video at the same size, and how long it rests on the cover, on each card and on the last.
const TOUR_SIZE = { width: 1280, height: 800 };
const TOUR_HOLD = { cover: 2000, card: 2500, last: 2000 };
// The tour ends on the card with this eyebrow.
const TOUR_LAST = "11 · Try it";
// Quality: lower is better and bigger. Checked for banding in the waves' gradients, the hardest part of the picture.
const H264_CRF = 23;
const VP9_CRF = 33;

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

async function ensureServer(label, url, command, env = {}) {
  if (await reachable(url)) return;
  console.log(`${label}: not running, starting it (${command.join(" ")})`);
  const child = spawn(command[0], command.slice(1), { cwd: root, detached: true, stdio: "ignore", env: { ...process.env, ...env } });
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

// The deck's tour, recorded the way a visitor sees it: motion on (no reducedMotion), the waves drawn, "Learn more"
// clicked. The deck's own tour waits as long as reading each card takes, so it is stopped once it reaches the first
// card, and the script moves on from card to card itself, to each card's resting place (data-waves-rest, which the
// waves record) with the deck's glide: --learn-more-duration, ease-in-out (deck.ts in the demo's style guide).
async function recordTour(browser, shot, missing) {
  if (spawnSync("ffmpeg", ["-version"]).status !== 0) {
    missing.push(`${shot.name}: ffmpeg is not installed`);
    return;
  }
  const raw = mkdtempSync(join(tmpdir(), "pd-tour-"));
  const context = await browser.newContext({
    viewport: TOUR_SIZE,
    recordVideo: { dir: raw, size: TOUR_SIZE },
    locale: "en-US",
    timezoneId: "UTC",
  });
  const page = await context.newPage();
  const started = Date.now();
  let ready = started;
  try {
    const response = await page.goto(`${DEMO_SITE}${shot.demoTour}`, { waitUntil: "networkidle" });
    if (!response?.ok()) throw new Error(`${DEMO_SITE}${shot.demoTour} answered ${response?.status()}`);
    await settle(page);
    // The waves have drawn once the canvas is in and has faded in: waves.ts adds .waves-live a frame after the first draw.
    await page.locator(".waves-live .waves-canvas").first().waitFor({ timeout: 10000 });
    await page.evaluate(() =>
      Promise.all(document.querySelector(".waves-canvas").getAnimations().map((a) => a.finished)),
    );
    ready = Date.now();
    await page.waitForTimeout(TOUR_HOLD.cover);

    await page.getByRole("link", { name: "Learn more" }).click();
    // No hover state left on a link the page scrolls under; moving the mouse doesn't stop the tour.
    await page.mouse.move(TOUR_SIZE.width - 2, TOUR_SIZE.height / 2);
    // The deck puts the first card's anchor in the address once it has arrived there.
    await page.waitForURL(/#./, { timeout: 15000 });
    // A wheel event stops the deck's tour where it is (any input does), without a key that would show focus.
    await page.evaluate(() => dispatchEvent(new WheelEvent("wheel")));
    await page.evaluate(() => document.activeElement?.blur());
    await page.waitForTimeout(TOUR_HOLD.card);

    const rests = await page.evaluate((last) => {
      const sections = [...document.querySelectorAll("section[data-waves-rest]")];
      // pushState doesn't move :target, so the first card is found by the address.
      const anchor = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      const first = sections.findIndex((s) => s.contains(anchor));
      return sections.slice(first + 1).map((s) => ({
        top: Number(s.dataset.wavesRest),
        last: s.querySelector(".slide-eyebrow")?.textContent.trim() === last,
      }));
    }, TOUR_LAST);
    const end = rests.findIndex((r) => r.last);
    if (end < 0) throw new Error(`no card with the eyebrow "${TOUR_LAST}"`);
    for (const rest of rests.slice(0, end + 1)) {
      await page.evaluate(glide, rest.top);
      await page.waitForTimeout(rest.last ? TOUR_HOLD.last : TOUR_HOLD.card);
    }
    const inView = await page.evaluate((last) => {
      const eyebrow = [...document.querySelectorAll(".slide-eyebrow")].find((e) => e.textContent.trim() === last);
      const r = eyebrow.closest("section").querySelector("h2").getBoundingClientRect();
      return r.top >= 0 && r.bottom <= innerHeight;
    }, TOUR_LAST);
    if (!inView) throw new Error(`the heading of "${TOUR_LAST}" is not in view at the end`);
  } catch (error) {
    missing.push(`${shot.name}: ${error.message.split("\n")[0]}`);
    await context.close();
    rmSync(raw, { recursive: true, force: true });
    return;
  }
  await context.close();
  const recorded = await page.video().path();

  // The recording starts with the page; the video starts once the waves have drawn.
  const from = ((ready - started) / 1000).toFixed(2);
  mkdirSync(videoDir, { recursive: true });
  const encode = (file, codec) => {
    const run = spawnSync("ffmpeg", ["-y", "-v", "error", "-i", recorded, "-ss", from, "-an", ...codec, file]);
    if (run.status !== 0) throw new Error(`ffmpeg: ${run.stderr.toString().trim().split("\n").pop()}`);
    console.log(`wrote ${file.replace(`${root}/`, "")}`);
  };
  encode(join(videoDir, `${shot.name}.mp4`), [
    "-c:v", "libx264", "-preset", "veryfast", "-crf", String(H264_CRF), "-pix_fmt", "yuv420p", "-movflags", "+faststart",
  ]);
  encode(join(videoDir, `${shot.name}.webm`), [
    "-c:v", "libvpx-vp9", "-crf", String(VP9_CRF), "-b:v", "0", "-row-mt", "1", "-pix_fmt", "yuv420p",
  ]);
  rmSync(raw, { recursive: true, force: true });
}

// The deck's glide (deck.ts): to `to` over --learn-more-duration, ease-in-out. Runs in the page.
function glide(to) {
  const css = getComputedStyle(document.documentElement).getPropertyValue("--learn-more-duration");
  const m = /^\s*([\d.]+)\s*(ms|s)\s*$/.exec(css);
  const duration = m ? Number(m[1]) * (m[2] === "s" ? 1000 : 1) : 1800;
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
  const end = Math.min(document.documentElement.scrollHeight - innerHeight, Math.max(0, to));
  const from = scrollY;
  const start = performance.now();
  return new Promise((resolve) => {
    requestAnimationFrame(function step(now) {
      const t = Math.min(1, (now - start) / duration);
      scrollTo({ top: from + (end - from) * ease(t), behavior: "instant" });
      if (t < 1) requestAnimationFrame(step);
      else resolve();
    });
  });
}

async function main() {
  mkdirSync(outDir, { recursive: true });
  sharp.concurrency(1);

  await ensureServer("workbench", WORKBENCH, ["npm", "run", "dev:styleguide"]);
  const needsSite = SHOTS.some((s) => s.site);
  if (needsSite) await ensureServer("site", SITE, ["npm", "run", "dev"], { PD_PORT: SITE_PORT });

  const browser = await chromium.launch();
  const missing = [];

  // 1. Which patterns exist? The workbench's tree names them; a shot with a pattern that isn't there is skipped.
  const patternsIn = async (workbench) => {
    const probe = await browser.newPage({ viewport: WINDOW });
    await probe.goto(`${workbench}/`, { waitUntil: "networkidle" });
    await probe.locator('a[href^="/"]').first().waitFor();
    const ids = await probe.evaluate(() =>
      [...document.querySelectorAll("a[href^='/']")].map((a) => a.getAttribute("href").replace(/^\//, "")),
    );
    await probe.close();
    return new Set(ids);
  };
  const present = await patternsIn(WORKBENCH);
  // The demo isn't started here (see the top of this file): if it isn't running, its shots are missing.
  const demoRunning = await reachable(`${DEMO_WORKBENCH}/`);
  const demoPresent = demoRunning ? await patternsIn(DEMO_WORKBENCH) : new Set();

  // `npm run screenshots -- name [name ...]` takes only those shots.
  const only = process.argv.slice(2);
  const todo = [];
  for (const shot of SHOTS.filter((s) => (only.length === 0 ? !s.named : only.includes(s.name)))) {
    if (shot.pattern && !present.has(shot.pattern)) {
      missing.push(`${shot.name}: the pattern "${shot.pattern}" is not in the style guide`);
    } else if ((shot.demoPage || shot.demoPattern || shot.demoTour) && !demoRunning) {
      missing.push(`${shot.name}: the demo is not running at ${DEMO_WORKBENCH}/ (PD_PORT=${DEMO_PORT} npm run dev:site)`);
    } else if (shot.demoPattern && !demoPresent.has(shot.demoPattern)) {
      missing.push(`${shot.name}: the pattern "${shot.demoPattern}" is not in the demo's style guide`);
    } else if (shot.site && !existsSync(join(root, shot.site.file))) {
      missing.push(`${shot.name}: the page ${shot.site.file} does not exist`);
    } else {
      todo.push(shot);
    }
  }

  // 2. Each shot at 2x, in light, and for the site page in dark too (schemesFor).
  for (const shot of todo) {
    if (shot.demoTour) {
      await recordTour(browser, shot, missing);
      continue;
    }
    const url = shot.demoPage
      ? `${DEMO_SITE}${shot.demoPage}`
      : shot.demoPattern
        ? `${DEMO_WORKBENCH}/${shot.demoPattern}`
        : shot.site
          ? `${SITE}${shot.site.url}`
          : `${WORKBENCH}/${shot.pattern}`;
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
        if (!shot.site && !shot.demoPage && (await relationships.count()) > 0) {
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
