// Handlebars helpers for the site's templates. JavaScript, not TypeScript: Pattern Dump loads a package's helpers
// with Node as they are, and stops at startup on a TypeScript one. Declared in package.json ("patternDump.helpers").

// onGuideStep nav: true when the page being rendered is one of the Guide's steps, that is, when a page under the nav
// entry at /guide/ is the current one. The one place this test lives: molecules/guide-progress shows the progress
// when it is true, and layouts/doc shows the breadcrumbs when it isn't, so the two never sit on top of each other.
// The Guide's own page (/guide/) is the entry, not one of its children, so it is no step.
export default {
  onGuideStep(nav) {
    if (!Array.isArray(nav)) return false;
    const guide = nav.find((entry) => entry?.route === "/guide/");
    return Array.isArray(guide?.children) && guide.children.some((step) => step?.current === true);
  },
};
