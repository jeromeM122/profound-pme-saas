import React from 'react';
import { Composition, Still } from 'remotion';
import { Film } from './Video';
import { Cover } from './Cover';
import timeline from './timeline.json';

const FPS = timeline.fps;
export const Root: React.FC = () => (
  <>
    <Composition id="Main-9x16" component={Film} defaultProps={{ version: 'main' as const }} fps={FPS} width={1080} height={1920} durationInFrames={timeline.main.duration * FPS} />
    <Composition id="Main-16x9" component={Film} defaultProps={{ version: 'main' as const }} fps={FPS} width={1920} height={1080} durationInFrames={timeline.main.duration * FPS} />
    <Composition id="Short-9x16" component={Film} defaultProps={{ version: 'short' as const }} fps={FPS} width={1080} height={1920} durationInFrames={timeline.short.duration * FPS} />
    <Still id="Cover-9x16" component={Cover} width={1080} height={1920} />
    <Still id="Cover-16x9" component={Cover} width={1920} height={1080} />
  </>
);
