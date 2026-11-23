import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, Img } from 'remotion';
import { C, F, condensed, lerp, cap, Variant, sec } from '../lib/theme';
import { Wipe, Grain, Rise, Logo, MonoNote } from '../components/ui';
import { Phone, Shot, usePhoneGeo } from '../components/Phone';
import { S1Identity, TEX } from '../scenes/S1Identity';
import { S2Question } from '../scenes/S2Question';
import { S3Discover } from '../scenes/S3Discover';
import { S4Routine } from '../scenes/S4Routine';
import { S5Quiz } from '../scenes/S5Quiz';
import { S6Community, Mosaic } from '../scenes/S6Community';
import { S7Signature } from '../scenes/S7Signature';

// Coupes calées sur les temps de la musique (80 BPM : 1 temps = 0,75 s)
export const MAIN_CUTS = [0, 6, 11.25, 18, 26.25, 33, 39, 45].map(sec);

export const MainFilm: React.FC<{ variant: Variant }> = ({ variant }) => {
  const c = MAIN_CUTS;
  const L = (i: number) => c[i + 1] - c[i];
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      <Sequence from={c[0]} durationInFrames={L(0)}><S1Identity len={L(0)} /></Sequence>
      <Sequence from={c[1]} durationInFrames={L(1)}><S2Question len={L(1)} /></Sequence>
      <Sequence from={c[2]} durationInFrames={L(2)}><S3Discover len={L(2)} variant={variant} /></Sequence>
      <Sequence from={c[3]} durationInFrames={L(3)}><S4Routine len={L(3)} variant={variant} /></Sequence>
      <Sequence from={c[4]} durationInFrames={L(4)}><S5Quiz len={L(4)} variant={variant} /></Sequence>
      <Sequence from={c[5]} durationInFrames={L(5)}><S6Community len={L(5)} variant={variant} /></Sequence>
      <Sequence from={c[6]} durationInFrames={L(6)}><S7Signature len={L(6)} /></Sequence>
      <Wipe at={c[2]} color={C.yellow} />
      <Wipe at={c[6]} color={C.blue} />
    </AbsoluteFill>
  );
};

/** Segment « profils et textures » de la version courte. */
const ShortFaces: React.FC<{ len: number; variant: Variant }> = ({ len, variant }) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const per = len / TEX.length;
  const idx = Math.min(TEX.length - 1, Math.floor(f / per));
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      <Mosaic variant={variant} speed={1.6} />
      <div style={{ position: 'absolute', left: 48, right: 48, top: height * 0.36, background: C.ink, color: '#fff', padding: '50px 54px', borderRadius: 8,
        opacity: lerp(f, 0, 8), boxShadow: '0 30px 80px rgba(0,0,0,.25)' }}>
        <div style={{ ...condensed, fontSize: 132, color: C.yellow, height: 130, whiteSpace: 'nowrap' }}>
          {TEX.map((t, i) => i === idx ? <Rise key={t.k} at={i * per} dur={10}>{t.label}</Rise> : null)}
        </div>
        <div style={{ fontFamily: F.sans, fontWeight: 600, fontSize: 48, lineHeight: 1.15, marginTop: 28, letterSpacing: '-0.02em' }}>
          <Rise at={6}>De vraies routines,</Rise>
          <Rise at={11}>partagées par de vraies personnes.</Rise>
        </div>
      </div>
      <Grain />
    </AbsoluteFill>
  );
};

export const SHORT_CUTS = [0, 3, 6.75, 11.25, 15].map(sec);
export const ShortFilm: React.FC<{ variant: Variant }> = ({ variant }) => {
  const c = SHORT_CUTS;
  const L = (i: number) => c[i + 1] - c[i];
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      <Sequence from={c[0]} durationInFrames={L(0)}><S1Identity len={L(0)} short /></Sequence>
      <Sequence from={c[1]} durationInFrames={L(1)}><ShortFaces len={L(1)} variant={variant} /></Sequence>
      <Sequence from={c[2]} durationInFrames={L(2)}><S4Routine len={L(2)} variant={variant} short /></Sequence>
      <Sequence from={c[3]} durationInFrames={L(3)}><S7Signature len={L(3)} short /></Sequence>
      <Wipe at={c[1]} color={C.yellow} dur={10} />
      <Wipe at={c[3]} color={C.blue} dur={12} />
    </AbsoluteFill>
  );
};

/** Cover / miniature (image fixe). */
export const Cover: React.FC<{ variant: Variant }> = ({ variant }) => {
  const { width, height } = useVideoConfig();
  const wide = width > height;
  const ratio = height / width;
  const screenW = wide ? 300 : ratio > 1.5 ? 560 : 430;
  const geo = usePhoneGeo({ screenW, cx: wide ? width * 0.73 : width * 0.62, top: wide ? 70 : ratio > 1.5 ? 840 : 690 });
  const hs = wide ? 112 : ratio > 1.5 ? 150 : 128;
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      <div style={{ position: 'absolute', background: C.blue, left: wide ? geo.left - 90 : 0, top: wide ? 260 : geo.top + 250, width: wide ? 230 : 300, height: wide ? 460 : 640 }} />
      <div style={{ position: 'absolute', background: C.yellow, left: geo.left + geo.ow - 80, top: geo.top - 60, width: 220, height: wide ? 300 : 420 }} />
      <Phone geo={geo} transform="rotate(4deg)">
        <Shot src={cap(variant, 'home_full.png')} geo={geo} scroll={700} />
      </Phone>
      <div style={{ position: 'absolute', left: wide ? 80 : 64, top: wide ? 90 : ratio > 1.5 ? 170 : 110, width: wide ? 760 : width - 128 }}>
        <div style={{ ...condensed, fontSize: hs, color: C.ink }}>
          <div>Chaque cheveu</div>
          <div>a son <span style={{ background: `linear-gradient(transparent 58%, ${C.yellow} 58%, ${C.yellow} 92%, transparent 92%)` }}>histoire.</span></div>
        </div>
        <div style={{ fontFamily: F.sans, fontWeight: 600, fontSize: wide ? 38 : 46, letterSpacing: '-0.02em', marginTop: 26, color: C.ink, width: wide ? 600 : 900, lineHeight: 1.15 }}>
          Trouve ta routine. <b>Partage la tienne.</b>
        </div>
      </div>
      <div style={{ position: 'absolute', left: wide ? 80 : 64, ...(wide ? { bottom: 70 } : { top: ratio > 1.5 ? 600 : 470 }) }}>
        <Logo width={wide ? 330 : 300} />
        <div style={{ fontFamily: F.mono, fontWeight: 500, fontSize: wide ? 28 : 32, marginTop: 14, color: C.ink }}>routines.tresser.fr</div>
      </div>
      <Grain />
    </AbsoluteFill>
  );
};
