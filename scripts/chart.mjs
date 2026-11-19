// A bar chart as a symbol image, from a JSON file of rows, drawn with the diagram kit (styleguide/diagrams/kit.svg):
// direct labels, no axis box, grid or legend, one row in the accent at most.
//
//   node scripts/chart.mjs styleguide/diagrams/<name>.json [more.json ...]
//
// writes styleguide/assets/symbols/<name>.svg for each. The numbers on the page and in the chart come from the same
// file, so they can't drift apart. The JSON:
//
//   title        the chart's title
//   note         optional, the line under it: unit, source, date
//   highlight    optional, the label of the one row in the accent
//   decimals     optional, the number of decimals every value is printed with (47.40, not 47.4)
//   cap          optional, the largest value drawn to scale; a row above it runs to the full width, cut
//   rows         [{ label, value, text?, muted? }]; text replaces the printed value, muted draws a dotted bar
//                for context rows (reference tools, say); { "gap": true } leaves a row's space empty

import { readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const inputs = process.argv.slice(2);
if (inputs.length === 0) {
  console.error("usage: node scripts/chart.mjs styleguide/diagrams/<name>.json [more.json ...]");
  process.exit(1);
}

const kit = readFileSync(join(root, "styleguide/diagrams/kit.svg"), "utf8");
const style = kit.match(/<style>[\s\S]*?<\/style>/)?.[0];
if (!style) throw new Error("styleguide/diagrams/kit.svg has no style block");

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const number = (v, decimals) => v.toLocaleString("en", decimals === undefined
  ? { maximumFractionDigits: 2 } : { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

for (const input of inputs) {
  const data = JSON.parse(readFileSync(input, "utf8"));
  const pad = 24; // pulled back into the gutter on the page (base/doc-image.scss)
  const width = 684 + 2 * pad;
  const labelX = pad;
  const barX = pad + 171;
  const maxBar = 330;
  const top = data.note ? pad + 84 : pad + 62;
  const step = 36;
  const values = data.rows.filter((r) => !r.gap).map((r) => r.value);
  const scale = data.cap ?? Math.max(...values);
  const height = top + (data.rows.length - 1) * step + 10 + pad;

  const rows = data.rows.map((r, i) => {
    if (r.gap) return "";
    const y = top + i * step;
    const cut = r.value > scale;
    const end = Math.round(barX + (Math.min(r.value, scale) / scale) * maxBar) + (cut ? 30 : 0);
    const on = r.label === data.highlight;
    const text = on ? "label on" : r.muted ? "label muted" : "label";
    const bar = on ? "bar-on" : r.muted ? "bar-muted" : "bar";
    return [
      `  <text class="${text}" x="${labelX}" y="${y + 5}">${esc(r.label)}</text>`,
      `  <path class="${bar}" d="M${barX} ${y}H${end}"/>`,
      cut ? `  <path class="cut" d="M${end - 26} ${y + 10}L${end - 20} ${y - 10}M${end - 18} ${y + 10}L${end - 12} ${y - 10}"/>` : "",
      `  <text class="${text}" x="${end + 12}" y="${y + 5}">${esc(r.text ?? number(r.value, data.decimals))}</text>`,
    ].filter(Boolean).join("\n");
  }).filter(Boolean);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
  ${style}
  <text class="title" x="${labelX}" y="${pad + 16}">${esc(data.title)}</text>
${data.note ? `  <text class="small" x="${labelX}" y="${pad + 38}">${esc(data.note)}</text>\n` : ""}  <path class="hair" d="M${barX - 0.5} ${top - 18}V${top + (data.rows.length - 1) * step + 18}"/>
${rows.join("\n")}
</svg>
`;

  const out = join(root, "styleguide/assets/symbols", `${basename(input, ".json")}.svg`);
  writeFileSync(out, svg);
  console.log(`wrote ${out}`);
}
