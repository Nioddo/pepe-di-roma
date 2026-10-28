import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { useApi } from '../../hooks/useApi';
import { cambiarEstadoPedido, getPedidosDeCliente } from '../../services/pedidosService';
import { mensajeDeError } from '../../services/api';
import { formatearFechaHora, formatearPrecio } from '../../utils/formato';
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
  const pedidos = (data ?? []).slice().sort((a, b) => (b.creadoEn ?? '').localeCompare(a.creadoEn ?? '') || b.id - a.id);

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
        text="Armá tu primer pedido, elegí la hora y lo retirás en el local."
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
                <span>{formatearFechaHora(p.creadoEn)}</span>
                <span>{formatearPrecio(p.precioTotal)}</span>
                {p.horaRetiro ? (
                  <span>
                    Retira {p.nombre} a las {p.horaRetiro} h
                  </span>
                ) : (
                  p.estado !== 'CANCELADO' && p.estado !== 'ENTREGADO' && <span>Listo en unos {p.tiempoEstimadoMin} min</span>
                )}
                <span>
                  {METODO_PAGO[p.metodoPago]}
                  {p.pagoRecibido ? ' · Pagado' : ''}
                </span>
              </>
            }
            detalle={
              p.items.map((it) => `${it.cantidad}× ${it.nombre}`).join(' · ') +
              (p.modalidad === 'DELIVERY' && p.direccion ? ` — ${p.direccion}` : '') +
              (p.indicaciones ? ` · “${p.indicaciones}”` : '')
            }
            acciones={
              p.estado === 'PENDIENTE' ? (
                <Button variant="danger-quiet" size="sm" loading={cancelando === p.id} onClick={() => cancelar(p)}>
                  Cancelar
                </Button>
              ) : (
                p.estado === 'ENTREGADO' &&
                p.items.length > 0 && (
                  <ButtonLink to={`/opinar?plato=${p.items[0].platoId}`} variant="secondary" size="sm">
                    Contanos qué te pareció
                  </ButtonLink>
                )
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
