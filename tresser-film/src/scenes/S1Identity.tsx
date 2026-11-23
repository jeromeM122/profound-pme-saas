import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, F, condensed, lerp } from '../lib/theme';
import { Glyph, Rise, MonoNote, useWide } from '../components/ui';

// Descriptions reprises du guide des textures du site (routines.tresser.fr)
export const TEX = [
  { k: 'crepus', label: 'Crépus', desc: 'Boucles très serrées, en forme de Z' },
  { k: 'frises', label: 'Frisés', desc: 'Petites spirales bien dessinées' },
  { k: 'boucles', label: 'Bouclés', desc: 'Boucles plus larges, en forme de S' },
  { k: 'locs', label: 'Locks', desc: 'Mèches enroulées et feutrées en cordes' },
  { k: 'multi', label: 'Multi-textures', desc: 'Plusieurs formes sur la même tête' },
];

/** Séquence 1 — L'identification. Gros plans graphiques sur les textures. */
export const S1Identity: React.FC<{ len: number; short?: boolean }> = ({ len, short }) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const wide = useWide();
  const per = len / TEX.length;
  const idx = Math.min(TEX.length - 1, Math.floor(f / per));
  const fadeOut = lerp(f, len - 10, len, 1, 0);

  // gros plan : l'icône déborde du cadre, comme une macro sur une mèche
  const gH = wide ? height * 0.82 : height * 0.6;
  const gx = wide ? width * 0.79 : width / 2;
  const gy = wide ? height * 0.5 : height * 0.63;

  return (
    <AbsoluteFill style={{ background: C.paper, opacity: fadeOut }}>
      {/* aplat bleu de la charte */}
      <div style={{ position: 'absolute', background: C.blue,
        left: wide ? width * 0.66 : width - 300, top: wide ? height * 0.52 : height * 0.58,
        width: wide ? 300 : 330, height: wide ? 420 : 470,
        transform: `translateY(${lerp(f, 0, 40, 80, 0)}px)`, opacity: lerp(f, 0, 30) }} />
      {TEX.map((t, i) => {
        const a = i * per;
        if (f < a - 6 || f > a + per + 8) return null;
        const local = f - a;
        const draw = lerp(local, 0, per * 0.8, 0, 1);
        const op = Math.min(lerp(local, -6, 6, 0, 1), lerp(local, per - 2, per + 8, 1, 0));
        const sc = 1 + lerp(local, 0, per + 8, 0, 0.07, (x) => x);
        const rot = (i % 2 ? -1 : 1) * 3;
        return (
          <div key={t.k} style={{ position: 'absolute', left: gx, top: gy, opacity: op,
            transform: `translate(-50%,-50%) scale(${sc}) rotate(${rot}deg)` }}>
            <Glyph k={t.k} size={gH} draw={draw} weight={0.62} />
          </div>
        );
      })}
      {/* légende de texture */}
      <div style={{ position: 'absolute', left: wide ? 140 : 72, bottom: wide ? 110 : 120, right: wide ? undefined : 72 }}>
        {TEX.map((t, i) => {
          const a = i * per;
          if (f < a - 2 || f > a + per + 2) return null;
          const o = Math.min(lerp(f, a, a + 8), lerp(f, a + per - 6, a + per, 1, 0));
          return (
            <div key={t.k} style={{ position: 'absolute', bottom: 0, left: 0, width: wide ? 700 : 936, opacity: o }}>
              <div style={{ ...condensed, fontSize: wide ? 64 : 70, color: C.ink }}>{t.label}</div>
              <MonoNote size={wide ? 24 : 28} style={{ marginTop: 10, color: C.ink, opacity: 0.75 }}>{t.desc}</MonoNote>
            </div>
          );
        })}
      </div>
      {/* titres */}
      <div style={{ position: 'absolute', left: wide ? 140 : 72, top: wide ? 150 : 150, width: wide ? 900 : 936 }}>
        <div style={{ ...condensed, fontSize: wide ? 124 : 138, color: C.ink }}>
          <Rise at={6} out={short ? undefined : Math.round(len * 0.5)}>Chaque cheveu</Rise>
          <Rise at={12} out={short ? undefined : Math.round(len * 0.5)}>
            a son <span style={{ background: `linear-gradient(transparent 58%, ${C.yellow} 58%, ${C.yellow} 92%, transparent 92%)` }}>histoire.</span>
          </Rise>
        </div>
        {!short && (
          <div style={{ ...condensed, fontSize: wide ? 124 : 138, color: C.ink, position: 'absolute', top: 0 }}>
            <Rise at={Math.round(len * 0.5) + 8}>Et chaque routine</Rise>
            <Rise at={Math.round(len * 0.5) + 14}>est différente.</Rise>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
