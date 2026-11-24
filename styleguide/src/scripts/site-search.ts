// The search component's behaviour (organisms/search). pd build writes the site's index with Pagefind to
// _pd/search/ under the site's path, which <meta name="pd-base-path"> names; this loads it from there and searches in
// the browser. Without the index (npm run dev, or a project without Pagefind) the status line says so.

interface PagefindData {
  url: string;
  /** The page's whole text, which the excerpt is cut from. */
  content: string;
  excerpt: string;
  meta: Record<string, string | undefined>;
  filters: Record<string, string[] | undefined>;
}
interface Pagefind {
  init(): Promise<void>;
  search(term: string, options?: { filters?: Record<string, string> }): Promise<{ results: Array<{ data(): Promise<PagefindData> }> } | null>;
  filters(): Promise<Record<string, Record<string, number>>>;
}

const base = document.querySelector<HTMLMetaElement>(`meta[name="pd-base-path"]`)?.content ?? "/";
let pagefind: Promise<Pagefind | null> | undefined;
const load = (): Promise<Pagefind | null> => pagefind ??= import(`${base}_pd/search/pagefind.js`)
  .then(async (m: Pagefind) => { await m.init(); return m; }, () => null);

/** The most results shown at once. */
const SHOWN = 20;

/** Whitespace collapsed, to compare an excerpt with the text it was cut from. */
const squash = (s: string): string => s.replace(/\s+/g, " ").trim();

for (const root of document.querySelectorAll<HTMLElement>("[data-search]")) {
  const form = root.querySelector("form");
  const field = root.querySelector<HTMLInputElement>(`input[type="search"]`);
  const status = root.querySelector<HTMLElement>("[data-search-status]");
  const list = root.querySelector<HTMLElement>("[data-search-results]");
  if (!form || !field || !status || !list) continue;
  let sections: HTMLFieldSetElement | null = null;
  /** The checked section, or "" for all. */
  const chosen = (): string => sections?.querySelector<HTMLInputElement>("input:checked")?.value ?? "";
  let run = 0;

  const result = (d: PagefindData): HTMLLIElement => {
    const li = document.createElement("li");
    li.className = "search-result";
    const link = document.createElement("a");
    link.href = d.url;
    link.textContent = d.meta["title"] ?? d.url;
    const heading = document.createElement("h2");
    heading.className = "search-result-title";
    heading.append(link);
    // The section first, in the HTML too, so it reads before the title as it shows above it; hgroup keeps it with the
    // heading.
    const group = document.createElement("hgroup");
    group.className = "search-result-heading";
    const where = d.filters["section"]?.[0];
    if (where) {
      const p = document.createElement("p");
      p.className = "search-result-section";
      p.textContent = where;
      group.append(p);
    }
    group.append(heading);
    li.append(group);
    const teaser = document.createElement("p");
    teaser.className = "search-result-teaser";
    // Pagefind's excerpt is the page's text, escaped, with the words found in <mark>. It is cut from the text: where it
    // doesn't start at the text's start, an ellipsis says so; at the end too, unless it ends a sentence (. ? !), which
    // reads as an end already (Stefan, 2026-11-24). The words stay as they are.
    teaser.innerHTML = d.excerpt;
    const text = squash(teaser.textContent ?? "");
    const whole = squash(d.content);
    if (text && !whole.startsWith(text)) teaser.prepend("…");
    if (text && !whole.endsWith(text) && !/[.?!]$/.test(text)) teaser.append("…");
    li.append(teaser);
    return li;
  };

  const show = async (term: string): Promise<void> => {
    const mine = ++run;
    const words = term.trim();
    if (!words) { list.replaceChildren(); status.textContent = ""; return; }
    const pf = await load();
    if (mine !== run) return;
    if (!pf) { status.textContent = "Search works on the built site: this one has no search index."; return; }
    const filters = chosen() ? { section: chosen() } : undefined;
    const found = await pf.search(words, filters ? { filters } : {});
    if (mine !== run || !found) return;
    const data = await Promise.all(found.results.slice(0, SHOWN).map(r => r.data()));
    if (mine !== run) return;
    list.replaceChildren(...data.map(result));
    const n = found.results.length;
    status.textContent = n === 0 ? `No results for "${words}".`
      : `${n} result${n === 1 ? "" : "s"} for "${words}"${n > SHOWN ? `, the first ${SHOWN} shown` : ""}.`;
  };

  // The words in the address, so a search can be linked and Back returns to it.
  const remember = (): void => {
    const url = new URL(location.href);
    if (field.value.trim()) url.searchParams.set("q", field.value.trim()); else url.searchParams.delete("q");
    if (chosen()) url.searchParams.set("section", chosen()); else url.searchParams.delete("section");
    history.replaceState(null, "", url);
  };

  // Scrolls the checked tab into view in its row, and only there.
  const reveal = (): void => {
    sections?.querySelector("input:checked")?.parentElement
      ?.scrollIntoView({ block: "nearest", inline: "nearest", container: "nearest" } as ScrollIntoViewOptions);
  };

  // The sections as a row of tabs, once the index is loaded and has sections: All, then the sections in the order of
  // the site's navigation (molecules/site-nav), then any the navigation doesn't name, alphabetically.
  void load().then(async pf => {
    if (!pf) return;
    const nav = [...document.querySelectorAll(".site-nav-link")].map(a => a.textContent?.trim() ?? "");
    const rank = (s: string): number => { const i = nav.indexOf(s); return i < 0 ? nav.length : i; };
    const names = Object.keys((await pf.filters())["section"] ?? {})
      .sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
    if (!names.length) return;
    const asked = new URL(location.href).searchParams.get("section") ?? "";
    const current = names.includes(asked) ? asked : "";
    sections = document.createElement("fieldset");
    sections.className = "search-sections";
    const legend = document.createElement("legend");
    legend.className = "search-sections-legend";
    legend.textContent = "Section";
    const row = document.createElement("div");
    row.className = "search-sections-row";
    for (const [value, name] of [["", "All"], ...names.map(n => [n, n])] as const) {
      const label = document.createElement("label");
      label.className = "search-section";
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = "section";
      radio.value = value;
      radio.checked = value === current;
      label.append(radio, name);
      row.append(label);
    }
    sections.append(legend, row);
    sections.addEventListener("change", () => { remember(); reveal(); void show(field.value); });
    form.append(sections);
    reveal();
    if (current && field.value) void show(field.value);
  });

  let timer: ReturnType<typeof setTimeout> | undefined;
  field.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(() => { remember(); void show(field.value); }, 250);
  });
  form.addEventListener("submit", event => {
    event.preventDefault();
    clearTimeout(timer);
    remember();
    void show(field.value);
  });

  const asked = new URL(location.href).searchParams.get("q");
  if (asked) { field.value = asked; void show(asked); }
}
