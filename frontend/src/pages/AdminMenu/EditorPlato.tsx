import { useState, type FormEvent } from 'react';
import { useToast } from '../../context/ToastContext';
import { useCartas } from '../../hooks/useSitio';
import { createPlato, updatePlato } from '../../services/platosService';
import { updateSeccion } from '../../services/seccionesService';
import { mensajeDeError } from '../../services/api';
import { resolverImagen } from '../../utils/imagenes';
import { formatearPrecio } from '../../utils/formato';
import { hayErrores, validarPrecio, validarRequerido, type Errores } from '../../utils/validacion';
import { enfocarPrimerError } from '../../utils/foco';
import { Editor } from '../../components/Editor/Editor';
import { Check, SelectField, TextAreaField, TextField } from '../../components/Field/Field';
import { FotoPicker } from '../../components/Foto/Foto';
import type { Plato, Seccion, SeccionConPlatos } from '../../types';

type Campo = 'nombre' | 'precio' | 'foto';

interface EditorPlatoProps {
  /** Sin plato, el formulario da de alta uno nuevo en la sección. */
  plato?: Plato;
  /** Sección donde está ahora (o donde se agrega). */
  seccion: SeccionConPlatos;
  secciones: Seccion[];
  onCerrar: () => void;
  onGuardado: () => void;
}

/**
 * Un solo formulario para crear y para editar un plato: texto, precio, foto, etiquetas,
 * estrella y en qué sección va. A la derecha se ve el renglón tal como sale en la carta.
 */
export function EditorPlato({ plato, seccion, secciones, onCerrar, onGuardado }: EditorPlatoProps) {
  const toast = useToast();
  const { cartaInfo } = useCartas();
  const [datos, setDatos] = useState({
    nombre: plato?.nombre ?? '',
    precio: plato ? String(plato.precio) : '',
    medida: plato?.medida ?? '',
    descripcion: plato?.descripcion ?? '',
    foto: plato?.imageUrl ?? '',
    vegano: plato?.vegano ?? false,
    sinTacc: plato?.sinTacc ?? false,
    picante: plato?.picante ?? false,
    destacado: plato?.destacado ?? false,
    seccionId: String(seccion.id)
  });
  const [errores, setErrores] = useState<Errores<Campo>>({});
  const [guardando, setGuardando] = useState(false);

  const cambiar = (campo: keyof typeof datos, valor: string | boolean) => {
    setDatos((d) => ({ ...d, [campo]: valor }));
    setErrores((e) => ({ ...e, [campo]: '' }));
  };

  const imagen = datos.foto.trim();
  const nombre = datos.nombre.trim();

  const guardar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const destino = secciones.find((s) => s.id === Number(datos.seccionId)) ?? seccion;
    const repetido = seccion.platosDetalle.some((p) => p.id !== plato?.id && p.nombre.toLowerCase() === nombre.toLowerCase());
    const nuevos: Errores<Campo> = {
      nombre: validarRequerido(datos.nombre, 'El plato necesita un nombre.') || (repetido ? `Ya hay un plato con ese nombre en ${seccion.titulo}.` : ''),
      precio: validarPrecio(datos.precio),
      foto: imagen && !resolverImagen(imagen) ? 'Pegá un enlace que empiece con http:// o https://.' : ''
    };
    setErrores(nuevos);
    if (hayErrores(nuevos)) {
      enfocarPrimerError(evento.currentTarget);
      return;
    }

    const cuerpo = {
      nombre,
      precio: Number(datos.precio),
      medida: datos.medida.trim() || null,
      descripcion: datos.descripcion.trim() || null,
      imageUrl: imagen || null,
      vegano: datos.vegano,
      sinTacc: datos.sinTacc,
      picante: datos.picante,
      destacado: datos.destacado
    };

    setGuardando(true);
    try {
      if (!plato) {
        const creado = await createPlato(cuerpo);
        await updateSeccion(destino.id, { platos: [...destino.platos, creado.id] });
        toast.success(`Agregaste "${nombre}" a ${destino.titulo}.`);
      } else {
        await updatePlato(plato.id, cuerpo);
        if (destino.id !== seccion.id) {
          await updateSeccion(seccion.id, { platos: seccion.platos.filter((id) => id !== plato.id) });
          await updateSeccion(destino.id, { platos: [...destino.platos.filter((id) => id !== plato.id), plato.id] });
        }
        toast.success(destino.id !== seccion.id ? `Guardaste "${nombre}" y lo pasaste a ${destino.titulo}.` : `Guardaste los cambios de "${nombre}".`);
      }
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

  const precio = Number(datos.precio);
  const marcas = [datos.vegano && 'Vegano', datos.sinTacc && 'Sin TACC', datos.picante && 'Picante'].filter(Boolean).join(' · ');

  return (
    <Editor
      titulo={plato ? `Editar "${plato.nombre}"` : `Plato nuevo en ${seccion.titulo}`}
      onSubmit={guardar}
      onCancelar={onCerrar}
      guardando={guardando}
      textoGuardar={plato ? 'Guardar cambios' : 'Agregar plato'}
    >
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
      <SelectField
        label="Sección"
        hint={plato ? 'Cambiala para mover el plato.' : 'Dónde va a aparecer.'}
        options={opcionesSeccion}
        value={datos.seccionId}
        onChange={(e) => cambiar('seccionId', e.target.value)}
      />
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

      {/* el renglón como lo va a leer el cliente, mientras se escribe */}
      <div className="editor__ancho renglon-carta" aria-live="polite">
        <p className="renglon-carta__rotulo">Así sale en la carta</p>
        <p className="renglon-carta__linea">
          <span className="renglon-carta__nombre">
            {nombre || 'Nombre del plato'}
            {datos.medida.trim() && <small> {datos.medida.trim()}</small>}
          </span>
          <span className="renglon-carta__puntos" aria-hidden="true" />
          <span className="renglon-carta__precio">{precio > 0 ? formatearPrecio(precio) : '$ —'}</span>
        </p>
        {datos.descripcion.trim() && <p className="renglon-carta__desc">{datos.descripcion.trim()}</p>}
        {marcas && <p className="renglon-carta__marcas">{marcas}</p>}
      </div>
    </Editor>
  );
}
