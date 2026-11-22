// X-ray: the docs site's way of showing which component is which. Loaded by src/scripts/site-footer.ts only when the
// footer's control switches it on; a gimmick of this site, not of Pattern Dump.
//
// It marks every element with data-xray="<component id>" (set by hand in this style guide's templates) and every live
// example (Pattern Dump's figure.doc-example, whose frame's title is the component's id). The page goes dark under a
// veil; the marked components sit above it. Each gets a frame and a label, the label a link to the component in the
// published workbench. Frames and labels live at the end of .site (the frame, pages/frame), outside the components
// (whose filter would touch them) and, since .site makes no stacking context, in the root one above the veil, each anchored to its component with CSS anchor positioning.
// Nothing wraps them: an opacity, filter, transform or animation on a wrapper would make a stacking context and drop
// them under the veil's backdrop-filter. The styles are in base/xray.scss.

const root = document.documentElement;
const workbench = document.querySelector<HTMLElement>("template.site-footer-xray")?.dataset.workbenchUrl ?? "/workbench/";
const reduced = (): boolean => matchMedia("(prefers-reduced-motion: reduce)").matches;
const MARKED = "[data-xray], figure.doc-example";
// Inside .site, so they read its custom properties (the page gutter, for the bars' labels).
const layer = (): HTMLElement => document.querySelector<HTMLElement>(".site") ?? document.body;

interface Mark { element: HTMLElement; frame: HTMLElement; label: HTMLAnchorElement }

let marks: Mark[] = [];
let settle = 0;
let watcher: ResizeObserver | undefined;

// Where each chip goes. A chip stands on its frame's top line, level with its left side; inside the header (and for a
// chip that doesn't fit there) under the bottom line. It must cover no content and no other chip: where it would, it
// moves along the line (right) until it doesn't, and if it runs past the frame's end, it tries the other line. The
// bars' own chips sit inside the bar, in its padding (base/xray.scss), and only take part as obstacles.
const leaves = (): DOMRect[] => {
  const out: DOMRect[] = [];
  const site = document.querySelector(".site") ?? document.body;
  const mine = (node: Node): boolean => !!(node instanceof Element ? node : node.parentElement)?.closest(".xray-frame, .xray-label, .xray-veil");
  const walker = document.createTreeWalker(site, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const parent = node.parentElement;
    if (!node.textContent?.trim() || !parent || mine(node) || !parent.checkVisibility({ visibilityProperty: true, opacityProperty: true })) continue;
    const range = document.createRange();
    range.selectNodeContents(node);
    for (const rect of range.getClientRects()) if (rect.width > 2 && rect.height > 2) out.push(rect);
  }
  for (const element of site.querySelectorAll("img, svg:not(svg svg), iframe, video, input")) {
    if (mine(element) || !element.checkVisibility({ visibilityProperty: true, opacityProperty: true })) continue;
    const rect = element.getBoundingClientRect();
    if (rect.width > 2 && rect.height > 2) out.push(rect);
  }
  return out;
};

const place = (): void => {
  const rem = parseFloat(getComputedStyle(root).fontSize);
  const gap = 0.25 * rem;
  const content = leaves();
  const touches = (a: DOMRect, b: DOMRect, room = 0): boolean =>
    a.left < b.right + room && b.left < a.right + room && a.top < b.bottom + room && b.top < a.bottom + room;
  const placed: DOMRect[] = [];
  const obstacle = (rect: DOMRect): DOMRect | undefined =>
    [...placed.filter(p => touches(rect, p, gap)), ...content.filter(c => touches(rect, c))].sort((a, b) => a.right - b.right)[0];
  for (const { label, frame } of marks) {
    label.style.removeProperty("margin-inline-start");
    delete label.dataset.align;
    if (label.classList.contains("xray-bar-label")) { placed.push(label.getBoundingClientRect()); continue; }
    const sides = label.classList.contains("xray-in-header") ? ["below", "above"] : ["above", "below"];
    const end = frame.getBoundingClientRect().right;
    let done = false;
    for (const side of sides) {
      label.dataset.side = side;
      // From the frame's left end, moving right past whatever is in the way, as long as it stays on the line and in
      // the window.
      delete label.dataset.align;
      label.style.removeProperty("margin-inline-start");
      for (let guard = 0; guard < 200 && !done; guard++) {
        const rect = label.getBoundingClientRect();
        if (rect.right > Math.min(end, innerWidth) + 0.5) break;
        const hit = obstacle(rect);
        if (!hit) { done = true; break; }
        const current = parseFloat(getComputedStyle(label).marginInlineStart) || 0;
        label.style.setProperty("margin-inline-start", `${((current + Math.max(hit.right + gap - rect.left, 1)) / rem).toFixed(3)}rem`);
      }
      if (done) break;
      // Level with the frame's right end.
      label.style.removeProperty("margin-inline-start");
      label.dataset.align = "end";
      const rect = label.getBoundingClientRect();
      if (rect.left >= 0 && !obstacle(rect)) { done = true; break; }
    }
    if (!done) {
      label.dataset.side = sides[0];
      delete label.dataset.align;
      label.style.removeProperty("margin-inline-start");
    }
    placed.push(label.getBoundingClientRect());
  }
};

const onResize = (): void => {
  cancelAnimationFrame(settle);
  settle = requestAnimationFrame(place);
};
let added: HTMLElement[] = [];
let active: Mark | undefined;
let introTimer = 0;

const activate = (mark: Mark | undefined): void => {
  if (mark === active) return;
  active?.frame.removeAttribute("data-active");
  active?.label.removeAttribute("data-active");
  active = mark;
  mark?.frame.setAttribute("data-active", "");
  mark?.label.setAttribute("data-active", "");
};

// Only the innermost marked component under the pointer is active.
const onPointer = (event: PointerEvent): void => {
  const target = event.target as Element;
  const label = target.closest<HTMLAnchorElement>(".xray-label");
  const element = label ? undefined : target.closest<HTMLElement>(MARKED);
  activate(marks.find(m => m.label === label || m.element === element));
};
const onFocus = (event: FocusEvent): void => {
  const mark = marks.find(m => m.label === event.target);
  if (mark) activate(mark);
};
const onFocusOut = (event: FocusEvent): void => {
  if (marks.some(m => m.label === event.target)) activate(undefined);
};

export function on(animate: boolean): void {
  if (marks.length) return;
  root.dataset.xrayMode = "on";
  if (animate && !reduced()) {
    root.dataset.xrayIntro = "";
    introTimer = window.setTimeout(() => delete root.dataset.xrayIntro, 1500);
  }

  const veil = document.createElement("div");
  veil.className = "xray-veil";
  veil.setAttribute("aria-hidden", "true");
  layer().append(veil);
  added.push(veil);

  const elements = [...document.querySelectorAll<HTMLElement>(MARKED)]
    .filter(element => element.getClientRects().length > 0);
  elements.forEach((element, index) => {
    const id = element.dataset.xray ?? element.querySelector("iframe")?.title ?? "";
    if (!id) return;
    const name = `--xray-${index}`;
    // Beside any anchor name it has already (the collapsed header is the phone menu's anchor).
    const own = getComputedStyle(element).getPropertyValue("anchor-name");
    element.style.setProperty("anchor-name", own && own !== "none" ? `${own}, ${name}` : name);
    // In the header and the footer, which stay above everything else, their frames and labels do too.
    const bar = element.closest(".site-header, .site-footer") ? " xray-in-bar" : "";
    // A component inside another marked one gets its frame inside its own box, so frames never cross.
    const nested = element.parentElement?.closest(MARKED) ? " xray-nested" : "";
    // The bars run the window's width: their own labels start at the page gutter, where their content does.
    const fullWidth = element.matches(".site-header") ? " xray-bar-label xray-bar-top" : element.matches(".site-footer") ? " xray-bar-label xray-bar-bottom" : "";
    const inHeader = !fullWidth && element.closest(".site-header") ? " xray-in-header" : "";

    const frame = document.createElement("div");
    frame.className = `xray-frame${bar}${nested}${fullWidth ? " xray-bar-frame" : ""}`;
    frame.setAttribute("aria-hidden", "true");
    frame.style.setProperty("position-anchor", name);
    // The label hangs from the frame, on its top edge.
    frame.style.setProperty("anchor-name", `${name}-frame`);

    const label = document.createElement("a");
    label.className = `xray-label${bar}${fullWidth}${inHeader}`;
    label.href = `${workbench}${id}`;
    label.textContent = id;
    label.style.setProperty("position-anchor", `${name}-frame`);

    layer().append(frame, label);
    added.push(frame, label);
    marks.push({ element, frame, label });
  });

  place();
  // Again once the fonts are in (the chips' mono face sets their width) and whenever the page's layout changes size
  // (an image that loads late, the window): one pass per frame.
  void document.fonts?.ready.then(onResize);
  watcher = new ResizeObserver(onResize);
  watcher.observe(document.querySelector(".site") ?? document.body);
  window.addEventListener("resize", onResize);
  document.addEventListener("pointerover", onPointer);
  document.addEventListener("focusin", onFocus);
  document.addEventListener("focusout", onFocusOut);
}

export function off(): void {
  window.clearTimeout(introTimer);
  cancelAnimationFrame(settle);
  watcher?.disconnect();
  watcher = undefined;
  window.removeEventListener("resize", onResize);
  document.removeEventListener("pointerover", onPointer);
  document.removeEventListener("focusin", onFocus);
  document.removeEventListener("focusout", onFocusOut);
  for (const mark of marks) mark.element.style.removeProperty("anchor-name");
  for (const element of added) element.remove();
  marks = [];
  added = [];
  active = undefined;
  delete root.dataset.xrayMode;
  delete root.dataset.xrayIntro;
}
