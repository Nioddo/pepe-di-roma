import React, { useMemo } from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { Subtitulo } from '../datos/escenas';
import { FPS, TEXTO } from '../tema';

const MAX_PALABRAS = 13;

/** Parte cada frase en tramos de hasta 14 palabras, repartiendo el tiempo según la cantidad de letras. */
export function partir(subs: Subtitulo[]): Subtitulo[] {
  const salida: Subtitulo[] = [];
  for (const s of subs) {
    const palabras = s.texto.split(/\s+/).filter(Boolean);
    const n = Math.ceil(palabras.length / MAX_PALABRAS);
    const porTramo = Math.ceil(palabras.length / n);
    const tramos: string[] = [];
    for (let i = 0; i < palabras.length; i += porTramo) tramos.push(palabras.slice(i, i + porTramo).join(' '));
    const letras = tramos.reduce((a, t) => a + t.length, 0);
    let t0 = s.desde;
    for (const t of tramos) {
      const d = ((s.hasta - s.desde) * t.length) / letras;
      salida.push({ desde: t0, hasta: t0 + d, texto: t });
      t0 += d;
    }
  }
  return salida;
}

export const Subtitulos: React.FC<{ subtitulos: Subtitulo[] }> = ({ subtitulos }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const tramos = useMemo(() => partir(subtitulos), [subtitulos]);
  const actual = tramos.find((s) => t >= s.desde && t < s.hasta + 0.15);
  if (!actual) return null;
  const a = interpolate(t, [actual.desde, actual.desde + 0.12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 26, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
      <div
        style={{
          maxWidth: 1800,
          background: 'rgba(20,10,11,0.82)',
          color: '#fff',
          fontFamily: TEXTO,
          fontWeight: 500,
          fontSize: 34,
          lineHeight: 1.3,
          padding: '12px 28px',
          borderRadius: 12,
          textAlign: 'center',
          opacity: a
        }}
      >
        {actual.texto}
      </div>
    </div>
  );
};
