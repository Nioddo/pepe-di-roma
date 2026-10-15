import { useRef, type KeyboardEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { getPedidos } from '../../services/pedidosService';
import { getReservas } from '../../services/reservasService';
import { getUsuarios } from '../../services/usuariosService';
import { getMesas } from '../../services/mesasService';
import { fechaLarga, formatearPrecio, hoyISO, nombreDeMes, plural } from '../../utils/formato';
import { ESTADO_PEDIDO, ESTADO_RESERVA, METODO_PAGO, MODALIDAD, textoEstadoPedido } from '../../utils/estados';
import { DIAS_CORTOS, DIAS_SEMANA, diaSemana, mesAnterior, mesSiguiente, resumen } from '../../utils/metricas';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { Button } from '../../components/Button/Button';
import { Badge } from '../../components/Badge/Badge';
import { Icon } from '../../components/Icon/Icon';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { Loading, SkeletonBlock } from '../../components/Skeleton/Skeleton';
import type { Pedido, Reserva } from '../../types';
import './AdminHistory.css';

const cargar = () => Promise.all([getPedidos(), getReservas(), getUsuarios(), getMesas()]);

const dos = (n: number) => String(n).padStart(2, '0');
const sumarDias = (fecha: string, dias: number) => {
  const d = new Date(`${fecha}T12:00:00`);
  d.setDate(d.getDate() + dias);
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;
};
const telHref = (t: string) => `tel:${t.replace(/[^\d+]/g, '')}`;

/** Historial: el mes en un calendario, y el detalle de reservas y pedidos del día que se elija. */
export function AdminHistory() {
  const { data, loading, error, recargar } = useApi(cargar);
  const [pedidos, reservas, usuarios, mesas] = data ?? [[], [], [], []];
  const [params, setParams] = useSearchParams();
  const hoy = hoyISO();
  const dia = /^\d{4}-\d{2}-\d{2}$/.test(params.get('dia') ?? '') ? (params.get('dia') as string) : hoy;
  const mes = dia.slice(0, 7);
  const refs = useRef(new Map<string, HTMLButtonElement>());

  const elegir = (fecha: string, enfocar = false) => {
    setParams({ dia: fecha }, { replace: true });
    if (enfocar) requestAnimationFrame(() => refs.current.get(fecha)?.focus());
  };

  const emailDe = (id: number) => usuarios.find((u) => u.id === id)?.email ?? `Cliente #${id}`;
  const mesaDe = (id: number | null) => (id === null ? 'Sin mesa' : `Mesa ${mesas.find((m) => m.id === id)?.numero ?? id}`);

  // movimiento de cada día del mes
  const porDia = new Map<string, { reservas: Reserva[]; pedidos: Pedido[] }>();
  const delDia = (f: string) => {
    let d = porDia.get(f);
    if (!d) {
      d = { reservas: [], pedidos: [] };
      porDia.set(f, d);
    }
    return d;
  };
  reservas.filter((r) => r.fecha.startsWith(mes)).forEach((r) => delDia(r.fecha).reservas.push(r));
  pedidos.filter((p) => (p.creadoEn ?? '').startsWith(mes)).forEach((p) => delDia((p.creadoEn as string).slice(0, 10)).pedidos.push(p));

  const [anio, m] = mes.split('-').map(Number);
  const diasDelMes = new Date(anio, m, 0).getDate();
  const vacios = diaSemana(`${mes}-01`);
  const celdas = [...Array.from({ length: vacios }, () => null), ...Array.from({ length: diasDelMes }, (_, i) => `${mes}-${dos(i + 1)}`)];
  const r = resumen(pedidos, reservas, mes);

  const seleccion = porDia.get(dia) ?? { reservas: [], pedidos: [] };
  const reservasDia = seleccion.reservas.slice().sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
  const pedidosDia = seleccion.pedidos.slice().sort((a, b) => (a.creadoEn ?? '').localeCompare(b.creadoEn ?? ''));
  const ventasDia = pedidosDia.filter((p) => p.estado !== 'CANCELADO').reduce((n, p) => n + p.precioTotal, 0);
  const personasDia = reservasDia.filter((x) => x.estado !== 'CANCELADA').reduce((n, x) => n + x.cantidadIntegrantes, 0);

  // flechas: un día a los costados, una semana arriba y abajo (patrón de grilla)
  const alTeclear = (e: KeyboardEvent<HTMLButtonElement>, fecha: string) => {
    const paso = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
    if (!paso) return;
    e.preventDefault();
    elegir(sumarDias(fecha, paso), true);
  };

  let cuerpo;
  if (loading) {
    cuerpo = (
      <Loading label="Cargando el historial…">
        <div className="historial">
          <SkeletonBlock height={460} />
          <SkeletonBlock height={460} />
        </div>
      </Loading>
    );
  } else if (error) {
    cuerpo = <EmptyState title="No pudimos cargar el historial" text={error} action={<Button onClick={recargar}>Reintentar</Button>} />;
  } else {
    cuerpo = (
      <div className="historial">
        <section className="calendario" aria-labelledby="mes-titulo">
          <div className="calendario__cabecera">
            <button type="button" className="calendario__nav" aria-label={`Ir a ${nombreDeMes(mesAnterior(mes))}`} onClick={() => elegir(`${mesAnterior(mes)}-01`)}>
              <Icon name="prev" size={18} />
            </button>
            <h2 id="mes-titulo" aria-live="polite">
              {nombreDeMes(mes)}
            </h2>
            <button type="button" className="calendario__nav" aria-label={`Ir a ${nombreDeMes(mesSiguiente(mes))}`} onClick={() => elegir(`${mesSiguiente(mes)}-01`)}>
              <Icon name="next" size={18} />
            </button>
            {dia !== hoy && (
              <Button variant="ghost" size="sm" onClick={() => elegir(hoy, true)}>
                Hoy
              </Button>
            )}
          </div>

          <p className="calendario__resumen">
            {plural(r.reservas, 'reserva')} · {plural(r.personas, 'persona')} · {plural(r.pedidos, 'pedido')} · {formatearPrecio(r.facturacion)} vendidos
          </p>

          <div key={mes} className="calendario__grilla" role="grid" aria-label={`Calendario de ${nombreDeMes(mes)}`}>
            <div role="row" className="calendario__semana">
              {DIAS_CORTOS.map((d, i) => (
                <span key={d} role="columnheader" className="calendario__dia-semana" aria-label={DIAS_SEMANA[i]}>
                  {d}
                </span>
              ))}
            </div>
            {Array.from({ length: Math.ceil(celdas.length / 7) }, (_, fila) => (
              <div role="row" className="calendario__semana" key={fila}>
                {celdas.slice(fila * 7, fila * 7 + 7).map((fecha, i) => {
                  if (!fecha) return <span key={`v${i}`} role="gridcell" className="calendario__vacio" />;
                  const mov = porDia.get(fecha);
                  const nR = mov?.reservas.filter((x) => x.estado !== 'CANCELADA').length ?? 0;
                  const nP = mov?.pedidos.filter((x) => x.estado !== 'CANCELADO').length ?? 0;
                  return (
                    <span key={fecha} role="gridcell">
                      <button
                        ref={(el) => {
                          if (el) refs.current.set(fecha, el);
                          else refs.current.delete(fecha);
                        }}
                        type="button"
                        className="calendario__dia"
                        aria-pressed={fecha === dia}
                        aria-current={fecha === hoy ? 'date' : undefined}
                        aria-label={`${fechaLarga(fecha)}: ${plural(nR, 'reserva')}, ${plural(nP, 'pedido')}`}
                        tabIndex={fecha === dia ? 0 : -1}
                        onClick={() => elegir(fecha)}
                        onKeyDown={(e) => alTeclear(e, fecha)}
                        data-vacio={nR + nP === 0 || undefined}
                      >
                        <span className="calendario__numero">{Number(fecha.slice(8))}</span>
                        {nR > 0 && <span className="calendario__cuenta calendario__cuenta--reservas">{nR} res.</span>}
                        {nP > 0 && <span className="calendario__cuenta calendario__cuenta--pedidos">{nP} ped.</span>}
                      </button>
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
          <p className="calendario__ayuda">Con el teclado: flechas para moverte de día, arriba y abajo para cambiar de semana.</p>
        </section>

        <section key={dia} className="jornada" aria-labelledby="dia-titulo" aria-live="polite">
          <h2 id="dia-titulo" className="jornada__titulo">
            {fechaLarga(dia)}
          </h2>
          <p className="jornada__resumen">
            {plural(personasDia, 'persona')} con reserva · {formatearPrecio(ventasDia)} en pedidos
          </p>

          <h3 className="jornada__seccion">
            Reservas <span className="count">{reservasDia.filter((x) => x.estado !== 'CANCELADA').length}</span>
            {reservasDia.some((x) => x.estado === 'CANCELADA') && (
              <span className="jornada__canceladas">+ {plural(reservasDia.filter((x) => x.estado === 'CANCELADA').length, 'cancelada')}</span>
            )}
          </h3>
          {reservasDia.length === 0 ? (
            <p className="empty-inline">No hubo reservas este día.</p>
          ) : (
            <ul className="jornada__lista" role="list">
              {reservasDia.map((x) => (
                <li key={x.id}>
                  <details className="registro">
                    <summary>
                      <span className="registro__hora">{x.horaInicio}</span>
                      <span className="registro__quien">
                        {x.nombre ?? emailDe(x.clienteId)}
                        <span className="cell-note">
                          {plural(x.cantidadIntegrantes, 'persona')} · {mesaDe(x.mesaId)}
                        </span>
                      </span>
                      <Badge tono={ESTADO_RESERVA[x.estado].tono}>{ESTADO_RESERVA[x.estado].texto}</Badge>
                    </summary>
                    <dl className="registro__detalle">
                      <div>
                        <dt>Reserva</dt>
                        <dd>#{x.id}, de {x.horaInicio} a 2 h más tarde</dd>
                      </div>
                      <div>
                        <dt>Teléfono</dt>
                        <dd>{x.telefono ? <a href={telHref(x.telefono)}>{x.telefono}</a> : 'Sin dato'}</dd>
                      </div>
                      <div>
                        <dt>Cuenta</dt>
                        <dd>{emailDe(x.clienteId)}</dd>
                      </div>
                    </dl>
                  </details>
                </li>
              ))}
            </ul>
          )}

          <h3 className="jornada__seccion">
            Pedidos <span className="count">{pedidosDia.filter((p) => p.estado !== 'CANCELADO').length}</span>
            {pedidosDia.some((p) => p.estado === 'CANCELADO') && (
              <span className="jornada__canceladas">+ {plural(pedidosDia.filter((p) => p.estado === 'CANCELADO').length, 'cancelado')}</span>
            )}
          </h3>
          {pedidosDia.length === 0 ? (
            <p className="empty-inline">No hubo pedidos este día.</p>
          ) : (
            <ul className="jornada__lista" role="list">
              {pedidosDia.map((p) => (
                <li key={p.id}>
                  <details className="registro">
                    <summary>
                      <span className="registro__hora">{(p.creadoEn ?? 'T--:--').split('T')[1]}</span>
                      <span className="registro__quien">
                        #{p.id} · {formatearPrecio(p.precioTotal)}
                        <span className="cell-note">
                          {MODALIDAD[p.modalidad]} · {emailDe(p.clienteId)}
                        </span>
                      </span>
                      <Badge tono={ESTADO_PEDIDO[p.estado].tono}>{textoEstadoPedido(p.estado, p.modalidad)}</Badge>
                    </summary>
                    <dl className="registro__detalle">
                      <div>
                        <dt>Lleva</dt>
                        <dd>
                          <ul className="cell-list">
                            {p.items.map((it) => (
                              <li key={it.id}>
                                {it.cantidad}× {it.nombre} · {formatearPrecio(it.cantidad * it.precioUnitario)}
                              </li>
                            ))}
                          </ul>
                        </dd>
                      </div>
                      <div>
                        <dt>Pago</dt>
                        <dd>
                          {METODO_PAGO[p.metodoPago]} · {p.pagoRecibido ? 'pagado' : 'sin pagar'}
                        </dd>
                      </div>
                      {p.direccion && (
                        <div>
                          <dt>Envío a</dt>
                          <dd>{p.direccion}</dd>
                        </div>
                      )}
                      <div>
                        <dt>Teléfono</dt>
                        <dd>{p.telefono ? <a href={telHref(p.telefono)}>{p.telefono}</a> : 'Sin dato'}</dd>
                      </div>
                      {p.indicaciones && (
                        <div>
                          <dt>Indicaciones</dt>
                          <dd>{p.indicaciones}</dd>
                        </div>
                      )}
                    </dl>
                  </details>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Historial" lead="Elegí un día en el calendario para ver sus reservas y pedidos, y abrí cada uno para ver el detalle." compact />
      <div className="wrap page">{cuerpo}</div>
    </>
  );
}
