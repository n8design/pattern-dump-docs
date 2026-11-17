# styleguide

A design system worked on with [Pattern Dump](https://www.npmjs.com/package/pattern-dump).

```bash
npm run dev     # the workbench at http://localhost:4000
npm run audit   # static defects across every component
npm run typecheck      # type-check the behaviour scripts
npm run build:scripts  # compile them to lib/scripts (JavaScript + type declarations)
```

## The website

The website's pages live outside this folder, in the repository's `site/` (`../site/` from here,
`storefront.pagesDir` in `pattern-dump.config.ts`); this folder holds the skin they render with. Every
markdown file in `site/` is a page, at the address its path names (`site/about.md` is `/about/`). Run
`npm run dev` here, in `styleguide/`; it serves the website next to the workbench:

| Address | Serves |
|---|---|
| http://live.localhost:4000/ | the website |
| http://pd.localhost:4000/ | the workbench |

If Safari can't open them, add this line to `/etc/hosts`: `127.0.0.1  live.localhost pd.localhost`.

### Try breaking it

`site/index.md` places the note component with a `pd-` tag, and its values are checked against the
component's schema before the page is shown. With the website open, change `tone="tip"` to `tone="tips"`
and save: the page shows what is wrong, with the file, line and column. Change it back and the page
returns by itself. How `pd-` tags work:
[placing components](https://github.com/n8design/pattern-dump/blob/main/docs/guide/storefront.md#placing-components).

### Where it lives

| Path | What lives there |
|---|---|
| `../site/` | the pages, in markdown, at the repository root (`site/` is the website; `src/patterns/pages/`, if you have it, holds page-sized components) |
| `src/patterns/layouts/page/` | the layout every page renders with; its schema is what a page's frontmatter may set |
| `src/patterns/layouts/home/`, `layouts/article/` | the home page's layout, with the latest articles, and an article's, with its related articles |
| `src/patterns/partials/base/` | the frame around every page: header, navigation, footer |
| `src/patterns/partials/head/` | what the skin adds to every page's `<head>` (the icon) |
| `src/patterns/components/note/` | the component the home page shows |
| `src/patterns/views/` | the ways a listing can be shown: `list`, `grid`, `featured`, `compact` |
| `src/patterns/components/*-card/` | the card each view shows a page as; its schema says which fields a page needs |
| `pattern-dump.config.ts` | `storefront`: the website's name and footer (`site`), and where it is published |

`site/articles/` is a collection: its `index.md` (layout `listing`, `sort: date`) lists every page in the folder,
newest first, by its `date`, in the listing layout's default view (`list`). Copy `hello.md` to write another; `draft: true` keeps one out of the
build. Each page is checked against the view's card: switch to `view: grid` and the listing names every article
without an `image:`. `childLayout: article` on its `index.md` gives its pages the article layout, which lists each article's related
articles; the home page lists the latest ones. Both are queries, declared in the layout's schema (`x-pd-query`)
and changed per page under the query's name (`related:`, with `limit: 5` indented under it), or turned off with
`related: false`.

A page that doesn't exist shows a built-in 404 page; write `site/404.md` to change it. A page that moved
can forward from its old address (`redirectFrom: [/old/]`), and `index: false` keeps a page out of search
engines. All of it is in the [storefront guide](https://github.com/n8design/pattern-dump/blob/main/docs/guide/storefront.md).

### Build it

`npm run build` writes the website to `public/` and the workbench to `dist/` (both in `styleguide/`), built for `/workbench/`. The
website is served from the root of its host, with the workbench copied into it at `/workbench/`, which is
what the GitHub Pages workflow does.

### Publish it

`.github/workflows/pages.yml`, at the repository root, publishes both to GitHub Pages on every push to `main`,
at a custom domain or as a project page. It runs its steps in `styleguide/`.

**As a project page** (`https://<owner>.github.io/<repository>/`, no domain needed): in
`pattern-dump.config.ts`, set `storefront.url` to that address, and `storefront.workbenchUrl` and
`build.basePath` to `/<repository>/workbench/`. Then **Settings → Pages → Source:** "GitHub Actions".

**At a custom domain**, once, in the repository on GitHub:

1. **Settings → Pages → Source:** "GitHub Actions".
2. **Settings → Pages → Custom domain:** your domain, then Save. GitHub recommends verifying the domain in
   your account settings first.
3. **DNS:** for an apex domain (`example.com`), `A` records to `185.199.108.153`, `185.199.109.153`,
   `185.199.110.153` and `185.199.111.153`; for a subdomain (`www.example.com`), a `CNAME` record to
   `<your-user>.github.io`, without the repository name.
4. **Enforce HTTPS** in the same settings, once GitHub offers it (it can take up to a day).
5. **`storefront.url`** in `pattern-dump.config.ts`: the same address, for canonical URLs, link previews and
   the sitemap.

The workflow writes no `CNAME` file: with a GitHub Actions deploy, the custom domain is the setting in
step 2. It installs with `npm ci`, so `pattern-dump` must come from the npm registry, not a local file.

## Layout

| Path | What lives there |
|---|---|
| `pattern-dump.config.ts` | where everything is: every path resolves against this folder |
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

To load a script into every preview, list it in `pattern-dump.config.ts`: `globalScripts: ["<id>"]`.

`npm run dev` compiles scripts itself (esbuild) and reloads the preview when one changes; there is no
build step while you work. `tsconfig.json` is for your editor, `npm run typecheck` and
`npm run build:scripts`, which writes JavaScript and type declarations to `lib/scripts/`.

To let another package in your repository import the compiled scripts, export them from `package.json`:

```json
"files": ["lib/scripts"],
"exports": { "./package.json": "./package.json", "./scripts/*": "./lib/scripts/*" }
```
