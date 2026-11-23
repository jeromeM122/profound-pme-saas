import React, { useEffect, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';

// Polices du site reeltobuild.com (Plus Jakarta Sans pour les titres, Inter pour le texte).
const css = `
@font-face{font-family:"Plus Jakarta Sans";font-weight:200 800;font-style:normal;src:url(${staticFile('fonts/plus-jakarta-sans-latin-wght-normal.woff2')}) format("woff2");}
@font-face{font-family:"Inter";font-weight:100 900;font-style:normal;src:url(${staticFile('fonts/inter-latin-wght-normal.woff2')}) format("woff2");}
`;

export const Fonts: React.FC = () => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all([
      document.fonts.load('800 80px "Plus Jakarta Sans"'),
      document.fonts.load('500 40px "Inter"'),
      document.fonts.load('700 40px "Inter"'),
    ]).then(() => continueRender(handle));
  }, [handle]);
  return <style>{css}</style>;
};
