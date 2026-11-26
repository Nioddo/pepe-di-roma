import React from 'react';
import { Composition } from 'remotion';
import { DefensaPepeDiRoma, PropsDefensa } from './Video';
import { DURACION_TOTAL } from './datos/escenas';
import { FPS } from './tema';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="DefensaPepeDiRoma"
    component={DefensaPepeDiRoma}
    durationInFrames={DURACION_TOTAL}
    fps={FPS}
    width={1920}
    height={1080}
    defaultProps={{ mostrarSubtitulos: true } satisfies PropsDefensa}
  />
);
