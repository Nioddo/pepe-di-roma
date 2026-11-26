import React from 'react';
import { AbsoluteFill, Easing, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { Video } from '@remotion/media';
import { momento } from '../datos/escenas';
import { Fondo, Navegador, useResorte } from '../componentes/base';
import { C, DISPLAY, FPS, TEXTO } from '../tema';

const REGLAS = ['Horarios', 'Capacidad de mesas', 'Tamaño del grupo', 'Privacidad', 'Concurrencia'];

export const EscenaPortada: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const o = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) } as const;
  const tReglas = momento('intro', 'Lo elegí porque');
  const titulo = useResorte(4, 14);
  const sub = interpolate(frame, [22, 40], [0, 1], o);
  const nav = useResorte(14, 20);
  const raya = interpolate(frame, [30, 55], [0, 1], o);
  const deriva = interpolate(frame, [0, 900], [0, -30]);

  return (
    <Fondo>
      {/* Captura real a la derecha, inclinada */}
      <div
        style={{
          position: 'absolute',
          left: 1000,
          top: 210,
          opacity: nav,
          transform: `perspective(1800px) rotateY(-14deg) rotateX(4deg) translateX(${(1 - nav) * 200 + deriva}px)`,
          transformOrigin: '0 50%'
        }}
      >
        <Navegador ancho={1040} url="localhost:5173/reservar">
          <AbsoluteFill>
            <Video src={staticFile('grabaciones/reserva.mp4')} trimBefore={Math.round(12.8 * FPS)} playbackRate={0.8} muted style={{ width: 1920, height: 1080 }} />
          </AbsoluteFill>
        </Navegador>
      </div>

      <div style={{ position: 'absolute', left: 120, top: 170, width: 960 }}>
        <div style={{ fontFamily: TEXTO, fontWeight: 600, fontSize: 26, letterSpacing: 6, color: C.rojo, textTransform: 'uppercase', opacity: sub }}>Defensa técnica</div>
        <div style={{ fontFamily: DISPLAY, fontSize: 150, lineHeight: 1, whiteSpace: 'nowrap', color: C.rojo, marginTop: 18, transform: `translateY(${(1 - titulo) * 60}px)`, opacity: titulo, textShadow: '0 8px 30px rgba(206,19,32,0.2)' }}>
          Pepe Di Roma
        </div>
        <div style={{ height: 8, width: 520 * raya, background: C.rojo, borderRadius: 8, margin: '26px 0' }} />
        <div style={{ fontFamily: DISPLAY, fontSize: 64, lineHeight: 1.1, color: C.tinta, opacity: sub, transform: `translateY(${(1 - sub) * 20}px)` }}>
          Flujo de Reserva de Mesas
        </div>
        <div style={{ fontFamily: TEXTO, fontSize: 26, color: C.gris, marginTop: 18, opacity: sub }}>Node + Express en capas · React + TypeScript con Vite</div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 56, width: 820 }}>
          {REGLAS.map((r, k) => {
            const a = interpolate(t, [tReglas + 1 + k * 0.9, tReglas + 1.4 + k * 0.9], [0, 1], o);
            const ultima = k === REGLAS.length - 1;
            return (
              <div
                key={r}
                style={{
                  opacity: a,
                  transform: `translateY(${(1 - a) * 16}px) scale(${0.9 + 0.1 * a})`,
                  background: ultima ? C.rojo : C.blanco,
                  color: ultima ? C.blanco : C.tinta,
                  border: `2px solid ${C.rojo}`,
                  fontFamily: TEXTO,
                  fontWeight: 600,
                  fontSize: 26,
                  padding: '10px 22px',
                  borderRadius: 999
                }}
              >
                {r}
              </div>
            );
          })}
        </div>
      </div>
    </Fondo>
  );
};
