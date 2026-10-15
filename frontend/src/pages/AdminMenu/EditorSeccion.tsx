import { useState, type FormEvent } from 'react';
import { useToast } from '../../context/ToastContext';
import { useCartas } from '../../hooks/useSitio';
import { updateSeccion } from '../../services/seccionesService';
import { mensajeDeError } from '../../services/api';
import { enfocarPrimerError } from '../../utils/foco';
import { Editor } from '../../components/Editor/Editor';
import { SelectField, TextAreaField, TextField } from '../../components/Field/Field';
import type { CartaId, Seccion } from '../../types';

interface EditorSeccionProps {
  seccion: Seccion;
  secciones: Seccion[];
  onCerrar: () => void;
  onGuardado: (carta: CartaId) => void;
}

/** Título, aclaración, grupo, nota al pie y carta de una sección. */
export function EditorSeccion({ seccion, secciones, onCerrar, onGuardado }: EditorSeccionProps) {
  const toast = useToast();
  const { cartas } = useCartas();
  const [datos, setDatos] = useState({
    titulo: seccion.titulo,
    subtitulo: seccion.subtitulo ?? '',
    grupo: seccion.grupo ?? '',
    nota: seccion.nota ?? '',
    carta: seccion.carta
  });
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cambiar = (campo: keyof typeof datos, valor: string) => {
    setDatos((d) => ({ ...d, [campo]: valor }));
    if (campo === 'titulo' || campo === 'carta') setError('');
  };

  const guardar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const limpio = datos.titulo.trim();
    const repetida = secciones.some(
      (s) => s.id !== seccion.id && s.carta === datos.carta && s.titulo.toLowerCase() === limpio.toLowerCase()
    );
    const mensaje = !limpio ? 'La sección necesita un título.' : repetida ? 'Ya hay una sección con ese título en esa carta.' : '';
    setError(mensaje);
    if (mensaje) {
      enfocarPrimerError(evento.currentTarget);
      return;
    }

    setGuardando(true);
    try {
      await updateSeccion(seccion.id, {
        titulo: limpio,
        subtitulo: datos.subtitulo.trim() || null,
        grupo: datos.grupo.trim() || null,
        nota: datos.nota.trim() || null,
        carta: datos.carta as CartaId
      });
      toast.success(`Guardaste la sección "${limpio}".`);
      onGuardado(datos.carta as CartaId);
    } catch (err) {
      toast.error(mensajeDeError(err));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Editor titulo={`Editar la sección "${seccion.titulo}"`} onSubmit={guardar} onCancelar={onCerrar} guardando={guardando}>
      <TextField label="Título" value={datos.titulo} error={error} onChange={(e) => cambiar('titulo', e.target.value)} />
      <TextField label="Aclaración (opcional)" hint='Va entre guiones: "-pastas rellenas-".' value={datos.subtitulo} onChange={(e) => cambiar('subtitulo', e.target.value)} />
      <TextField label="Grupo (opcional)" hint='Agrupa secciones: "I Vini", "Dolce".' value={datos.grupo} onChange={(e) => cambiar('grupo', e.target.value)} />
      <SelectField
        label="Carta"
        options={cartas.map((c) => ({ value: c.id, label: c.nombre }))}
        value={datos.carta}
        onChange={(e) => cambiar('carta', e.target.value)}
      />
      <div className="editor__ancho">
        <TextAreaField label="Nota al pie (opcional)" rows={2} value={datos.nota} onChange={(e) => cambiar('nota', e.target.value)} />
      </div>
    </Editor>
  );
}
