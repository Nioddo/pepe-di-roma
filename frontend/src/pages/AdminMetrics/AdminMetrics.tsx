import { useState, type CSSProperties, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { getPedidos } from '../../services/pedidosService';
import { getReservas } from '../../services/reservasService';
import { getCalificaciones } from '../../services/calificacionesService';
import { getPlatos } from '../../services/platosService';
import { getUsuarios } from '../../services/usuariosService';
import { formatearFecha, formatearPrecio, hoyISO, montoCorto, nombreDeMes, plural } from '../../utils/formato';
import { METODO_PAGO, MODALIDAD } from '../../utils/estados';
import {
  clientesFrecuentes,
  DIAS_CORTOS,
  DIAS_SEMANA,
  HORAS,
  mapaDeReservas,
  mesAnterior,
  mesesConDatos,
  platosMasPedidos,
  platosPorOpinion,
  porMedioDePago,
  porModalidad,
  promediosEncuesta,
  resumen,
  variacion,
  ventasPorDia,
  type Periodo
} from '../../utils/metricas';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { SelectField } from '../../components/Field/Field';
import { Button } from '../../components/Button/Button';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { Icon } from '../../components/Icon/Icon';
import { ArchScore } from '../../components/ArchRating/ArchRating';
import { Loading, SkeletonBlock } from '../../components/Skeleton/Skeleton';
import './AdminMetrics.css';

const cargar = () => Promise.all([getPedidos(), getReservas(), getCalificaciones(), getPlatos(), getUsuarios()]);

const porcentaje = (x: number) => `${Math.round(x * 100)} %`;
const unoDecimal = (x: number) => x.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** Escala de un solo tono (validada con el script de dataviz: monótona, clara de punta a punta legible sobre blanco). */
const ESCALA = ['#EC9A9E', '#DC5F68', '#CE1320', '#9E0D17', '#650610'];

/* ---------- piezas ---------- */

function Panel({ titulo, bajada, children, ancho = false, tabla }: { titulo: string; bajada?: string; children: ReactNode; ancho?: boolean; tabla?: ReactNode }) {
  return (
    <section className={`metrica${ancho ? ' metrica--ancha' : ''}`} aria-label={titulo}>
      <header className="metrica__cabecera">
        <h2>{titulo}</h2>
        {bajada && <p>{bajada}</p>}
      </header>
      {children}
      {tabla && (
        <details className="metrica__tabla">
          <summary>Ver como tabla</summary>
          {tabla}
        </details>
      )}
    </section>
  );
}

interface TileProps {
  label: string;
  valor: string;
  delta: number | null;
  /** Si subir es bueno (ventas) o malo (cancelaciones). */
  subirEsBueno?: boolean;
  comparado: string;
}

function Tile({ label, valor, delta, subirEsBueno = true, comparado }: TileProps) {
  const sube = delta !== null && delta > 0.005;
  const baja = delta !== null && delta < -0.005;
  const bueno = (sube && subirEsBueno) || (baja && !subirEsBueno);
  const tono = !sube && !baja ? 'igual' : bueno ? 'bien' : 'mal';
  return (
    <div className="tile">
      <p className="tile__label">{label}</p>
      <p className="tile__valor">{valor}</p>
      {delta !== null && (
        <p className="tile__delta" data-tono={tono}>
          {(sube || baja) && <Icon name={sube ? 'up' : 'down'} size={14} />}
          {sube ? '+' : ''}
          {Math.round(delta * 100)} % vs {comparado}
        </p>
      )}
    </div>
  );
}

/** Barras horizontales de una serie: la primera en rojo (es la noticia), el resto en gris. */
function Barras({ filas, max }: { filas: { clave: string | number; nombre: string; valor: number; texto: string; tip: string }[]; max: number }) {
  return (
    <ol className="barras" role="list">
      {filas.map((f, i) => (
        <li key={f.clave} className="barras__fila">
          <span className="barras__nombre">{f.nombre}</span>
          <span className="barras__pista">
            <span
              className="barras__barra"
              data-destacada={i === 0 || undefined}
              style={{ '--ancho': `${max ? (f.valor / max) * 100 : 0}%` } as CSSProperties}
              tabIndex={0}
              data-tip={f.tip}
              aria-label={f.tip}
            />
            <span className="barras__valor">{f.texto}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

/* ---------- pantalla ---------- */

export function AdminMetrics() {
  const { data, loading, error, recargar } = useApi(cargar);
  const [pedidos, reservas, calificaciones, platos, usuarios] = data ?? [[], [], [], [], []];
  const meses = mesesConDatos(pedidos, reservas);
  const mesActual = hoyISO().slice(0, 7);
  const [elegido, setPeriodo] = useState<Periodo | null>(null);
  const periodo: Periodo = elegido ?? (meses.includes(mesActual) ? mesActual : (meses[0] ?? 'todo'));
  const esMes = periodo !== 'todo';
  const anterior = esMes ? mesAnterior(periodo) : null;

  let cuerpo;
  if (loading) {
    cuerpo = (
      <Loading label="Calculando las métricas…">
        <div className="metricas">
          <SkeletonBlock height={120} />
          <SkeletonBlock height={340} />
          <SkeletonBlock height={340} />
        </div>
      </Loading>
    );
  } else if (error) {
    cuerpo = <EmptyState title="No pudimos calcular las métricas" text={error} action={<Button onClick={recargar}>Reintentar</Button>} />;
  } else if (meses.length === 0) {
    cuerpo = <EmptyState title="Todavía no hay movimiento" text="Cuando haya pedidos y reservas, acá vas a ver qué se vende más y cuándo viene la gente." />;
  } else {
    // el mes en curso se compara con los mismos días del mes anterior, no con el mes entero
    const enCurso = periodo === mesActual;
    const hastaDia = enCurso ? Number(hoyISO().slice(8, 10)) : undefined;
    const r = resumen(pedidos, reservas, periodo, hastaDia);
    const ra = anterior ? resumen(pedidos, reservas, anterior, hastaDia) : null;
    const nombreAnterior = anterior ? nombreDeMes(anterior).split(' de ')[0] : '';
    const comparado = enCurso ? `el 1 al ${hastaDia} de ${nombreAnterior}` : nombreAnterior;
    const top = platosMasPedidos(pedidos, periodo);
    const top8 = top.slice(0, 8);
    const mapa = mapaDeReservas(reservas, periodo);
    const diaPico = mapa.porDia.indexOf(Math.max(...mapa.porDia));
    const horaPico = mapa.porHora.indexOf(Math.max(...mapa.porHora));
    const ventas = esMes ? ventasPorDia(pedidos, periodo) : [];
    const maxVenta = Math.max(0, ...ventas.map((v) => v.monto));
    const mejorDia = ventas.find((v) => v.monto === maxVenta && maxVenta > 0);
    const modalidades = porModalidad(pedidos, periodo);
    const pagos = porMedioDePago(pedidos, periodo);
    const opinados = platosPorOpinion(calificaciones, platos, periodo);
    const encuesta = promediosEncuesta(calificaciones, periodo);
    const frecuentes = clientesFrecuentes(pedidos, reservas, usuarios, periodo).slice(0, 5);
    const paso = (v: number) => (v === 0 ? -1 : Math.min(ESCALA.length - 1, Math.ceil((v / (mapa.maximo || 1)) * ESCALA.length) - 1));

    cuerpo = (
      <div className="metricas">
        {/* ---------- los números de arriba ---------- */}
        {enCurso && <p className="metricas__nota">Mes en curso: del 1 al {hastaDia}, comparado con los mismos días del mes anterior.</p>}
        <div className="tiles" role="group" aria-label="Resumen del período">
          <Tile label="Ventas" valor={montoCorto(r.facturacion)} delta={ra && variacion(r.facturacion, ra.facturacion)} comparado={comparado} />
          <Tile label="Pedidos" valor={String(r.pedidos)} delta={ra && variacion(r.pedidos, ra.pedidos)} comparado={comparado} />
          <Tile label="Ticket promedio" valor={formatearPrecio(r.ticket)} delta={ra && variacion(r.ticket, ra.ticket)} comparado={comparado} />
          <Tile label="Reservas" valor={String(r.reservas)} delta={ra && variacion(r.reservas, ra.reservas)} comparado={comparado} />
          <Tile label="Personas que vinieron con reserva" valor={String(r.personas)} delta={ra && variacion(r.personas, ra.personas)} comparado={comparado} />
          <Tile
            label="Reservas canceladas"
            valor={porcentaje(r.cancelacion)}
            delta={ra && ra.cancelacion ? variacion(r.cancelacion, ra.cancelacion) : null}
            subirEsBueno={false}
            comparado={comparado}
          />
        </div>

        {/* ---------- platos más pedidos ---------- */}
        <Panel
          titulo="Platos más pedidos"
          bajada={top[0] ? `${top[0].nombre}: ${plural(top[0].unidades, 'unidad', 'unidades')} en ${plural(top[0].pedidos, 'pedido')}.` : 'Todavía no hay pedidos en este período.'}
          tabla={
            <table className="tabla-datos">
              <thead>
                <tr><th scope="col">Plato</th><th scope="col">Unidades</th><th scope="col">Pedidos</th><th scope="col">Vendido</th></tr>
              </thead>
              <tbody>
                {top.map((p) => (
                  <tr key={p.platoId}><td>{p.nombre}</td><td>{p.unidades}</td><td>{p.pedidos}</td><td>{formatearPrecio(p.monto)}</td></tr>
                ))}
              </tbody>
            </table>
          }
        >
          {top8.length > 0 && (
            <Barras
              max={top8[0].unidades}
              filas={top8.map((p) => ({ clave: p.platoId, nombre: p.nombre, valor: p.unidades, texto: `${p.unidades} u.`, tip: `${p.nombre}: ${p.unidades} unidades, ${formatearPrecio(p.monto)}` }))}
            />
          )}
        </Panel>

        {/* ---------- cuándo se reserva ---------- */}
        <Panel
          titulo="Cuándo se reserva"
          bajada={mapa.maximo ? `El día con más reservas es el ${DIAS_SEMANA[diaPico].toLowerCase()} y el horario más pedido, las ${HORAS[horaPico]} h.` : 'Todavía no hay reservas en este período.'}
          tabla={
            <table className="tabla-datos">
              <thead>
                <tr><th scope="col">Día</th>{HORAS.map((h) => <th key={h} scope="col">{h} h</th>)}<th scope="col">Total</th></tr>
              </thead>
              <tbody>
                {DIAS_SEMANA.map((d, i) => (
                  <tr key={d}><th scope="row">{d}</th>{mapa.celdas[i].map((v, h) => <td key={h}>{v}</td>)}<td>{mapa.porDia[i]}</td></tr>
                ))}
              </tbody>
            </table>
          }
        >
          <div className="calor" role="img" aria-label={`Mapa de reservas por día y hora. Pico: ${DIAS_SEMANA[diaPico]} a las ${HORAS[horaPico]} h.`}>
            <span aria-hidden="true" />
            {HORAS.map((h) => (
              <span key={h} className="calor__hora" aria-hidden="true">
                {h}
              </span>
            ))}
            {DIAS_CORTOS.map((d, i) => [
              <span key={`d${i}`} className="calor__dia" aria-hidden="true">
                {d}
              </span>,
              ...mapa.celdas[i].map((v, h) => {
                const s = paso(v);
                return (
                  <span
                    key={`${i}-${h}`}
                    className="calor__celda"
                    data-vacia={v === 0 || undefined}
                    data-oscura={s >= 2 || undefined}
                    style={s >= 0 ? ({ '--fondo': ESCALA[s] } as CSSProperties) : undefined}
                    data-tip={`${DIAS_SEMANA[i]} ${HORAS[h]} h: ${plural(v, 'reserva')}`}
                  >
                    {v > 0 ? v : ''}
                  </span>
                );
              })
            ])}
          </div>
          <div className="calor__escala" aria-hidden="true">
            <span>Menos</span>
            {ESCALA.map((c) => (
              <i key={c} style={{ background: c }} />
            ))}
            <span>Más</span>
          </div>
        </Panel>

        {/* ---------- ventas por día ---------- */}
        {esMes && (
          <Panel
            ancho
            titulo={`Ventas de ${nombreDeMes(periodo).split(' de ')[0]}, día por día`}
            bajada={mejorDia ? `El mejor día fue el ${formatearFecha(mejorDia.fecha)}: ${formatearPrecio(mejorDia.monto)} en ${plural(mejorDia.pedidos, 'pedido')}.` : 'Todavía no hay ventas este mes.'}
            tabla={
              <table className="tabla-datos">
                <thead>
                  <tr><th scope="col">Día</th><th scope="col">Pedidos</th><th scope="col">Ventas</th></tr>
                </thead>
                <tbody>
                  {ventas.filter((v) => v.pedidos > 0).map((v) => (
                    <tr key={v.fecha}><td>{formatearFecha(v.fecha)}</td><td>{v.pedidos}</td><td>{formatearPrecio(v.monto)}</td></tr>
                  ))}
                </tbody>
              </table>
            }
          >
            <div className="columnas">
              <div className="columnas__eje" aria-hidden="true">
                <span>{montoCorto(maxVenta)}</span>
                <span>{montoCorto(maxVenta / 2)}</span>
                <span>$ 0</span>
              </div>
              <ol className="columnas__plot" role="list" style={{ '--n': ventas.length } as CSSProperties}>
                {ventas.map((v) => {
                  const dia = Number(v.fecha.slice(8));
                  return (
                    <li key={v.fecha} className="columnas__col">
                      <span
                        className="columnas__pista"
                        tabIndex={v.pedidos ? 0 : -1}
                        data-tip={`${formatearFecha(v.fecha)}: ${formatearPrecio(v.monto)} · ${plural(v.pedidos, 'pedido')}`}
                        aria-label={`${formatearFecha(v.fecha)}: ${formatearPrecio(v.monto)}, ${plural(v.pedidos, 'pedido')}`}
                      >
                        <span
                          className="columnas__barra"
                          data-mejor={v === mejorDia || undefined}
                          style={{ '--alto': `${maxVenta ? (v.monto / maxVenta) * 100 : 0}%` } as CSSProperties}
                        />
                      </span>
                      <span className="columnas__dia" aria-hidden="true">
                        {dia === 1 || dia % 5 === 0 ? dia : ''}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          </Panel>
        )}

        {/* ---------- cómo compran ---------- */}
        <Panel
          titulo="Cómo compran"
          bajada={pagos[0] ? `El medio de pago más usado es ${METODO_PAGO[pagos[0].clave].toLowerCase()} (${porcentaje(pagos[0].parte)}).` : undefined}
          tabla={
            <table className="tabla-datos">
              <thead>
                <tr><th scope="col">Modalidad o pago</th><th scope="col">Pedidos</th><th scope="col">Parte</th><th scope="col">Ventas</th></tr>
              </thead>
              <tbody>
                {[...modalidades.map((m) => ({ ...m, nombre: MODALIDAD[m.clave] })), ...pagos.map((p) => ({ ...p, nombre: METODO_PAGO[p.clave] }))].map((f) => (
                  <tr key={f.nombre}><td>{f.nombre}</td><td>{f.cantidad}</td><td>{porcentaje(f.parte)}</td><td>{formatearPrecio(f.monto)}</td></tr>
                ))}
              </tbody>
            </table>
          }
        >
          <h3 className="metrica__subtitulo">Retiro o envío</h3>
          <Barras max={1} filas={modalidades.map((m) => ({ clave: m.clave, nombre: MODALIDAD[m.clave], valor: m.parte, texto: porcentaje(m.parte), tip: `${MODALIDAD[m.clave]}: ${plural(m.cantidad, 'pedido')}` }))} />
          <h3 className="metrica__subtitulo">Medio de pago</h3>
          <Barras max={1} filas={pagos.map((p) => ({ clave: p.clave, nombre: METODO_PAGO[p.clave], valor: p.parte, texto: porcentaje(p.parte), tip: `${METODO_PAGO[p.clave]}: ${plural(p.cantidad, 'pedido')}` }))} />
          <p className="metrica__nota">Recordá que el efectivo tiene 10 % de descuento en el local.</p>
        </Panel>

        {/* ---------- opiniones ---------- */}
        <Panel
          titulo="Lo que dicen las opiniones"
          bajada={encuesta.total ? `${plural(encuesta.total, 'opinión', 'opiniones')} en el período.` : undefined}
          tabla={
            opinados.length > 0 && (
              <table className="tabla-datos">
                <thead>
                  <tr><th scope="col">Plato</th><th scope="col">Promedio</th><th scope="col">Opiniones</th></tr>
                </thead>
                <tbody>
                  {opinados.map((p) => (
                    <tr key={p.platoId}><td>{p.nombre}</td><td>{unoDecimal(p.promedio)}</td><td>{p.opiniones}</td></tr>
                  ))}
                </tbody>
              </table>
            )
          }
        >
          {encuesta.total === 0 ? (
            <p className="empty-inline">
              Todavía no hay opiniones en este período. Cuando los clientes completen la encuesta, acá vas a ver el plato peor y mejor calificado y cómo puntúan la atención y el lugar.
            </p>
          ) : (
            <>
              {opinados.length > 0 ? (
                <div className="opinados">
                  <div className="opinados__caso" data-tono="peor">
                    <p className="tile__label">Plato con peor opinión</p>
                    <p className="opinados__nombre">{opinados[0].nombre}</p>
                    <p className="opinados__puntos">
                      <ArchScore puntaje={opinados[0].promedio} /> {unoDecimal(opinados[0].promedio)} · {plural(opinados[0].opiniones, 'opinión', 'opiniones')}
                    </p>
                  </div>
                  {opinados.length > 1 && (
                    <div className="opinados__caso" data-tono="mejor">
                      <p className="tile__label">Plato con mejor opinión</p>
                      <p className="opinados__nombre">{opinados[opinados.length - 1].nombre}</p>
                      <p className="opinados__puntos">
                        <ArchScore puntaje={opinados[opinados.length - 1].promedio} /> {unoDecimal(opinados[opinados.length - 1].promedio)} ·{' '}
                        {plural(opinados[opinados.length - 1].opiniones, 'opinión', 'opiniones')}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="empty-inline">Las opiniones del período no dicen qué plato comieron.</p>
              )}
              <dl className="aspectos">
                {[
                  ['General', encuesta.general],
                  ['Atención', encuesta.atencion],
                  ['Platos', encuesta.comida],
                  ['El lugar', encuesta.espacio]
                ].map(([nombre, valor]) => (
                  <div key={nombre as string}>
                    <dt>{nombre as string}</dt>
                    <dd>{valor === null ? 'Sin datos' : <><ArchScore puntaje={valor as number} /> {unoDecimal(valor as number)}</>}</dd>
                  </div>
                ))}
              </dl>
            </>
          )}
        </Panel>

        {/* ---------- clientes frecuentes ---------- */}
        <Panel titulo="Clientes que más vuelven" bajada="Pedidos y reservas del período, sin contar los cancelados.">
          {frecuentes.length > 0 ? (
            <table className="tabla-datos tabla-datos--visible">
              <thead>
                <tr><th scope="col">Cliente</th><th scope="col">Pedidos</th><th scope="col">Reservas</th><th scope="col">Gastó en pedidos</th></tr>
              </thead>
              <tbody>
                {frecuentes.map((c) => (
                  <tr key={c.usuarioId}>
                    <td>
                      <strong>{c.nombre || c.email}</strong>
                      {c.nombre && <span className="cell-note">{c.email}</span>}
                    </td>
                    <td>{c.pedidos}</td>
                    <td>{c.reservas}</td>
                    <td>{formatearPrecio(c.gasto)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="empty-inline">Todavía no hay clientes en este período.</p>
          )}
        </Panel>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Métricas" lead="Qué se vende, cuándo viene la gente y qué opinan. Todo se calcula con los pedidos, las reservas y las opiniones reales." compact />
      <div className="wrap page">
        {meses.length > 0 && (
          <div className="filtros">
            <SelectField
              label="Período"
              options={[...meses.map((m) => ({ value: m, label: nombreDeMes(m) })), { value: 'todo', label: 'Todo el historial' }]}
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
            />
            <Link className="filtros__enlace" to="/admin/historial">
              Ver el día a día en el Historial
            </Link>
          </div>
        )}
        {cuerpo}
      </div>
    </>
  );
}
