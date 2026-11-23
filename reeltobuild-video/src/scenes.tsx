import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { BODY, C, Caption, Card, DarkBg, DISPLAY, ease, lerp, LightBg, Phone, PHONE, Ring, SCREEN, Shot, Stage, Tag, Touch, useLayout, useSec } from './lib';
import rows from './rows.json';
import ruler from './ruler.json';
import inputPos from './inputpos.json';

type CaptionText = { text: string; sub?: string };
export type SceneProps = { caption?: CaptionText };

const R = rows as Record<string, { h: number; w: number; compact: number }>;

/** Capture « carte » dont on retire la marge de capture (pad, en px image) et qu'on arrondit. */
const CardShot: React.FC<{ name: string; srcW: number; srcH: number; pad: number; width: number; radius: number; cropH?: number; style?: React.CSSProperties; shadow?: boolean }> = ({
  name, srcW, srcH, pad, width, radius, cropH, style, shadow = true,
}) => {
  const k = width / (srcW - pad * 2);
  const h = ((cropH ?? srcH) - pad * 2) * k;
  return (
    <div
      style={{
        width,
        height: h,
        borderRadius: radius,
        overflow: 'hidden',
        position: 'relative',
        boxShadow: shadow ? '0 1px 2px rgba(11,31,59,0.06), 0 14px 34px -10px rgba(11,31,59,0.22), 0 44px 90px -30px rgba(11,31,59,0.28)' : undefined,
        ...style,
      }}
    >
      <Img src={staticFile(`ui/${name}.png`)} style={{ position: 'absolute', left: -pad * k, top: -pad * k, width: srcW * k }} />
    </div>
  );
};

// =====================================================================
// 1. LE PROBLÈME — un tuto vidéo de pose de carrelage sur un téléphone
// =====================================================================
const TILE = 168;
const GAP = 8;
const PITCH = TILE + GAP;

const TutorialVideo: React.FC = () => {
  const t = useSec();
  const laid = 5 + Math.floor(Math.max(0, t) / 0.32); // carreaux posés
  const cols = 3;
  const rowsN = 8;
  const cam = 1.04 + 0.05 * ease(t, 0, 5, 'linear');
  const nextIdx = Math.min(laid, cols * rowsN - 1);
  const nx = (nextIdx % cols) * PITCH + 4;
  const ny = Math.floor(nextIdx / cols) * PITCH - 60;
  const paused = t > 2.45;
  const pause = ease(t, 2.45, 2.75);
  return (
    <AbsoluteFill style={{ background: '#8d9295', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${cam}) translateY(${-ease(t, 0, 5, 'linear') * 40}px)`, transformOrigin: '50% 40%' }}>
        {/* chape béton */}
        <div
          style={{
            position: 'absolute',
            inset: -100,
            backgroundColor: '#8f9496',
            backgroundImage:
              'radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1.5px), radial-gradient(rgba(0,0,0,0.10) 1px, transparent 1.5px)',
            backgroundSize: '7px 7px, 11px 11px',
            backgroundPosition: '0 0, 3px 5px',
          }}
        />
        {/* mortier-colle peigné sur les 2 rangées suivantes */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: Math.floor(nextIdx / cols) * PITCH - 64,
            height: PITCH * 2 + 8,
            backgroundColor: '#b7b2a8',
            backgroundImage: 'repeating-linear-gradient(0deg, #a39d92 0 6px, #c2bdb3 6px 14px)',
            boxShadow: 'inset 0 6px 12px rgba(0,0,0,0.18)',
          }}
        />
        {/* carreaux */}
        {Array.from({ length: cols * rowsN }).map((_, i) => {
          if (i > laid) return null;
          const appear = i < 5 ? 1 : ease(t, (i - 5) * 0.32 - 0.02, (i - 5) * 0.32 + 0.3);
          if (appear <= 0) return null;
          const x = (i % cols) * PITCH + 4;
          const y = Math.floor(i / cols) * PITCH - 60;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                width: TILE,
                height: TILE,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #ece7df 0%, #ddd6cb 55%, #e6e0d6 100%)',
                boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.5), 0 ${lerp(26, 1, appear)}px ${lerp(40, 2, appear)}px rgba(0,0,0,${lerp(0.35, 0.25, appear)})`,
                opacity: Math.min(1, appear * 1.6),
                transform: `scale(${lerp(1.14, 1, appear)}) rotate(${lerp(2.5, 0, appear)}deg)`,
              }}
            >
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 25%, rgba(255,255,255,0.45), transparent 60%)' }} />
            </div>
          );
        })}
        {/* lisseuse crantée */}
        <svg
          width={250}
          height={190}
          viewBox="0 0 250 190"
          style={{
            position: 'absolute',
            left: nx + 40 + Math.sin(t * 5.5) * 70,
            top: ny + TILE + 70 + Math.cos(t * 5.5) * 8,
            transform: 'rotate(-8deg)',
            filter: 'drop-shadow(0 18px 18px rgba(0,0,0,0.35))',
          }}
        >
          <defs>
            <linearGradient id="steel" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stopColor="#f3f5f7" />
              <stop offset="0.5" stopColor="#b9c0c7" />
              <stop offset="1" stopColor="#8a939c" />
            </linearGradient>
          </defs>
          <path d={`M10 60 H240 V150 ${Array.from({ length: 12 }).map((_, k) => `L${240 - k * 19.2 - 9.6} 150 L${240 - k * 19.2 - 9.6} 162 L${240 - (k + 1) * 19.2} 162 L${240 - (k + 1) * 19.2} 150`).join(' ')} Z`} fill="url(#steel)" />
          <rect x="95" y="20" width="60" height="44" rx="6" fill="#5b6470" />
          <rect x="45" y="0" width="160" height="34" rx="17" fill="#2b2f36" />
        </svg>
      </div>
      {/* habillage lecteur vidéo générique */}
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 18%, transparent 62%, rgba(0,0,0,0.72) 100%)' }} />
      <div style={{ position: 'absolute', left: 36, right: 36, bottom: 92, color: '#fff', fontFamily: BODY }}>
        <div style={{ fontSize: 22, fontWeight: 600, opacity: 0.8, letterSpacing: '0.02em', textTransform: 'uppercase' }}>Tuto rénovation</div>
        <div style={{ fontSize: 34, fontWeight: 700, lineHeight: 1.15, marginTop: 8, letterSpacing: '-0.01em' }}>Poser du carrelage 60 × 60 dans une pièce</div>
      </div>
      <div style={{ position: 'absolute', left: 36, right: 36, bottom: 56, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.3)' }}>
        <div style={{ width: `${(0.34 + (paused ? 2.45 : t) * 0.025) * 100}%`, height: '100%', borderRadius: 3, background: '#fff' }} />
      </div>
      {pause > 0 ? (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '46%',
            width: 132,
            height: 132,
            margin: -66,
            borderRadius: 999,
            background: 'rgba(0,0,0,0.38)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 18,
            opacity: pause,
            transform: `scale(${lerp(1.3, 1, pause)})`,
          }}
        >
          <div style={{ width: 16, height: 52, borderRadius: 4, background: '#fff' }} />
          <div style={{ width: 16, height: 52, borderRadius: 4, background: '#fff' }} />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

const Question: React.FC<{ text: string; at: number; style: React.CSSProperties }> = ({ text, at, style }) => {
  const t = useSec();
  const p = ease(t, at, at + 0.6);
  return (
    <div
      style={{
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '20px 30px 20px 20px',
        borderRadius: 999,
        background: 'rgba(255,255,255,0.97)',
        color: C.fg,
        fontFamily: BODY,
        fontWeight: 600,
        fontSize: 36,
        letterSpacing: '-0.015em',
        boxShadow: '0 24px 50px -12px rgba(0,0,0,0.5)',
        opacity: p,
        transform: `translateY(${(1 - p) * 30}px) scale(${0.9 + 0.1 * p})`,
        whiteSpace: 'nowrap',
        zIndex: 10,
        ...style,
      }}
    >
      <span
        style={{
          width: 52,
          height: 52,
          borderRadius: 99,
          background: C.brand,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: DISPLAY,
          fontWeight: 800,
          fontSize: 32,
        }}
      >
        ?
      </span>
      {text}
    </div>
  );
};

export const ProblemScene: React.FC<SceneProps> = () => {
  const t = useSec();
  const enter = ease(t, 0, 1.0);
  return (
    <AbsoluteFill>
      <DarkBg />
      <Caption dark text="Vous avez trouvé *le tuto.*" at={0.25} out={2.2} />
      <Caption dark text={'Mais savez-vous *quoi acheter ?*'} at={2.4} />
      <Stage>
        <div style={{ position: 'absolute', inset: 0, opacity: enter, transform: `translateY(${(1 - enter) * 90}px)` }}>
          <Phone screenBg="#000">
            <TutorialVideo />
          </Phone>
        </div>
        <Question text="Combien de carreaux ?" at={2.75} style={{ left: 0, top: 300 }} />
        <Question text="Quel mortier-colle ?" at={3.05} style={{ right: -10, top: 590 }} />
        <Question text="Quels outils ?" at={3.35} style={{ left: 40, top: 880 }} />
      </Stage>
    </AbsoluteFill>
  );
};

// =====================================================================
// 2. LA SOLUTION — coller le lien dans ReelToBuild
// =====================================================================
const KS = SCREEN.w / inputPos.homeW; // px capture (3x) → px écran du téléphone
const CARD = { x: inputPos.x * KS, y: inputPos.y * KS, w: inputPos.w * KS, h: inputPos.h * KS };
const SX = PHONE.x + 14;
const SY = PHONE.y + 14;
const FOCUS = { x: SX + CARD.x + CARD.w / 2, y: SY + CARD.y + CARD.h / 2 };

export const PasteScene: React.FC<SceneProps> = ({ caption }) => {
  const t = useSec();
  const enter = ease(t, 0, 0.9);
  const zoom = ease(t, 1.25, 2.3, 'inout');
  const Z = lerp(1, 1.72, zoom);
  const ty = lerp(0, 560 - FOCUS.y, zoom);
  const dimPhone = ease(t, 3.25, 3.8);
  // pastille du lien copié
  const pillIn = ease(t, 0.55, 1.05);
  const fly = ease(t, 1.35, 2.0, 'inout');
  const pillO = pillIn * (1 - ease(t, 1.9, 2.02, 'linear'));
  const target = { x: SX + CARD.x + 195 * KS + 130, y: SY + CARD.y + 135 * KS }; // début du texte du champ
  const pillX = lerp(500, target.x, fly);
  const pillY = lerp(330, target.y, fly);
  const state = t < 2.0 ? 'input_empty' : t < 3.1 ? 'input_filled' : 'input_loading';
  const pop = t >= 2.0 ? 1 + 0.04 * Math.sin(Math.min(1, (t - 2.0) / 0.25) * Math.PI) : 1;
  const prog = ease(t, 3.3, 3.95);
  const step = t < 3.85 ? 0 : t < 4.3 ? 1 : t < 4.7 ? 2 : 3;
  return (
    <AbsoluteFill>
      <LightBg />
      <Caption text={caption?.text ?? 'Collez simplement *le lien.*'} sub={caption?.sub} at={0.3} />
      <Stage style={{ WebkitMaskImage: `linear-gradient(to bottom, rgba(0,0,0,${1 - zoom}) 0px, #000 110px)`, maskImage: `linear-gradient(to bottom, rgba(0,0,0,${1 - zoom}) 0px, #000 110px)`, height: 2000 }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: enter * (1 - dimPhone * 0.75),
            transform: `translateY(${(1 - enter) * 60 + ty}px) scale(${Z})`,
            transformOrigin: `${FOCUS.x}px ${FOCUS.y}px`,
            filter: dimPhone > 0 ? `blur(${dimPhone * 6}px)` : undefined,
          }}
        >
          <Phone screenBg={C.paper}>
            <Img src={staticFile('ui/screen_home.png')} style={{ width: SCREEN.w, display: 'block' }} />
            <div style={{ position: 'absolute', left: CARD.x, top: CARD.y, width: CARD.w, transform: `scale(${pop})` }}>
              <Img src={staticFile(`ui/${state}.png`)} style={{ width: CARD.w, display: 'block' }} />
            </div>
          </Phone>
          <Touch x={FOCUS.x} y={SY + CARD.y + CARD.h * 0.685} at={2.45} until={3.3} press={[2.9]} />
          {pillO > 0 ? (
            <div
              style={{
                position: 'absolute',
                left: pillX,
                top: pillY,
                transform: `translate(-50%, -50%) scale(${lerp(1, 0.42, fly) * (0.9 + 0.1 * pillIn)})`,
                opacity: pillO,
                zIndex: 60,
              }}
            >
              <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 22, letterSpacing: '0.12em', color: C.brand, textAlign: 'center', marginBottom: 10, opacity: 1 - fly }}>
                LIEN DU TUTO COPIÉ
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '18px 30px',
                  borderRadius: 999,
                  background: C.fg,
                  color: '#fff',
                  fontFamily: BODY,
                  fontWeight: 500,
                  fontSize: 34,
                  whiteSpace: 'nowrap',
                  boxShadow: '0 20px 40px -10px rgba(11,31,59,0.5)',
                }}
              >
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={C.brand} strokeWidth="2.4" strokeLinecap="round">
                  <path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
                  <path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
                </svg>
                https://youtu.be/carrelage60
              </div>
            </div>
          ) : null}
        </div>
        {prog > 0 ? (
          <div style={{ position: 'absolute', left: 70, top: lerp(1400, 300, prog), opacity: prog }}>
            <CardShot name={`progress_${step}`} srcW={1152} srcH={2532} pad={36} cropH={1250} width={860} radius={44} />
          </div>
        ) : null}
      </Stage>
    </AbsoluteFill>
  );
};

// =====================================================================
// 3. LA TRANSFORMATION — le tuto devient une liste détaillée
// =====================================================================
const LIST_W = 860;
const KL = LIST_W / 1050;
type Item = { name: string; srcW: number; cropH: number; ml?: number };
const LIST_ITEMS: Item[] = [
  { name: 'project_header', srcW: 1026, cropH: 519, ml: 12 },
  { name: 'cat_sols', srcW: 978, cropH: 183, ml: 36 },
  { name: 'row_carrelage', srcW: 1050, cropH: R.row_carrelage.compact },
  { name: 'row_plinthe', srcW: 1050, cropH: R.row_plinthe.compact },
  { name: 'cat_conso', srcW: 978, cropH: 183, ml: 36 },
  { name: 'row_mortier', srcW: 1050, cropH: R.row_mortier.compact },
  { name: 'row_joint', srcW: 1050, cropH: R.row_joint.compact },
  { name: 'row_primaire', srcW: 1050, cropH: R.row_primaire.compact },
  { name: 'row_croisillons', srcW: 1050, cropH: R.row_croisillons.compact },
  { name: 'row_peigne', srcW: 1050, cropH: R.row_peigne.compact },
];
const LIST_TOTAL = LIST_ITEMS.reduce((s, it) => s + it.cropH * KL + 6, 0);

export const TransformScene: React.FC<SceneProps> = ({ caption }) => {
  const t = useSec();
  const swap = ease(t, 0.15, 0.6);
  const scroll = ease(t, 1.0, 4.1, 'inout') * (LIST_TOTAL - 1180);
  const focus = ease(t, 4.2, 4.85);
  const KF = 0.86;
  let y = 0;
  return (
    <AbsoluteFill>
      <LightBg />
      <Caption text={caption?.text ?? 'Votre tutoriel devient une *liste de courses détaillée.*'} sub={caption?.sub ?? 'Exemple réel : pose de carrelage au sol 60 × 60 cm'} at={0.25} />
      <Stage>
        {swap < 1 ? (
          <div style={{ position: 'absolute', left: 70, top: 300, opacity: 1 - swap, transform: `scale(${1 - swap * 0.03})` }}>
            <CardShot name="progress_3" srcW={1152} srcH={2532} pad={36} cropH={1250} width={860} radius={44} />
          </div>
        ) : null}
        <div
          style={{
            position: 'absolute',
            left: 70,
            top: 30,
            opacity: swap * (1 - focus * 0.6),
            transform: `scale(${1 - focus * 0.04})`,
            filter: focus > 0 ? `blur(${focus * 7}px)` : undefined,
          }}
        >
          <Card style={{ width: LIST_W, height: 1240 }} radius={44}>
            <div style={{ transform: `translateY(${-scroll}px)`, paddingTop: 14 }}>
              {LIST_ITEMS.map((it, i) => {
                const at = 0.45 + i * 0.3;
                const p = ease(t, at, at + 0.7);
                const top = y;
                y += it.cropH * KL + 6;
                void top;
                return (
                  <div key={it.name} style={{ opacity: p, transform: `translateY(${(1 - p) * 50}px)`, marginBottom: 6, marginLeft: (it.ml ?? 0) * KL }}>
                    <Shot name={it.name} srcW={1050} width={it.srcW * KL} cropH={it.cropH} />
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
        {focus > 0 ? (
          <div style={{ position: 'absolute', left: 48, top: 150, opacity: focus, transform: `translateY(${(1 - focus) * 60}px) scale(${0.92 + 0.08 * focus})` }}>
            <Card style={{ width: 1050 * KF, height: 1170 * KF }} radius={44}>
              <Shot name="row_carrelage" srcW={1050} width={1050 * KF} />
            </Card>
            <Ring x={850 * KF} y={150 * KF} w={180 * KF} h={170 * KF} p={ease(t, 4.9, 5.3)} />
            <Tag text="Quantité calculée" p={ease(t, 4.95, 5.4)} style={{ right: -6, top: -78 }} />
            <Ring x={128 * KF} y={418 * KF} w={900 * KF} h={372 * KF} p={ease(t, 5.45, 5.85)} />
            <Tag text="Références produit" p={ease(t, 5.5, 5.95)} style={{ right: -6, top: 292 }} />
            <Ring x={6 * KF} y={808 * KF} w={730 * KF} h={142 * KF} p={ease(t, 6.0, 6.4)} />
            <Tag text="Où l'acheter" p={ease(t, 6.05, 6.5)} style={{ left: 600, top: 760 }} />
          </div>
        ) : null}
      </Stage>
    </AbsoluteFill>
  );
};

// =====================================================================
// 4. LA PERSONNALISATION — la règle graduée
// =====================================================================
const RV = ruler as { value: number; x: number; y: number; w: number; h: number; budget: string }[];
const KR = 900 / 1074;
const KRow = 900 / 1050;
const STEP0 = 1.95;
const STEP = 0.25;

export const RulerScene: React.FC<SceneProps> = ({ caption }) => {
  const t = useSec();
  const idx = Math.max(0, Math.min(RV.length - 1, Math.floor((t - STEP0) / STEP) + 1));
  const cur = RV[idx];
  const enter = ease(t, 0, 0.8);
  // position continue du doigt
  const f = Math.max(0, Math.min(RV.length - 1, (t - 1.7) / (STEP * (RV.length - 1)) * (RV.length - 1)));
  const i0 = Math.floor(f);
  const i1 = Math.min(RV.length - 1, i0 + 1);
  const fx = lerp(RV[i0].x * RV[i0].w, RV[i1].x * RV[i1].w, f - i0) * KR + 50;
  const fy = cur.y * cur.h * KR + 20;
  const hl = ease(t, 1.6, 2.0) * (1 - ease(t, 6.6, 7.0));
  const done = ease(t, 5.2, 5.8);
  const first = RV[0];
  const last = RV[RV.length - 1];
  return (
    <AbsoluteFill>
      <LightBg />
      <Caption text={caption?.text ?? 'Adaptez les quantités à vos *dimensions réelles.*'} sub={caption?.sub} at={0.25} />
      <ResultPills p={done} items={[`${first.value} m² → ${last.value} m²`, '112 → 71 carreaux', `Budget ${first.budget} → ${last.budget}`]} />
      <Stage>
        <div style={{ position: 'absolute', inset: 0, opacity: enter, transform: `translateY(${(1 - enter) * 60}px)` }}>
          <Card style={{ position: 'absolute', left: 50, top: 20, width: 900, height: 625 * KR }} radius={40}>
            <Shot name={`ruler_${cur.value}`} srcW={1074} width={900} cropH={625} />
          </Card>
          <Card style={{ position: 'absolute', left: 50, top: 640, width: 900, height: R.row_carrelage.compact * KRow }} radius={40}>
            <Shot name={`ruler_row_carrelage_${cur.value}`} srcW={1050} width={900} cropH={R.row_carrelage.compact} />
            <Ring x={850 * KRow} y={150 * KRow} w={180 * KRow} h={170 * KRow} p={hl} />
          </Card>
          <Card style={{ position: 'absolute', left: 50, top: 1010, width: 900, height: R.row_mortier.compact * KRow }} radius={40}>
            <Shot name={`ruler_row_mortier_${cur.value}`} srcW={1050} width={900} cropH={R.row_mortier.compact} />
            <Ring x={790 * KRow} y={60 * KRow} w={245 * KRow} h={200 * KRow} p={hl} />
          </Card>
          <Touch x={fx} y={fy} at={0.9} until={5.3} press={[1.0]} />
        </div>
      </Stage>
    </AbsoluteFill>
  );
};

const ResultPills: React.FC<{ items: string[]; p: number }> = ({ items, p }) => {
  const { vertical } = useLayout();
  if (p <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        ...(vertical ? { left: 80, top: 470, width: 940 } : { left: 140, top: 720, width: 760 }),
        display: 'flex',
        flexWrap: 'wrap',
        gap: 14,
      }}
    >
      {items.map((s, i) => {
        const q = Math.max(0, Math.min(1, p * 1.6 - i * 0.25));
        return (
          <div
            key={s}
            style={{
              padding: '14px 24px',
              borderRadius: 999,
              background: i === 1 ? C.brand : C.fg,
              color: '#fff',
              fontFamily: BODY,
              fontWeight: 700,
              fontSize: vertical ? 32 : 28,
              letterSpacing: '-0.01em',
              opacity: q,
              transform: `translateY(${(1 - q) * 16}px)`,
              whiteSpace: 'nowrap',
            }}
          >
            {s}
          </div>
        );
      })}
    </div>
  );
};

// =====================================================================
// 5. LA CONFIANCE — statuts et détail du calcul
// =====================================================================
const BADGES = [
  { name: 'badge_valide', w: 183, h: 72, text: 'Quantité nommée ou vue dans la source' },
  { name: 'badge_estime', w: 192, h: 78, text: 'Rendement ou conditionnement non sourcé' },
  { name: 'badge_confirmer', w: 300, h: 72, text: 'Un contrôle a relevé une incohérence' },
];
const KC = 0.86;
const CALC_LINES = [1500, 1727, 1825, 2120];

export const TrustScene: React.FC<SceneProps> = ({ caption }) => {
  const t = useSec();
  const out = ease(t, 2.15, 2.6, 'inout');
  const rowIn = ease(t, 2.2, 2.85);
  const open = ease(t, 2.95, 3.6, 'inout');
  const pan = ease(t, 3.05, 3.95, 'inout');
  const calc = t >= 2.95;
  const fullH = (calc ? 2448 : 1170) * KC;
  const visH = lerp(1170, 2448, open) * KC;
  return (
    <AbsoluteFill>
      <LightBg />
      <Caption text={caption?.text ?? "Comprenez d'où viennent *les quantités.*"} sub={caption?.sub} at={0.25} />
      <Stage>
        {out < 1 ? (
          <div style={{ position: 'absolute', left: 60, top: 120, width: 880, opacity: 1 - out, transform: `translateY(${-out * 80}px)` }}>
            {BADGES.map((b, i) => {
              const p = ease(t, 0.3 + i * 0.3, 0.9 + i * 0.3);
              return (
                <Card key={b.name} style={{ display: 'flex', alignItems: 'center', gap: 34, padding: '40px 44px', marginBottom: 28, opacity: p, transform: `translateX(${(1 - p) * 60}px)` }}>
                  <div style={{ width: 300, flexShrink: 0 }}>
                    <Img src={staticFile(`ui/${b.name}.png`)} style={{ height: (b.h / 72) * 104, display: 'block' }} />
                  </div>
                  <div style={{ fontFamily: BODY, fontSize: 36, fontWeight: 500, color: C.mute, lineHeight: 1.25, letterSpacing: '-0.01em' }}>{b.text}</div>
                </Card>
              );
            })}
          </div>
        ) : null}
        {rowIn > 0 ? (
          <div style={{ position: 'absolute', left: -60, right: -60, top: 0, height: 2000, WebkitMaskImage: 'linear-gradient(to bottom, transparent 0, #000 90px)', maskImage: 'linear-gradient(to bottom, transparent 0, #000 90px)' }}>
          <div style={{ position: 'absolute', left: 108, top: lerp(150, -840, pan) + (1 - rowIn) * 200, opacity: rowIn }}>
            <Card style={{ width: 1050 * KC, height: visH, position: 'relative' }} radius={44}>
              <Shot name={calc ? 'row_carrelage_calc' : 'row_carrelage'} srcW={1050} width={1050 * KC} cropH={fullH / KC} />
              {CALC_LINES.map((ly, i) => {
                const p = ease(t, 3.95 + i * 0.25, 4.35 + i * 0.25);
                return (
                  <div
                    key={ly}
                    style={{
                      position: 'absolute',
                      left: 30 * KC,
                      width: 980 * KC,
                      top: (ly - 38) * KC,
                      height: 76 * KC,
                      borderRadius: 12,
                      background: 'rgba(255,122,0,0.11)',
                      borderLeft: `6px solid ${C.brand}`,
                      opacity: p,
                      transformOrigin: 'left center',
                      transform: `scaleX(${0.6 + 0.4 * p})`,
                    }}
                  />
                );
              })}
            </Card>
            <Touch x={200} y={1018 * KC} at={2.55} until={3.2} press={[2.7]} />
          </div>
          </div>
        ) : null}
      </Stage>
    </AbsoluteFill>
  );
};

// =====================================================================
// 6. LE RÉSULTAT — liste finale, budget, export
// =====================================================================
export const ResultScene: React.FC<SceneProps> = ({ caption }) => {
  const t = useSec();
  const enter = ease(t, 0, 0.8);
  const scroll = ease(t, 0.3, 3.6, 'inout');
  const KLs = (SCREEN.w / 400) * (360 / 1080);
  const b = ease(t, 0.8, 1.4);
    const e = ease(t, 2.2, 2.8);
  return (
    <AbsoluteFill>
      <LightBg />
      <Caption text={caption?.text ?? 'Votre projet est prêt à *passer à l’action.*'} sub={caption?.sub ?? 'Budget et quantités estimés : à vérifier avant achat.'} at={0.25} />
      <Stage>
        <div style={{ position: 'absolute', inset: 0, opacity: enter, transform: `translateY(${(1 - enter) * 60}px)` }}>
          <Phone screenBg={C.paper}>
            <Img
              src={staticFile('ui/list_top.png')}
              style={{ position: 'absolute', left: 20 * (SCREEN.w / 400), top: 70 - scroll * 2600, width: 1080 * KLs }}
            />
          </Phone>
        </div>
        <div style={{ position: 'absolute', left: -30, top: 130, opacity: b, transform: `translateX(${(1 - b) * -60}px) rotate(-2deg)` }}>
          <CardShot name="budget_card_35" srcW={1152} srcH={1407} pad={36} width={470} radius={30} />
        </div>
        <div style={{ position: 'absolute', left: 470, top: 800, opacity: e, transform: `translateY(${(1 - e) * 60}px) rotate(1.5deg)` }}>
          <CardShot name="export_bar" srcW={1134} srcH={732} pad={30} width={540} radius={34} />
        </div>
      </Stage>
    </AbsoluteFill>
  );
};

// =====================================================================
// 7. SIGNATURE
// =====================================================================
export const SignatureScene: React.FC<SceneProps> = () => {
  const t = useSec();
  const { vertical } = useLayout();
  const logo = ease(t, 0.1, 0.9);
  const l1 = ease(t, 0.55, 1.25);
  const l2 = ease(t, 1.0, 1.7);
  const l3 = ease(t, 1.2, 1.9);
  const bar = ease(t, 1.6, 2.4, 'inout');
  const S = vertical ? 1 : 0.86;
  return (
    <AbsoluteFill>
      <DarkBg />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', transform: `scale(${S})` }}>
        <div
          style={{
            width: 380,
            height: 380,
            borderRadius: 86,
            overflow: 'hidden',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 40px 90px -20px rgba(0,0,0,0.6), 0 0 120px rgba(255,122,0,0.12)',
            opacity: logo,
            transform: `translateY(${(1 - logo) * 40}px) scale(${0.9 + 0.1 * logo})`,
          }}
        >
          <Img src={staticFile('logo-app.jpg')} style={{ width: 380, height: 380, transform: 'scale(1.035)' }} />
        </div>
        <div
          style={{
            marginTop: 70,
            fontFamily: DISPLAY,
            fontWeight: 800,
            fontSize: 92,
            letterSpacing: '-0.04em',
            color: '#fff',
            opacity: l1,
            transform: `translateY(${(1 - l1) * 30}px)`,
          }}
        >
          De la vidéo au <span style={{ color: C.brand }}>projet.</span>
        </div>
        <div style={{ marginTop: 64, fontFamily: BODY, fontWeight: 500, fontSize: 40, color: '#cbd5e1', opacity: l2, transform: `translateY(${(1 - l2) * 20}px)` }}>
          Essayez gratuitement sur
        </div>
        <div style={{ marginTop: 14, position: 'relative', opacity: l3, transform: `translateY(${(1 - l3) * 20}px)` }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 96, letterSpacing: '-0.03em', color: '#fff' }}>reeltobuild.com</div>
          <div style={{ height: 8, borderRadius: 4, background: C.brand, width: `${bar * 100}%`, marginTop: 6 }} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const SCENES: Record<string, React.FC<SceneProps>> = {
  problem: ProblemScene,
  paste: PasteScene,
  transform: TransformScene,
  ruler: RulerScene,
  trust: TrustScene,
  result: ResultScene,
  signature: SignatureScene,
};
