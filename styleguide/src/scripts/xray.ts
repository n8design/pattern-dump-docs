// X-ray: the docs site's way of showing which component is which. Loaded by src/scripts/site-footer.ts only when the
// footer's control switches it on; a gimmick of this site, not of Pattern Dump.
//
// It marks every element with data-xray="<component id>" (set by hand in this style guide's templates) and every live
// example (Pattern Dump's figure.doc-example, whose frame's title is the component's id). The page goes dark under a
// veil; the marked components sit above it. Each gets a frame and a label, the label a link to the component in the
// published workbench. Frames and labels live at the end of <body>, outside the components (whose filter would touch
// them) and in the root stacking context above the veil, each anchored to its component with CSS anchor positioning.
// Nothing wraps them: an opacity, filter, transform or animation on a wrapper would make a stacking context and drop
// them under the veil's backdrop-filter. The styles are in base/xray.scss.

const root = document.documentElement;
const workbench = document.querySelector<HTMLElement>("template.site-footer-xray")?.dataset.workbenchUrl ?? "/workbench/";
const reduced = (): boolean => matchMedia("(prefers-reduced-motion: reduce)").matches;

interface Mark { element: HTMLElement; frame: HTMLElement; label: HTMLAnchorElement }

let marks: Mark[] = [];
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
  const element = label ? undefined : target.closest<HTMLElement>("[data-xray], figure.doc-example");
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
  document.body.append(veil);
  added.push(veil);

  const elements = [...document.querySelectorAll<HTMLElement>("[data-xray], figure.doc-example")]
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

    const frame = document.createElement("div");
    frame.className = `xray-frame${bar}`;
    frame.setAttribute("aria-hidden", "true");
    frame.style.setProperty("position-anchor", name);

    const label = document.createElement("a");
    label.className = `xray-label${bar}`;
    label.href = `${workbench}${id}`;
    label.textContent = id;
    label.style.setProperty("position-anchor", name);

    document.body.append(frame, label);
    added.push(frame, label);
    marks.push({ element, frame, label });
  });

  document.addEventListener("pointerover", onPointer);
  document.addEventListener("focusin", onFocus);
  document.addEventListener("focusout", onFocusOut);
}

export function off(): void {
  window.clearTimeout(introTimer);
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
