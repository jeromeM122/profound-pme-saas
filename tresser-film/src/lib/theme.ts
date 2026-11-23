import { Easing, staticFile, delayRender, continueRender, interpolate } from 'remotion';
import membersMeta from '../../public/captures/members/meta.json';

// Charte Tresser (relevée dans routines.tresser.fr/assets/style.css)
export const C = {
  yellow: '#E8F800',
  blue: '#3366FF',
  ink: '#000000',
  white: '#FFFFFF',
  paper: '#F3F4EC',
  paper2: '#E9EBDF',
  muted: '#5A5C50',
};
export const F = {
  display: 'Archivo, sans-serif',
  sans: 'Figtree, sans-serif',
  mono: '"DM Mono", ui-monospace, monospace',
};
// Archivo condensé (wdth 62), comme les titres du site
export const condensed: React.CSSProperties = {
  fontFamily: F.display, fontStretch: '62%', fontVariationSettings: "'wdth' 62", fontWeight: 800,
  textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 0.9,
};

export const FPS = 30;
export const sec = (s: number) => Math.round(s * FPS);
export const ease = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
export const lerp = (f: number, a: number, b: number, from = 0, to = 1, e = ease) =>
  interpolate(f, [a, b], [from, to], { ...clamp, easing: e });

// Interpolation par paliers : [[frame, valeur], ...] avec easeInOut entre chaque palier
export const keyframes = (f: number, kf: [number, number][], e = easeInOut) => {
  if (f <= kf[0][0]) return kf[0][1];
  for (let i = 1; i < kf.length; i++) {
    if (f <= kf[i][0]) return interpolate(f, [kf[i - 1][0], kf[i][0]], [kf[i - 1][1], kf[i][1]], { ...clamp, easing: e });
  }
  return kf[kf.length - 1][1];
};

export type Variant = 'members' | 'masked';
export const cap = (v: Variant, file: string) => staticFile(`captures/${v}/${file}`);
export const META = membersMeta as any; // positions identiques dans les deux variantes

// ---------- Polices (fichiers locaux, licence OFL) ----------
let fontsRequested = false;
export const loadFonts = () => {
  if (fontsRequested || typeof document === 'undefined') return;
  fontsRequested = true;
  const h = delayRender('Chargement des polices');
  const faces: [string, string, FontFaceDescriptors][] = [
    ['Archivo', 'Archivo-normal-0.woff2', { weight: '100 900', stretch: '62% 100%' }],
    ['DM Mono', 'DMMono-normal-1.woff2', { weight: '400' }],
    ['DM Mono', 'DMMono-normal-2.woff2', { weight: '500' }],
    ['Figtree', 'Figtree-normal-4.woff2', { weight: '400 900' }],
    ['Figtree', 'Figtree-italic-3.woff2', { weight: '400 900', style: 'italic' }],
  ];
  Promise.all(faces.map(([fam, file, d]) =>
    new FontFace(fam, `url(${staticFile('fonts/' + file)}) format('woff2')`, d).load().then(ff => (document.fonts as any).add(ff))))
    .then(() => continueRender(h))
    .catch(e => { console.error(e); continueRender(h); });
};
