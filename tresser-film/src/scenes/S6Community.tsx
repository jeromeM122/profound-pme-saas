import React from 'react';
import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, F, condensed, lerp, cap, META, Variant } from '../lib/theme';
import { Phone, usePhoneGeo } from '../components/Phone';
import { Rise, MonoNote, Tap, useWide, Grain } from '../components/ui';
import PROFILES from '../data/profiles.json';

const ORDER = ['cheveux-crepus-chloe', 'soin-locks-lindsay', 'cheveux-boucles-camille', 'cheveux-crepus-multitextures-yannick', 'cheveux-crepus-kjp',
  'routine-capillaire-multitexture-joanna', 'cheveux-frises-michoune', 'cheveux-crepus-epais-cindy', 'cheveux-boucles-andrea', 'cheveux-crepus-jessica-c',
  'cheveux-crepus-multitextures-lauren', 'cheveux-boucles-frises-gabou', 'cheveux-crepus-selene', 'cheveux-multi-textures-jessica', 'cheveux-crepus-poreux-naiza'];

/** Mosaïque des vraies cartes du mur (captures). */
export const Mosaic: React.FC<{ variant: Variant; speed?: number; dim?: number }> = ({ variant, speed = 1, dim = 0 }) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const wide = width > height;
  const cols = wide ? 6 : 3;
  const gap = wide ? 26 : 22;
  const colW = (width - gap * (cols + 1)) / cols;
  const cards = ORDER.map(id => { const i = META.home.names.indexOf((PROFILES as any[]).find(p => p.id === id).name); const b = META.home.cards[i]; return { id, h: colW * b.h / b.w }; });
  const columns: { id: string; h: number }[][] = Array.from({ length: cols }, () => []);
  // répartition + boucle pour remplir la hauteur
  for (let k = 0; k < (wide ? 30 : 21); k++) columns[k % cols].push(cards[(k * 7) % cards.length]);
  return (
    <AbsoluteFill style={{ opacity: 1 - dim }}>
      {columns.map((col, c) => {
        const dir = c % 2 ? 1 : -1;
        const off = (c % 2 ? -380 : -60) + dir * f * 2.1 * speed - (c % 3) * 90;
        let y = off;
        return (
          <div key={c}>
            {col.map((card, j) => {
              const top = y; y += card.h + gap;
              const appear = lerp(f, 2 + ((c * 3 + j) % 8) * 2, 16 + ((c * 3 + j) % 8) * 2);
              return <Img key={j} src={cap(variant, `cards/${card.id}.png`)} style={{ position: 'absolute', left: gap + c * (colW + gap), top, width: colW,
                opacity: appear, transform: `translateY(${(1 - appear) * 40}px)` }} />;
            })}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** Séquence 6 — La communauté : des visages, des textures, et le partage. */
export const S6Community: React.FC<{ len: number; variant: Variant }> = ({ len, variant }) => {
  const f = useCurrentFrame();
  const wide = useWide();
  const geo = usePhoneGeo();
  const phoneAt = Math.round(len * 0.5);
  const rise = lerp(f, phoneAt, phoneAt + 24);
  const tapAt = phoneAt + Math.round(len * 0.27);
  const tap = META.shareTap;
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      <Mosaic variant={variant} dim={rise * 0.88} />
      {/* aplat noir — reprend le bloc « Ta routine peut inspirer quelqu'un » du site */}
      <div style={{ position: 'absolute', left: wide ? 120 : 48, right: wide ? undefined : 48, width: wide ? 820 : undefined, top: wide ? 300 - rise * 110 : 640 - rise * 500,
        background: C.ink, color: '#fff', padding: wide ? '54px 60px' : '56px 54px', borderRadius: 8,
        transform: `scale(${0.94 + lerp(f, 0, 16) * 0.06})`, opacity: lerp(f, 0, 12), boxShadow: '0 30px 80px rgba(0,0,0,.25)' }}>
        <div style={{ fontFamily: F.mono, fontWeight: 500, textTransform: 'uppercase', fontSize: wide ? 64 : 66, lineHeight: 1.1, letterSpacing: '0.01em' }}>
          <Rise at={8}>Ta routine</Rise>
          <Rise at={13}>peut aussi</Rise>
          <Rise at={18}>inspirer</Rise>
          <Rise at={23}><span style={{ color: C.yellow }}>quelqu’un.</span></Rise>
        </div>
      </div>
      {rise > 0 && (
        <Phone geo={geo} transform={`translateY(${(1 - rise) * (wide ? 1000 : 1400)}px)`} style={wide ? {} : { top: geo.top + 120 }}>
          <Img src={cap(variant, 'share.png')} style={{ position: 'absolute', left: 0, top: 0, width: geo.sw }} />
          <Img src={cap(variant, 'share_sel.png')} style={{ position: 'absolute', left: 0, top: 0, width: geo.sw, opacity: f >= tapAt + 1 ? 1 : 0 }} />
          <Tap at={tapAt} x={tap.x + tap.width / 2} y={tap.y + tap.height / 2} s={geo.s} />
        </Phone>
      )}
      <div style={{ position: 'absolute', left: wide ? 140 : 72, top: wide ? 760 : 1820, opacity: wide ? lerp(f, phoneAt + 10, phoneAt + 24) : 0 }}>
        <MonoNote size={wide ? 24 : 24} color={C.ink}>Partage ta routine sur routines.tresser.fr</MonoNote>
      </div>
      <Grain />
    </AbsoluteFill>
  );
};
