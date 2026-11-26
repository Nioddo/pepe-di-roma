import React from 'react';
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, DISPLAY, MONO, TEXTO } from '../tema';

export const useAparecer = (desde = 0, dur = 14) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [desde, desde + dur], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
};

export const useResorte = (desde = 0, damping = 16) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - desde, fps, config: { damping, stiffness: 140, mass: 0.8 } });
};

/** Fondo rosado de la marca, con un degradé suave y una trama de puntos. */
export const Fondo: React.FC<{ oscuro?: boolean; children?: React.ReactNode }> = ({ oscuro, children }) => (
  <AbsoluteFill
    style={{
      background: oscuro
        ? `radial-gradient(1200px 700px at 30% 20%, #2a1416 0%, #140a0b 70%)`
        : `radial-gradient(1400px 900px at 20% 0%, ${C.blanco} 0%, ${C.rosa} 55%, ${C.rosaDeep} 100%)`,
      fontFamily: TEXTO,
      color: oscuro ? C.blanco : C.tinta
    }}
  >
    <AbsoluteFill
      style={{
        backgroundImage: `radial-gradient(${oscuro ? 'rgba(255,255,255,0.05)' : 'rgba(206,19,32,0.07)'} 1.5px, transparent 1.5px)`,
        backgroundSize: '28px 28px'
      }}
    />
    {children}
  </AbsoluteFill>
);

/** Rótulo del capítulo arriba a la izquierda. */
export const Rotulo: React.FC<{ capitulo: string; titulo: string; oscuro?: boolean }> = ({ capitulo, titulo, oscuro }) => {
  const a = useAparecer(0, 16);
  return (
    <div style={{ position: 'absolute', left: 64, top: 30, display: 'flex', alignItems: 'center', gap: 18, opacity: a, transform: `translateY(${(1 - a) * -16}px)` }}>
      <div style={{ background: C.rojo, color: C.blanco, fontFamily: TEXTO, fontWeight: 700, fontSize: 20, letterSpacing: 2, textTransform: 'uppercase', padding: '8px 16px', borderRadius: 8 }}>
        {capitulo}
      </div>
      <div style={{ fontFamily: DISPLAY, fontSize: 40, color: oscuro ? C.blanco : C.tinta, letterSpacing: 0.5 }}>{titulo}</div>
    </div>
  );
};

/** Ventana de navegador que muestra contenido pensado para 1920x1080. */
export const Navegador: React.FC<{ ancho: number; url: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ ancho, url, children, style }) => {
  const escala = ancho / 1920;
  const alto = 1080 * escala;
  const barra = Math.max(30, Math.round(48 * escala * 1.2));
  return (
    <div style={{ width: ancho, height: alto + barra, borderRadius: 14, overflow: 'hidden', background: C.blanco, boxShadow: '0 30px 80px rgba(80,10,15,0.28), 0 0 0 1px rgba(0,0,0,0.08)', ...style }}>
      <div style={{ height: barra, background: '#efe7e7', display: 'flex', alignItems: 'center', gap: barra * 0.22, padding: `0 ${barra * 0.45}px`, borderBottom: '1px solid #e0d4d4' }}>
        {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
          <div key={c} style={{ width: barra * 0.3, height: barra * 0.3, borderRadius: '50%', background: c }} />
        ))}
        <div style={{ marginLeft: barra * 0.4, flex: 1, height: barra * 0.6, borderRadius: barra, background: C.blanco, display: 'flex', alignItems: 'center', padding: `0 ${barra * 0.4}px`, fontFamily: TEXTO, fontSize: barra * 0.36, color: C.gris }}>
          {url}
        </div>
      </div>
      <div style={{ width: ancho, height: alto, position: 'relative', overflow: 'hidden' }}>
        <div style={{ width: 1920, height: 1080, transform: `scale(${escala})`, transformOrigin: '0 0', position: 'absolute', left: 0, top: 0 }}>{children}</div>
      </div>
    </div>
  );
};

export const Pildora: React.FC<{ children: React.ReactNode; color?: string; style?: React.CSSProperties }> = ({ children, color = C.rojo, style }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: color, color: C.blanco, fontWeight: 600, fontSize: 26, padding: '10px 22px', borderRadius: 999, boxShadow: '0 10px 30px rgba(0,0,0,0.18)', ...style }}>
    {children}
  </div>
);

export const Mono: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <span style={{ fontFamily: MONO, ...style }}>{children}</span>
);
