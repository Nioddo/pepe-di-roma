import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { useApi } from '../../hooks/useApi';
import { getMesas } from '../../services/mesasService';
import { cambiarEstadoReserva, getReservasDeCliente } from '../../services/reservasService';
import { mensajeDeError } from '../../services/api';
import { aMinutos, deMinutos, diaDe, formatearFecha, mesDe, plural } from '../../utils/formato';
import { ESTADO_RESERVA } from '../../utils/estados';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { RecordCard, RecordList } from '../../components/RecordCard/RecordCard';
import { Badge } from '../../components/Badge/Badge';
import { Button, ButtonLink } from '../../components/Button/Button';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { SkeletonList } from '../../components/Skeleton/Skeleton';
import type { Reserva } from '../../types';

export function MyReservations() {
  const { usuario } = useAuth();
  const toast = useToast();
  const confirmar = useConfirm();
  const [cancelando, setCancelando] = useState<number | null>(null);

  const clienteId = usuario?.id ?? 0;
  const { data, loading, error, recargar } = useApi(
    () => Promise.all([getReservasDeCliente(clienteId), getMesas()]),
    [clienteId]
  );

  const reservas = (data?.[0] ?? []).slice().sort((a, b) => (a.fecha + a.horaInicio).localeCompare(b.fecha + b.horaInicio));
  const numeroDe = (mesaId: number | null) => data?.[1].find((m) => m.id === mesaId)?.numero;

  const cancelar = async (r: Reserva) => {
    const ok = await confirmar({
      titulo: '¿Cancelar la reserva?',
      texto: `¿Seguro que querés cancelar la reserva del ${formatearFecha(r.fecha)} a las ${r.horaInicio} h? La mesa queda libre para otros clientes.`,
      confirmar: 'Cancelar reserva',
      cancelar: 'Volver'
    });
    if (!ok) return;

    setCancelando(r.id);
    try {
      await cambiarEstadoReserva(r.id, 'CANCELADA');
      toast.success(`Cancelaste la reserva del ${formatearFecha(r.fecha)}.`);
      recargar();
    } catch (err) {
      toast.error(mensajeDeError(err));
    } finally {
      setCancelando(null);
    }
  };

  let contenido;
  if (loading) {
    contenido = <SkeletonList rows={3} height={128} />;
  } else if (error) {
    contenido = <EmptyState title="No pudimos cargar tus reservas" text={error} action={<Button onClick={recargar}>Reintentar</Button>} />;
  } else if (reservas.length === 0) {
    contenido = (
      <EmptyState
        title="Todavía no tenés reservas"
        text="Cuando reserves una mesa, la vas a ver acá con su fecha, horario y estado."
        action={<ButtonLink to="/reservar">Reservá una mesa</ButtonLink>}
      />
    );
  } else {
    contenido = (
      <RecordList>
        {reservas.map((r) => {
          const activa = r.estado === 'PENDIENTE' || r.estado === 'CONFIRMADA';
          const numero = numeroDe(r.mesaId);
          return (
            <RecordCard
              key={r.id}
              arriba={diaDe(r.fecha)}
              abajo={mesDe(r.fecha)}
              apagado={!activa}
              titulo={`${numero ? `Mesa ${numero}` : 'Mesa a asignar'} · ${plural(r.cantidadIntegrantes, 'persona')}`}
              meta={
                <>
                  <span>
                    {formatearFecha(r.fecha)}, de {r.horaInicio} a {deMinutos(aMinutos(r.horaInicio) + r.duracionMin)} h
                  </span>
                  <Badge tono={ESTADO_RESERVA[r.estado].tono}>{ESTADO_RESERVA[r.estado].texto}</Badge>
                </>
              }
              acciones={
                activa && (
                  <>
                    <ButtonLink to={`/reservar/${r.id}`} variant="secondary" size="sm">
                      Modificar
                    </ButtonLink>
                    <Button variant="danger-quiet" size="sm" loading={cancelando === r.id} onClick={() => cancelar(r)}>
                      Cancelar
                    </Button>
                  </>
                )
              }
            />
          );
        })}
      </RecordList>
    );
  }

  return (
    <>
      <PageHeader title="Mis reservas" actions={<ButtonLink to="/reservar">Nueva reserva</ButtonLink>} />
      <div className="wrap page">
        {contenido}
      </div>
    </>
  );
}
