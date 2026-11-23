# Prépare les dérivés des captures pour une langue : repère orange de la règle, hauteurs compactes
# des lignes, position du champ de saisie, recadrage de la liste.
# Usage : python3 scripts/prep.py [fr|us]   ->  src/data-<loc>.json
import glob, json, os, sys
import numpy as np
from PIL import Image

LOC = sys.argv[1] if len(sys.argv) > 1 else 'fr'
UI = 'public/ui/' if LOC == 'fr' else f'public/ui-{LOC}/'
man = json.load(open(UI + 'manifest.json'))
arr = lambda f, mode='RGB': np.asarray(Image.open(f).convert(mode)).astype(int)

def match(big, small, step=3):
    best = None
    for y in range(0, big.shape[0] - small.shape[0], step):
        for x in range(0, big.shape[1] - small.shape[1] + 1, step):
            d = np.abs(big[y:y + small.shape[0]:step, x:x + small.shape[1]:step] - small[::step, ::step]).mean()
            if best is None or d < best[0]: best = (d, x, y)
    return best

# Règle
ruler = []
for r in man['ruler']:
    v = r['value']; im = arr(f"{UI}ruler_{v}.png")
    R, G, B = im[..., 0], im[..., 1], im[..., 2]
    ys, xs = np.nonzero((R > 220) & (G > 90) & (G < 160) & (B < 60))
    ruler.append({'value': v, 'x': float(xs.mean() / im.shape[1]), 'y': float(ys.mean() / im.shape[0]), 'w': im.shape[1], 'h': im.shape[0], 'budget': r['budget']})
    print('ruler', v, round(xs.mean()), round(ys.mean()), im.shape[1], im.shape[0], r['budget'])

# Hauteur compacte des lignes : jusqu'au bloc gris des caractéristiques
rows = {}
for f in sorted(glob.glob(UI + 'row_*.png') + glob.glob(UI + 'ruler_row_*.png')):
    if f.endswith('_calc.png'): continue
    im = arr(f); h, w, _ = im.shape
    band = im[:, int(w * 0.35):int(w * 0.9)]
    gray = (np.abs(band - np.array([247, 249, 251])).sum(axis=2) < 10).mean(axis=1)
    ys = [y for y in range(150, h) if gray[y] > 0.6]
    rows[os.path.basename(f)[:-4]] = {'h': h, 'w': w, 'compact': (ys[0] - 30) if ys else h}
print({k: v['compact'] for k, v in rows.items() if not k.startswith('ruler')})

# Champ de saisie dans l'écran d'accueil
home = arr(UI + 'screen_home.png', 'L'); card = arr(UI + 'input_empty.png', 'L')
d, bx, by = match(home, card, 6)
best = (d, bx, by)
for y in range(max(0, by - 6), by + 7):
    for x in range(max(0, bx - 6), min(home.shape[1] - card.shape[1], bx + 6) + 1):
        dd = np.abs(home[y:y + card.shape[0]:2, x:x + card.shape[1]:2] - card[::2, ::2]).mean()
        if dd < best[0]: best = (dd, x, y)
print('input', best)
inputpos = {'x': best[1], 'y': best[2], 'w': card.shape[1], 'h': card.shape[0], 'homeW': home.shape[1], 'homeH': home.shape[0]}

# Liste : à partir de « Liste de matériel » (≈ 350 px au-dessus du bloc « Préparation du projet »)
L = arr(UI + 'list_full.png', 'L'); P = arr(UI + 'prep_sols.png', 'L')[18:80, 18:-18]
_, _, py = match(L, P)
top = max(0, py - 350)
im = Image.open(UI + 'list_full.png'); im.crop((0, top, im.width, min(im.height, top + 9000))).save(UI + 'list_top.png')
print('list_top from', top)

json.dump({'ruler': ruler, 'rows': rows, 'inputpos': inputpos}, open(f'src/data-{LOC}.json', 'w'), indent=1)
