import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, F, lerp, keyframes } from '../lib/theme';
import { Rise, useWide, Grain } from '../components/ui';

// Flacons génériques au trait (aucune marque) — l'étagère de la salle de bain.
// Chaque forme est dessinée dans une boîte de 100 × 300, base à y = 300.
const BOTTLES: { w: number; d: string }[] = [
  // flacon pompe
  { w: 100, d: 'M18 300 V120 Q18 100 38 100 H62 Q82 100 82 120 V300 Z M40 100 V80 H60 V100 M44 80 V58 H56 V80 M44 62 H22' },
  // pot
  { w: 130, d: 'M8 300 V232 Q8 220 20 220 H110 Q122 220 122 232 V300 Z M14 220 V196 H116 V220' },
  // tube posé sur son bouchon
  { w: 90, d: 'M14 70 L28 262 H62 L76 70 Z M10 62 H80 V70 H10 Z M30 262 V300 H60 V262' },
  // grand flacon
  { w: 96, d: 'M16 300 V96 Q16 72 40 66 V44 H56 V66 Q80 72 80 96 V300 Z M38 44 V28 H58 V44' },
  // vaporisateur
  { w: 110, d: 'M20 300 V150 Q20 126 44 126 H66 Q90 126 90 150 V300 Z M44 126 V106 H66 V126 M40 106 V86 H74 L96 96 V104 H74 V106' },
  // compte-gouttes
  { w: 80, d: 'M14 300 V196 Q14 176 34 176 H46 Q66 176 66 196 V300 Z M30 176 V158 H50 V176 M34 158 V128 Q40 112 46 128 V158' },
];

const QUESTIONS = ['Quels produits choisir ?', 'Quelle routine adopter ?', 'Qu’est-ce qui fonctionne vraiment ?'];

/** Séquence 2 — Le problème : l'hésitation devant l'étagère. */
export const S2Question: React.FC<{ len: number }> = ({ len }) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const wide = useWide();
  const shelfW = wide ? 1000 : 940;
  const gap = 34;
  const total = BOTTLES.reduce((a, b) => a + b.w, 0) + gap * (BOTTLES.length - 1);
  const sc = shelfW / total;
  const baseY = wide ? height * 0.78 : height * 0.8;
  const shelfX = wide ? width * 0.47 : (width - shelfW) / 2;
  let acc = 0;
  const centers = BOTTLES.map(b => { const c = acc + b.w / 2; acc += b.w + gap; return c * sc; });
  // la lumière hésite d'un flacon à l'autre
  const step = len / 7;
  const spot = keyframes(f, [[0, centers[1]], [step * 1, centers[1]], [step * 1.8, centers[4]], [step * 2.6, centers[4]], [step * 3.4, centers[0]], [step * 4.2, centers[0]], [step * 5, centers[3]], [step * 5.8, centers[3]], [step * 6.6, centers[2]]]);
  const qAt = [6, Math.round(len * 0.3), Math.round(len * 0.56)];
  const out = len - 12;

  return (
    <AbsoluteFill style={{ background: '#0c0c0b', opacity: lerp(f, 0, 6) }}>
      {/* lumière douce */}
      <div style={{ position: 'absolute', left: shelfX + spot - 320, top: baseY - 560, width: 640, height: 720,
        background: 'radial-gradient(ellipse at 50% 60%, rgba(255,246,214,0.20) 0%, rgba(255,246,214,0.06) 45%, rgba(0,0,0,0) 70%)' }} />
      <svg style={{ position: 'absolute', left: shelfX, top: baseY - 300 * sc, overflow: 'visible' }} width={shelfW} height={300 * sc}>
        {BOTTLES.map((b, i) => {
          const x = centers[i] / sc - b.w / 2;
          const near = Math.max(0, 1 - Math.abs(centers[i] - spot) / (180 * sc * 2.2));
          const draw = lerp(f, 2 + i * 3, 26 + i * 3);
          return (
            <g key={i} transform={`scale(${sc}) translate(${x} 0)`}>
              <path d={b.d} fill="none" stroke="#fff" strokeOpacity={0.35 + near * 0.65} strokeWidth={2.4 / sc} pathLength={1}
                strokeDasharray="1 1" strokeDashoffset={1 - draw} strokeLinejoin="round" strokeLinecap="round" />
            </g>
          );
        })}
      </svg>
      <div style={{ position: 'absolute', left: shelfX - 40, width: shelfW + 80, top: baseY + 2, height: 3, background: 'rgba(255,255,255,0.5)',
        transform: `scaleX(${lerp(f, 0, 24)})`, transformOrigin: 'left' }} />
      {/* questions */}
      <div style={{ position: 'absolute', left: wide ? 140 : 72, top: wide ? 170 : 200, width: wide ? 760 : 936 }}>
        {QUESTIONS.map((q, i) => {
          const dim = i < 2 ? lerp(f, qAt[i + 1], qAt[i + 1] + 10, 1, 0.32) : 1;
          return (
            <div key={i} style={{ marginBottom: wide ? 26 : 40, opacity: dim }}>
              <Rise at={qAt[i]} out={out}>
                <div style={{ fontFamily: F.sans, fontWeight: 700, fontSize: wide ? 76 : 84, lineHeight: 1.05, color: '#fff', letterSpacing: '-0.02em' }}>{q}</div>
              </Rise>
            </div>
          );
        })}
      </div>
      <Grain dark />
    </AbsoluteFill>
  );
};
