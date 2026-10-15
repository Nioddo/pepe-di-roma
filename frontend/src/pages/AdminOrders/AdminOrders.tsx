import { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { useApi } from '../../hooks/useApi';
import { cambiarEstadoPedido, deletePedido, getPedidos, marcarPedidoPagado } from '../../services/pedidosService';
import { getUsuarios } from '../../services/usuariosService';
import { mensajeDeError } from '../../services/api';
import { formatearPrecio } from '../../utils/formato';
import { ESTADO_PEDIDO, METODO_PAGO, MODALIDAD, SIGUIENTE_ESTADO, textoAvance, textoEstadoPedido } from '../../utils/estados';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { DataTable, RowActions, type Columna } from '../../components/DataTable/DataTable';
import { Badge } from '../../components/Badge/Badge';
import { Button } from '../../components/Button/Button';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { SkeletonList } from '../../components/Skeleton/Skeleton';
import type { Pedido } from '../../types';
import './AdminOrders.css';

const cargar = () => Promise.all([getPedidos(), getUsuarios()]);

export function AdminOrders() {
  const toast = useToast();
  const confirmar = useConfirm();
  const { data, loading, error, recargar } = useApi(cargar);
  const [ocupado, setOcupado] = useState<string | null>(null);

  const [pedidos, usuarios] = data ?? [[], []];
  const ordenados = pedidos.slice().sort((a, b) => b.id - a.id);
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

  const columnas: Columna<Pedido>[] = [
    {
      clave: 'pedido',
      titulo: 'Pedido',
      render: (p) => (
        <>
          <strong>#{p.id}</strong>
          <span className="cell-note">{emailDe(p.clienteId)}</span>
        </>
      )
    },
    {
      clave: 'detalle',
      titulo: 'Detalle',
      render: (p) => (
        <ul className="cell-list">
          {p.items.map((it) => (
            <li key={it.id}>
              {it.cantidad}× {it.nombre}
            </li>
          ))}
        </ul>
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
      render: (p) => (
        <div className="cell-badges">
          <Badge tono={ESTADO_PEDIDO[p.estado].tono}>{textoEstadoPedido(p.estado, p.modalidad)}</Badge>
          {p.estado !== 'CANCELADO' && <Badge tono={p.pagoRecibido ? 'ok' : 'off'}>{p.pagoRecibido ? 'Pagado' : 'Sin pagar'}</Badge>}
        </div>
      )
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
    contenido = <EmptyState title="No hay pedidos" text="Los pedidos nuevos aparecen acá como pendientes." />;
  } else {
    contenido = <DataTable columnas={columnas} filas={ordenados} getKey={(p) => p.id} minWidth={1040} caption="Pedidos, del más nuevo al más viejo." />;
  }

  return (
    <>
      <PageHeader title="Gestión de pedidos" lead="Avanzá cada pedido de estado y registrá los pagos." compact />
      <div className="wrap page">
        {contenido}
      </div>
    </>
  );
}
