"""VERTO — icone dell'app: il marchio (due rombi che si sovrappongono, il latino e l'italiano) su fondo blu egizio.
Produce assets/: favicon-32.png, apple-touch-icon.png (180), icon-192.png, icon-512.png, icon-maskable-512.png.
Uso: python tools/icons.py"""
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'assets'
OUT.mkdir(exist_ok=True)
BLUE = (0x24, 0x48, 0xB0, 255)
BACK = (0xE9, 0x80, 0x5A, 255)   # minio chiaro: il rombo dietro
FRONT = (0xFF, 0xFF, 0xFF, 255)  # il rombo davanti
SS = 4  # sovracampionamento per bordi puliti

# il marchio nel riquadro 32×32 dell'app (lo stesso disegno di MARK in src/app.js)
FRONT_PTS = [(13.8, 5), (24.6, 16), (13.8, 27), (3, 16)]
BACK_PTS = [(18.2, 5), (29, 16), (18.2, 27), (7.4, 16)]


def icon(size, mark_share, rounded):
    s = size * SS
    img = Image.new('RGBA', (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if rounded:
        d.rounded_rectangle([0, 0, s - 1, s - 1], radius=int(s * 0.22), fill=BLUE)
    else:
        d.rectangle([0, 0, s, s], fill=BLUE)
    k = s * mark_share / 26.0  # il marchio è largo 26 unità (da 3 a 29)
    ox, oy = s / 2 - 16 * k, s / 2 - 16 * k
    pts = lambda P: [(ox + x * k, oy + y * k) for x, y in P]
    d.polygon(pts(BACK_PTS), fill=BACK)
    d.polygon(pts(FRONT_PTS), fill=FRONT)
    return img.resize((size, size), Image.LANCZOS)


icon(32, 0.78, True).save(OUT / 'favicon-32.png')
icon(180, 0.62, False).save(OUT / 'apple-touch-icon.png')
icon(192, 0.62, True).save(OUT / 'icon-192.png')
icon(512, 0.62, True).save(OUT / 'icon-512.png')
icon(512, 0.5, False).save(OUT / 'icon-maskable-512.png')  # dentro la zona sicura dell'80%
print('Icone scritte in', OUT)
