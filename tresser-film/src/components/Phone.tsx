import React from 'react';
import { Img, useVideoConfig } from 'remotion';

// Viewport réel des captures : 390 × 844 px CSS (@3x)
export const VW = 390, VH = 844;

export type Geo = { left: number; top: number; s: number; sw: number; sh: number; bezel: number; ow: number; oh: number };

/** Géométrie du téléphone selon le format. */
export const usePhoneGeo = (override?: Partial<{ screenW: number; cx: number; top: number }>): Geo => {
  const { width, height } = useVideoConfig();
  const wide = width > height;
  const screenW = override?.screenW ?? (wide ? 880 * VW / VH : 600);
  const s = screenW / VW, sw = screenW, sh = VH * s;
  const bezel = Math.round(s * 9);
  const ow = sw + bezel * 2, oh = sh + bezel * 2;
  const cx = override?.cx ?? (wide ? 1250 : width / 2);
  const top = override?.top ?? (wide ? (height - oh) / 2 : 452);
  return { left: cx - ow / 2, top, s, sw, sh, bezel, ow, oh };
};

/** Maquette de smartphone générique (sans marque). L'écran affiche l'interface réelle. */
export const Phone: React.FC<{ geo: Geo; children: React.ReactNode; style?: React.CSSProperties; transform?: string; origin?: string }> =
  ({ geo, children, style, transform, origin }) => {
    const { left, top, ow, oh, bezel, sw, sh, s } = geo;
    return (
      <div style={{ position: 'absolute', left, top, width: ow, height: oh, transform, transformOrigin: origin, ...style }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: 54 * s / 1.54 * 1.25, background: '#0b0b0a',
          boxShadow: `0 ${40 * s}px ${80 * s}px rgba(25,22,10,0.28), 0 ${8 * s}px ${20 * s}px rgba(25,22,10,0.18), inset 0 0 0 ${1.5 * s}px #2a2a26` }} />
        <div style={{ position: 'absolute', left: bezel, top: bezel, width: sw, height: sh, borderRadius: 44 * s / 1.54 * 1.25, overflow: 'hidden', background: '#fff' }}>
          {children}
          {/* îlot caméra */}
          <div style={{ position: 'absolute', left: sw / 2 - 58 * s, top: 9 * s, width: 116 * s, height: 33 * s, borderRadius: 20 * s, background: '#0b0b0a', opacity: 0.0 }} />
        </div>
      </div>
    );
  };

/** Capture réelle affichée dans l'écran, avec défilement (px CSS). */
export const Shot: React.FC<{ src: string; geo: Geo; scroll?: number; opacity?: number; x?: number; style?: React.CSSProperties }> =
  ({ src, geo, scroll = 0, opacity = 1, x = 0, style }) => (
    <Img src={src} style={{ position: 'absolute', left: x * geo.s, top: -scroll * geo.s, width: geo.sw, height: 'auto', opacity, ...style }} />
  );
