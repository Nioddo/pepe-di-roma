import { useState, type FormEvent } from 'react';
import { useToast } from '../../context/ToastContext';
import { useCartas } from '../../hooks/useSitio';
import { updatePlato } from '../../services/platosService';
import { updateSeccion } from '../../services/seccionesService';
import { mensajeDeError } from '../../services/api';
import { resolverImagen } from '../../utils/imagenes';
import { hayErrores, validarPrecio, validarRequerido, type Errores } from '../../utils/validacion';
import { enfocarPrimerError } from '../../utils/foco';
import { Editor } from '../../components/Editor/Editor';
import { Check, SelectField, TextAreaField, TextField } from '../../components/Field/Field';
import { FotoPicker } from '../../components/Foto/Foto';
import type { Plato, Seccion } from '../../types';

type Campo = 'nombre' | 'precio' | 'foto';

interface EditorPlatoProps {
  plato: Plato;
  /** Sección donde está ahora. */
  seccion: Seccion;
  secciones: Seccion[];
  onCerrar: () => void;
  onGuardado: () => void;
}

/** Todo lo de un plato se edita acá: texto, precio, foto, etiquetas, estrella y en qué sección va. */
export function EditorPlato({ plato, seccion, secciones, onCerrar, onGuardado }: EditorPlatoProps) {
  const toast = useToast();
  const { cartaInfo } = useCartas();
  const [datos, setDatos] = useState({
    nombre: plato.nombre,
    precio: String(plato.precio),
    medida: plato.medida ?? '',
    descripcion: plato.descripcion ?? '',
    foto: plato.imageUrl ?? '',
    vegano: plato.vegano,
    sinTacc: plato.sinTacc,
    picante: plato.picante,
    destacado: plato.destacado,
    seccionId: String(seccion.id)
  });
  const [errores, setErrores] = useState<Errores<Campo>>({});
  const [guardando, setGuardando] = useState(false);

  const cambiar = (campo: keyof typeof datos, valor: string | boolean) => {
    setDatos((d) => ({ ...d, [campo]: valor }));
    setErrores((e) => ({ ...e, [campo]: '' }));
  };

  const imagen = datos.foto.trim();

  const guardar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const nuevos: Errores<Campo> = {
      nombre: validarRequerido(datos.nombre, 'El plato necesita un nombre.'),
      precio: validarPrecio(datos.precio),
      foto: imagen && !resolverImagen(imagen) ? 'Pegá un enlace que empiece con http:// o https://.' : ''
    };
    setErrores(nuevos);
    if (hayErrores(nuevos)) {
      enfocarPrimerError(evento.currentTarget);
      return;
    }

    setGuardando(true);
    try {
      await updatePlato(plato.id, {
        nombre: datos.nombre.trim(),
        precio: Number(datos.precio),
        medida: datos.medida.trim() || null,
        descripcion: datos.descripcion.trim() || null,
        imageUrl: imagen || null,
        vegano: datos.vegano,
        sinTacc: datos.sinTacc,
        picante: datos.picante,
        destacado: datos.destacado
      });

      const destino = secciones.find((s) => s.id === Number(datos.seccionId));
      if (destino && destino.id !== seccion.id) {
        await updateSeccion(seccion.id, { platos: seccion.platos.filter((id) => id !== plato.id) });
        await updateSeccion(destino.id, { platos: [...destino.platos.filter((id) => id !== plato.id), plato.id] });
      }

      toast.success(
        destino && destino.id !== seccion.id
          ? `Guardaste "${datos.nombre.trim()}" y lo pasaste a ${destino.titulo}.`
          : `Guardaste los cambios de "${datos.nombre.trim()}".`
      );
      onGuardado();
    } catch (err) {
      toast.error(mensajeDeError(err));
    } finally {
      setGuardando(false);
    }
  };

  const opcionesSeccion = secciones
    .slice()
    .sort((a, b) => a.carta.localeCompare(b.carta) || a.orden - b.orden)
    .map((s) => ({ value: String(s.id), label: `${cartaInfo(s.carta).nombre} · ${s.titulo}` }));

  return (
    <Editor titulo={`Editar "${plato.nombre}"`} onSubmit={guardar} onCancelar={onCerrar} guardando={guardando}>
      <TextField label="Nombre" value={datos.nombre} error={errores.nombre} onChange={(e) => cambiar('nombre', e.target.value)} />
      <TextField
        label="Precio"
        type="number"
        inputMode="numeric"
        min={1}
        step={1}
        hint="En pesos, sin puntos."
        value={datos.precio}
        error={errores.precio}
        onChange={(e) => cambiar('precio', e.target.value)}
      />
      <TextField label="Medida (opcional)" hint='"-pocillo-", "x505ml"…' value={datos.medida} onChange={(e) => cambiar('medida', e.target.value)} />
      <SelectField label="Sección" hint="Cambiala para mover el plato." options={opcionesSeccion} value={datos.seccionId} onChange={(e) => cambiar('seccionId', e.target.value)} />
      <div className="editor__ancho">
        <TextAreaField
          label="Descripción (opcional)"
          hint="Va debajo del nombre en la carta."
          rows={2}
          value={datos.descripcion}
          onChange={(e) => cambiar('descripcion', e.target.value)}
        />
      </div>
      <div className="editor__ancho">
        <FotoPicker label="Foto" value={datos.foto} error={errores.foto} onChange={(v) => cambiar('foto', v)} />
      </div>
      <fieldset className="editor__ancho">
        <legend>Etiquetas</legend>
        <div className="checks">
          <Check label="Vegano" checked={datos.vegano} onChange={(e) => cambiar('vegano', e.target.checked)} />
          <Check label="Sin TACC" checked={datos.sinTacc} onChange={(e) => cambiar('sinTacc', e.target.checked)} />
          <Check label="Picante" checked={datos.picante} onChange={(e) => cambiar('picante', e.target.checked)} />
          <Check label="Producto estrella (sale en la portada)" checked={datos.destacado} onChange={(e) => cambiar('destacado', e.target.checked)} />
        </div>
      </fieldset>
    </Editor>
  );
}
