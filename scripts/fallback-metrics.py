"""The fallback faces' metrics (base/fonts.scss): size-adjust, ascent-override, descent-override and line-gap-override
for a local system font standing in for each web font while it loads, so the swap changes no line breaks and no
heights.

Run from anywhere in the repository, with fonttools 4.60.1 (pip install "fonttools[woff]==4.60.1"):

    python3 scripts/fallback-metrics.py [path to the system fonts folder]

The web fonts are read from styleguide/assets/fonts/, found from this file's own place.

The system fonts are Arial and Courier New (macOS: /System/Library/Fonts/Supplemental, the default; Windows:
C:/Windows/Fonts). For each web font, at the weight the site uses most, it compares the average advance width of
SAMPLE (English docs text) with the fallback's: that ratio is size-adjust. The web font's vertical metrics (its typo
metrics when it says to use them, else hhea), divided by size-adjust, are the overrides.
"""
import os
import sys
from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

# The web fonts: styleguide/assets/fonts/, beside this scripts/ folder.
FONTS = Path(__file__).resolve().parent.parent / "styleguide" / "assets" / "fonts"

SAMPLE = (
    "Pattern Dump renders Handlebars components with JSON data, checks accessibility in every build and publishes "
    "sites like this one. Every key of the configuration, with its type, its default and what it does. The folder "
    "the build writes the workbench to when neither option is given. Build your design system. Reuse it everywhere."
)

# (web font file, axis values to pin, fallback file, the local() names, what it stands in for)
FACES = [
    ("archivo-latin-italic-wdth125-wght800-900.woff2", {"wght": 900}, "Arial Bold Italic.ttf",
     ["Arial Bold Italic", "Arial-BoldItalicMT"], "Archivo italic: the site title and the hero"),
    ("archivo-latin-normal-wdth100-wght700-900.woff2", {"wght": 800}, "Arial Bold.ttf",
     ["Arial Bold", "Arial-BoldMT"], "Archivo upright: headings"),
    ("atkinson-hyperlegible-next-latin-wght-normal.woff2", {"wght": 400}, "Arial.ttf",
     ["Arial", "ArialMT"], "Atkinson Hyperlegible Next, 200 to 500: body text"),
    ("atkinson-hyperlegible-next-latin-wght-normal.woff2", {"wght": 600}, "Arial Bold.ttf",
     ["Arial Bold", "Arial-BoldMT"], "Atkinson Hyperlegible Next, 550 to 800: semibold text"),
    ("atkinson-hyperlegible-mono-latin-wght-normal.woff2", {"wght": 400}, "Courier New.ttf",
     ["Courier New", "CourierNewPSMT"], "Atkinson Hyperlegible Mono: code"),
]


def vertical(font):
    upm = font["head"].unitsPerEm
    os2 = font["OS/2"]
    if os2.fsSelection & (1 << 7):  # USE_TYPO_METRICS
        return upm, os2.sTypoAscender, -os2.sTypoDescender, os2.sTypoLineGap
    hhea = font["hhea"]
    return upm, hhea.ascent, -hhea.descent, hhea.lineGap


def average_width(font, text):
    cmap = font.getBestCmap()
    hmtx = font["hmtx"]
    widths = [hmtx[cmap[ord(c)]][0] for c in text if ord(c) in cmap]
    return sum(widths) / len(widths) / font["head"].unitsPerEm


def pct(value):
    return f"{round(value * 100, 2)}%"


def main():
    system = sys.argv[1] if len(sys.argv) > 1 else "/System/Library/Fonts/Supplemental"
    for web_file, axes, fallback_file, names, what in FACES:
        web = instancer.instantiateVariableFont(TTFont(FONTS / web_file), axes)
        fallback = TTFont(os.path.join(system, fallback_file))
        size_adjust = average_width(web, SAMPLE) / average_width(fallback, SAMPLE)
        upm, ascent, descent, line_gap = vertical(web)
        print(f"/* {what}: {web_file} at {axes}, against {fallback_file} */")
        print(f"  src: {', '.join(f'local(\"{n}\")' for n in names)};")
        print(f"  size-adjust: {pct(size_adjust)};")
        print(f"  ascent-override: {pct(ascent / upm / size_adjust)};")
        print(f"  descent-override: {pct(descent / upm / size_adjust)};")
        print(f"  line-gap-override: {pct(line_gap / upm / size_adjust)};")
        print()


if __name__ == "__main__":
    main()
