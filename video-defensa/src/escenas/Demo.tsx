import React from 'react';
import { AbsoluteFill, Easing, interpolate, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { Video } from '@remotion/media';
import { Clip, Escena, framesDe, Zoom } from '../datos/escenas';
import { Fondo, Navegador, Rotulo } from '../componentes/base';
import { FPS } from '../tema';

type EscenaDemo = Extract<Escena, { tipo: 'demo' }>;

export const ANCHO_NAV = 1440;

/** Reparte los cuadros de la escena entre los tramos de grabación a una velocidad común. */
export function tramosDe(clips: Clip[], frames: number) {
  const total = clips.reduce((s, c) => s + c.hasta - c.desde, 0);
  const velocidad = Math.min(1.8, Math.max(0.6, (total * FPS) / frames));
  let acc = 0;
  const tramos = clips.map((c) => {
    const f = Math.round(((c.hasta - c.desde) * FPS) / velocidad);
    const r = { ...c, inicio: acc, frames: f };
    acc += f;
    return r;
  });
  return { tramos, velocidad };
}

/** Transform que agranda la captura alrededor de (x, y) sin dejar bordes vacíos. */
export function transformZoom(escala: number, x: number, y: number) {
  const tx = Math.min(0, Math.max(1920 - 1920 * escala, 960 - escala * x));
  const ty = Math.min(0, Math.max(1080 - 1080 * escala, 540 - escala * y));
  return `translate(${tx}px, ${ty}px) scale(${escala})`;
}

export function zoomEn(zooms: Zoom[], t: number) {
  const ts = zooms.map((z) => z.t);
  if (zooms.length === 1) return zooms[0];
  const o = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) } as const;
  return {
    t,
    escala: interpolate(t, ts, zooms.map((z) => z.escala), o),
    x: interpolate(t, ts, zooms.map((z) => z.x), o),
    y: interpolate(t, ts, zooms.map((z) => z.y), o)
  };
}

export const EscenaDemoView: React.FC<{ escena: EscenaDemo }> = ({ escena }) => {
  const frame = useCurrentFrame();
  const { tramos, velocidad } = tramosDe(escena.clips, framesDe(escena.id));
  const tramo = tramos.find((t) => frame < t.inicio + t.frames) ?? tramos[tramos.length - 1];
  const tFuente = tramo.desde + (Math.min(frame - tramo.inicio, tramo.frames - 1) / FPS) * velocidad;
  const z = zoomEn(escena.zooms, tFuente);

  const entrada = interpolate(frame, [0, 16], [0, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });

  return (
    <Fondo>
      <Rotulo capitulo={escena.capitulo} titulo={escena.paso} />
      <div style={{ position: 'absolute', left: (1920 - ANCHO_NAV) / 2, top: 96, opacity: entrada, transform: `translateY(${(1 - entrada) * 30}px)` }}>
        <Navegador ancho={ANCHO_NAV} url={escena.url}>
          <AbsoluteFill style={{ transform: transformZoom(z.escala, z.x, z.y), transformOrigin: '0 0' }}>
            {tramos.map((t, k) => (
              <Sequence key={k} from={t.inicio} durationInFrames={t.frames}>
                <Video src={staticFile(t.src)} trimBefore={Math.round(t.desde * FPS)} trimAfter={Math.round(t.hasta * FPS)} playbackRate={velocidad} muted style={{ width: 1920, height: 1080 }} />
                {k > 0 ? <Destello /> : null}
              </Sequence>
            ))}
          </AbsoluteFill>
        </Navegador>
      </div>
    </Fondo>
  );
};

/** Corte suave entre dos tramos de la misma grabación. */
const Destello: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 10], [1, 0], { extrapolateRight: 'clamp' });
  return <AbsoluteFill style={{ background: '#fff', opacity: o }} />;
};
