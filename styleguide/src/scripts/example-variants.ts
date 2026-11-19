// A live example's variants (a `pattern` fence, which Pattern Dump writes as figure.doc-example): each variant is a
// link to that variant's own preview, so without scripting it opens the preview. With scripting, a click shows the
// variant in the example's frame instead, in place, and marks it with aria-current. Pattern Dump fits the frame's
// height to the new preview when it loads. A click with a modifier key still opens the link as usual.

for (const figure of document.querySelectorAll<HTMLElement>("figure.doc-example")) {
  const frame = figure.querySelector<HTMLIFrameElement>("iframe");
  const links = [...figure.querySelectorAll<HTMLAnchorElement>(".doc-example-variants a")];
  if (!frame || links.length === 0) continue;

  for (const link of links) {
    link.addEventListener("click", event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      if (link.getAttribute("aria-current") === "true") return;
      frame.src = link.href;
      for (const other of links) {
        if (other === link) other.setAttribute("aria-current", "true");
        else other.removeAttribute("aria-current");
      }
    });
  }
}
