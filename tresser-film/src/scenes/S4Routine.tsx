import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, F, condensed, lerp, keyframes, cap, META, Variant } from '../lib/theme';
import { Phone, Shot, usePhoneGeo } from '../components/Phone';
import { Rise, MonoNote, useWide, Grain } from '../components/ui';

const STEPS = ['Laver', 'Démêler', 'Nourrir', 'Coiffer', 'Définir'];

/** Séquence 4 — Entrer dans une routine réelle : le profil d'Andréa. */
export const S4Routine: React.FC<{ len: number; variant: Variant; short?: boolean }> = ({ len, variant, short }) => {
  const f = useCurrentFrame();
  const wide = useWide();
  const geo = usePhoneGeo();
  // cartes d'étapes réelles (01 → 05) : on cale le haut de chaque carte sous le haut de l'écran
  const steps = META.andrea.steps.slice(1).map((s: any) => s.y - 96);
  const hold = short ? 16 : 34;
  const zoomAt = short ? len : Math.round(len * 0.74);
  const span = (zoomAt - hold - 6) / 5;
  const kf: [number, number][] = [[0, 0], [hold, 0]];
  steps.forEach((y: number, i: number) => { kf.push([hold + span * i + span * 0.55, y]); kf.push([hold + span * (i + 1), y]); });
  const scroll = keyframes(f, kf);
  const cur = f < hold + span * 0.3 ? -1 : Math.min(4, Math.floor((f - hold - span * 0.3) / span));

  // zoom sur le commentaire réel de l'étape 5
  const last = META.andrea.steps[5];
  const z = short ? 0 : lerp(f, zoomAt, zoomAt + 26);
  const scale = 1 + z * (wide ? 0.55 : 0.42);
  const quoteY = geo.top + geo.bezel + (last.y + last.h * 0.72 - scroll) * geo.s;
  const enter = lerp(f, 0, 16);

  const tagline = !short && f >= zoomAt;
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      <div style={{ position: 'absolute', background: C.blue, left: wide ? geo.left - 140 : geo.left - 90, top: wide ? geo.top + 330 : geo.top + 520,
        width: wide ? 260 : 260, height: wide ? 420 : 560, opacity: 1 - z }} />
      <Phone geo={geo} transform={`scale(${scale})`} origin={`50% ${quoteY - geo.top}px`}>
        <Shot src={cap(variant, 'andrea_full.png')} geo={geo} scroll={scroll} x={(1 - enter) * 390} />
        <Shot src={cap(variant, 'home_full.png')} geo={geo} scroll={META.home.cards[0].y - 140} x={-enter * 120} opacity={1 - enter} />
      </Phone>
      {/* fond papier sous l'accroche pendant le zoom */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: wide ? 0 : 640, opacity: z,
        background: `linear-gradient(${C.paper} 82%, rgba(243,244,236,0))` }} />
      {/* progression des gestes */}
      <div style={{ position: 'absolute', left: wide ? 140 : 72, top: wide ? 200 : 150, width: wide ? 760 : 936, opacity: tagline ? lerp(f, zoomAt, zoomAt + 8, 1, 0) : 1 }}>
        <div style={{ ...condensed, fontSize: wide ? 96 : 112, color: C.ink, height: wide ? 96 : 112, position: 'relative', whiteSpace: 'nowrap' }}>
          <div style={{ position: 'absolute', top: 0, opacity: lerp(f, 0, 12) * (cur >= 0 ? lerp(f, hold + span * 0.3 - 6, hold + span * 0.3, 1, 0) : 1) }}>
            <Rise at={4}>La routine d’Andréa</Rise>
          </div>
          {STEPS.map((s, i) => {
            const a = hold + span * (i + 0.3);
            if (cur !== i) return null;
            return <div key={s} style={{ position: 'absolute', top: 0 }}><Rise at={a} dur={14}><span style={{ fontFamily: F.mono, fontWeight: 500, fontSize: '0.42em', verticalAlign: 'top', marginRight: 18, letterSpacing: 0 }}>0{i + 1}</span>{s}</Rise></div>;
          })}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: wide ? 34 : 30 }}>
          {STEPS.map((s, i) => {
            const on = i <= cur;
            return (
              <div key={s} style={{ fontFamily: F.sans, fontWeight: 600, fontSize: wide ? 28 : 30, padding: '10px 20px', borderRadius: 999,
                border: `2px solid ${C.ink}`, background: i === cur ? C.yellow : on ? C.ink : 'transparent', color: on && i !== cur ? '#fff' : C.ink,
                opacity: lerp(f, 8 + i * 3, 20 + i * 3) }}>{s}</div>
            );
          })}
        </div>
        {wide && <MonoNote size={24} style={{ marginTop: 40, opacity: lerp(f, 20, 34) }}>Frisés et bouclés · Guadeloupe · 5 produits · ses vrais commentaires</MonoNote>}
      </div>
      {tagline && (
        <div style={{ position: 'absolute', left: wide ? 140 : 72, top: wide ? 260 : 150, width: wide ? 640 : 936 }}>
          <div style={{ fontFamily: F.sans, fontWeight: 700, fontSize: wide ? 84 : 80, lineHeight: 1.04, letterSpacing: '-0.025em', color: C.ink }}>
            <Rise at={zoomAt + 4}>Des produits.</Rise>
            <Rise at={zoomAt + 12}>Des gestes.</Rise>
            <Rise at={zoomAt + 20}><span style={{ background: `linear-gradient(transparent 60%, ${C.yellow} 60%, ${C.yellow} 92%, transparent 92%)` }}>Des expériences</span></Rise>
            <Rise at={zoomAt + 26}>partagées.</Rise>
          </div>
        </div>
      )}
      <Grain />
    </AbsoluteFill>
  );
};
