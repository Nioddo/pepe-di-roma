import { useState, type FormEvent } from 'react';
import { useToast } from '../../context/ToastContext';
import { updateReserva } from '../../services/reservasService';
import { mensajeDeError } from '../../services/api';
import { ESTADO_RESERVA } from '../../utils/estados';
import { horarios, MAX_ONLINE, mesaOcupada, reglaPara } from '../../utils/reservas';
import { enfocarPrimerError } from '../../utils/foco';
import { validarRequerido, validarTelefono } from '../../utils/validacion';
import { Editor } from '../../components/Editor/Editor';
import { SelectField, TextField } from '../../components/Field/Field';
import type { EstadoReserva, Mesa, Reserva, Usuario } from '../../types';

type Campo = 'fecha' | 'mesa' | 'nombre' | 'telefono';

const ESTADOS = (Object.keys(ESTADO_RESERVA) as EstadoReserva[]).map((e) => ({ value: e, label: ESTADO_RESERVA[e].texto }));
const PERSONAS = Array.from({ length: MAX_ONLINE }, (_, i) => ({ value: String(i + 1), label: `${i + 1} ${i ? 'personas' : 'persona'}` }));

interface EditorReservaProps {
  reserva: Reserva;
  reservas: Reserva[];
  mesas: Mesa[];
  usuarios: Usuario[];
  onCerrar: () => void;
  onGuardado: () => void;
}

/** Todo lo de una reserva: quién, cuándo, cuántos, en qué mesa y en qué estado está. */
export function EditorReserva({ reserva, reservas, mesas, usuarios, onCerrar, onGuardado }: EditorReservaProps) {
  const toast = useToast();
  const [datos, setDatos] = useState({
    clienteId: String(reserva.clienteId),
    fecha: reserva.fecha,
    hora: reserva.horaInicio,
    personas: String(reserva.cantidadIntegrantes),
    mesaId: reserva.mesaId === null ? '' : String(reserva.mesaId),
    estado: reserva.estado,
    nombre: reserva.nombre ?? '',
    telefono: reserva.telefono ?? ''
  });
  const [errores, setErrores] = useState<Partial<Record<Campo, string>>>({});
  const [guardando, setGuardando] = useState(false);

  const cambiar = (campo: keyof typeof datos, valor: string) => {
    setDatos((d) => ({ ...d, [campo]: valor }));
    setErrores({});
  };

  const personas = Number(datos.personas);
  const eligeMesa = reglaPara(personas) === 'elige-mesa';
  const turnos = horarios(datos.fecha);
  const horas = turnos.includes(datos.hora) ? turnos : [datos.hora, ...turnos];

  const opcionesMesa = [
    { value: '', label: eligeMesa ? 'Elegí una mesa…' : 'Sin mesa todavía' },
    ...mesas
      .slice()
      .sort((a, b) => a.numero - b.numero)
      .filter((m) => !eligeMesa || m.capacidad >= personas)
      .map((m) => {
        const ocupada = mesaOcupada(m.id, datos.fecha, datos.hora, reservas, reserva.id);
        return { value: String(m.id), label: `Mesa ${m.numero} (${m.capacidad} personas)${ocupada ? ' · ocupada a esa hora' : ''}` };
      })
  ];

  const guardar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const mesaId = datos.mesaId ? Number(datos.mesaId) : null;
    const activa = datos.estado !== 'CANCELADA';
    const nuevos: Partial<Record<Campo, string>> = {
      fecha: datos.fecha ? '' : 'Elegí la fecha.',
      nombre: validarRequerido(datos.nombre, 'La reserva necesita un nombre.'),
      telefono: validarTelefono(datos.telefono),
      mesa:
        eligeMesa && mesaId === null
          ? 'Hasta 4 personas, la reserva necesita una mesa.'
          : activa && mesaId !== null && mesaOcupada(mesaId, datos.fecha, datos.hora, reservas, reserva.id)
            ? 'Esa mesa ya está reservada en ese horario. Elegí otra o cambiá la hora.'
            : ''
    };
    setErrores(nuevos);
    if (nuevos.fecha || nuevos.mesa || nuevos.nombre || nuevos.telefono) {
      enfocarPrimerError(evento.currentTarget);
      return;
    }

    setGuardando(true);
    try {
      await updateReserva(reserva.id, {
        clienteId: Number(datos.clienteId),
        fecha: datos.fecha,
        horaInicio: datos.hora,
        cantidadIntegrantes: personas,
        mesaId,
        estado: datos.estado,
        nombre: datos.nombre.trim(),
        telefono: datos.telefono.trim()
      });
      toast.success('Guardaste los cambios de la reserva.');
      onGuardado();
    } catch (err) {
      toast.error(mensajeDeError(err));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Editor titulo="Editar la reserva" onSubmit={guardar} onCancelar={onCerrar} guardando={guardando}>
      <SelectField
        label="Cliente"
        options={usuarios.map((u) => ({ value: String(u.id), label: u.email }))}
        value={datos.clienteId}
        onChange={(e) => cambiar('clienteId', e.target.value)}
      />
      <TextField label="A nombre de" maxLength={60} value={datos.nombre} error={errores.nombre} onChange={(e) => cambiar('nombre', e.target.value)} />
      <TextField label="Teléfono" type="tel" value={datos.telefono} error={errores.telefono} onChange={(e) => cambiar('telefono', e.target.value)} />
      <TextField label="Fecha" type="date" value={datos.fecha} error={errores.fecha} onChange={(e) => cambiar('fecha', e.target.value)} />
      <SelectField label="Horario" options={horas.map((h) => ({ value: h, label: `${h} h` }))} value={datos.hora} onChange={(e) => cambiar('hora', e.target.value)} />
      <SelectField
        label="Personas"
        hint={`Online se reserva hasta ${MAX_ONLINE}.`}
        options={PERSONAS}
        value={datos.personas}
        onChange={(e) => cambiar('personas', e.target.value)}
      />
      <SelectField
        label="Mesa"
        hint={eligeMesa ? 'Solo las mesas donde entra el grupo.' : 'De 5 a 12 personas podés unir mesas o dejarla para después.'}
        options={opcionesMesa}
        value={datos.mesaId}
        error={errores.mesa}
        onChange={(e) => cambiar('mesaId', e.target.value)}
      />
      <SelectField label="Estado" options={ESTADOS} value={datos.estado} onChange={(e) => cambiar('estado', e.target.value)} />
    </Editor>
  );
}
