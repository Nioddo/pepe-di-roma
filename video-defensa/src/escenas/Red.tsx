import React from 'react';
import { AbsoluteFill, Easing, Freeze, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { Video } from '@remotion/media';
import grabaciones from '../datos/grabaciones.json';
import red409 from '../datos/red-409.json';
import redGet from '../datos/red-get-reservas.json';
import { momento } from '../datos/escenas';
import { Fondo, Navegador, Pildora, Rotulo } from '../componentes/base';
import { ANCHO_NAV } from './Demo';
import { C, FPS, MONO, TEXTO } from '../tema';

const ID = 'demoRed';
const G = grabaciones as unknown as Record<string, { archivo: string; marcas: Record<string, number> }>;
type Reserva = { id: number; clienteId: number | null; fecha: string; horaInicio: string; mesaId: number | null; estado: string; nombre: string | null; telefono: string | null };
const DEL_DIA = (redGet.respuesta.data as Reserva[]).filter((r) => r.fecha === '2026-12-18');

const DT = { fondo: '#202124', panel: '#292a2d', borde: '#3c4043', texto: '#e8eaed', tenue: '#9aa0a6', clave: '#c58af9', cadena: '#f28b82', numero: '#8ab4f8', nulo: '#9aa0a6', azul: '#8ab4f8' };

const Valor: React.FC<{ v: unknown }> = ({ v }) => {
  if (v === null) return <span style={{ color: DT.nulo }}>null</span>;
  if (typeof v === 'string') return <span style={{ color: DT.cadena }}>"{v}"</span>;
  if (typeof v === 'boolean') return <span style={{ color: DT.numero }}>{String(v)}</span>;
  return <span style={{ color: DT.numero }}>{String(v)}</span>;
};

const Linea: React.FC<{ k: string; v: unknown; resaltar?: number; sangria?: number; color?: string }> = ({ k, v, resaltar = 0, sangria = 0, color = C.rojo }) => (
  <div style={{ padding: `2px 10px 2px ${14 + sangria}px`, borderRadius: 6, background: `rgba(${color === C.ok ? '31,122,61' : '206,19,32'},${0.45 * resaltar})`, outline: resaltar ? `2px solid rgba(255,120,120,${resaltar})` : 'none' }}>
    <span style={{ color: DT.clave }}>{k}</span>
    <span style={{ color: DT.tenue }}>: </span>
    <Valor v={v} />
  </div>
);

const Seccion: React.FC<{ titulo: string; children: React.ReactNode; op?: number }> = ({ titulo, children, op = 1 }) => (
  <div style={{ marginBottom: 18, opacity: op }}>
    <div style={{ color: DT.texto, fontFamily: TEXTO, fontWeight: 600, fontSize: 20, padding: '6px 14px', borderBottom: `1px solid ${DT.borde}`, marginBottom: 8 }}>▾ {titulo}</div>
    {children}
  </div>
);

export const EscenaRed: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const tGet = momento(ID, 'Y si un cliente');
  const tPriv = momento(ID, 'La privacidad');
  const o = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) } as const;
  const panel = interpolate(frame, [4, 22], [0, 1], o);
  const fase2 = interpolate(t, [tGet - 0.2, tGet + 0.3], [0, 1], o);
  const pulso = (desde: number) => interpolate(t, [desde, desde + 0.4], [0, 1], o) * (1 - fase2);
  const b = G.concurrenciaB;
  const ancho = 980;

  const filas = [
    { nombre: 'reservas', metodo: 'POST', estado: 409, color: '#f28b82', visible: 1, sel: 1 - fase2 },
    { nombre: 'reservas', metodo: 'GET', estado: 200, color: DT.texto, visible: fase2, sel: fase2 }
  ];

  return (
    <Fondo>
      <Rotulo capitulo="Demo" titulo={fase2 < 0.5 ? 'e · La respuesta 409 en la red' : 'f · GET /api/reservas sin datos ajenos'} />
      <div style={{ position: 'absolute', left: (1920 - ANCHO_NAV) / 2, top: 96 }}>
        <Navegador ancho={ANCHO_NAV} url="localhost:5173/reservar">
          <AbsoluteFill style={{ filter: `brightness(${1 - 0.35 * panel})` }}>
            <Freeze frame={0}>
              <Video src={staticFile(b.archivo)} trimBefore={Math.round((b.marcas.fin - 1) * FPS)} muted style={{ width: 1920, height: 1080 }} />
            </Freeze>
          </AbsoluteFill>
          {/* DevTools acoplado a la derecha */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: ancho / (ANCHO_NAV / 1920),
              height: 1080,
              transform: `translateX(${(1 - panel) * 110}%)`,
              background: DT.fondo,
              borderLeft: `2px solid ${DT.borde}`,
              display: 'flex',
              flexDirection: 'column',
              fontFamily: MONO,
              fontSize: 25,
              color: DT.texto
            }}
          >
            <div style={{ display: 'flex', gap: 34, padding: '0 22px', height: 58, alignItems: 'center', background: DT.panel, borderBottom: `1px solid ${DT.borde}`, fontFamily: TEXTO, fontSize: 22, color: DT.tenue }}>
              {['Elements', 'Console', 'Sources', 'Network', 'Application'].map((p) => (
                <div key={p} style={{ color: p === 'Network' ? DT.azul : DT.tenue, borderBottom: p === 'Network' ? `3px solid ${DT.azul}` : 'none', padding: '14px 0' }}>
                  {p}
                </div>
              ))}
            </div>
            <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
              {/* Lista de pedidos */}
              <div style={{ width: 330, borderRight: `1px solid ${DT.borde}`, fontSize: 22 }}>
                <div style={{ display: 'flex', padding: '10px 14px', color: DT.tenue, borderBottom: `1px solid ${DT.borde}`, fontFamily: TEXTO, fontSize: 18 }}>
                  <span style={{ flex: 1 }}>Name</span>
                  <span style={{ width: 80 }}>Method</span>
                  <span style={{ width: 60 }}>Status</span>
                </div>
                {filas.map((f, k) => (
                  <div key={k} style={{ display: 'flex', padding: '10px 14px', opacity: f.visible, background: `rgba(138,180,248,${0.22 * f.sel})`, color: f.color }}>
                    <span style={{ flex: 1 }}>{f.nombre}</span>
                    <span style={{ width: 80 }}>{f.metodo}</span>
                    <span style={{ width: 60 }}>{f.estado}</span>
                  </div>
                ))}
              </div>
              {/* Detalle */}
              <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, padding: '14px 10px', opacity: 1 - fase2 }}>
                  <Seccion titulo="General">
                    <Linea k="Request URL" v={`http://localhost:5173${red409.url}`} />
                    <Linea k="Request Method" v={red409.metodo} />
                    <div style={{ padding: '2px 10px 2px 14px', borderRadius: 6, background: `rgba(206,19,32,${0.45 * pulso(1.2)})` }}>
                      <span style={{ color: DT.clave }}>Status Code</span>
                      <span style={{ color: DT.tenue }}>: </span>
                      <span style={{ color: '#f28b82' }}>● 409 Conflict</span>
                    </div>
                  </Seccion>
                  <Seccion titulo="Request Headers">
                    <Linea k="content-type" v={red409.headersPedido['content-type']} />
                    <Linea k="x-usuario-id" v={red409.headersPedido['x-usuario-id']} resaltar={pulso(3)} />
                  </Seccion>
                  <Seccion titulo="Payload">
                    {Object.entries(red409.pedido).map(([k, v]) => (
                      <Linea key={k} k={k} v={v} sangria={10} resaltar={k === 'mesaId' || k === 'horaInicio' || k === 'fecha' ? pulso(4.2) * 0.6 : 0} />
                    ))}
                  </Seccion>
                  <Seccion titulo="Response">
                    <Linea k="success" v={red409.respuesta.success} resaltar={pulso(5.8)} sangria={10} />
                    <Linea k="message" v={red409.respuesta.message} resaltar={pulso(5.8)} sangria={10} />
                  </Seccion>
                </div>
                <div style={{ position: 'absolute', inset: 0, padding: '14px 10px', opacity: fase2 }}>
                  <Seccion titulo="Preview · GET /api/reservas · x-usuario-id: 1">
                    {DEL_DIA.map((r, k) => {
                      const ajena = r.clienteId === null;
                      const res = interpolate(t, [tGet + 1.5 + k * 0.6, tGet + 2 + k * 0.6], [0, 1], o);
                      return (
                        <div key={r.id} style={{ marginBottom: 10 }}>
                          <div style={{ padding: '2px 14px', color: DT.tenue }}>
                            ▾ {k}: {'{'}id: {r.id}, mesaId: {r.mesaId}, horaInicio: "{r.horaInicio}"{'}'}
                            <span style={{ marginLeft: 14, fontFamily: TEXTO, fontSize: 19, fontWeight: 600, color: ajena ? '#f28b82' : '#81c995', opacity: res }}>
                              {ajena ? '← ajena' : '← propia'}
                            </span>
                          </div>
                          <Linea k="clienteId" v={r.clienteId} sangria={26} resaltar={res * 0.8} color={ajena ? C.rojo : C.ok} />
                          <Linea k="nombre" v={r.nombre} sangria={26} resaltar={res * 0.8} color={ajena ? C.rojo : C.ok} />
                          <Linea k="telefono" v={r.telefono} sangria={26} resaltar={res * 0.8} color={ajena ? C.rojo : C.ok} />
                        </div>
                      );
                    })}
                  </Seccion>
                </div>
              </div>
            </div>
          </div>
        </Navegador>
      </div>
      {t > tPriv ? (
        <div style={{ position: 'absolute', left: 260, top: 520, opacity: interpolate(t, [tPriv, tPriv + 0.4], [0, 1], o), transform: `scale(${interpolate(t, [tPriv, tPriv + 0.4], [0.9, 1], o)})` }}>
          <Pildora color={C.tinta} style={{ fontSize: 30, padding: '16px 28px', flexDirection: 'column', alignItems: 'flex-start', borderRadius: 18 }}>
            <span style={{ color: '#ff8a92', fontSize: 20, letterSpacing: 2 }}>PRIVACIDAD</span>
            <span>Se resuelve en el servidor,</span>
            <span>no escondiendo datos en la pantalla</span>
          </Pildora>
        </div>
      ) : null}
    </Fondo>
  );
};
