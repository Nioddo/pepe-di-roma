import React from 'react';
import { Easing, interpolate, useCurrentFrame } from 'remotion';
import { momento } from '../datos/escenas';
import { Fondo, Mono } from '../componentes/base';
import { C, DISPLAY, FPS, TEXTO } from '../tema';

const ID = 'cierre';
const RESUMEN = [
  ['Reglas de negocio', 'ReservaService'],
  ['Permisos', 'middlewares/auth'],
  ['Errores', 'errorHandler'],
  ['Comunicación', 'api.ts']
];

export const EscenaCierre: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const o = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) } as const;
  const tLista = momento(ID, 'Las reglas');
  const tValida = momento(ID, 'La validación');
  const tGracias = momento(ID, 'Gracias');
  const titulo = interpolate(frame, [0, 20], [0, 1], o);
  const valida = interpolate(t, [tValida, tValida + 0.6], [0, 1], o);
  const gracias = interpolate(t, [tGracias - 0.2, tGracias + 0.5], [0, 1], o);

  return (
    <Fondo oscuro={gracias > 0.5}>
      <div style={{ position: 'absolute', inset: 0, opacity: 1 - gracias }}>
        <div style={{ position: 'absolute', left: 140, top: 120, fontFamily: DISPLAY, fontSize: 80, color: C.rojo, opacity: titulo }}>Cada cosa en su capa</div>
        <div style={{ position: 'absolute', left: 140, top: 270, width: 900 }}>
          {RESUMEN.map(([que, donde], k) => {
            const a = interpolate(t, [tLista + 0.3 + k * 1.6, tLista + 0.8 + k * 1.6], [0, 1], o);
            return (
              <div key={que} style={{ display: 'flex', alignItems: 'center', gap: 26, marginBottom: 24, opacity: a, transform: `translateX(${(1 - a) * -40}px)` }}>
                <div style={{ width: 420, fontFamily: TEXTO, fontWeight: 700, fontSize: 38 }}>{que}</div>
                <div style={{ fontSize: 40, color: C.rojo }}>→</div>
                <div style={{ background: C.editor, color: '#dcdcaa', borderRadius: 12, padding: '10px 22px', fontSize: 32 }}>
                  <Mono>{donde}</Mono>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ position: 'absolute', left: 1120, top: 300, width: 660, opacity: valida, transform: `translateY(${(1 - valida) * 30}px)` }}>
          <div style={{ background: C.blanco, borderRadius: 22, padding: '34px 40px', boxShadow: '0 30px 70px rgba(80,10,15,0.2)', borderTop: `8px solid ${C.rojo}` }}>
            <div style={{ fontFamily: TEXTO, fontSize: 30, color: C.gris }}>Validación en el cliente</div>
            <div style={{ fontFamily: DISPLAY, fontSize: 52, marginBottom: 22 }}>mejora la experiencia</div>
            <div style={{ fontFamily: TEXTO, fontSize: 30, color: C.gris }}>Validación en el servidor</div>
            <div style={{ fontFamily: DISPLAY, fontSize: 52, color: C.rojo }}>garantiza la consistencia</div>
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: gracias }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 200, color: C.blanco, transform: `scale(${0.9 + 0.1 * gracias})` }}>Gracias</div>
        <div style={{ height: 6, width: 300, background: C.rojo, borderRadius: 6, margin: '10px 0 30px' }} />
        <div style={{ fontFamily: TEXTO, fontSize: 34, color: '#f3caca' }}>Pepe Di Roma · Flujo de Reserva de Mesas</div>
      </div>
    </Fondo>
  );
};
