import React from 'react';
import { AbsoluteFill, Easing, Freeze, interpolate, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { Video } from '@remotion/media';
import grabaciones from '../datos/grabaciones.json';
import { framesDe, momento } from '../datos/escenas';
import { Fondo, Navegador, Pildora, Rotulo } from '../componentes/base';
import { transformZoom } from './Demo';
import { C, FPS, TEXTO } from '../tema';

const ID = 'demoConcurrencia';
const G = grabaciones as unknown as Record<string, { archivo: string; marcas: Record<string, number> }>;

/** Una grabación alineada para que sus clics caigan sobre la narración. */
const Pantalla: React.FC<{ clave: 'concurrenciaA' | 'concurrenciaB'; inicio: number; velocidad: number; total: number; zoom: number }> = ({ clave, inicio, velocidad, total, zoom }) => {
  const g = G[clave];
  const fin = g.marcas.fin;
  const frames = Math.min(total, Math.round(((fin - inicio) * FPS) / velocidad));
  const v = (desde: number, hasta: number) => (
    <Video src={staticFile(g.archivo)} trimBefore={Math.round(desde * FPS)} trimAfter={Math.round(hasta * FPS)} playbackRate={velocidad} muted style={{ width: 1920, height: 1080 }} />
  );
  return (
    <AbsoluteFill style={{ transform: transformZoom(zoom, 1640, 1010), transformOrigin: '0 0' }}>
      <Sequence durationInFrames={frames}>{v(inicio, fin)}</Sequence>
      {frames < total ? (
        <Sequence from={frames}>
          <Freeze frame={0}>{v(fin - 0.2, fin)}</Freeze>
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};

export const EscenaConcurrencia: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const total = framesDe(ID);
  const A = G.concurrenciaA.marcas;
  const B = G.concurrenciaB.marcas;

  const tPrimero = momento(ID, 'El primero confirma');
  const tSegundo = momento(ID, 'El segundo confirma');
  const tAviso = momento(ID, 'El aviso muestra');
  const velocidad = (B.segundo - B.primero) / (tSegundo - tPrimero);
  const inicioA = A.primero - tPrimero * velocidad;
  const inicioB = B.segundo - tSegundo * velocidad;

  const ancho = 880;
  const o = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) } as const;
  const foco = interpolate(t, [tAviso - 0.6, tAviso + 0.4], [0, 1], o);
  const zoomB = interpolate(t, [tAviso + 0.6, tAviso + 1.6], [1, 1.9], o);
  const entrada = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' });

  // Posiciones: lado a lado; al final B ocupa el centro.
  const xA = 60;
  const xB = interpolate(foco, [0, 1], [980, 260]);
  const yB = interpolate(foco, [0, 1], [250, 90]);
  const escB = interpolate(foco, [0, 1], [1, 1400 / ancho]);

  const etiqueta = (texto: string, desde: number, color: string) => {
    const a = interpolate(t, [desde, desde + 0.3], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    return a > 0 ? (
      <Pildora color={color} style={{ opacity: a, transform: `scale(${0.85 + 0.15 * a})`, fontSize: 24, padding: '8px 18px' }}>
        {texto}
      </Pildora>
    ) : null;
  };

  return (
    <Fondo>
      <Rotulo capitulo="Demo" titulo="e · Dos clientes, la misma mesa" />
      {/* Cliente A */}
      <div style={{ position: 'absolute', left: xA, top: 250, opacity: entrada * (1 - foco) }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14, fontFamily: TEXTO, fontWeight: 700, fontSize: 30 }}>
          Cliente A {etiqueta('POST → 201 Created', tPrimero + 0.6, C.ok)}
        </div>
        <Navegador ancho={ancho} url="localhost:5173/reservar">
          <Pantalla clave="concurrenciaA" inicio={inicioA} velocidad={velocidad} total={total} zoom={1} />
        </Navegador>
      </div>
      {/* Cliente B */}
      <div style={{ position: 'absolute', left: xB, top: yB, opacity: entrada, transform: `scale(${escB})`, transformOrigin: '0 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14, fontFamily: TEXTO, fontWeight: 700, fontSize: 30 / escB, opacity: 1 - foco }}>
          Cliente B {etiqueta('POST → 409 Conflict', tSegundo + 1.2, C.rojo)}
        </div>
        <Navegador ancho={ancho} url="localhost:5173/reservar">
          <Pantalla clave="concurrenciaB" inicio={inicioB} velocidad={velocidad} total={total} zoom={zoomB} />
        </Navegador>
      </div>
      {/* Indicación central */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 160, display: 'flex', justifyContent: 'center', opacity: entrada * (1 - foco), fontFamily: TEXTO, fontSize: 26, color: C.gris }}>
        Mesa 1 · 18/12/2026 · 21:00 · dos navegadores al mismo tiempo
      </div>
      {foco > 0.5 ? (
        <div style={{ position: 'absolute', right: 120, top: 40, opacity: interpolate(t, [tAviso + 1, tAviso + 1.4], [0, 1], o) }}>
          <Pildora>409 · La mesa ya esta reservada en ese horario</Pildora>
        </div>
      ) : null}
    </Fondo>
  );
};
