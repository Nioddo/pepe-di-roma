import React, { useMemo } from 'react';
import { Easing, interpolate, useCurrentFrame } from 'remotion';
import codigo from '../datos/codigo.json';
import { Escena, momento } from '../datos/escenas';
import { Fondo, Rotulo } from '../componentes/base';
import { resaltar } from '../componentes/resaltado';
import { C, FPS, MONO, TEXTO } from '../tema';

type EscenaCodigo = Extract<Escena, { tipo: 'codigo' }>;
const CODIGO = codigo as Record<string, string[]>;

const VENTANA = { x: 64, y: 104, w: 1792, h: 836 };
const BARRA = 40;
const PESTANAS = 44;
const LATERAL = 390;
const ALTO_LINEA = 33;
const AREA = VENTANA.h - BARRA - PESTANAS;
const TRANSICION = 0.7; // segundos

const nombre = (p: string) => p.split('/').pop() as string;

/** Árbol de archivos: carpetas (backend/src/..., frontend/src/...) y sus archivos. */
const ARBOL = (() => {
  const grupos = new Map<string, string[]>();
  for (const p of Object.keys(CODIGO)) {
    const dir = p.slice(0, p.lastIndexOf('/'));
    grupos.set(dir, [...(grupos.get(dir) ?? []), p]);
  }
  return [...grupos.entries()];
})();

export const EscenaCodigoView: React.FC<{ escena: EscenaCodigo }> = ({ escena }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;

  const focos = useMemo(() => {
    let previo = 0;
    return escena.focos.map((f) => {
      const inicio = momento(escena.id, f.en, previo);
      previo = inicio + 0.01;
      return { ...f, inicio };
    });
  }, [escena]);

  let i = 0;
  for (let k = 0; k < focos.length; k++) if (t >= focos[k].inicio) i = k;
  const foco = focos[i];
  const anterior = focos[Math.max(0, i - 1)];
  const lineas = CODIGO[foco.archivo];
  if (!lineas) throw new Error(`Falta el código de ${foco.archivo}`);

  const centro = (f: { lineas: [number, number] }, total: number) => {
    const medio = ((f.lineas[0] + f.lineas[1]) / 2 - 0.5) * ALTO_LINEA + 16;
    return Math.max(0, Math.min(medio - AREA / 2.1, total * ALTO_LINEA + 40 - AREA));
  };

  const mismoArchivo = anterior.archivo === foco.archivo && i > 0;
  const p = interpolate(t, [foco.inicio, foco.inicio + TRANSICION], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });
  const scroll = mismoArchivo ? interpolate(p, [0, 1], [centro(anterior, lineas.length), centro(foco, lineas.length)]) : centro(foco, lineas.length);
  const desde = mismoArchivo ? interpolate(p, [0, 1], [anterior.lineas[0], foco.lineas[0]]) : foco.lineas[0];
  const hasta = mismoArchivo ? interpolate(p, [0, 1], [anterior.lineas[1], foco.lineas[1]]) : foco.lineas[1];
  const opArchivo = mismoArchivo || i === 0 ? 1 : interpolate(t, [foco.inicio, foco.inicio + 0.35], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Al entrar a la escena: la ventana sube y el foco se enciende al rato.
  const entrada = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const enfoque = interpolate(t, [0.4, 1.1], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const zoom = 1 + 0.025 * enfoque;
  const archivosAbiertos = [...new Set(focos.map((f) => f.archivo))];

  const bandaTop = (desde - 1) * ALTO_LINEA + 16 - scroll;
  const bandaAlto = (hasta - desde + 1) * ALTO_LINEA;

  return (
    <Fondo>
      <Rotulo capitulo={escena.capitulo} titulo={escena.capa} />
      <div
        style={{
          position: 'absolute',
          left: VENTANA.x,
          top: VENTANA.y,
          width: VENTANA.w,
          height: VENTANA.h,
          borderRadius: 14,
          overflow: 'hidden',
          background: C.editor,
          boxShadow: '0 40px 90px rgba(60,5,10,0.35)',
          opacity: entrada,
          transform: `translateY(${(1 - entrada) * 40}px) scale(${zoom})`,
          transformOrigin: '60% 50%',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Barra de título */}
        <div style={{ height: BARRA, background: '#323233', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 9, borderBottom: `1px solid ${C.editorBorde}` }}>
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
            <div key={c} style={{ width: 13, height: 13, borderRadius: '50%', background: c }} />
          ))}
          <div style={{ flex: 1, textAlign: 'center', fontFamily: TEXTO, fontSize: 16, color: '#bbb' }}>{nombre(foco.archivo)} — pepe-di-roma — Visual Studio Code</div>
        </div>
        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          {/* Explorador */}
          <div style={{ width: LATERAL, background: C.editorBarra, borderRight: `1px solid ${C.editorBorde}`, padding: '14px 0', fontFamily: TEXTO, fontSize: 17, color: '#ccc' }}>
            <div style={{ padding: '0 20px 10px', fontSize: 13, letterSpacing: 1.5, color: '#999' }}>EXPLORADOR</div>
            {ARBOL.map(([dir, archivos]) => (
              <div key={dir}>
                <div style={{ padding: '4px 20px', color: '#999', fontSize: 15 }}>▾ {dir}</div>
                {archivos.map((a) => {
                  const activo = a === foco.archivo;
                  return (
                    <div
                      key={a}
                      style={{
                        padding: '3px 20px 3px 44px',
                        background: activo ? '#37373d' : 'transparent',
                        color: activo ? '#fff' : '#bbb',
                        borderLeft: activo ? `3px solid ${C.rojo}` : '3px solid transparent',
                        fontWeight: activo ? 600 : 400
                      }}
                    >
                      <span style={{ color: a.endsWith('.js') ? '#e8d44d' : '#3d8fd6', fontFamily: MONO, fontSize: 13, marginRight: 8 }}>{a.endsWith('.js') ? 'JS' : 'TS'}</span>
                      {nombre(a)}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          {/* Editor */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div style={{ height: PESTANAS, background: C.editorBarra, display: 'flex', borderBottom: `1px solid ${C.editorBorde}` }}>
              {archivosAbiertos.map((a) => {
                const activa = a === foco.archivo;
                return (
                  <div
                    key={a}
                    style={{
                      padding: '0 22px',
                      display: 'flex',
                      alignItems: 'center',
                      fontFamily: TEXTO,
                      fontSize: 17,
                      background: activa ? C.editor : C.editorTab,
                      color: activa ? '#fff' : '#999',
                      borderTop: activa ? `2px solid ${C.rojo}` : '2px solid transparent',
                      borderRight: `1px solid ${C.editorBorde}`
                    }}
                  >
                    {nombre(a)}
                  </div>
                );
              })}
            </div>
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden', opacity: opArchivo }}>
              {/* Banda del foco */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: bandaTop,
                  height: bandaAlto,
                  background: `rgba(206,19,32,${0.16 * enfoque})`,
                  borderLeft: `5px solid rgba(255,70,80,${enfoque})`,
                  boxShadow: `0 0 0 1px rgba(255,90,100,${0.35 * enfoque}) inset`
                }}
              />
              <div style={{ position: 'absolute', left: 0, right: 0, top: 16 - scroll, fontFamily: MONO, fontSize: 22 }}>
                {lineas.map((l, n) => {
                  const num = n + 1;
                  const dentro = num >= Math.floor(desde) && num <= Math.ceil(hasta);
                  const op = dentro ? 1 : interpolate(enfoque, [0, 1], [1, 0.3]);
                  return (
                    <div key={n} style={{ height: ALTO_LINEA, lineHeight: `${ALTO_LINEA}px`, display: 'flex', whiteSpace: 'pre', opacity: op }}>
                      <span style={{ width: 70, textAlign: 'right', paddingRight: 24, color: dentro ? '#c6c6c6' : C.editorNumero, flexShrink: 0 }}>{num}</span>
                      <span style={{ color: C.editorTexto }}>{resaltar(l)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fondo>
  );
};
