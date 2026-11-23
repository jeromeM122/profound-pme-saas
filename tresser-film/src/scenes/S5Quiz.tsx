import React from 'react';
import { AbsoluteFill, Img, useCurrentFrame } from 'remotion';
import { C, F, condensed, lerp, cap, META, Variant } from '../lib/theme';
import { Phone, usePhoneGeo } from '../components/Phone';
import { Rise, MonoNote, Tap, useWide, Grain } from '../components/ui';

/** Séquence 5 — Trouver sa routine : le quiz réel en 3 questions. */
export const S5Quiz: React.FC<{ len: number; variant: Variant }> = ({ len, variant }) => {
  const f = useCurrentFrame();
  const wide = useWide();
  const geo = usePhoneGeo();
  const q = META.quiz;
  const u = len / 203; // calé sur 6,75 s
  const T = { tapOpen: 16 * u, q1: 24 * u, t1: 48 * u, q2: 60 * u, t2: 82 * u, q3: 94 * u, t3: 116 * u, res: 130 * u };
  // écrans réels, dans l'ordre
  const screens: [string, number][] = [
    ['quiz_home.png', 0], ['quiz_q1.png', T.q1], ['quiz_q1_sel.png', T.t1 + 1], ['quiz_q2.png', T.q2], ['quiz_q2_sel.png', T.t2 + 1],
    ['quiz_q3.png', T.q3], ['quiz_q3_sel.png', T.t3 + 1], ['quiz_result.png', T.res],
  ];
  const enter = lerp(f, 0, 10);
  const resultText = f >= T.res;
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      <div style={{ position: 'absolute', background: C.yellow, left: wide ? geo.left + geo.ow - 160 : geo.left + geo.ow - 140, top: wide ? geo.top - 40 : geo.top + 60,
        width: 280, height: wide ? 380 : 480 }} />
      <Phone geo={geo}>
        {screens.map(([file, at], i) => {
          const next = screens[i + 1]?.[1] ?? 1e9;
          if (f < at - 1 || f > next + 8) return null;
          const fadeIn = i === 0 ? 1 : lerp(f, at, at + (file.includes('_sel') ? 2 : 7));
          // la feuille du quiz monte depuis le bas, comme sur le site
          const slide = i === 1 ? (1 - lerp(f, at, at + 12)) * 160 : 0;
          return <Img key={file} src={cap(variant, file)} style={{ position: 'absolute', left: 0, top: slide * geo.s, width: geo.sw, opacity: fadeIn }} />;
        })}
        <Tap at={T.tapOpen} x={q.open.x + q.open.width / 2} y={q.open.y + q.open.height / 2} s={geo.s} />
        {[T.t1, T.t2, T.t3].map((t, i) => <Tap key={i} at={t} x={q.taps[i].x + q.taps[i].width / 2} y={q.taps[i].y + q.taps[i].height / 2} s={geo.s} />)}
      </Phone>
      <div style={{ position: 'absolute', left: wide ? 140 : 72, top: wide ? 220 : 150, width: wide ? 720 : 936 }}>
        <div style={{ position: 'absolute', top: 0, width: '100%' }}>
          <div style={{ ...condensed, fontSize: wide ? 120 : 104, color: C.ink }}>
            <Rise at={4} out={T.res - 10}>Quelle routine</Rise>
            <Rise at={9} out={T.res - 10}>est faite pour toi&nbsp;?</Rise>
          </div>
          <div style={{ marginTop: 26, display: 'flex', gap: 14, opacity: Math.min(lerp(f, 26 * u, 36 * u), lerp(f, T.res - 10, T.res, 1, 0)) }}>
            {['3 questions.', '30 secondes.'].map((t, i) => (
              <div key={t} style={{ fontFamily: F.sans, fontWeight: 700, fontSize: wide ? 40 : 42, background: i ? C.ink : C.yellow, color: i ? '#fff' : C.ink, padding: '10px 24px', borderRadius: 999,
                transform: `translateY(${(1 - lerp(f, (26 + i * 6) * u, (36 + i * 6) * u)) * 20}px)` }}>{t}</div>
            ))}
          </div>
        </div>
        {resultText && (
          <div style={{ position: 'absolute', top: 0, width: '100%' }}>
            <div style={{ fontFamily: F.sans, fontWeight: 700, fontSize: wide ? 70 : 64, lineHeight: 1.06, letterSpacing: '-0.025em', color: C.ink }}>
              <Rise at={T.res + 4}>Commence par découvrir</Rise>
              <Rise at={T.res + 9}>les routines qui</Rise>
              <Rise at={T.res + 14}>te correspondent.</Rise>
            </div>
          </div>
        )}
      </div>
      {/* transparence : réponses réellement données, et pas de promesse de diagnostic */}
      <div style={{ position: 'absolute', left: wide ? 140 : 72, top: wide ? 820 : 1810, width: wide ? 720 : 936, opacity: lerp(f, 30 * u, 44 * u) }}>
        <MonoNote size={wide ? 24 : 27} color={C.ink} style={{ opacity: 0.7 }}>
          {resultText ? 'Une inspiration, pas un diagnostic.' : 'Le vrai quiz · Frisés · Définition · Définir mes boucles'}
        </MonoNote>
      </div>
      <Grain />
    </AbsoluteFill>
  );
};
