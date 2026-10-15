import { useState, type FormEvent } from 'react';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { useApi } from '../../hooks/useApi';
import { deleteCalificacion, getCalificaciones, updateCalificacion } from '../../services/calificacionesService';
import { getUsuarios } from '../../services/usuariosService';
import { getPlatos } from '../../services/platosService';
import { mensajeDeError } from '../../services/api';
import { formatearFecha, plural } from '../../utils/formato';
import { enfocarPrimerError } from '../../utils/foco';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { DataTable, RowActions, type Columna } from '../../components/DataTable/DataTable';
import { ArchRating, ArchScore } from '../../components/ArchRating/ArchRating';
import { Editor } from '../../components/Editor/Editor';
import { Check, SelectField, TextAreaField, TextField } from '../../components/Field/Field';
import { Badge } from '../../components/Badge/Badge';
import { Button } from '../../components/Button/Button';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { SkeletonList } from '../../components/Skeleton/Skeleton';
import type { Calificacion, Plato } from '../../types';
import './AdminReviews.css';

const cargar = () => Promise.all([getCalificaciones(), getUsuarios(), getPlatos()]);

interface EditorOpinionProps {
  opinion: Calificacion;
  platos: Plato[];
  onCerrar: () => void;
  onGuardado: () => void;
}

/** El admin puede responder, corregir, ocultar o fechar cualquier opinión. */
function EditorOpinion({ opinion, platos, onCerrar, onGuardado }: EditorOpinionProps) {
  const toast = useToast();
  const [puntaje, setPuntaje] = useState(opinion.puntaje);
  const [mensaje, setMensaje] = useState(opinion.mensaje);
  const [firma, setFirma] = useState(opinion.firma);
  const [platoId, setPlatoId] = useState(opinion.platoId === null ? '' : String(opinion.platoId));
  const [fecha, setFecha] = useState(opinion.fecha);
  const [visible, setVisible] = useState(opinion.visible);
  const [respuesta, setRespuesta] = useState(opinion.respuesta ?? '');
  const [aspectos, setAspectos] = useState({ atencion: opinion.atencion ?? 0, comida: opinion.comida ?? 0, espacio: opinion.espacio ?? 0 });
  const [mozo, setMozo] = useState(opinion.mozo ?? '');
  const [errores, setErrores] = useState({ mensaje: '', firma: '', fecha: '' });
  const [guardando, setGuardando] = useState(false);

  const guardar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const nuevos = {
      mensaje: mensaje.trim() ? '' : 'La opinión necesita un mensaje.',
      firma: firma.trim() ? '' : 'La opinión necesita una firma.',
      fecha: fecha ? '' : 'Elegí la fecha.'
    };
    setErrores(nuevos);
    if (nuevos.mensaje || nuevos.firma || nuevos.fecha) {
      enfocarPrimerError(evento.currentTarget);
      return;
    }
    setGuardando(true);
    try {
      await updateCalificacion(opinion.id, {
        puntaje,
        mensaje: mensaje.trim(),
        firma: firma.trim(),
        platoId: platoId ? Number(platoId) : null,
        fecha,
        visible,
        respuesta: respuesta.trim() || null,
        atencion: aspectos.atencion || null,
        comida: aspectos.comida || null,
        espacio: aspectos.espacio || null,
        mozo: mozo.trim() || null
      });
      toast.success(`Guardaste la opinión de ${firma.trim()}.`);
      onGuardado();
    } catch (err) {
      toast.error(mensajeDeError(err));
    } finally {
      setGuardando(false);
    }
  };

  const opcionesPlato = [
    { value: '', label: 'Sin plato' },
    ...platos
      .slice()
      .sort((a, b) => a.nombre.localeCompare(b.nombre))
      .map((p) => ({ value: String(p.id), label: p.nombre }))
  ];

  return (
    <Editor titulo={`Opinión de ${opinion.firma}`} onSubmit={guardar} onCancelar={onCerrar} guardando={guardando}>
      <div className="editor__ancho">
        <ArchRating label="Puntaje" value={puntaje} onChange={setPuntaje} />
      </div>
      <div className="editor__ancho">
        <TextAreaField
          label="Mensaje"
          maxLength={500}
          value={mensaje}
          error={errores.mensaje}
          onChange={(e) => {
            setMensaje(e.target.value);
            setErrores((er) => ({ ...er, mensaje: '' }));
          }}
        />
      </div>
      <TextField
        label="Firma"
        maxLength={40}
        value={firma}
        error={errores.firma}
        onChange={(e) => {
          setFirma(e.target.value);
          setErrores((er) => ({ ...er, firma: '' }));
        }}
      />
      <SelectField label="Qué comió" options={opcionesPlato} value={platoId} onChange={(e) => setPlatoId(e.target.value)} />
      <TextField label="Quién lo atendió" maxLength={40} value={mozo} onChange={(e) => setMozo(e.target.value)} />
      <div className="editor__ancho">
        <ArchRating tamano="chico" label="Atención" value={aspectos.atencion} onChange={(v) => setAspectos((a) => ({ ...a, atencion: v }))} />
        <ArchRating tamano="chico" label="Platos" value={aspectos.comida} onChange={(v) => setAspectos((a) => ({ ...a, comida: v }))} />
        <ArchRating tamano="chico" label="El lugar" value={aspectos.espacio} onChange={(v) => setAspectos((a) => ({ ...a, espacio: v }))} />
      </div>
      <TextField label="Fecha" type="date" value={fecha} error={errores.fecha} onChange={(e) => setFecha(e.target.value)} />
      <div className="editor__ancho">
        <TextAreaField
          label="Respuesta del local (opcional)"
          hint='Se publica debajo de la opinión como "Pepe responde".'
          maxLength={500}
          rows={3}
          value={respuesta}
          onChange={(e) => setRespuesta(e.target.value)}
        />
      </div>
      <div className="editor__ancho admin-opiniones__visible">
        <Check label="Mostrarla en la portada" checked={visible} onChange={(e) => setVisible(e.target.checked)} />
      </div>
    </Editor>
  );
}

/** Moderación de "Nuestras calificaciones": responder, ocultar, corregir o eliminar. */
export function AdminReviews() {
  const toast = useToast();
  const confirmar = useConfirm();
  const { data, loading, error, recargar } = useApi(cargar);
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [editando, setEditando] = useState<number | null>(null);

  const [opiniones, usuarios, platos] = data ?? [[], [], []];
  const ordenadas = opiniones.slice().sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id - a.id);
  const visibles = opiniones.filter((o) => o.visible);
  const promedio = visibles.length ? visibles.reduce((n, o) => n + o.puntaje, 0) / visibles.length : 0;
  const emailDe = (id: number | null) => (id === null ? 'Sin cuenta' : usuarios.find((u) => u.id === id)?.email ?? `Cliente #${id}`);
  const platoDe = (id: number | null) => platos.find((p) => p.id === id);

  const alternarVisible = async (o: Calificacion) => {
    setOcupado(`visible-${o.id}`);
    try {
      await updateCalificacion(o.id, { visible: !o.visible });
      toast.success(o.visible ? `Ocultaste la opinión de ${o.firma}.` : `La opinión de ${o.firma} vuelve a la portada.`);
      recargar();
    } catch (err) {
      toast.error(mensajeDeError(err));
    } finally {
      setOcupado(null);
    }
  };

  const eliminar = async (o: Calificacion) => {
    const ok = await confirmar({
      titulo: '¿Eliminar la opinión?',
      texto: `¿Seguro que querés eliminar la opinión de ${o.firma}? Si solo no querés mostrarla, podés ocultarla.`
    });
    if (!ok) return;
    setOcupado(`eliminar-${o.id}`);
    try {
      await deleteCalificacion(o.id);
      toast.success(`Eliminaste la opinión de ${o.firma}.`);
      recargar();
    } catch (err) {
      toast.error(mensajeDeError(err));
    } finally {
      setOcupado(null);
    }
  };

  const columnas: Columna<Calificacion>[] = [
    {
      clave: 'puntaje',
      titulo: 'Puntaje',
      render: (o) => <ArchScore puntaje={o.puntaje} />
    },
    {
      clave: 'opinion',
      titulo: 'Opinión',
      render: (o) => (
        <div className="admin-opinion">
          <p>{o.mensaje}</p>
          {(o.atencion || o.comida || o.espacio || o.mozo) && (
            <p className="admin-opinion__aspectos">
              {[
                o.atencion && `Atención ${o.atencion}`,
                o.comida && `Platos ${o.comida}`,
                o.espacio && `Lugar ${o.espacio}`,
                o.mozo && `Lo atendió ${o.mozo}`
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
          )}
          {o.respuesta && (
            <p className="admin-opinion__respuesta">
              <b>Respuesta:</b> {o.respuesta}
            </p>
          )}
        </div>
      )
    },
    {
      clave: 'quien',
      titulo: 'Quién',
      render: (o) => (
        <>
          <strong>{o.firma}</strong>
          <span className="cell-note">{emailDe(o.usuarioId)}</span>
          <span className="cell-note">
            {formatearFecha(o.fecha)}
            {platoDe(o.platoId) && ` · ${platoDe(o.platoId)?.nombre}`}
          </span>
        </>
      )
    },
    {
      clave: 'estado',
      titulo: 'En la portada',
      render: (o) => <Badge tono={o.visible ? 'ok' : 'off'}>{o.visible ? 'Visible' : 'Oculta'}</Badge>
    },
    {
      clave: 'acciones',
      titulo: 'Acciones',
      tituloOculto: true,
      render: (o) => (
        <RowActions>
          <Button variant="secondary" size="sm" loading={ocupado === `visible-${o.id}`} onClick={() => alternarVisible(o)}>
            {o.visible ? 'Ocultar' : 'Mostrar'}
          </Button>
          <Button variant="secondary" size="sm" aria-expanded={editando === o.id} onClick={() => setEditando(editando === o.id ? null : o.id)}>
            {o.respuesta ? 'Editar' : 'Responder'}
          </Button>
          <Button variant="danger-quiet" size="sm" loading={ocupado === `eliminar-${o.id}`} onClick={() => eliminar(o)}>
            Eliminar
          </Button>
        </RowActions>
      )
    }
  ];

  let contenido;
  if (loading) {
    contenido = <SkeletonList rows={3} height={86} />;
  } else if (error) {
    contenido = <EmptyState title="No pudimos cargar las opiniones" text={error} action={<Button onClick={recargar}>Reintentar</Button>} />;
  } else if (ordenadas.length === 0) {
    contenido = (
      <EmptyState
        title="Todavía no hay opiniones"
        text="Cuando un cliente complete la encuesta, su opinión aparece acá y en la portada. Desde acá la podés responder u ocultar."
      />
    );
  } else {
    contenido = (
      <DataTable
        columnas={columnas}
        filas={ordenadas}
        getKey={(o) => o.id}
        minWidth={1000}
        caption={`${plural(opiniones.length, 'opinión', 'opiniones')}, de la más nueva a la más vieja. Las ocultas no cuentan para el promedio de la portada.`}
        detalle={(o) =>
          editando === o.id && (
            <EditorOpinion
              opinion={o}
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
      <PageHeader
        title="Opiniones"
        lead="Lo que los clientes cuentan en la encuesta. Respondé, ocultá de la portada o corregí lo que haga falta."
        compact
        actions={
          visibles.length > 0 && (
            <p className="admin-opiniones__promedio">
              <ArchScore puntaje={promedio} />
              <span>
                {promedio.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} de promedio en la portada
              </span>
            </p>
          )
        }
      />
      <div className="wrap page">{contenido}</div>
    </>
  );
}
