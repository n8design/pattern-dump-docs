// The header's behaviour (organisms/site-header): the menu button's state, and the search field's keyboard shortcut.
//
// The menu. Where it shows and how it opens is CSS and HTML alone (a container query and a native popover), so it works
// without this script. The script keeps the button's aria-expanded in step with the menu, and the icon with it (three
// strokes, an X while open).
//
// The shortcut. ⌘K on Apple platforms, Ctrl K elsewhere, moves focus to the search field, opening the menu first when
// the field is in it. The hint next to the field shows the shortcut only once this runs; without it there's nothing
// to promise, so the hint stays empty (and hidden by CSS).

const menu = document.querySelector<HTMLElement>("#site-menu");
const button = document.querySelector<HTMLButtonElement>(".site-menu-button");
const field = document.querySelector<HTMLInputElement>("#site-search-input");
const hint = document.querySelector<HTMLElement>("[data-search-key]");

if (menu && button) {
  menu.addEventListener("toggle", event => {
    button.setAttribute("aria-expanded", String((event as ToggleEvent).newState === "open"));
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
