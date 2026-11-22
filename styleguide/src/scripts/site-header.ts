// The header's behaviour (organisms/site-header): the menu button's state, and the search field's keyboard shortcut.
//
// The menu. Where it shows and how it opens is CSS and HTML alone (a media query and a native popover), so it works
// without this script. The script keeps the button's aria-expanded in step with the menu, and the icon with it (three
// strokes, an X while open). And it keeps the menu's closing transition out of the switch: when the window crosses the
// header's width, the header is marked for one frame (data-switching), in which the menu has no transition, so the
// sections leave the row at once. The query is the style guide's own (--site-menu-query, from the measured width).
//
// The shortcut. ⌘K on Apple platforms, Ctrl K elsewhere, moves focus to the search field, opening the menu first when
// the field is in it. The hint next to the field shows the shortcut only once this runs; without it there's nothing
// to promise, so the hint stays empty (and hidden by CSS).

const header = document.querySelector<HTMLElement>(".site-header");
const menu = document.querySelector<HTMLElement>("#site-menu");
const button = document.querySelector<HTMLButtonElement>(".site-menu-button");
const field = document.querySelector<HTMLInputElement>("#site-search-input");
const hint = document.querySelector<HTMLElement>("[data-search-key]");

// The classic scrollbar's width (0 with overlay scrollbars), measured once, for the page to keep its place while the open
// menu turns the scrollbar's gutter off (organisms/site-header.scss): the window's width less the page's, which the
// gutter narrows (clientWidth can miss it). In rem, like every size in the styles.
const scrollbar = innerWidth - document.documentElement.getBoundingClientRect().width;
if (scrollbar > 0) {
  document.documentElement.style.setProperty("--scrollbar-width", `${scrollbar / parseFloat(getComputedStyle(document.documentElement).fontSize)}rem`);
}

if (menu && button) {
  // Not in the markup: without this script the browser reports the popover button's state itself, and a fixed
  // aria-expanded="false" would override it while the menu is open.
  button.setAttribute("aria-expanded", String(menu.matches(":popover-open")));
  menu.addEventListener("toggle", event => {
    button.setAttribute("aria-expanded", String((event as ToggleEvent).newState === "open"));
  });
}

const query = header ? getComputedStyle(header).getPropertyValue("--site-menu-query").trim() : "";
if (header && query) {
  matchMedia(query).addEventListener("change", () => {
    header.dataset.switching = "";
    // The change is reported before the frame's styles; the mark goes in the next frame's.
    requestAnimationFrame(() => requestAnimationFrame(() => delete header.dataset.switching));
  });
}

if (field) {
  const apple = /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);
  if (hint) hint.textContent = apple ? "⌘K" : "Ctrl K";
  field.setAttribute("aria-keyshortcuts", apple ? "Meta+K" : "Control+K");

  document.addEventListener("keydown", event => {
    if (event.key.toLowerCase() !== "k" || event.altKey || event.shiftKey) return;
    if (!(apple ? event.metaKey && !event.ctrlKey : event.ctrlKey && !event.metaKey)) return;
    event.preventDefault();
    // Collapsed, the field is in the closed menu, where it can't take focus: open the menu first.
    if (menu && !menu.matches(":popover-open") && getComputedStyle(menu).display === "none") menu.showPopover();
    field.focus();
    field.select();
  });
}
