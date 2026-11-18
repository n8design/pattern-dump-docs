// The table of contents' scrollspy (components/toc): marks the link of the heading in view with
// aria-current="true", on a wide screen only (56em and up, where the table of contents sits beside the text).
// Where the browser has scroll-target-group, CSS shows the current link (:target-current) and this mirrors it into
// aria-current once scrolling ends; elsewhere a scroll listener finds the heading and sets aria-current, which CSS shows too.

const toc = document.querySelector<HTMLElement>(".toc");
const wide = window.matchMedia("(min-width: 56em)");

if (toc) {
  const links = [...toc.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')];
  const mark = (current: Element | null): void => {
    for (const link of links) {
      if (wide.matches && link === current) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    }
  };

  if (CSS.supports("scroll-target-group: auto")) {
    // Chrome updates :target-current two frames after scrollend (measured), so read it then.
    const sync = (): void => {
      requestAnimationFrame(() => requestAnimationFrame(() => mark(toc.querySelector("a:target-current"))));
    };
    sync();
    document.addEventListener("scrollend", sync);
    wide.addEventListener("change", sync);
  } else {
    const targets = links
      .map(link => document.getElementById(decodeURIComponent(link.hash.slice(1))))
      .filter((el): el is HTMLElement => el !== null);
    // The current heading is the last one whose top has passed a third of the window's height (where
    // Chrome's own scroll-target-group puts it, measured on the Guide page); at the end of the page,
    // where the last headings can't reach that line, the last one (as scroll-target-group does).
    const atEnd = (): boolean => window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 1;
    const update = (): void => {
      const line = window.innerHeight / 3;
      // Before the first heading reaches the line, the first one, as scroll-target-group does.
      let current: HTMLElement | undefined = targets[0];
      for (const target of targets) if (target.getBoundingClientRect().top <= line) current = target;
      if (atEnd() && targets.length > 0) current = targets[targets.length - 1];
      mark(current ? links[targets.indexOf(current)] ?? null : null);
    };
    // On scroll, once a frame. Not an IntersectionObserver: reaching the end of the page crosses no heading, so it
    // would miss the last one.
    let queued = false;
    window.addEventListener("scroll", () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; update(); });
    }, { passive: true });
    wide.addEventListener("change", update);
    update();
  }
}
