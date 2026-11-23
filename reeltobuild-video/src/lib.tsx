import React, { createContext, useContext } from 'react';
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

// ---------- Charte (tokens repris du CSS de reeltobuild.com) ----------
export const C = {
  paper: '#f8fafc',
  card: '#ffffff',
  sunk: '#f1f5f9',
  line: '#e2e8f0',
  fg: '#0b1f3b',
  mute: '#475569',
  dim: '#64748b',
  brand: '#ff7a00',
  accent: '#b85000',
  navy2: '#13294b',
};
export const DISPLAY = '"Plus Jakarta Sans", system-ui, sans-serif';
export const BODY = '"Inter", system-ui, sans-serif';

// ---------- Temps local d'une scène ----------
// rate : accélération (version courte) ; offset : point d'entrée dans la scène.
export const SceneTime = createContext({ rate: 1, offset: 0 });
export const useSec = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { rate, offset } = useContext(SceneTime);
  return offset + (f / fps) * rate;
};

const EXPO = Easing.bezier(0.16, 1, 0.3, 1);
const INOUT = Easing.bezier(0.65, 0, 0.35, 1);
/** 0→1 entre a et b (secondes locales), easing « expo out » par défaut. */
export const ease = (t: number, a: number, b: number, kind: 'out' | 'inout' | 'linear' = 'out') =>
  interpolate(t, [a, b], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: kind === 'out' ? EXPO : kind === 'inout' ? INOUT : (x) => x,
  });
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

// ---------- Mise en page (9:16 ou 16:9) ----------
export const useLayout = () => {
  const { width, height } = useVideoConfig();
  return { vertical: height > width, W: width, H: height };
};

/** Zone « scène » de 1000 × 1300 unités, mise à l'échelle selon le format. */
export const Stage: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => {
  const { vertical, W } = useLayout();
  const s = vertical ? 0.92 : 0.775;
  const left = vertical ? (W - 1000 * s) / 2 : 1000;
  const top = vertical ? 590 : 36;
  return (
    <div style={{ position: 'absolute', left, top, width: 1000, height: 1300, transform: `scale(${s})`, transformOrigin: '0 0', ...style }}>
      {children}
    </div>
  );
};

// ---------- Fonds ----------
export const LightBg: React.FC = () => (
  <AbsoluteFill style={{ background: C.paper }}>
    <AbsoluteFill
      style={{
        backgroundImage: `linear-gradient(${C.line} 1px, transparent 1px), linear-gradient(90deg, ${C.line} 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
        opacity: 0.55,
        maskImage: 'radial-gradient(ellipse 80% 70% at 50% 45%, #000 30%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 45%, #000 30%, transparent 100%)',
      }}
    />
  </AbsoluteFill>
);
export const DarkBg: React.FC = () => (
  <AbsoluteFill style={{ background: C.fg }}>
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 110%, rgba(255,122,0,0.16), transparent 70%)' }} />
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse 60% 40% at 50% -10%, rgba(59,104,170,0.25), transparent 70%)' }} />
  </AbsoluteFill>
);

// ---------- Légende animée mot par mot ----------
// Texte avec *accent* entre astérisques.
export const Caption: React.FC<{ text: string; at: number; out?: number; dark?: boolean; sub?: string }> = ({ text, at, out, dark, sub }) => {
  const t = useSec();
  const { vertical } = useLayout();
  const parts: { w: string; accent: boolean }[] = [];
  text.split(/(\*[^*]+\*)/).forEach((seg) => {
    const accent = seg.startsWith('*');
    seg.replace(/\*/g, '').split(' ').filter(Boolean).forEach((w) => parts.push({ w, accent }));
  });
  const o = out !== undefined ? 1 - ease(t, out, out + 0.35, 'inout') : 1;
  const box: React.CSSProperties = vertical
    ? { left: 80, top: 190, width: 920 }
    : { left: 140, top: 0, bottom: 0, width: 760, display: 'flex', flexDirection: 'column', justifyContent: 'center' };
  return (
    <div style={{ position: 'absolute', ...box, opacity: o, transform: `translateY(${(1 - o) * -16}px)` }}>
      <div
        style={{
          fontFamily: DISPLAY,
          fontWeight: 800,
          fontSize: vertical ? 82 : 74,
          lineHeight: 1.06,
          letterSpacing: '-0.035em',
          color: dark ? '#fff' : C.fg,
          textWrap: 'balance' as never,
        }}
      >
        {parts.map((p, i) => {
          const q = ease(t, at + i * 0.05, at + i * 0.05 + 0.7);
          return (
            <span key={i} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', paddingBottom: '0.12em', marginBottom: '-0.12em' }}>
              <span
                style={{
                  display: 'inline-block',
                  transform: `translateY(${(1 - q) * 105}%)`,
                  color: p.accent ? C.brand : undefined,
                }}
              >
                {p.w}
                {i < parts.length - 1 ? ' ' : ''}
              </span>
            </span>
          );
        })}
      </div>
      {sub ? (
        <div
          style={{
            marginTop: 26,
            fontFamily: BODY,
            fontSize: vertical ? 30 : 28,
            fontWeight: 500,
            color: dark ? '#cbd5e1' : C.dim,
            opacity: ease(t, at + 0.5, at + 1.1),
            letterSpacing: '-0.005em',
          }}
        >
          {sub}
        </div>
      ) : null}
    </div>
  );
};

// ---------- Capture d'interface ----------
export const Shot: React.FC<{ name: string; width: number; cropH?: number; srcW: number; style?: React.CSSProperties }> = ({ name, width, cropH, srcW, style }) => {
  const k = width / srcW;
  return (
    <div style={{ width, height: cropH !== undefined ? cropH * k : undefined, overflow: 'hidden', ...style }}>
      <Img src={staticFile(`ui/${name}.png`)} style={{ width, display: 'block' }} />
    </div>
  );
};

/** Carte blanche flottante (ombre douce, style de l'interface). */
export const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; radius?: number }> = ({ children, style, radius = 36 }) => (
  <div
    style={{
      background: C.card,
      borderRadius: radius,
      boxShadow: '0 1px 2px rgba(11,31,59,0.06), 0 12px 32px -8px rgba(11,31,59,0.18), 0 40px 80px -24px rgba(11,31,59,0.22)',
      border: `1px solid ${C.line}`,
      overflow: 'hidden',
      ...style,
    }}
  >
    {children}
  </div>
);

// ---------- Téléphone ----------
export const PHONE = { x: 220, y: 60, w: 560, h: 1180, pad: 14 };
export const SCREEN = { w: PHONE.w - PHONE.pad * 2, h: PHONE.h - PHONE.pad * 2 }; // 532 × 1152
export const Phone: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; screenBg?: string }> = ({ children, style, screenBg = '#fff' }) => (
  <div
    style={{
      position: 'absolute',
      left: PHONE.x,
      top: PHONE.y,
      width: PHONE.w,
      height: PHONE.h,
      borderRadius: 84,
      background: 'linear-gradient(145deg, #1c2f4f, #050d1a 60%)',
      padding: PHONE.pad,
      boxShadow: '0 0 0 2px rgba(255,255,255,0.06) inset, 0 50px 100px -30px rgba(5,13,26,0.55), 0 20px 40px -20px rgba(5,13,26,0.4)',
      ...style,
    }}
  >
    <div style={{ position: 'relative', width: SCREEN.w, height: SCREEN.h, borderRadius: 70, overflow: 'hidden', background: screenBg }}>
      {children}
      <div style={{ position: 'absolute', left: '50%', top: 18, width: 150, height: 42, marginLeft: -75, borderRadius: 30, background: '#000', zIndex: 50 }} />
    </div>
  </div>
);

// ---------- Indicateur de toucher ----------
export const Touch: React.FC<{ x: number; y: number; at: number; until: number; press?: number[] }> = ({ x, y, at, until, press = [] }) => {
  const t = useSec();
  const vis = ease(t, at, at + 0.25) * (1 - ease(t, until, until + 0.3));
  if (vis <= 0.001) return null;
  let squash = 1;
  let ripple = 0;
  let rippleO = 0;
  for (const p of press) {
    if (t >= p - 0.12 && t < p + 0.6) {
      squash = Math.min(squash, 1 - 0.18 * Math.sin(Math.min(1, Math.max(0, (t - p + 0.12) / 0.3)) * Math.PI));
      if (t >= p) {
        ripple = ease(t, p, p + 0.6);
        rippleO = 1 - ripple;
      }
    }
  }
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 0, height: 0, zIndex: 100 }}>
      <div
        style={{
          position: 'absolute',
          left: -90,
          top: -90,
          width: 180,
          height: 180,
          borderRadius: 999,
          border: `4px solid ${C.brand}`,
          opacity: rippleO * 0.8,
          transform: `scale(${0.4 + ripple * 0.8})`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: -40,
          top: -40,
          width: 80,
          height: 80,
          borderRadius: 999,
          background: 'rgba(255,255,255,0.78)',
          border: '3px solid rgba(11,31,59,0.22)',
          boxShadow: '0 8px 24px rgba(11,31,59,0.25)',
          backdropFilter: 'blur(4px)',
          opacity: vis,
          transform: `scale(${(0.7 + 0.3 * vis) * squash})`,
        }}
      />
    </div>
  );
};

/** Étiquette d'annotation (pastille bleu nuit, point orange). */
export const Tag: React.FC<{ text: string; style?: React.CSSProperties; p: number }> = ({ text, style, p }) => (
  <div
    style={{
      position: 'absolute',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '14px 24px 14px 18px',
      borderRadius: 999,
      background: C.fg,
      color: '#fff',
      fontFamily: BODY,
      fontWeight: 600,
      fontSize: 30,
      letterSpacing: '-0.01em',
      whiteSpace: 'nowrap',
      boxShadow: '0 12px 30px -8px rgba(11,31,59,0.45)',
      opacity: p,
      transform: `translateY(${(1 - p) * 16}px) scale(${0.92 + 0.08 * p})`,
      ...style,
    }}
  >
    <span style={{ width: 14, height: 14, borderRadius: 99, background: C.brand, boxShadow: `0 0 0 5px rgba(255,122,0,0.25)` }} />
    {text}
  </div>
);

/** Cadre de mise en évidence (orange). */
export const Ring: React.FC<{ x: number; y: number; w: number; h: number; p: number; r?: number }> = ({ x, y, w, h, p, r = 22 }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      borderRadius: r,
      border: `4px solid ${C.brand}`,
      boxShadow: '0 0 0 8px rgba(255,122,0,0.14)',
      opacity: p,
      transform: `scale(${1.06 - 0.06 * p})`,
      pointerEvents: 'none',
    }}
  />
);
