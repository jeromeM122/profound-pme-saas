import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { BODY, C, DarkBg, DISPLAY, useLayout } from './lib';
import { Fonts } from './fonts';
import { LocaleCtx, LOCALES, LocaleId, useL } from './locale';

// Miniature / cover : accroche + extraits réels de l'interface.
export const Cover: React.FC<{ locale?: LocaleId }> = ({ locale = 'fr' }) => (
  <LocaleCtx.Provider value={LOCALES[locale]}>
    <CoverInner />
  </LocaleCtx.Provider>
);

const CoverInner: React.FC = () => {
  const { vertical } = useLayout();
  const L = useL();
  const last = L.data.ruler[L.data.ruler.length - 1].value;
  const [t1, t2] = L.t.coverTitle.split(/\*([^*]+)\*/);
  const K = 0.86;
  const rowH = L.data.rows.row_carrelage.compact;
  const panel = (
    <div style={{ position: 'relative', width: 1000, height: 1100 }}>
      <div style={{ position: 'absolute', left: 40, top: 0, width: 900, height: 625 * (900 / 1074), borderRadius: 40, overflow: 'hidden', transform: 'rotate(-2.5deg)', boxShadow: '0 40px 90px -20px rgba(0,0,0,0.55)', background: '#fff' }}>
        <div style={{ height: 625 * (900 / 1074), overflow: 'hidden' }}>
          <Img src={staticFile(`${L.dir}/ruler_${last}.png`)} style={{ width: 900 }} />
        </div>
      </div>
      <div style={{ position: 'absolute', left: 70, top: 500, width: 1050 * K, height: rowH * K, borderRadius: 40, overflow: 'hidden', transform: 'rotate(1.5deg)', boxShadow: '0 40px 90px -20px rgba(0,0,0,0.6)', background: '#fff' }}>
        <div style={{ height: rowH * K, overflow: 'hidden' }}>
          <Img src={staticFile(`${L.dir}/ruler_row_carrelage_${last}.png`)} style={{ width: 1050 * K }} />
        </div>
      </div>
      <div style={{ position: 'absolute', left: 120, top: 880, display: 'flex', gap: 18, transform: 'rotate(-1deg)' }}>
        {['badge_valide', 'badge_estime', 'badge_confirmer'].map((b) => (
          <div key={b} style={{ background: '#fff', borderRadius: 18, padding: '18px 22px', boxShadow: '0 20px 40px -12px rgba(0,0,0,0.5)' }}>
            <Img src={staticFile(`${L.dir}/${b}.png`)} style={{ height: 64, display: 'block' }} />
          </div>
        ))}
      </div>
    </div>
  );
  const title = (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
        <div style={{ width: 110, height: 110, borderRadius: 26, overflow: 'hidden', position: 'relative', background: '#0b1f3b', boxShadow: '0 0 0 1px rgba(255,255,255,0.1)' }}>
          <Img src={staticFile('logo-app.jpg')} style={{ position: 'absolute', width: 176, height: 176, left: -33, top: -16 }} />
        </div>
        <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 54, color: '#fff', letterSpacing: '-0.03em' }}>
          ReelTo<span style={{ color: C.brand }}>Build</span>
        </div>
      </div>
      <div style={{ marginTop: 56, fontFamily: DISPLAY, fontWeight: 800, fontSize: vertical ? 118 : 104, lineHeight: 1.0, letterSpacing: '-0.045em', color: '#fff' }}>
        {t1}<span style={{ color: C.brand }}>{t2}</span>
      </div>
      <div style={{ marginTop: 34, fontFamily: BODY, fontWeight: 500, fontSize: vertical ? 40 : 36, color: '#cbd5e1', lineHeight: 1.35 }}>
        {L.t.coverSub}
      </div>
      <div style={{ marginTop: 40, display: 'inline-block', fontFamily: DISPLAY, fontWeight: 800, fontSize: vertical ? 52 : 46, color: '#fff', borderBottom: `6px solid ${C.brand}`, paddingBottom: 6 }}>
        reeltobuild.com
      </div>
    </div>
  );
  return (
    <AbsoluteFill>
      <Fonts />
      <DarkBg />
      {vertical ? (
        <>
          <div style={{ position: 'absolute', left: 80, top: 130, width: 920 }}>{title}</div>
          <div style={{ position: 'absolute', left: 40, top: 860, transform: 'scale(0.94)', transformOrigin: '0 0' }}>{panel}</div>
        </>
      ) : (
        <>
          <div style={{ position: 'absolute', left: 120, top: 0, bottom: 0, width: 860, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>{title}</div>
          <div style={{ position: 'absolute', left: 1000, top: 60, transform: 'scale(0.86)', transformOrigin: '0 0' }}>{panel}</div>
        </>
      )}
    </AbsoluteFill>
  );
};
