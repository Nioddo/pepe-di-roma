import { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { useApi } from '../../hooks/useApi';
import { getMesas } from '../../services/mesasService';
import { cambiarEstadoReserva, deleteReserva, getReservas, updateReserva } from '../../services/reservasService';
import { getUsuarios } from '../../services/usuariosService';
import { mensajeDeError } from '../../services/api';
import { formatearFecha } from '../../utils/formato';
import { ESTADO_RESERVA } from '../../utils/estados';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { DataTable, RowActions, type Columna } from '../../components/DataTable/DataTable';
import { Badge } from '../../components/Badge/Badge';
import { Button } from '../../components/Button/Button';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { SkeletonList } from '../../components/Skeleton/Skeleton';
import type { Reserva } from '../../types';
import './AdminReservations.css';

const cargar = () => Promise.all([getReservas(), getMesas(), getUsuarios()]);

export function AdminReservations() {
  const toast = useToast();
  const confirmar = useConfirm();
  const { data, loading, error, recargar } = useApi(cargar);
  const [ocupado, setOcupado] = useState<string | null>(null);

  const [reservas, mesas, usuarios] = data ?? [[], [], []];
  const ordenadas = reservas.slice().sort((a, b) => (a.fecha + a.horaInicio).localeCompare(b.fecha + b.horaInicio));
  const emailDe = (id: number) => usuarios.find((u) => u.id === id)?.email ?? `Cliente #${id}`;
  const cuando = (r: Reserva) => `${formatearFecha(r.fecha)} a las ${r.horaInicio} h`;

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

  const cambiarMesa = (r: Reserva, mesaId: number) =>
    ejecutar(`mesa-${r.id}`, async () => {
      await updateReserva(r.id, { mesaId });
      const numero = mesas.find((m) => m.id === mesaId)?.numero ?? mesaId;
      return `Mesa ${numero} asignada a la reserva del ${cuando(r)}.`;
    });

  const confirmarReserva = (r: Reserva) =>
    ejecutar(`confirmar-${r.id}`, async () => {
      await cambiarEstadoReserva(r.id, 'CONFIRMADA');
      return `Confirmaste la reserva de ${emailDe(r.clienteId)}.`;
    });

  const cancelar = async (r: Reserva) => {
    const ok = await confirmar({
      titulo: '¿Cancelar la reserva?',
      texto: `¿Seguro que querés cancelar la reserva de ${emailDe(r.clienteId)} del ${cuando(r)}?`,
      confirmar: 'Cancelar reserva',
      cancelar: 'Volver'
    });
    if (ok) ejecutar(`cancelar-${r.id}`, async () => {
      await cambiarEstadoReserva(r.id, 'CANCELADA');
      return 'Reserva cancelada.';
    });
  };

  const eliminar = async (r: Reserva) => {
    const ok = await confirmar({
      titulo: '¿Eliminar la reserva?',
      texto: `¿Seguro que querés eliminar la reserva de ${emailDe(r.clienteId)} del ${cuando(r)}? Se borra del sistema y no se puede deshacer.`
    });
    if (ok) ejecutar(`eliminar-${r.id}`, async () => {
      await deleteReserva(r.id);
      return 'Reserva eliminada.';
    });
  };

  const columnas: Columna<Reserva>[] = [
    { clave: 'fecha', titulo: 'Fecha', numerica: true, render: (r) => formatearFecha(r.fecha) },
    { clave: 'hora', titulo: 'Horario', numerica: true, render: (r) => `${r.horaInicio} h` },
    { clave: 'cliente', titulo: 'Cliente', render: (r) => emailDe(r.clienteId) },
    { clave: 'personas', titulo: 'Personas', numerica: true, render: (r) => r.cantidadIntegrantes },
    {
      clave: 'mesa',
      titulo: 'Mesa',
      render: (r) => {
        const activa = r.estado === 'PENDIENTE' || r.estado === 'CONFIRMADA';
        const id = `mesa-reserva-${r.id}`;
        return (
          <div className="inline-select">
            <label className="sr-only" htmlFor={id}>
              Mesa de la reserva del {cuando(r)}
            </label>
            <select
              id={id}
              value={r.mesaId ?? ''}
              disabled={!activa || ocupado === `mesa-${r.id}`}
              onChange={(e) => cambiarMesa(r, Number(e.target.value))}
            >
              {r.mesaId === null && <option value="">Asignar mesa…</option>}
              {mesas
                // hasta 4 personas, solo mesas donde entran; los grupos grandes pueden unir mesas
                .filter((m) => r.cantidadIntegrantes > 4 || m.capacidad >= r.cantidadIntegrantes || m.id === r.mesaId)
                .sort((a, b) => a.numero - b.numero)
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    Mesa {m.numero} ({m.capacidad} personas)
                  </option>
                ))}
            </select>
          </div>
        );
      }
    },
    {
      clave: 'estado',
      titulo: 'Estado',
      render: (r) => <Badge tono={ESTADO_RESERVA[r.estado].tono}>{ESTADO_RESERVA[r.estado].texto}</Badge>
    },
    {
      clave: 'acciones',
      titulo: 'Acciones',
      tituloOculto: true,
      render: (r) => (
        <RowActions>
          {r.estado === 'PENDIENTE' && (
            <Button size="sm" loading={ocupado === `confirmar-${r.id}`} onClick={() => confirmarReserva(r)}>
              Confirmar
            </Button>
          )}
          {(r.estado === 'PENDIENTE' || r.estado === 'CONFIRMADA') && (
            <Button variant="secondary" size="sm" loading={ocupado === `cancelar-${r.id}`} onClick={() => cancelar(r)}>
              Cancelar
            </Button>
          )}
          <Button variant="danger-quiet" size="sm" loading={ocupado === `eliminar-${r.id}`} onClick={() => eliminar(r)}>
            Eliminar
          </Button>
        </RowActions>
      )
    }
  ];

  let contenido;
  if (loading) {
    contenido = <SkeletonList rows={4} height={62} />;
  } else if (error) {
    contenido = <EmptyState title="No pudimos cargar las reservas" text={error} action={<Button onClick={recargar}>Reintentar</Button>} />;
  } else if (ordenadas.length === 0) {
    contenido = <EmptyState title="No hay reservas" text="Cuando los clientes reserven, las vas a ver acá." />;
  } else {
    contenido = (
      <DataTable
        columnas={columnas}
        filas={ordenadas}
        getKey={(r) => r.id}
        minWidth={940}
        caption="Los grupos de 5 a 12 personas reservan sin mesa: asignala desde la columna Mesa (podés unir mesas)."
      />
    );
  }

  return (
    <>
      <PageHeader title="Gestión de reservas" lead="Confirmá, reasigná mesas y cancelá reservas." compact />
      <div className="wrap page">
        {contenido}
      </div>
    </>
  );
}
