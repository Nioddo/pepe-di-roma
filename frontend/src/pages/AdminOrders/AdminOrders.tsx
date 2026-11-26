import { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { useApi } from '../../hooks/useApi';
import { cambiarEstadoPedido, deletePedido, getPedidos, marcarPedidoPagado } from '../../services/pedidosService';
import { getUsuarios } from '../../services/usuariosService';
import { getPlatos } from '../../services/platosService';
import { mensajeDeError } from '../../services/api';
import { formatearFechaHora, formatearPrecio, hoyISO, plural } from '../../utils/formato';
import { Icon } from '../../components/Icon/Icon';
import { Toggle } from '../../components/Toggle/Toggle';
import { Link } from 'react-router-dom';
import { METODO_PAGO, MODALIDAD, SIGUIENTE_ESTADO, textoAvance, textoEstadoPedido } from '../../utils/estados';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { Badge } from '../../components/Badge/Badge';
import { Button } from '../../components/Button/Button';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { SkeletonList } from '../../components/Skeleton/Skeleton';
import { EditorPedido } from './EditorPedido';
import type { EstadoPedido, Pedido } from '../../types';
import './AdminOrders.css';
import './Comandas.css';

const cargar = () => Promise.all([getPedidos(), getUsuarios(), getPlatos()]);

type Vista = 'curso' | 'hoy';
const VISTAS: { value: Vista; label: string }[] = [
  { value: 'curso', label: 'En curso' },
  { value: 'hoy', label: 'Hoy' }
];

/** El recorrido de un pedido, de izquierda a derecha: cada columna tiene un solo paso siguiente. */
const ETAPAS: { estado: EstadoPedido; titulo: string; vacio: string }[] = [
  { estado: 'PENDIENTE', titulo: 'Nuevos', vacio: 'No entró ningún pedido nuevo.' },
  { estado: 'EN_PREPARACION', titulo: 'En cocina', vacio: 'La cocina está al día.' },
  { estado: 'EN_CAMINO', titulo: 'Para entregar', vacio: 'Nada esperando en el mostrador.' }
];
const CERRADOS: EstadoPedido[] = ['ENTREGADO', 'CANCELADO'];

/** Primero lo que se retira antes; los pedidos viejos sin hora, por orden de llegada. */
const porUrgencia = (a: Pedido, b: Pedido) =>
  (a.horaRetiro ?? '99').localeCompare(b.horaRetiro ?? '99') || (a.creadoEn ?? '').localeCompare(b.creadoEn ?? '') || a.id - b.id;

export function AdminOrders() {
  const toast = useToast();
  const confirmar = useConfirm();
  const { data, loading, error, recargar } = useApi(cargar);
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [editando, setEditando] = useState<number | null>(null);

  const [pedidos, usuarios, platos] = data ?? [[], [], []];
  // con meses de pedidos, acá van los que piden atención; lo anterior está en Historial
  const [vista, setVista] = useState<Vista>('curso');
  const hoy = hoyISO();
  const deHoy = (p: Pedido) => (p.creadoEn ?? '').startsWith(hoy);
  const enEtapa = (estado: EstadoPedido) => pedidos.filter((p) => p.estado === estado && (vista === 'curso' || deHoy(p))).sort(porUrgencia);
  const cerrados = vista === 'hoy' ? pedidos.filter((p) => CERRADOS.includes(p.estado) && deHoy(p)).sort((a, b) => (b.creadoEn ?? '').localeCompare(a.creadoEn ?? '')) : [];
  const enCurso = ETAPAS.reduce((n, e) => n + enEtapa(e.estado).length, 0);
  const pedidoEditado = pedidos.find((p) => p.id === editando) ?? null;
  const emailDe = (id: number) => usuarios.find((u) => u.id === id)?.email ?? `Cliente #${id}`;

  const ejecutar = async (clave: string, accion: () => Promise<string>) => {
    setOcupado(clave);
    try {
      toast.success(await accion());
    } catch (err) {
      toast.error(mensajeDeError(err));
    } finally {
      setOcupado(null);
      recargar();
    }
  };

  const avanzar = (p: Pedido) => {
    const siguiente = SIGUIENTE_ESTADO[p.estado];
    if (!siguiente) return;
    ejecutar(`avanzar-${p.id}`, async () => {
      await cambiarEstadoPedido(p.id, siguiente);
      return `Pedido #${p.id}: ${textoEstadoPedido(siguiente, p.modalidad).toLowerCase()}.`;
    });
  };

  const marcarPagado = (p: Pedido) =>
    ejecutar(`pago-${p.id}`, async () => {
      await marcarPedidoPagado(p.id);
      return `Pedido #${p.id} marcado como pagado.`;
    });

  const cancelar = async (p: Pedido) => {
    const ok = await confirmar({
      titulo: '¿Cancelar el pedido?',
      texto: `¿Seguro que querés cancelar el pedido #${p.id} de ${emailDe(p.clienteId)}?`,
      confirmar: 'Cancelar pedido',
      cancelar: 'Volver'
    });
    if (ok) ejecutar(`cancelar-${p.id}`, async () => {
      await cambiarEstadoPedido(p.id, 'CANCELADO');
      return `Pedido #${p.id} cancelado.`;
    });
  };

  const eliminar = async (p: Pedido) => {
    const ok = await confirmar({
      titulo: '¿Eliminar el pedido?',
      texto: `¿Seguro que querés eliminar el pedido #${p.id} de ${emailDe(p.clienteId)}? Se borra con todos sus ítems y no se puede deshacer.`
    });
    if (ok) ejecutar(`eliminar-${p.id}`, async () => {
      await deletePedido(p.id);
      return `Eliminaste el pedido #${p.id}.`;
    });
  };

  /** La comanda: lo que hay que leer para preparar el pedido y un solo botón grande con el paso que sigue. */
  const comanda = (p: Pedido) => {
    const avance = textoAvance(p.estado, p.modalidad);
    const cancelable = p.estado === 'PENDIENTE' || p.estado === 'EN_PREPARACION';
    const cerrado = CERRADOS.includes(p.estado);
    return (
      <li key={p.id}>
        <article className="comanda" data-estado={p.estado} data-editando={editando === p.id || undefined} aria-label={`Pedido #${p.id}`}>
          <header className="comanda__cabeza">
            <p className="comanda__hora">
              {/* los pedidos viejos no tienen hora de retiro: se ve la modalidad que tenían */}
              {p.horaRetiro ? (
                <>
                  <span className="comanda__rotulo">Retira</span>
                  {p.horaRetiro} h
                </>
              ) : (
                MODALIDAD[p.modalidad]
              )}
            </p>
            <p className="comanda__numero">
              #{p.id}
              <span>Pedido {formatearFechaHora(p.creadoEn)}</span>
            </p>
          </header>

          <p className="comanda__cliente">
            <strong>{p.nombre ?? emailDe(p.clienteId)}</strong>
            {p.nombre && <span>{emailDe(p.clienteId)}</span>}
            {p.direccion && <span>{p.direccion}</span>}
            {p.telefono && <a href={`tel:${p.telefono.replace(/[^\d+]/g, '')}`}>{p.telefono}</a>}
          </p>

          <ul className="comanda__items" role="list">
            {p.items.map((it) => (
              <li key={it.id}>
                <b>{it.cantidad}×</b>
                {it.nombre}
              </li>
            ))}
          </ul>
          {p.indicaciones && (
            <p className="comanda__nota">
              <Icon name="alert" size={14} />
              {p.indicaciones}
            </p>
          )}

          <div className="comanda__cobro">
            <p>
              <strong>{formatearPrecio(p.precioTotal)}</strong>
              <span>{METODO_PAGO[p.metodoPago]}</span>
            </p>
            {p.estado === 'CANCELADO' ? (
              <Badge tono="danger">Cancelado</Badge>
            ) : p.pagoRecibido ? (
              <Badge tono="ok">Pagado</Badge>
            ) : (
              <Button variant="secondary" size="sm" loading={ocupado === `pago-${p.id}`} onClick={() => marcarPagado(p)}>
                Cobrar
              </Button>
            )}
          </div>

          {avance && (
            <div className="comanda__avance">
              <Button loading={ocupado === `avanzar-${p.id}`} onClick={() => avanzar(p)}>
                {avance}
              </Button>
            </div>
          )}

          <div className="comanda__mas">
            <button type="button" aria-expanded={editando === p.id} onClick={() => setEditando(editando === p.id ? null : p.id)}>
              Editar
            </button>
            {cancelable && (
              <button type="button" disabled={ocupado === `cancelar-${p.id}`} onClick={() => cancelar(p)}>
                Cancelar pedido
              </button>
            )}
            {cerrado && (
              <button type="button" disabled={ocupado === `eliminar-${p.id}`} onClick={() => eliminar(p)}>
                Eliminar
              </button>
            )}
          </div>
        </article>
      </li>
    );
  };

  let contenido;
  if (loading) {
    contenido = <SkeletonList rows={3} height={72} />;
  } else if (error) {
    contenido = <EmptyState title="No pudimos cargar los pedidos" text={error} action={<Button onClick={recargar}>Reintentar</Button>} />;
  } else if (enCurso + cerrados.length === 0) {
    contenido = (
      <EmptyState
        title={vista === 'curso' ? 'No hay pedidos en curso' : 'Hoy todavía no hubo pedidos'}
        text="Los pedidos nuevos aparecen acá apenas entran. Los anteriores están en el Historial."
      />
    );
  } else {
    contenido = (
      <>
        {pedidoEditado && (
          <div className="comandas__editor">
            <EditorPedido
              key={pedidoEditado.id}
              pedido={pedidoEditado}
              platos={platos}
              onCerrar={() => setEditando(null)}
              onGuardado={() => {
                setEditando(null);
                recargar();
              }}
            />
          </div>
        )}

        <div className="comandas">
          {ETAPAS.map((etapa, i) => {
            const lista = enEtapa(etapa.estado);
            return (
              <section key={etapa.estado} className="comandas__etapa" aria-labelledby={`etapa-${etapa.estado}`}>
                <h2 id={`etapa-${etapa.estado}`} className="comandas__titulo">
                  <span className="comandas__paso" aria-hidden="true">
                    {i + 1}
                  </span>
                  {etapa.titulo}
                  <span className="comandas__cuenta">
                    {lista.length}
                    <span className="sr-only"> {lista.length === 1 ? 'pedido' : 'pedidos'}</span>
                  </span>
                </h2>
                {lista.length > 0 ? (
                  <ul className="comandas__lista" role="list">
                    {lista.map(comanda)}
                  </ul>
                ) : (
                  <p className="comandas__vacio">{etapa.vacio}</p>
                )}
              </section>
            );
          })}
        </div>

        {cerrados.length > 0 && (
          <section className="comandas__cerrados" aria-labelledby="etapa-cerrados">
            <h2 id="etapa-cerrados" className="comandas__titulo">
              Cerrados hoy
              <span className="comandas__cuenta">{cerrados.length}</span>
            </h2>
            <ul className="comandas__lista comandas__lista--fila" role="list">
              {cerrados.map(comanda)}
            </ul>
          </section>
        )}
      </>
    );
  }

  return (
    <>
      <PageHeader title="Gestión de pedidos" lead="Cada pedido avanza de izquierda a derecha: confirmalo, pasalo a la cocina y entregalo. El botón rojo es siempre el paso que sigue." compact />
      <div className="wrap page">
        <div className="filtros">
          <Toggle legend="Mostrar" options={VISTAS} value={vista} onChange={setVista} />
          {!loading && !error && (
            <p className="comandas__resumen" role="status">
              {enCurso === 0 ? 'Todo entregado' : `${plural(enCurso, 'pedido')} en curso`}
            </p>
          )}
          <Link className="filtros__enlace" to="/admin/historial">
            Ver pedidos anteriores en el Historial
          </Link>
        </div>
        {contenido}
      </div>
    </>
  );
}
