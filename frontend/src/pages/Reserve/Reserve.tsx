import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { getMesas } from '../../services/mesasService';
import { getReservas } from '../../services/reservasService';
import { esPersonal } from '../../utils/sesion';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { Button, ButtonLink } from '../../components/Button/Button';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { Loading, SkeletonBlock } from '../../components/Skeleton/Skeleton';
import { ReserveForm } from './ReserveForm';
import './Reserve.css';

const cargarDatos = () => Promise.all([getMesas(), getReservas()]);

const BAJADA = 'Toda reserva dura 2 horas. Horario: martes a domingo, de 12 a 15 h y de 20 a 24 h.';

/** Carga el salón y las reservas; el formulario recién se arma con los datos listos. */
export function Reserve() {
  const { id } = useParams();
  const editId = id ? Number(id) : undefined;
  const { usuario } = useAuth();
  const { data, loading, error, recargar } = useApi(cargarDatos);

  const mesas = useMemo(() => (data ? [...data[0]].sort((a, b) => a.numero - b.numero) : []), [data]);
  const reservas = data?.[1] ?? [];
  const editando = editId ? reservas.find((r) => r.id === editId) : undefined;
  const titulo = editId ? 'Modificar reserva' : 'Reservá tu mesa';

  if (loading) {
    return (
      <>
        <PageHeader title={titulo} lead={BAJADA} />
        <div className="wrap page">
          <Loading label="Cargando el salón…">
            <div className="split">
              <SkeletonBlock height={360} />
              <SkeletonBlock height={420} />
            </div>
          </Loading>
        </div>
      </>
    );
  }

  if (error || !usuario) {
    return (
      <>
        <PageHeader title={titulo} lead={BAJADA} />
        <div className="wrap page">
          <EmptyState
            title="No pudimos cargar el salón"
            text={error ?? 'Volvé a intentarlo en un momento.'}
            action={<Button onClick={recargar}>Reintentar</Button>}
          />
        </div>
      </>
    );
  }

  const ajena = editando && editando.clienteId !== usuario.id && !esPersonal(usuario);
  if (editId && (!editando || ajena || editando.estado === 'CANCELADA')) {
    return (
      <>
        <PageHeader title={titulo} />
        <div className="wrap page">
          <EmptyState
            title="No encontramos esa reserva"
            text="Puede que se haya cancelado o que no sea tuya."
            action={<ButtonLink to="/mis-reservas">Ver mis reservas</ButtonLink>}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title={titulo} lead={BAJADA} />
      <div className="wrap page">
        <ReserveForm
          key={editando?.id ?? 'nueva'}
          usuario={usuario}
          mesas={mesas}
          reservas={reservas}
          editando={editando}
          onError={recargar}
        />
      </div>
    </>
  );
}
