import React from 'react';
import { AbsoluteFill, interpolate, Series, staticFile, useCurrentFrame } from 'remotion';
import { Audio } from '@remotion/media';
import { DURACION_TOTAL, Escena, ESCENAS, framesDe, vozDe } from './datos/escenas';
import { Subtitulos } from './componentes/Subtitulos';
import { EscenaPortada } from './escenas/Portada';
import { EscenaArquitectura } from './escenas/Arquitectura';
import { EscenaCodigoView } from './escenas/Codigo';
import { EscenaDemoView } from './escenas/Demo';
import { EscenaConcurrencia } from './escenas/Concurrencia';
import { EscenaRed } from './escenas/Red';
import { EscenaCierre } from './escenas/Cierre';
import { C } from './tema';

export type PropsDefensa = { mostrarSubtitulos: boolean };

const Contenido: React.FC<{ escena: Escena }> = ({ escena }) => {
  switch (escena.tipo) {
    case 'portada':
      return <EscenaPortada />;
    case 'arquitectura':
      return <EscenaArquitectura />;
    case 'codigo':
      return <EscenaCodigoView escena={escena} />;
    case 'demo':
      return <EscenaDemoView escena={escena} />;
    case 'concurrencia':
      return <EscenaConcurrencia />;
    case 'red':
      return <EscenaRed />;
    case 'cierre':
      return <EscenaCierre />;
  }
};

/** Fundido corto de entrada y salida para que los cortes entre escenas no sean bruscos. */
const Fundido: React.FC<{ frames: number; children: React.ReactNode }> = ({ frames, children }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 8, frames - 8, frames], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

const Progreso: React.FC = () => {
  const frame = useCurrentFrame();
  return <div style={{ position: 'absolute', left: 0, top: 0, height: 6, width: `${(frame / DURACION_TOTAL) * 100}%`, background: C.rojo }} />;
};

export const DefensaPepeDiRoma: React.FC<PropsDefensa> = ({ mostrarSubtitulos }) => (
  <AbsoluteFill style={{ background: C.tinta }}>
    <Series>
      {ESCENAS.map((e) => {
        const frames = framesDe(e.id);
        const voz = vozDe(e.id);
        return (
          <Series.Sequence key={e.id} durationInFrames={frames} name={e.id}>
            <Fundido frames={frames}>
              <Contenido escena={e} />
            </Fundido>
            <Audio src={staticFile(voz.archivo)} />
            {mostrarSubtitulos ? <Subtitulos subtitulos={voz.subtitulos} /> : null}
          </Series.Sequence>
        );
      })}
    </Series>
    <Progreso />
  </AbsoluteFill>
);
