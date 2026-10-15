import { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { useApi } from '../../hooks/useApi';
import { cambiarEstadoPedido, deletePedido, getPedidos, marcarPedidoPagado } from '../../services/pedidosService';
import { getUsuarios } from '../../services/usuariosService';
import { getPlatos } from '../../services/platosService';
import { mensajeDeError } from '../../services/api';
import { formatearFechaHora, formatearPrecio, hoyISO, plural } from '../../utils/formato';
import { Toggle } from '../../components/Toggle/Toggle';
import { Link } from 'react-router-dom';
import { ESTADO_PEDIDO, METODO_PAGO, MODALIDAD, SIGUIENTE_ESTADO, textoAvance, textoEstadoPedido } from '../../utils/estados';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { DataTable, RowActions, type Columna } from '../../components/DataTable/DataTable';
import { Badge } from '../../components/Badge/Badge';
import { Button } from '../../components/Button/Button';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { SkeletonList } from '../../components/Skeleton/Skeleton';
import { EditorPedido } from './EditorPedido';
import type { EstadoPedido, Pedido } from '../../types';
import './AdminOrders.css';

const cargar = () => Promise.all([getPedidos(), getUsuarios(), getPlatos()]);

const ESTADOS = Object.keys(ESTADO_PEDIDO) as EstadoPedido[];

type Vista = 'curso' | 'hoy';
const VISTAS: { value: Vista; label: string }[] = [
  { value: 'curso', label: 'En curso' },
  { value: 'hoy', label: 'Hoy' }
];
const EN_CURSO: EstadoPedido[] = ['PENDIENTE', 'EN_PREPARACION', 'EN_CAMINO'];

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
  const ordenados = pedidos
    .filter((p) => (vista === 'curso' ? EN_CURSO.includes(p.estado) : (p.creadoEn ?? '').startsWith(hoy)))
    .sort((a, b) => (b.creadoEn ?? '').localeCompare(a.creadoEn ?? '') || b.id - a.id);
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

  const cambiarEstado = (p: Pedido, estado: EstadoPedido) =>
    ejecutar(`estado-${p.id}`, async () => {
      await cambiarEstadoPedido(p.id, estado);
      return `Pedido #${p.id}: ${textoEstadoPedido(estado, p.modalidad).toLowerCase()}.`;
    });

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

  const columnas: Columna<Pedido>[] = [
    {
      clave: 'pedido',
      titulo: 'Pedido',
      render: (p) => (
        <>
          <strong>#{p.id}</strong>
          <span className="cell-note">{formatearFechaHora(p.creadoEn)}</span>
          <span className="cell-note">{emailDe(p.clienteId)}</span>
          {p.telefono && (
            <a className="cell-note" href={`tel:${p.telefono.replace(/[^\d+]/g, '')}`}>
              {p.telefono}
            </a>
          )}
        </>
      )
    },
    {
      clave: 'detalle',
      titulo: 'Detalle',
      render: (p) => (
        <>
          <ul className="cell-list">
            {p.items.map((it) => (
              <li key={it.id}>
                {it.cantidad}× {it.nombre}
              </li>
            ))}
          </ul>
          {p.indicaciones && <span className="cell-indicacion">“{p.indicaciones}”</span>}
        </>
      )
    },
    {
      clave: 'modalidad',
      titulo: 'Modalidad',
      render: (p) => (
        <>
          {MODALIDAD[p.modalidad]}
          {p.direccion && <span className="cell-note">{p.direccion}</span>}
          <span className="cell-note">{METODO_PAGO[p.metodoPago]}</span>
        </>
      )
    },
    {
      clave: 'total',
      titulo: 'Total',
      numerica: true,
      render: (p) => (
        <>
          {formatearPrecio(p.precioTotal)}
          <span className="cell-note">{p.tiempoEstimadoMin} min</span>
        </>
      )
    },
    {
      clave: 'estado',
      titulo: 'Estado',
      render: (p) => {
        const id = `estado-pedido-${p.id}`;
        return (
          <div className="cell-badges">
            <div className="inline-select" data-tono={ESTADO_PEDIDO[p.estado].tono}>
              <label className="sr-only" htmlFor={id}>
                Estado del pedido #{p.id}
              </label>
              <select id={id} value={p.estado} disabled={ocupado === `estado-${p.id}`} onChange={(e) => cambiarEstado(p, e.target.value as EstadoPedido)}>
                {ESTADOS.map((e) => (
                  <option key={e} value={e}>
                    {textoEstadoPedido(e, p.modalidad)}
                  </option>
                ))}
              </select>
            </div>
            {p.estado !== 'CANCELADO' && <Badge tono={p.pagoRecibido ? 'ok' : 'off'}>{p.pagoRecibido ? 'Pagado' : 'Sin pagar'}</Badge>}
          </div>
        );
      }
    },
    {
      clave: 'acciones',
      titulo: 'Acciones',
      tituloOculto: true,
      render: (p) => {
        const avance = textoAvance(p.estado, p.modalidad);
        const cancelable = p.estado === 'PENDIENTE' || p.estado === 'EN_PREPARACION';
        return (
          <RowActions>
            {avance && (
              <Button
                size="sm"
                variant={p.estado === 'PENDIENTE' ? 'primary' : 'secondary'}
                loading={ocupado === `avanzar-${p.id}`}
                onClick={() => avanzar(p)}
              >
                {avance}
              </Button>
            )}
            {!p.pagoRecibido && p.estado !== 'CANCELADO' && (
              <Button variant="secondary" size="sm" loading={ocupado === `pago-${p.id}`} onClick={() => marcarPagado(p)}>
                Marcar pagado
              </Button>
            )}
            {cancelable && (
              <Button variant="ghost" size="sm" loading={ocupado === `cancelar-${p.id}`} onClick={() => cancelar(p)}>
                Cancelar
              </Button>
            )}
            <Button variant="secondary" size="sm" aria-expanded={editando === p.id} onClick={() => setEditando(editando === p.id ? null : p.id)}>
              Editar
            </Button>
            <Button variant="danger-quiet" size="sm" loading={ocupado === `eliminar-${p.id}`} onClick={() => eliminar(p)}>
              Eliminar
            </Button>
          </RowActions>
        );
      }
    }
  ];

  let contenido;
  if (loading) {
    contenido = <SkeletonList rows={3} height={72} />;
  } else if (error) {
    contenido = <EmptyState title="No pudimos cargar los pedidos" text={error} action={<Button onClick={recargar}>Reintentar</Button>} />;
  } else if (ordenados.length === 0) {
    contenido = (
      <EmptyState
        title={vista === 'curso' ? 'No hay pedidos en curso' : 'Hoy todavía no hubo pedidos'}
        text="Los pedidos nuevos aparecen acá como pendientes. Los anteriores están en el Historial."
      />
    );
  } else {
    contenido = (
      <DataTable
        columnas={columnas}
        filas={ordenados}
        getKey={(p) => p.id}
        minWidth={1120}
        caption={`${plural(ordenados.length, 'pedido')}, del más nuevo al más viejo. El estado se cambia desde su columna; con Editar, todo lo demás.`}
        detalle={(p) =>
          editando === p.id && (
            <EditorPedido
              pedido={p}
              platos={platos}
              onCerrar={() => setEditando(null)}
              onGuardado={() => {
                setEditando(null);
                recargar();
              }}
            />
          )
        }
      />
    );
  }

  return (
    <>
      <PageHeader title="Gestión de pedidos" lead="Cambiá el estado de cada pedido, registrá los pagos y corregí lo que haga falta." compact />
      <div className="wrap page">
        <div className="filtros">
          <Toggle legend="Mostrar" options={VISTAS} value={vista} onChange={setVista} />
          <Link className="filtros__enlace" to="/admin/historial">
            Ver pedidos anteriores en el Historial
          </Link>
        </div>
        {contenido}
      </div>
    </>
  );
}
