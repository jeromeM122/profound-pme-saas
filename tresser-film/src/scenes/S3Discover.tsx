import React from 'react';
import { AbsoluteFill, Img, useCurrentFrame } from 'remotion';
import { C, F, condensed, lerp, keyframes, cap, META, Variant } from '../lib/theme';
import { Phone, Shot, usePhoneGeo, VH } from '../components/Phone';
import { Rise, MonoNote, useWide, Grain } from '../components/ui';
import PROFILES from '../data/profiles.json';

const LABEL: Record<string, string> = { crepus: 'Crépus', frises: 'Frisés', boucles: 'Bouclés', locs: 'Locks', multi: 'Multi-textures' };
export const texText = (t: string[]) => { const l = t.map(k => LABEL[k] || k); return l.length === 1 ? l[0] : l.slice(0, -1).join(', ') + ' et ' + l[l.length - 1].toLowerCase(); };
export const metaLine = (p: any) => `${texText(p.tex)} · ${p.loc} · ${p.steps.length} produit${p.steps.length > 1 ? 's' : ''}`;

// Les six profils réels mis en avant (dans l'ordre d'apparition sur le mur mobile)
const FEATURED = ['Andréa', 'Chloé', 'Cindy', 'Joanna', 'Lindsay', 'Yannick'];

/** Séquence 3 — La découverte de Tresser : la page d'accueil réelle. */
export const S3Discover: React.FC<{ len: number; variant: Variant }> = ({ len, variant }) => {
  const f = useCurrentFrame();
  const wide = useWide();
  const geo = usePhoneGeo();
  const home = META.home;
  const cards = FEATURED.map(n => {
    const i = home.names.indexOf(n); const b = home.cards[i];
    const p = (PROFILES as any[]).find(x => x.name === n);
    return { n, b, p, target: Math.max(0, b.y + b.h / 2 - VH / 2 - 20) };
  });
  const t0 = Math.round(len * 0.27), t1 = len - 16;
  const span = (t1 - t0) / cards.length;
  const kf: [number, number][] = [[0, 0], [t0, 0]];
  cards.forEach((c, i) => { kf.push([t0 + span * (i + 0.62), c.target]); kf.push([t0 + span * (i + 1), c.target]); });
  const scroll = keyframes(f, kf);
  const active = cards.findIndex((c, i) => f >= t0 + span * (i + 0.45) && f < t0 + span * (i + 1.15));

  const enter = lerp(f, 0, 22);
  const stuck = scroll > home.filters.y;

  return (
    <AbsoluteFill style={{ background: C.paper }}>
      {/* aplat jaune de la charte derrière le téléphone */}
      <div style={{ position: 'absolute', background: C.yellow, left: wide ? geo.left - 120 : geo.left + geo.ow - 150,
        top: wide ? geo.top + 120 : geo.top + 160, width: wide ? 300 : 300, height: wide ? 520 : 620, transform: `translateY(${(1 - enter) * 120}px)` }} />
      <Phone geo={geo} transform={`translateY(${(1 - enter) * 260}px)`} style={{ opacity: enter }}>
        <Shot src={cap(variant, 'home_full.png')} geo={geo} scroll={scroll} />
        {stuck && <Img src={cap(variant, 'filters_stuck.png')} style={{ position: 'absolute', left: home.filtersStuck.x * geo.s, top: 0, width: home.filtersStuck.w * geo.s }} />}
        {cards.map((c, i) => {
          const o = i === active ? 1 : 0;
          const y = (c.b.y - scroll) * geo.s;
          return <div key={c.n} style={{ position: 'absolute', left: (c.b.x - 5) * geo.s, top: y - 5 * geo.s, width: (c.b.w + 10) * geo.s, height: (c.b.h + 10) * geo.s,
            border: `${3 * geo.s}px solid ${C.ink}`, borderRadius: 22 * geo.s, opacity: o, boxShadow: `0 0 0 ${3 * geo.s}px ${C.yellow}` }} />;
        })}
      </Phone>
      {/* étiquette du profil actif (données réelles du site) */}
      {cards.map((c, i) => {
        const a = t0 + span * (i + 0.45), b = t0 + span * (i + 1.15);
        if (f < a - 2 || f > b + 4) return null;
        const p = Math.min(lerp(f, a, a + 8), lerp(f, b - 4, b + 4, 1, 0));
        const left = c.b.x < 150;
        const cy = geo.top + geo.bezel + (c.b.y + c.b.h * 0.42 - scroll) * geo.s;
        const x = wide ? geo.left + geo.ow + 36 : (left ? geo.left + geo.bezel + 205 * geo.s : geo.left + geo.bezel + 20 * geo.s);
        return (
          <div key={c.n} style={{ position: 'absolute', left: x, top: cy - 70, opacity: p, transform: `translateY(${(1 - p) * 20}px) scale(${0.96 + p * 0.04})`,
            background: C.ink, color: '#fff', padding: wide ? '22px 30px' : '22px 28px', borderRadius: 26, width: wide ? 380 : 400, boxShadow: '0 20px 50px rgba(0,0,0,.25)' }}>
            <div style={{ fontFamily: F.sans, fontWeight: 800, fontSize: wide ? 50 : 52, letterSpacing: '-0.02em', lineHeight: 1 }}>{c.n}</div>
            <div style={{ fontFamily: F.mono, fontSize: wide ? 23 : 24, marginTop: 12, lineHeight: 1.35, color: C.yellow }}>{metaLine(c.p)}</div>
          </div>
        );
      })}
      {/* textes */}
      <div style={{ position: 'absolute', left: wide ? 140 : 72, top: wide ? 200 : 150, width: wide ? 760 : 936 }}>
        <div style={{ position: 'absolute', top: 0, ...condensed, fontSize: wide ? 104 : 92, color: C.ink }}>
          <Rise at={10} out={t0 + 4}>Et dans leur salle</Rise>
          <Rise at={15} out={t0 + 4}>de bain, on trouve</Rise>
          <Rise at={20} out={t0 + 4}>quoi&nbsp;?</Rise>
        </div>
        <div style={{ position: 'absolute', top: 0, fontFamily: F.sans, fontWeight: 700, fontSize: wide ? 72 : 66, lineHeight: 1.06, letterSpacing: '-0.025em', color: C.ink, width: wide ? 720 : 936 }}>
          <Rise at={t0 + 14}>Découvre les routines</Rise>
          <Rise at={t0 + 19}>de personnes qui</Rise>
          <Rise at={t0 + 24}>te ressemblent.</Rise>
        </div>
        {wide && (
          <div style={{ position: 'absolute', top: 400, opacity: lerp(f, t0 + 30, t0 + 44) }}>
            <MonoNote size={24}>15 routines partagées · crépus, frisés, bouclés, locks, multi-textures</MonoNote>
          </div>
        )}
      </div>
      <Grain />
    </AbsoluteFill>
  );
};
