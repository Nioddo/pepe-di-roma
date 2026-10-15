import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { useApi } from '../../hooks/useApi';
import { cambiarEstadoPedido, getPedidosDeCliente } from '../../services/pedidosService';
import { mensajeDeError } from '../../services/api';
import { formatearPrecio } from '../../utils/formato';
import { ESTADO_PEDIDO, METODO_PAGO, MODALIDAD, textoEstadoPedido } from '../../utils/estados';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { RecordCard, RecordList } from '../../components/RecordCard/RecordCard';
import { Badge } from '../../components/Badge/Badge';
import { Button, ButtonLink } from '../../components/Button/Button';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { SkeletonList } from '../../components/Skeleton/Skeleton';
import type { Pedido } from '../../types';

export function MyOrders() {
  const { usuario } = useAuth();
  const toast = useToast();
  const confirmar = useConfirm();
  const [cancelando, setCancelando] = useState<number | null>(null);

  const clienteId = usuario?.id ?? 0;
  const { data, loading, error, recargar } = useApi(() => getPedidosDeCliente(clienteId), [clienteId]);
  const pedidos = (data ?? []).slice().sort((a, b) => b.id - a.id);

  const cancelar = async (p: Pedido) => {
    const ok = await confirmar({
      titulo: '¿Cancelar el pedido?',
      texto: `¿Seguro que querés cancelar el pedido #${p.id}? Todavía no empezamos a prepararlo.`,
      confirmar: 'Cancelar pedido',
      cancelar: 'Volver'
    });
    if (!ok) return;

    setCancelando(p.id);
    try {
      await cambiarEstadoPedido(p.id, 'CANCELADO');
      toast.success(`Cancelaste el pedido #${p.id}.`);
      recargar();
    } catch (err) {
      toast.error(mensajeDeError(err));
    } finally {
      setCancelando(null);
    }
  };

  let contenido;
  if (loading) {
    contenido = <SkeletonList rows={2} height={140} />;
  } else if (error) {
    contenido = <EmptyState title="No pudimos cargar tus pedidos" text={error} action={<Button onClick={recargar}>Reintentar</Button>} />;
  } else if (pedidos.length === 0) {
    contenido = (
      <EmptyState
        title="Todavía no hiciste pedidos"
        text="Armá tu primer pedido para retirar en el local o recibir en tu casa."
        action={<ButtonLink to="/pedido">Hacé tu primer pedido</ButtonLink>}
      />
    );
  } else {
    contenido = (
      <RecordList>
        {pedidos.map((p) => (
          <RecordCard
            key={p.id}
            arriba={`#${p.id}`}
            abajo="pedido"
            apagado={p.estado === 'CANCELADO' || p.estado === 'ENTREGADO'}
            titulo={`Pedido #${p.id} · ${MODALIDAD[p.modalidad]}`}
            meta={
              <>
                <Badge tono={ESTADO_PEDIDO[p.estado].tono}>{textoEstadoPedido(p.estado, p.modalidad)}</Badge>
                <span>{formatearPrecio(p.precioTotal)}</span>
                {p.estado !== 'CANCELADO' && p.estado !== 'ENTREGADO' && <span>Listo en unos {p.tiempoEstimadoMin} min</span>}
                <span>
                  {METODO_PAGO[p.metodoPago]}
                  {p.pagoRecibido ? ' · Pagado' : ''}
                </span>
              </>
            }
            detalle={
              p.items.map((it) => `${it.cantidad}× ${it.nombre}`).join(' · ') +
              (p.modalidad === 'DELIVERY' && p.direccion ? ` — ${p.direccion}` : '')
            }
            acciones={
              p.estado === 'PENDIENTE' && (
                <Button variant="danger-quiet" size="sm" loading={cancelando === p.id} onClick={() => cancelar(p)}>
                  Cancelar
                </Button>
              )
            }
          />
        ))}
      </RecordList>
    );
  }

  return (
    <>
      <PageHeader title="Mis pedidos" actions={<ButtonLink to="/pedido">Nuevo pedido</ButtonLink>} />
      <div className="wrap page">
        {contenido}
      </div>
    </>
  );
}
