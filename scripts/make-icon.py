#!/usr/bin/env python3
"""Generate tizen/icon.png (512x512) — night-gallery style: ink field,
gilded double frame, knight glyph. Regenerate: python3 scripts/make-icon.py"""
from PIL import Image, ImageDraw, ImageFont

INK = (12, 10, 7)
BRASS = (198, 161, 91)
VELLUM = (234, 227, 210)
S = 512

im = Image.new('RGB', (S, S), INK)
d = ImageDraw.Draw(im)

# candlelight glow behind the piece
glow = Image.new('L', (S, S), 0)
gd = ImageDraw.Draw(glow)
for r in range(220, 0, -4):
    gd.ellipse([S/2 - r, S/2 - r*0.9, S/2 + r, S/2 + r*0.9], fill=int(26 * (1 - r/220)))
im = Image.composite(Image.new('RGB', (S, S), (40, 32, 18)), im, glow)
d = ImageDraw.Draw(im)

# gilded double frame
d.rectangle([18, 18, S-19, S-19], outline=BRASS + (0,), width=2)
d.rectangle([30, 30, S-31, S-31], outline=(120, 98, 58), width=1)

# knight glyph, centered optically
font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 330)
glyph = '♞'
box = d.textbbox((0, 0), glyph, font=font)
w, h = box[2] - box[0], box[3] - box[1]
d.text(((S - w)/2 - box[0], (S - h)/2 - box[1] - 8), glyph, font=font, fill=VELLUM)

im.save('tizen/icon.png')
print('wrote tizen/icon.png', im.size)
