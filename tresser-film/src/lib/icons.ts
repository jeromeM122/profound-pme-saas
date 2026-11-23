// Icônes de texture de la charte Tresser, portées à l'identique depuis
// routines.tresser.fr/assets/shared.js (viewBox 0 0 44 40).
export function coilPath(x0: number, y0: number, y1: number, r: number, k: number) {
  let d = '', t = 0, first = true;
  while (true) {
    const y = y0 + k * t + r * Math.sin(t), x = x0 + r * Math.cos(t) - r;
    if (y > y1 && t > 0) break;
    d += (first ? 'M' : 'L') + x.toFixed(2) + ' ' + y.toFixed(2); first = false; t += 0.25; if (t > 200) break;
  }
  return d;
}
export function wavePath(x0: number, y0: number, y1: number, amp: number, period: number, phase = 0) {
  let d = '';
  for (let y = y0; y <= y1 + 0.01; y += 0.8) { const x = x0 + amp * Math.sin((y - y0) / period * 2 * Math.PI + phase); d += (y === y0 ? 'M' : 'L') + x.toFixed(2) + ' ' + y.toFixed(2); }
  return d;
}
// Chaque icône = liste de traits { d, w }
export const ICON_PATHS = {
  crepus: () => [10, 22, 34].map(x => ({ d: coilPath(x + 2, 4, 36, 2.6, 0.75), w: 1.6 })),
  frises: () => [13, 29].map(x => ({ d: coilPath(x + 3, 4, 36, 3.6, 1.6), w: 1.8 })),
  boucles: () => [14, 30].map((x, i) => ({ d: wavePath(x, 4, 36, 6, 16, i * 1.2), w: 2 })),
  locs: () => [11, 22, 33].map((x, i) => ({ d: wavePath(x, 4, 36, 1, 40, i), w: 4 })),
  multi: () => [{ d: coilPath(11, 4, 36, 2.6, 0.75), w: 1.6 }, { d: wavePath(22, 4, 36, 5, 16), w: 2 }, { d: wavePath(34, 4, 36, 1, 40), w: 3.5 }],
};

