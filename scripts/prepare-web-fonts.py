"""Regenerate web fonts using fonttools==4.66.0 and brotli==1.2.0.

Source fonts and their SIL OFL licenses remain alongside the generated assets.
Run from the repository root; no network access is needed for generation.
"""
from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

fonts = Path(__file__).resolve().parents[1] / "apps/web/src/app/fonts"
for family in ("DMSans", "Fraunces"):
    font = TTFont(fonts / f"{family}.ttf")
    font.flavor = "woff2"
    font.save(fonts / f"{family}.woff2")

font = TTFont(fonts / "DMSans.ttf")
axes = {axis.axisTag: axis.defaultValue for axis in font["fvar"].axes}
axes["wght"] = 700
static = instantiateVariableFont(font, axes, inplace=False)
static.save(fonts / "DMSans-Preview.ttf")
