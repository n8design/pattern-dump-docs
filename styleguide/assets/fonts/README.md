# Fonts

All Latin only, from `@fontsource-variable` 5.3.0, SIL Open Font License 1.1 (the `OFL-*.txt` files).

| File | Used for | Source |
|---|---|---|
| `archivo-latin-normal-wdth100-wght700-900.woff2` | headings | cut from `archivo-latin-wdth-normal.woff2` |
| `archivo-latin-italic-wdth125-wght800-900.woff2` | the hero and the site title | cut from `archivo-latin-wdth-italic.woff2` |
| `atkinson-hyperlegible-next-latin-wght-normal.woff2` | body text and UI | as published, weight 200–800 |
| `atkinson-hyperlegible-mono-latin-wght-normal.woff2` | code, step numbers, the search key hint | as published, weight 200–800 |

The two `archivo-latin-wdth-*.woff2` files are the originals (width 62–125, weight 100–900). They are kept so the
cut files can be rebuilt; the styles don't load them.

## Rebuilding the Archivo files

Archivo is cut to what the styles use: the upright at width 100 and the heading weights (the tokens use 720 to 900),
the italic at width 125 and the heading-strong weights (820 and 900). Run in this folder, with fonttools 4.60.1 and
brotli (`pip install "fonttools[woff]==4.60.1"`):

```sh
fonttools varLib.instancer archivo-latin-wdth-italic.woff2 wdth=125 wght=800:900 -o archivo-italic.ttf
fonttools ttLib.woff2 compress -o archivo-latin-italic-wdth125-wght800-900.woff2 archivo-italic.ttf
rm archivo-italic.ttf

fonttools varLib.instancer archivo-latin-wdth-normal.woff2 wdth=100 wght=700:900 -o archivo-normal.ttf
fonttools ttLib.woff2 compress -o archivo-latin-normal-wdth100-wght700-900.woff2 archivo-normal.ttf
rm archivo-normal.ttf
```

If a heading weight token goes below 700 (upright) or 800 (italic), or the hero's width changes, widen the ranges
and rebuild.
