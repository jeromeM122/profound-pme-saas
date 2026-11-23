# Prépare les dérivés des captures : position du repère orange de la règle, recadrage de la liste.
import json, numpy as np
from PIL import Image
UI = 'public/ui/'
man = json.load(open(UI + 'manifest.json'))
out = []
for r in man['ruler']:
    v = r['value']; im = np.asarray(Image.open(f"{UI}ruler_{v}.png").convert('RGB')).astype(int)
    R, G, B = im[..., 0], im[..., 1], im[..., 2]
    mask = (R > 220) & (G > 90) & (G < 160) & (B < 60)
    ys, xs = np.nonzero(mask)
    out.append({'value': v, 'x': float(xs.mean() / im.shape[1]), 'y': float(ys.mean() / im.shape[0]), 'w': im.shape[1], 'h': im.shape[0], 'budget': r['budget']})
    print(v, round(xs.mean()), round(ys.mean()), im.shape[1], im.shape[0], r['budget'])
json.dump(out, open('src/ruler.json', 'w'), indent=1)
im = Image.open(UI + 'list_full.png'); im.crop((0, 6900, im.width, 15900)).save(UI + 'list_top.png')  # à partir de « Liste de matériel »; print('list_top ok')

# Hauteur « compacte » de chaque ligne : jusqu'au début du bloc gris de caractéristiques.
import glob, os
compact = {}
for f in sorted(glob.glob(UI + 'row_*.png') + glob.glob(UI + 'ruler_row_*.png')):
    if f.endswith('_calc.png'): continue
    im = np.asarray(Image.open(f).convert('RGB')).astype(int); h, w, _ = im.shape
    band = im[:, int(w * 0.35):int(w * 0.9)]
    gray = (np.abs(band - np.array([247, 249, 251])).sum(axis=2) < 10).mean(axis=1)
    ys = [y for y in range(150, h) if gray[y] > 0.6]
    compact[os.path.basename(f)[:-4]] = {"h": h, "w": w, "compact": (ys[0] - 30) if ys else h}
json.dump(compact, open('src/rows.json', 'w'), indent=1)
print(compact)

# Position de la carte de saisie (input_empty, marge 12 px CSS) dans screen_home (pixels 3x).
home = np.asarray(Image.open(UI + 'screen_home.png').convert('L')).astype(int)
card = np.asarray(Image.open(UI + 'input_empty.png').convert('L')).astype(int)
ch, cw = card.shape; best = None
for y in range(0, home.shape[0] - ch, 3):
    for x in range(0, home.shape[1] - cw + 1, 3):
        d = np.abs(home[y:y + ch:6, x:x + cw:6] - card[::6, ::6]).mean()
        if best is None or d < best[0]: best = (d, x, y)
d, bx, by = best
for y in range(max(0, by - 3), by + 4):
    for x in range(max(0, bx - 3), min(home.shape[1] - cw, bx + 3) + 1):
        dd = np.abs(home[y:y + ch:2, x:x + cw:2] - card[::2, ::2]).mean()
        if dd < best[0]: best = (dd, x, y)
print('input card in screen_home', best, 'home', home.shape[::-1], 'card', (cw, ch))
json.dump({'x': best[1], 'y': best[2], 'w': cw, 'h': ch, 'homeW': home.shape[1], 'homeH': home.shape[0]}, open('src/inputpos.json', 'w'))
