import React from 'react';
import { Easing, interpolate, useCurrentFrame } from 'remotion';
import { momento } from '../datos/escenas';
import { Fondo, Mono, Rotulo } from '../componentes/base';
import { C, DISPLAY, FPS, TEXTO } from '../tema';

const ID = 'arquitectura';
const CAPAS = [
  { nombre: 'Routes', archivo: 'reservaRoutes.js', rol: 'Definen los endpoints', clave: 'Las rutas' },
  { nombre: 'Middlewares', archivo: 'auth.js · errorHandler.js', rol: 'Identidad y permisos', clave: 'Los middlewares' },
  { nombre: 'Controllers', archivo: 'ReservaController.js', rol: 'HTTP ↔ servicio', clave: 'Los controladores' },
  { nombre: 'Services', archivo: 'ReservaService.js', rol: 'Reglas de negocio', clave: 'Los servicios' },
  { nombre: 'Repositories', archivo: 'ReservaRepository.js', rol: 'Datos en memoria', clave: 'Los repositorios' },
  { nombre: 'Models', archivo: 'Reserva.js', rol: 'Forma de cada entidad', clave: 'Y los modelos' }
];

const X = 720;
const ANCHO = 640;
const Y0 = 150;
const ALTO = 106;
const GAP = 22;

export const EscenaArquitectura: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const o = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) } as const;
  const tPartes = momento(ID, 'dos partes');
  const tPeticion = momento(ID, 'Una petición');
  const tCliente = momento(ID, 'Del lado del cliente');
  const tiempos = CAPAS.map((c) => momento(ID, c.clave));

  const partes = interpolate(t, [tPartes + 0.5, tPartes + 1.2], [0, 1], o);
  const cliente = interpolate(t, [tCliente, tCliente + 0.6], [0, 1], o);
  const formato = interpolate(t, [tPeticion + 9, tPeticion + 9.6], [0, 1], o);

  // Recorrido de la petición: baja por las capas y vuelve.
  const ida = tPeticion + 0.8;
  const vuelta = tCliente - 0.6;
  const medio = (ida + vuelta) / 2;
  const pos = t < ida || t > vuelta ? -1 : t < medio ? interpolate(t, [ida, medio], [0, CAPAS.length - 1], { easing: Easing.inOut(Easing.quad) }) : interpolate(t, [medio, vuelta], [CAPAS.length - 1, 0], { easing: Easing.inOut(Easing.quad) });
  const yPos = (i: number) => Y0 + i * (ALTO + GAP) + ALTO / 2;

  return (
    <Fondo>
      <Rotulo capitulo="Arquitectura" titulo="Dos partes, un contrato" />

      {/* Encabezados de las dos partes */}
      <div style={{ position: 'absolute', left: X, top: 100, width: ANCHO, fontFamily: TEXTO, fontWeight: 700, fontSize: 22, color: C.rojo, letterSpacing: 3, opacity: partes }}>
        BACKEND · NODE + EXPRESS
      </div>
      <div style={{ position: 'absolute', left: 110, top: 100, width: 460, fontFamily: TEXTO, fontWeight: 700, fontSize: 22, color: C.rojo, letterSpacing: 3, opacity: partes }}>
        FRONTEND · REACT + TS + VITE
      </div>

      {/* Frontend */}
      <div style={{ position: 'absolute', left: 110, top: Y0, width: 460, opacity: 0.35 * partes + 0.65 * cliente }}>
        {[
          { n: 'Páginas', d: 'Reserve · ReserveForm · MyReservations' },
          { n: 'reservasService.ts', d: 'Funciones del dominio' },
          { n: 'api.ts', d: 'Único cliente HTTP · x-usuario-id' }
        ].map((b, k) => (
          <div
            key={b.n}
            style={{
              height: ALTO,
              marginBottom: GAP,
              borderRadius: 16,
              background: k === 2 ? C.rojo : C.blanco,
              color: k === 2 ? C.blanco : C.tinta,
              border: `2px solid ${C.rojo}`,
              padding: '16px 24px',
              boxShadow: k === 2 ? `0 0 ${40 * cliente}px rgba(206,19,32,0.5)` : 'none',
              transform: `scale(${k === 2 ? 1 + 0.04 * cliente : 1})`
            }}
          >
            <div style={{ fontFamily: DISPLAY, fontSize: 36 }}>{b.n}</div>
            <div style={{ fontSize: 20, opacity: 0.8 }}>{b.d}</div>
          </div>
        ))}
      </div>
      {/* Flecha HTTP del api.ts a las rutas */}
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, opacity: partes }}>
        <defs>
          <marker id="punta" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill={C.rojo} />
          </marker>
        </defs>
        <path d={`M 570 ${yPos(2)} C 650 ${yPos(2)}, 640 ${yPos(0)}, ${X - 8} ${yPos(0)}`} stroke={C.rojo} strokeWidth={4} fill="none" strokeDasharray="10 8" strokeDashoffset={-frame * 1.2} markerEnd="url(#punta)" />
      </svg>
      <div style={{ position: 'absolute', left: 560, top: yPos(1) - 20, fontFamily: TEXTO, fontWeight: 600, fontSize: 18, color: C.rojoOscuro, opacity: partes, transform: 'rotate(-62deg)' }}>HTTP · JSON</div>

      {/* Capas del backend */}
      {CAPAS.map((c, i) => {
        const a = interpolate(t, [tiempos[i], tiempos[i] + 0.5], [0, 1], o);
        const activa = Math.max(0, 1 - Math.abs(pos - i) * 1.4) * (pos >= 0 ? 1 : 0);
        const ahora = t >= tiempos[i] && (i === CAPAS.length - 1 ? t < tPeticion : t < tiempos[i + 1]);
        const brillo = Math.max(activa, ahora ? 1 : 0);
        return (
          <div
            key={c.nombre}
            style={{
              position: 'absolute',
              left: X,
              top: Y0 + i * (ALTO + GAP),
              width: ANCHO,
              height: ALTO,
              borderRadius: 16,
              background: brillo > 0.5 ? C.rojo : C.blanco,
              color: brillo > 0.5 ? C.blanco : C.tinta,
              border: `2px solid ${C.rojo}`,
              display: 'flex',
              alignItems: 'center',
              padding: '0 28px',
              gap: 24,
              opacity: 0.12 + 0.88 * a,
              transform: `translateX(${(1 - a) * 40}px) scale(${1 + 0.03 * brillo})`,
              boxShadow: `0 ${10 + 20 * brillo}px ${30 + 30 * brillo}px rgba(120,10,20,${0.1 + 0.2 * brillo})`
            }}
          >
            <div style={{ fontFamily: DISPLAY, fontSize: 40, width: 250 }}>{c.nombre}</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 600 }}>{c.rol}</div>
              <Mono style={{ fontSize: 18, opacity: 0.75 }}>{c.archivo}</Mono>
            </div>
          </div>
        );
      })}

      {/* Punto que representa la petición */}
      {pos >= 0 ? (
        <div style={{ position: 'absolute', left: X - 46, top: Y0 + pos * (ALTO + GAP) + ALTO / 2 - 14, width: 28, height: 28, borderRadius: '50%', background: C.rojo, boxShadow: '0 0 0 8px rgba(206,19,32,0.25)' }} />
      ) : null}

      {/* Formato de respuesta */}
      <div style={{ position: 'absolute', left: 1420, top: yPos(2) - 100, width: 420, opacity: formato, transform: `translateY(${(1 - formato) * 20}px)` }}>
        <div style={{ fontFamily: TEXTO, fontWeight: 700, fontSize: 20, letterSpacing: 3, color: C.rojo, marginBottom: 12 }}>SIEMPRE LA MISMA FORMA</div>
        <div style={{ background: C.editor, color: C.editorTexto, borderRadius: 14, padding: '22px 26px', fontSize: 24, lineHeight: 1.6, whiteSpace: 'pre', boxShadow: '0 20px 50px rgba(0,0,0,0.25)' }}>
          <Mono>
            {'{ '}
            <span style={{ color: '#9cdcfe' }}>success</span>: <span style={{ color: '#569cd6' }}>true</span>,<br />
            {'  '}
            <span style={{ color: '#9cdcfe' }}>data</span>: …{' }'}
            <br />
            {'{ '}
            <span style={{ color: '#9cdcfe' }}>success</span>: <span style={{ color: '#569cd6' }}>false</span>,<br />
            {'  '}
            <span style={{ color: '#9cdcfe' }}>message</span>: <span style={{ color: '#ce9178' }}>"…"</span>
            {' }'}
          </Mono>
        </div>
      </div>
    </Fondo>
  );
};
