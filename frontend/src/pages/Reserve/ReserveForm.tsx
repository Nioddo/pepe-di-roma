import { useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { createReserva, updateReserva } from '../../services/reservasService';
import { mensajeDeError } from '../../services/api';
import { formatearFecha, hoyISO } from '../../utils/formato';
import { horarios, MAX_ONLINE, mesaOcupada, reglaPara } from '../../utils/reservas';
import { hayErrores, type Errores } from '../../utils/validacion';
import { enfocarPrimerError } from '../../utils/foco';
import { contacto } from '../../content/sitio';
import { InlineError, SelectField, TextField } from '../../components/Field/Field';
import { Notice } from '../../components/Notice/Notice';
import { Button, ButtonLink } from '../../components/Button/Button';
import { TableLegend, TableMap, type EstadoMesa } from '../../components/TableMap/TableMap';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import type { Mesa, Reserva, Usuario } from '../../types';

type Campo = 'fecha' | 'hora' | 'mesa';

const OPCIONES_INTEGRANTES = [
  ...Array.from({ length: MAX_ONLINE }, (_, i) => ({
    value: String(i + 1),
    label: `${i + 1} ${i === 0 ? 'persona' : 'personas'}`
  })),
  { value: String(MAX_ONLINE + 1), label: `Más de ${MAX_ONLINE}` }
];

const OPCIONES_HORARIO = [
  { value: '', label: 'Elegí un horario' },
  ...horarios().map((h) => ({ value: h, label: `${h} h` }))
];

interface ReserveFormProps {
  usuario: Usuario;
  mesas: Mesa[];
  reservas: Reserva[];
  editando?: Reserva;
  onError: () => void;
}

/**
 * Regla del local:
 *  - hasta 4 personas eligen la mesa en el mapa;
 *  - de 5 a 12 no eligen: el local asigna la mesa libre más chica que alcance;
 *  - más de 12 no pueden reservar online.
 */
export function ReserveForm({ usuario, mesas, reservas, editando, onError }: ReserveFormProps) {
  const toast = useToast();
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  const mapaRef = useRef<HTMLDivElement>(null);

  const [fecha, setFecha] = useState(editando?.fecha ?? hoyISO());
  const [hora, setHora] = useState(editando?.horaInicio ?? '');
  const [integrantes, setIntegrantes] = useState(editando?.cantidadIntegrantes ?? 2);
  const [mesaId, setMesaId] = useState<number | null>(
    editando && reglaPara(editando.cantidadIntegrantes) === 'elige-mesa' ? editando.mesaId : null
  );
  const [errores, setErrores] = useState<Errores<Campo>>({});
  const [enviando, setEnviando] = useState(false);

  const regla = reglaPara(integrantes);
  const excluir = editando?.id;

  const estadoDe = (mesa: Mesa): EstadoMesa => {
    if (regla !== 'elige-mesa' || !fecha || !hora) return 'bloqueada';
    if (mesaOcupada(mesa.id, fecha, hora, reservas, excluir)) return 'ocupada';
    if (mesa.capacidad < integrantes) return 'bloqueada';
    return mesa.id === mesaId ? 'elegida' : 'libre';
  };

  const limpiar = (campo: Campo) => setErrores((e) => ({ ...e, [campo]: '' }));

  const cambiarIntegrantes = (valor: number) => {
    setIntegrantes(valor);
    const elegida = mesas.find((m) => m.id === mesaId);
    if (reglaPara(valor) !== 'elige-mesa' || (elegida && elegida.capacidad < valor)) setMesaId(null);
    limpiar('mesa');
  };

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();
    if (regla === 'no-online') return;

    const nuevos: Errores<Campo> = {
      fecha: !fecha ? 'Elegí una fecha.' : !editando && fecha < hoyISO() ? 'Elegí una fecha de hoy en adelante.' : '',
      hora: hora ? '' : 'Elegí un horario.',
      mesa: regla === 'elige-mesa' && fecha && hora && !mesaId ? 'Elegí una mesa disponible en el mapa.' : ''
    };

    setErrores(nuevos);
    if (hayErrores(nuevos)) {
      if (nuevos.fecha || nuevos.hora) enfocarPrimerError(formRef.current);
      else mapaRef.current?.querySelector<HTMLElement>('[data-estado="libre"]')?.focus();
      return;
    }

    // de 5 a 12 personas la reserva viaja sin mesa: la asigna el local desde Gestión de reservas
    const mesaFinal = regla === 'elige-mesa' ? mesaId : null;
    const numero = mesas.find((m) => m.id === mesaFinal)?.numero;
    const cuando = `${formatearFecha(fecha)} a las ${hora} h`;
    const datos = { fecha, horaInicio: hora, cantidadIntegrantes: integrantes, mesaId: mesaFinal };

    setEnviando(true);
    try {
      if (editando) {
        await updateReserva(editando.id, datos);
        toast.success(`Guardaste los cambios: ${cuando}${numero ? `, mesa ${numero}` : ''}.`);
      } else {
        await createReserva({ clienteId: usuario.id, ...datos });
        toast.success(
          regla === 'asigna-local'
            ? `Listo: reservaste para ${integrantes} personas el ${cuando}. El local te va a asignar la mesa.`
            : `Listo: reservaste la mesa ${numero} para el ${cuando}.`
        );
      }
      navigate('/mis-reservas');
    } catch (err) {
      toast.error(mensajeDeError(err));
      onError();
    } finally {
      setEnviando(false);
    }
  };

  let notaMapa = 'Tocá una mesa disponible para elegirla.';
  if (!fecha || !hora) notaMapa = 'Elegí fecha y horario para ver qué mesas están libres.';
  else if (regla === 'asigna-local') notaMapa = 'Para grupos de 5 a 12 personas el mapa queda bloqueado: la mesa la asigna el local.';
  else if (regla === 'no-online') notaMapa = 'El mapa queda bloqueado: los grupos de más de 12 reservan por teléfono o email.';

  return (
    <div className="split">
      <form ref={formRef} onSubmit={enviar} noValidate className="panel-form">
        {editando && (
          <Notice>
            Estás modificando la reserva del <strong>{formatearFecha(editando.fecha)} a las {editando.horaInicio} h</strong>.
          </Notice>
        )}

        <div className="form-row">
          <TextField
            label="Fecha"
            type="date"
            min={editando ? undefined : hoyISO()}
            value={fecha}
            error={errores.fecha}
            onChange={(e) => {
              setFecha(e.target.value);
              setMesaId(null);
              limpiar('fecha');
            }}
          />
          <SelectField
            label="Horario"
            options={OPCIONES_HORARIO}
            value={hora}
            error={errores.hora}
            onChange={(e) => {
              setHora(e.target.value);
              setMesaId(null);
              limpiar('hora');
            }}
          />
        </div>

        <SelectField
          label="Integrantes"
          options={OPCIONES_INTEGRANTES}
          value={String(integrantes)}
          onChange={(e) => cambiarIntegrantes(Number(e.target.value))}
        />

        {regla === 'asigna-local' && (
          <Notice tono="info">
            <strong>Grupos de 5 a 12 personas no eligen mesa.</strong> El local te la asigna y la vas a ver en Mis reservas.
          </Notice>
        )}
        {regla === 'no-online' && (
          <Notice tono="stop">
            <strong>Más de {MAX_ONLINE} personas no pueden reservar online.</strong> Escribinos a{' '}
            <a href={`mailto:${contacto.email}`}>{contacto.email}</a> o llamá al{' '}
            <a href={contacto.telefonoHref}>{contacto.telefono}</a>.
          </Notice>
        )}

        <Button type="submit" block loading={enviando} disabled={regla === 'no-online'}>
          {editando ? 'Guardar cambios' : 'Confirmar reserva'}
        </Button>
        {editando && (
          <ButtonLink to="/mis-reservas" variant="ghost" block className="reserve__discard">
            Descartar cambios
          </ButtonLink>
        )}
      </form>

      <section className="panel salon" aria-labelledby="salon-titulo">
        <div className="salon__head">
          <h2 id="salon-titulo">Mapa del salón</h2>
          <TableLegend />
        </div>

        {mesas.length === 0 ? (
          <EmptyState title="El salón no tiene mesas" text="Todavía no hay mesas cargadas en el sistema." />
        ) : (
          <div ref={mapaRef}>
            <TableMap
              mesas={mesas}
              estadoDe={estadoDe}
              onElegir={(mesa) => {
                setMesaId((actual) => (actual === mesa.id ? null : mesa.id));
                limpiar('mesa');
              }}
            />
          </div>
        )}

        <p className="salon__note">{notaMapa}</p>
        {errores.mesa && <InlineError>{errores.mesa}</InlineError>}
      </section>
    </div>
  );
}
