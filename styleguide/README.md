# styleguide

A design system worked on with [Pattern Dump](https://www.npmjs.com/package/pattern-dump), and the package the
website (`../site/`) installs for its look. Both are npm workspaces of the repository; install from its root.

```bash
npm install            # at the repository root: both workspaces, linked
npm run dev            # at the root: the website at http://live.localhost:4000/
npm run dev:styleguide # at the root: this style guide's own workbench, http://localhost:4300/
npm run audit          # static defects across every component
npm run typecheck      # type-check the behaviour scripts
npm run build:scripts  # here: compile them to lib/scripts (JavaScript + type declarations)
```

## The package

`package.json`'s `"patternDump"` field says where everything is (patterns, styles and the base layer, themes,
scripts, assets). This workbench reads it, and so does the site, which names the package in its config
(`packages: ["@pattern-dump-docs/styleguide"]`). `"files"` lists the same folders. Change a component or a style
here and the site's `npm run dev` picks it up: the workspace link is a symlink, and Pattern Dump watches it.

## The website

The website is the repository's `site/` workspace: pages only, in `site/pages/`, and its own
`pattern-dump.config.ts` (the site's name and footer, `storefront`). Every markdown file in `site/pages/` is a
page, at the address its path names (`site/pages/about.md` is `/about/`). `npm run dev` at the root serves it:

| Address | Serves |
|---|---|
| http://live.localhost:4000/ | the website |
| http://pd.localhost:4000/ | a workbench of the site's components (the same ones, from this package) |

If Safari can't open them, add this line to `/etc/hosts`: `127.0.0.1  live.localhost pd.localhost`.

### Try breaking it

`site/pages/examples.md` places the note component with a `pd-` tag, and its values are checked against the
component's schema before the page is shown. With the website open, delete `heading="Note"` (a note needs
one) and save: the page shows what is wrong, with the file, line and column. Change it back and the page
returns by itself. How `pd-` tags work:
[placing components](https://github.com/n8design/pattern-dump/blob/main/docs/guide/storefront.md#placing-components).

### Where it lives

| Path | What lives there |
|---|---|
| `../site/pages/` | the pages, in markdown, in the site workspace (`src/patterns/pages/` here holds page-sized components) |
| `src/patterns/layouts/page/` | the layout every page renders with; its schema is what a page's frontmatter may set |
| `src/patterns/layouts/home/` | the home page: the hero, then `organisms/page-map`, the map of every page built from `nav` |
| `src/patterns/layouts/doc/`, `layouts/article/` | the reading pages: progress, the text at 42rem with the pager at its end, the table of contents beside it (sticky on a wide screen); an article adds its related articles |
| `src/patterns/pages/frame/` | the frame around every page, at least the viewport's height: header, main, footer, no rail. The header and footer stick on a wide screen with room to spare (64em by 40em), with `scroll-padding` for both; layouts fill it with `{{#> pages-frame }}` |
| `src/patterns/organisms/site-header/`, `site-footer/` | the header (the site's name, the sections in `molecules/site-nav`, and a search field) and the footer |
| `src/patterns/molecules/guide-progress/`, `pager/` | a page's section and step (from `nav`), and its previous and next page: the reading layouts include them |
| `src/patterns/molecules/breadcrumbs/` | a breadcrumb trail, in the workbench only: the reading pages show their section instead |
| `src/styles/base/colors.scss` | every colour, as tokens with a light and a dark value ("Deep gunmetal, Lime & Berry": berry in light, lime in dark) |
| `.stylelintrc.json` | the style rules `npm run build` checks first: no `px`, colours only from the tokens, no radius, shadows, gradients or `backdrop-filter` |
| `src/patterns/organisms/search/` | the site's search, on the search page |
| `src/patterns/partials/base/` | only the schema of `storefront.site`: Pattern Dump reads it there |
| `src/patterns/partials/head/` | what the skin adds to every page's `<head>` (the icon) |
| `src/patterns/components/note/` | the component the examples page (`site/pages/examples.md`) shows |
| `src/patterns/views/` | the ways a listing can be shown: `list`, `grid`, `featured`, `compact` |
| `src/patterns/components/*-card/` | the card each view shows a page as; its schema says which fields a page needs |
| `../site/pattern-dump.config.ts` | `storefront`: the website's name and footer (`site`), and where it is published |

`site/pages/articles/` is a collection: its `index.md` (layout `listing`, `sort: date`) lists every page in the folder,
newest first, by its `date`, in the listing layout's default view (`list`). Copy `hello.md` to write another; `draft: true` keeps one out of the
build. Each page is checked against the view's card: switch to `view: grid` and the listing names every article
without an `image:`. `childLayout: article` on its `index.md` gives its pages the article layout, which lists each article's related
articles. That is a query, declared in the layout's schema (`x-pd-query`)
and changed per page under the query's name (`related:`, with `limit: 5` indented under it), or turned off with
`related: false`.

A page that doesn't exist shows a built-in 404 page; write `site/pages/404.md` to change it. A page that moved
can forward from its old address (`redirectFrom: [/old/]`), and `index: false` keeps a page out of search
engines. All of it is in the [storefront guide](https://github.com/n8design/pattern-dump/blob/main/docs/guide/storefront.md).

### Build it

`npm run pages` at the root builds the website (`site/dist/site/`), this style guide's workbench for
`/workbench/` (`styleguide/dist/`), and copies both into `_site/` (`scripts/assemble-pages.mjs`): the website
at the root of its host, the workbench under `/workbench/`. That is what the GitHub Pages workflow publishes. The
site's build also writes a workbench of its own (`site/dist/workbench/`); it isn't published.

### Publish it

`.github/workflows/pages.yml`, at the repository root, runs `npm ci` and `npm run pages` and publishes `_site/` to
GitHub Pages on every push to `main`, at a custom domain or as a project page.

**As a project page** (`https://<owner>.github.io/<repository>/`, no domain needed): in
`site/pattern-dump.config.ts`, set `storefront.url` to that address, and `storefront.workbenchUrl` and
`build.basePath` to `/<repository>/workbench/`; in the root's `pages` script, the style guide's `--base` too. Then **Settings → Pages → Source:** "GitHub Actions".

**At a custom domain**, once, in the repository on GitHub:

1. **Settings → Pages → Source:** "GitHub Actions".
2. **Settings → Pages → Custom domain:** your domain, then Save. GitHub recommends verifying the domain in
   your account settings first.
3. **DNS:** for an apex domain (`example.com`), `A` records to `185.199.108.153`, `185.199.109.153`,
   `185.199.110.153` and `185.199.111.153`; for a subdomain (`www.example.com`), a `CNAME` record to
   `<your-user>.github.io`, without the repository name.
4. **Enforce HTTPS** in the same settings, once GitHub offers it (it can take up to a day).
5. **`storefront.url`** in `site/pattern-dump.config.ts`: the same address, for canonical URLs, link previews and
   the sitemap.

The workflow writes no `CNAME` file: with a GitHub Actions deploy, the custom domain is the setting in
step 2. It installs with `npm ci`, so `pattern-dump` must come from the npm registry, not a local file.

## Layout

| Path | What lives there |
|---|---|
| `package.json` (`patternDump`) | where everything is: every path resolves against this folder |
| `pattern-dump.config.ts` | this workbench's own settings (output, brand) |
| `src/patterns/<category>/<name>/` | one component: `<name>.hbs`, `.json` data, `.md` docs, `.schema.json` |
| `src/patterns/<category>/<name>/<name>~<variant>.json` | a variant that overrides data |
| `src/patterns/<category>/<name>/<name>~<variant>.hbs` | a variant with its own markup |
| `src/styles/` | SCSS mirroring `src/patterns/` (`atoms/button.scss` styles `atoms/button`) |
| `src/styles/base/` | shared rules with no single owner, linked beneath every preview |
| `themes/<name>.theme.scss` | a theme: custom properties under `[data-theme="<name>"]` |
| `assets/` | served at `/assets/` |
| `src/scripts/<id>.ts` | a behaviour script, loaded by the components that name it |
| `tsconfig.json` | TypeScript settings for `src/scripts` |

Include a component from another with its handle, `<category>-<name>`: `{{> atoms-button }}`.
A variant handle contains `~`, so quote it: `{{> "atoms-button~secondary" }}`.

A folder's `index.md` titles it and can order its children by name. `...` stands for every child
the list doesn't name, so a folder you add later needs no edit here:

```md
---
title: Atoms
order: [button, ..., badge]
---
```

Any component (in its `.md`) or folder (in its `index.md`) can also rank itself with a number. Without
one its rank is `0`; lower comes first, whatever the parent's list says. This puts a folder before
every rank-0 sibling (`order: 10` would put it after them):

```md
---
title: Projects
order: -10
---
```

Siblings sort by rank first, then by the parent's list, then alphabetically.
`src/patterns/index.md` orders the top-level folders.

## Behaviour scripts

A script is a TypeScript module in `src/scripts/`. A component loads it by naming it in its `.md`
frontmatter, and every preview that shows the component (directly or included in another) loads it:

```md
---
title: Search field
requireScript: [search-field]
---
```

To load a script into every preview, list it in `package.json`: `"patternDump": { "globalScripts": ["<id>"] }`.

`npm run dev` compiles scripts itself (esbuild) and reloads the preview when one changes; there is no
build step while you work. `tsconfig.json` is for your editor, `npm run typecheck` and
`npm run build:scripts`, which writes JavaScript and type declarations to `lib/scripts/`.

To let another package in your repository import the compiled scripts, export them from `package.json`:

```json
"files": ["lib/scripts"],
"exports": { "./package.json": "./package.json", "./scripts/*": "./lib/scripts/*" }
```
