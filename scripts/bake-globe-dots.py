"""
Bakes the land mass of the earth into evenly spaced dots for the 3D route globe.

Reads public/textures/planets/earth_specular_2048.jpg (water = white, land = black),
samples a Fibonacci sphere and keeps points that fall on land. Output is a tiny
Int16 lat/lon pair list (x100) at public/models/globe-dots.bin, so the browser
never downloads a texture for the globe.

Run: python scripts/bake-globe-dots.py
"""
import math
import os
import struct

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "public", "textures", "planets", "earth_specular_2048.jpg")
OUT = os.path.join(ROOT, "public", "models", "globe-dots.bin")
SAMPLES = 30000

mask = Image.open(SRC).convert("L")
w, h = mask.size
golden = math.pi * (3 - math.sqrt(5))
points = []
for i in range(SAMPLES):
    y = 1 - (i / (SAMPLES - 1)) * 2
    r = math.sqrt(max(0.0, 1 - y * y))
    theta = golden * i
    x, z = math.cos(theta) * r, math.sin(theta) * r
    lat = math.degrees(math.asin(y))
    lon = math.degrees(math.atan2(z, x))
    if lat < -60:  # skip Antarctica – it only adds noise at the bottom of the globe
        continue
    px = int((lon + 180) / 360 * (w - 1))
    py = int((90 - lat) / 180 * (h - 1))
    if mask.getpixel((px, py)) < 128:
        points.append((round(lat * 100), round(lon * 100)))

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, "wb") as f:
    for lat, lon in points:
        f.write(struct.pack("<hh", lat, lon))
print(f"{len(points)} land dots -> {OUT} ({os.path.getsize(OUT)} bytes)")
