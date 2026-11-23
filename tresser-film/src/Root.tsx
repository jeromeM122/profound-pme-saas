import React from 'react';
import { Composition, Still } from 'remotion';
import { loadFonts, FPS, sec } from './lib/theme';
import { MainFilm, ShortFilm, Cover } from './films/Films';

loadFonts();

const VARIANTS = ['members', 'masked'] as const;

export const Root: React.FC = () => (
  <>
    {VARIANTS.map(v => (
      <React.Fragment key={v}>
        <Composition id={`Main-916-${v}`} component={MainFilm} durationInFrames={sec(45)} fps={FPS} width={1080} height={1920} defaultProps={{ variant: v }} />
        <Composition id={`Main-169-${v}`} component={MainFilm} durationInFrames={sec(45)} fps={FPS} width={1920} height={1080} defaultProps={{ variant: v }} />
        <Composition id={`Short-916-${v}`} component={ShortFilm} durationInFrames={sec(15)} fps={FPS} width={1080} height={1920} defaultProps={{ variant: v }} />
        <Still id={`Cover-916-${v}`} component={Cover} width={1080} height={1920} defaultProps={{ variant: v }} />
        <Still id={`Cover-45-${v}`} component={Cover} width={1080} height={1350} defaultProps={{ variant: v }} />
        <Still id={`Thumb-169-${v}`} component={Cover} width={1280} height={720} defaultProps={{ variant: v }} />
      </React.Fragment>
    ))}
  </>
);
