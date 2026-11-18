// The search field's keyboard shortcut (organisms/site-header): ⌘K on Apple platforms, Ctrl K elsewhere, moves focus
// to the field. The hint next to the field shows the shortcut only once this runs; without it there's nothing to
// promise, so the hint stays empty (and hidden by CSS).

const field = document.querySelector<HTMLInputElement>("#site-search-input");
const hint = document.querySelector<HTMLElement>("[data-search-key]");

if (field) {
  const apple = /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);
  if (hint) hint.textContent = apple ? "⌘K" : "Ctrl K";
  field.setAttribute("aria-keyshortcuts", apple ? "Meta+K" : "Control+K");

  document.addEventListener("keydown", event => {
    if (event.key.toLowerCase() !== "k" || event.altKey || event.shiftKey) return;
    if (!(apple ? event.metaKey && !event.ctrlKey : event.ctrlKey && !event.metaKey)) return;
    event.preventDefault();
    field.focus();
    field.select();
  });
}
