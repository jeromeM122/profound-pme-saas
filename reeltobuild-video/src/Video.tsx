import React from 'react';
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ease, SceneTime } from './lib';
import { SCENES, SceneProps } from './scenes';
import { Fonts } from './fonts';
import timeline from './timeline.json';

export type Version = 'main' | 'short';

// Légendes propres à la version courte (15 s).
const CAPTIONS: Record<Version, Record<string, SceneProps['caption']>> = {
  main: {},
  short: {
    paste: { text: 'Collez le lien *d’un tuto.*' },
    transform: { text: 'Obtenez la *liste d’achats détaillée.*', sub: 'Exemple réel : pose de carrelage au sol 60 × 60 cm' },
    ruler: { text: 'Adaptée à vos *dimensions réelles.*' },
  },
};

const XFADE = 0.45; // secondes de fondu enchaîné entre scènes

const Fade: React.FC<{ children: React.ReactNode; first: boolean }> = ({ children, first }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = first ? 1 : ease(f / fps, 0, XFADE, 'inout');
  return <AbsoluteFill style={{ opacity: p, transform: `scale(${1.015 - 0.015 * p})` }}>{children}</AbsoluteFill>;
};

export const Film: React.FC<{ version: Version }> = ({ version }) => {
  const cfg = timeline[version];
  const { fps, durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();
  void frame;
  return (
    <AbsoluteFill style={{ background: '#0b1f3b' }}>
      <Fonts />
      {cfg.scenes.map((sc, i) => {
        const Comp = SCENES[sc.id];
        const from = Math.round(sc.start * fps);
        const last = i === cfg.scenes.length - 1;
        const dur = last ? durationInFrames - from : Math.round((sc.len + XFADE + 0.1) * fps);
        return (
          <Sequence key={sc.id} from={from} durationInFrames={dur} name={sc.id}>
            <SceneTime.Provider value={{ rate: sc.rate, offset: sc.offset }}>
              <Fade first={i === 0}>
                <Comp caption={CAPTIONS[version][sc.id]} />
              </Fade>
            </SceneTime.Provider>
          </Sequence>
        );
      })}
      <Audio
        src={staticFile(`audio/${version}.wav`)}
        volume={(f) => interpolate(f, [0, 6], [0, 0.72], { extrapolateRight: 'clamp' })}
      />
    </AbsoluteFill>
  );
};
