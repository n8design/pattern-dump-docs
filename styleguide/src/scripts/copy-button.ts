// The code blocks' Copy button as an icon (base/code-block.scss). Pattern Dump's own script makes the button where the
// browser can write to the clipboard ("Copy", aria-label "Copy source"), copies on a click, writes "Copied" (or "Not
// copied") into the button and into its own polite live region, and puts "Copy" back after 1.5 s. This shows that
// text as Phosphor's Copy and Check icons (bold weight, MIT; one of the places TASTE.md section 1 allows them):
// the icon is decoration (aria-hidden), the button's name stays "Copy source", and the announcement stays
// Pattern Dump's, so it is said once. The Check stays for 2 s. "Not copied" is left as text: it is an error.
// Loaded on every site page by pages/frame, and by components/labelled-code for its previews.

const COPY = '<svg class="copy-btn-icon" aria-hidden="true" focusable="false" viewBox="0 0 256 256" fill="currentColor"><path d="M216,28H88A12,12,0,0,0,76,40V76H40A12,12,0,0,0,28,88V216a12,12,0,0,0,12,12H168a12,12,0,0,0,12-12V180h36a12,12,0,0,0,12-12V40A12,12,0,0,0,216,28ZM156,204H52V100H156Zm48-48H180V88a12,12,0,0,0-12-12H100V52H204Z"/></svg>';
const CHECK = '<svg class="copy-btn-icon" aria-hidden="true" focusable="false" viewBox="0 0 256 256" fill="currentColor"><path d="M232.49,80.49l-128,128a12,12,0,0,1-17,0l-56-56a12,12,0,1,1,17-17L96,183,215.51,63.51a12,12,0,0,1,17,17Z"/></svg>';
const HOLD = 2000;

const drawIcon = (button: HTMLButtonElement): void => {
  if (button.dataset.icon) return;
  let held = 0;
  const show = (icon: "copy" | "check"): void => {
    observer.disconnect();
    button.innerHTML = icon === "copy" ? COPY : CHECK;
    button.dataset.icon = icon;
    observer.observe(button, { childList: true, characterData: true, subtree: true });
  };
  // Pattern Dump changes the button's text; each change is read here and drawn as an icon.
  const observer = new MutationObserver(() => {
    const text = button.textContent?.trim();
    if (text === "Copied") {
      show("check");
      window.clearTimeout(held);
      held = window.setTimeout(() => { held = 0; show("copy"); }, HOLD);
    } else if (text === "Copy") {
      if (!held) show("copy");
      else show("check");
    } else if (text) {
      // An error stays as Pattern Dump wrote it.
      window.clearTimeout(held);
      held = 0;
      delete button.dataset.icon;
    }
  });
  show("copy");
};

for (const button of document.querySelectorAll<HTMLButtonElement>(".shiki-container > .copy-btn")) drawIcon(button);
