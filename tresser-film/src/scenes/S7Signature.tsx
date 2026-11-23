import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, F, condensed, lerp } from '../lib/theme';
import { Glyph, Logo, Rise, useWide, Grain } from '../components/ui';
import { TEX } from './S1Identity';

/** Séquence 7 — Signature. */
export const S7Signature: React.FC<{ len: number; short?: boolean }> = ({ len, short }) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const wide = useWide();
  const k = short ? 0.7 : 1;
  const at = (x: number) => Math.round(x * k);
  const logoP = lerp(f, at(4), at(30));
  return (
    <AbsoluteFill style={{ background: C.paper, alignItems: 'center' }}>
      <div style={{ position: 'absolute', background: C.blue, right: wide ? 0 : 0, top: 0, width: wide ? 140 : 120, height: lerp(f, 0, at(26), 0, wide ? height : 560) }} />
      <div style={{ position: 'absolute', background: C.yellow, left: 0, bottom: 0, height: wide ? 120 : 120, width: lerp(f, at(6), at(32), 0, wide ? 520 : 460) }} />
      <div style={{ position: 'absolute', top: wide ? 110 : 330, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ clipPath: `inset(0 ${(1 - logoP) * 100}% 0 0)`, transform: `translateY(${(1 - logoP) * 20}px)` }}>
          <Logo width={wide ? 720 : 740} />
        </div>
        <div style={{ ...condensed, fontSize: wide ? 118 : 120, color: C.ink, marginTop: wide ? 70 : 110 }}>
          <Rise at={at(26)}>Chaque cheveu</Rise>
          <Rise at={at(31)}>a son histoire.</Rise>
        </div>
        <div style={{ fontFamily: F.sans, fontWeight: 600, fontSize: wide ? 50 : 54, letterSpacing: '-0.02em', color: C.ink, marginTop: wide ? 34 : 50, lineHeight: 1.15 }}>
          <Rise at={at(52)}>Trouve ta routine. <span style={{ fontWeight: 800 }}>Partage la tienne.</span></Rise>
        </div>
        <div style={{ marginTop: wide ? 52 : 90, opacity: lerp(f, at(72), at(86)), transform: `scale(${0.9 + lerp(f, at(72), at(90)) * 0.1})` }}>
          <div style={{ fontFamily: F.sans, fontWeight: 700, fontSize: wide ? 44 : 50, background: C.yellow, color: C.ink, padding: wide ? '22px 52px' : '26px 60px', borderRadius: 999,
            border: `3px solid ${C.ink}` }}>Découvre Tresser&nbsp;→</div>
        </div>
        <div style={{ fontFamily: F.mono, fontWeight: 500, fontSize: wide ? 40 : 46, color: C.ink, marginTop: wide ? 34 : 50, letterSpacing: '0.01em', opacity: lerp(f, at(82), at(96)) }}>
          routines.tresser.fr
        </div>
      </div>
      {/* rangée des textures de la charte */}
      <div style={{ position: 'absolute', bottom: wide ? 46 : 250, width: '100%', display: 'flex', justifyContent: 'center', gap: wide ? 46 : 40 }}>
        {TEX.map((t, i) => <Glyph key={t.k} k={t.k} size={wide ? 64 : 72} draw={lerp(f, at(40 + i * 5), at(70 + i * 5))} />)}
      </div>
      <Grain />
    </AbsoluteFill>
  );
};
