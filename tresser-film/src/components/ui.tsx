import React from 'react';
import { AbsoluteFill, Img, random, staticFile, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { C, F, lerp, clamp, condensed } from '../lib/theme';
import { ICON_PATHS } from '../lib/icons';

export const useWide = () => { const { width, height } = useVideoConfig(); return width > height; };

/** Ligne de texte révélée par un masque (montée), avec sortie optionnelle. */
export const Rise: React.FC<{ at: number; out?: number; dur?: number; children: React.ReactNode; style?: React.CSSProperties; dy?: number }> =
  ({ at, out, dur = 22, children, style, dy = 105 }) => {
    const f = useCurrentFrame();
    const p = lerp(f, at, at + dur);
    const o = out != null ? lerp(f, out, out + 12, 1, 0) : 1;
    const oy = out != null ? lerp(f, out, out + 14, 0, -30) : 0;
    return (
      <div style={{ overflow: 'hidden', padding: '0.14em 0 0.1em', margin: '-0.14em 0 -0.1em' }}>
        <div style={{ transform: `translateY(${(1 - p) * dy + oy}%)`, opacity: o * Math.min(1, p * 3), ...style }}>{children}</div>
      </div>
    );
  };

/** Fondu simple. */
export const Fade: React.FC<{ at: number; out?: number; dur?: number; children: React.ReactNode; style?: React.CSSProperties; y?: number }> =
  ({ at, out, dur = 14, children, style, y = 18 }) => {
    const f = useCurrentFrame();
    const p = lerp(f, at, at + dur);
    const o = out != null ? lerp(f, out, out + 10, 1, 0) : 1;
    return <div style={{ opacity: p * o, transform: `translateY(${(1 - p) * y}px)`, ...style }}>{children}</div>;
  };

/** Icône de texture de la charte, tracée progressivement. */
export const Glyph: React.FC<{ k: string; size: number; draw?: number; color?: string; weight?: number; style?: React.CSSProperties }> =
  ({ k, size, draw = 1, color = C.ink, weight = 1, style }) => {
    const paths = (ICON_PATHS as any)[k]();
    return (
      <svg viewBox="0 0 44 40" width={size * 1.1} height={size} style={{ overflow: 'visible', ...style }}>
        {paths.map((p: any, i: number) => {
          const local = Math.max(0, Math.min(1, draw * 1.25 - i * 0.12));
          return <path key={i} d={p.d} pathLength={1} fill="none" stroke={color} strokeWidth={p.w * weight}
            strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 1" strokeDashoffset={1 - local} />;
        })}
      </svg>
    );
  };

/** Grain argentique léger + vignette : texture « film » premium. */
export const Grain: React.FC<{ dark?: boolean }> = ({ dark }) => {
  const f = useCurrentFrame();
  const seed = Math.floor(f / 2) % 12;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, mixBlendMode: 'overlay', opacity: dark ? 0.22 : 0.16 }}>
        <filter id={`g${seed}`}><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={seed} stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width="100%" height="100%" filter={`url(#g${seed})`} />
      </svg>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(30,25,10,0.10) 100%)' }} />
    </AbsoluteFill>
  );
};

/** Logo Tresser (SVG officiel du site). */
export const Logo: React.FC<{ width: number; white?: boolean; style?: React.CSSProperties }> = ({ width, white, style }) => (
  <Img src={staticFile('brand/logo.svg')} style={{ width, height: 'auto', filter: white ? 'invert(1)' : undefined, ...style }} />
);

/** Petite ligne de contexte en DM Mono (sous-titrage honnête). */
export const MonoNote: React.FC<{ children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties }> = ({ children, color = C.muted, size = 26, style }) => (
  <div style={{ fontFamily: F.mono, fontSize: size, letterSpacing: '0.04em', textTransform: 'uppercase', color, ...style }}>{children}</div>
);

/** Volet de transition aux couleurs de la charte. */
export const Wipe: React.FC<{ at: number; color?: string; dur?: number }> = ({ at, color = C.yellow, dur = 18 }) => {
  const f = useCurrentFrame();
  const a = interpolate(f, [at - dur, at], [100, 0], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const b = interpolate(f, [at, at + dur], [0, -100], { ...clamp, easing: (t) => t * t * t });
  if (f < at - dur || f > at + dur) return null;
  return <AbsoluteFill style={{ background: color, transform: `translateY(${f < at ? a : b}%)` }} />;
};

/** Indicateur de toucher (doigt) sur l'écran. Coordonnées en px CSS du site. */
export const Tap: React.FC<{ at: number; x: number; y: number; s: number }> = ({ at, x, y, s }) => {
  const f = useCurrentFrame();
  if (f < at - 8 || f > at + 22) return null;
  const pre = lerp(f, at - 8, at, 0, 1);
  const p = lerp(f, at, at + 20, 0, 1);
  const r = 26 * s;
  return (
    <>
      <div style={{ position: 'absolute', left: x * s - r, top: y * s - r, width: r * 2, height: r * 2, borderRadius: '50%',
        background: 'rgba(0,0,0,0.22)', border: `${2 * s}px solid rgba(255,255,255,0.9)`, boxShadow: '0 4px 18px rgba(0,0,0,.25)',
        transform: `scale(${(0.7 + pre * 0.3) * (1 - p * 0.25)})`, opacity: pre * (1 - p) }} />
      <div style={{ position: 'absolute', left: x * s - r, top: y * s - r, width: r * 2, height: r * 2, borderRadius: '50%',
        border: `${2 * s}px solid rgba(255,255,255,0.85)`, transform: `scale(${1 + p * 1.2})`, opacity: (1 - p) * (f >= at ? 1 : 0) }} />
    </>
  );
};

export const Paper: React.FC<{ color?: string; children?: React.ReactNode }> = ({ color = C.paper, children }) => (
  <AbsoluteFill style={{ background: color }}>{children}</AbsoluteFill>
);

export { condensed };
export const rnd = random;
