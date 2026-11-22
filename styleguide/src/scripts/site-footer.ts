// The footer's "X-ray" control (organisms/site-footer). It exists only once this runs: without JavaScript nothing
// changes. Switched on, it imports the script that draws x-ray (src/scripts/xray.ts, named in the footer's inert
// <template>, so it loads only now). It stays on for the session (sessionStorage), so the next page opens with it,
// and a new tab starts without it. The control or Escape switches it off.

interface Xray { on(animate: boolean): void; off(animate: boolean): void }

const template = document.querySelector<HTMLTemplateElement>("template.site-footer-xray");
const links = document.querySelector(".site-footer-links");
const src = template?.content.querySelector("script")?.getAttribute("src");

const KEY = "pd-docs-xray";
const remember = (on: boolean): void => {
  try { on ? sessionStorage.setItem(KEY, "on") : sessionStorage.removeItem(KEY); } catch { /* storage off: per page only */ }
};
const remembered = (): boolean => {
  try { return sessionStorage.getItem(KEY) === "on"; } catch { return false; }
};

if (template && links && src) {
  const item = document.createElement("li");
  const button = document.createElement("button");
  button.type = "button";
  button.className = "site-footer-xray-button";
  button.textContent = "X-ray";
  button.setAttribute("aria-pressed", "false");
  item.append(button);
  links.append(item);

  let xray: Xray | undefined;
  let on = false;

  const set = async (next: boolean, animate: boolean): Promise<void> => {
    on = next;
    button.setAttribute("aria-pressed", String(on));
    remember(on);
    if (on) {
      xray ??= await import(src) as Xray;
      if (on) xray.on(animate);
    } else {
      xray?.off(animate);
    }
  };

  button.addEventListener("click", () => void set(!on, true));
  document.addEventListener("keydown", event => {
    // Escape closes an open menu first (organisms/site-header); only then does it switch x-ray off.
    if (event.key === "Escape" && on && !document.querySelector(":popover-open")) void set(false, false);
  });
  if (remembered()) void set(true, false);
}
