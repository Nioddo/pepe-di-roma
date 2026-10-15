import { useRef, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { useApi } from '../../hooks/useApi';
import { createSeccion, deleteSeccion, getCarta, updateSeccion } from '../../services/seccionesService';
import { createPlato, deletePlato, updatePlato } from '../../services/platosService';
import { mensajeDeError } from '../../services/api';
import { cartaInfo } from '../../content/cartas';
import { cantidadesPorCarta, cartaDesdeParametro } from '../../utils/carta';
import { formatearPrecio, plural } from '../../utils/formato';
import { catalogoFotos, resolverImagen } from '../../utils/imagenes';
import { hayErrores, validarPrecio, validarRequerido, type Errores } from '../../utils/validacion';
import { enfocarPrimerError } from '../../utils/foco';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { CartaTabs } from '../../components/Carta/CartaTabs';
import { Check, SelectField, TextField } from '../../components/Field/Field';
import { Button } from '../../components/Button/Button';
import { Badge } from '../../components/Badge/Badge';
import { ArchImage } from '../../components/ArchImage/ArchImage';
import { DataTable, RowActions, type Columna } from '../../components/DataTable/DataTable';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { SkeletonList } from '../../components/Skeleton/Skeleton';
import type { CartaId, Plato, SeccionConPlatos } from '../../types';
import './AdminMenu.css';

type CampoPlato = 'nombre' | 'precio';
type Etiqueta = 'vegano' | 'sinTacc' | 'picante';

const PANEL = 'panel-admin-menu';
const ETIQUETAS: { clave: Etiqueta; texto: string; tono: 'veg' | 'tacc' | 'brand' }[] = [
  { clave: 'vegano', texto: 'Vegano', tono: 'veg' },
  { clave: 'sinTacc', texto: 'Sin TACC', tono: 'tacc' },
  { clave: 'picante', texto: 'Picante', tono: 'brand' }
];
const OPCIONES_FOTO = [{ value: '', label: 'Sin foto' }, ...catalogoFotos.map((f) => ({ value: f.clave, label: f.nombre }))];

const PLATO_VACIO = { nombre: '', precio: '', medida: '', descripcion: '', foto: '', vegano: false, sinTacc: false, picante: false };

export function AdminMenu() {
  const toast = useToast();
  const confirmar = useConfirm();
  const { data, loading, error, recargar } = useApi(getCarta);
  const [params, setParams] = useSearchParams();

  const carta: CartaId = cartaDesdeParametro(params.get('carta'));
  const secciones = data?.porCarta[carta] ?? [];
  const [seccionId, setSeccionId] = useState<number | null>(null);
  const seccion = secciones.find((s) => s.id === seccionId) ?? secciones[0];

  const [plato, setPlato] = useState(PLATO_VACIO);
  const [erroresPlato, setErroresPlato] = useState<Errores<CampoPlato>>({});
  const [creandoPlato, setCreandoPlato] = useState(false);
  const formPlato = useRef<HTMLFormElement>(null);

  const [titulo, setTitulo] = useState('');
  const [subtitulo, setSubtitulo] = useState('');
  const [errorSeccion, setErrorSeccion] = useState('');
  const [creandoSeccion, setCreandoSeccion] = useState(false);
  const formSeccion = useRef<HTMLFormElement>(null);

  /** Qué acción de la tabla está en curso, para mostrar su botón cargando. */
  const [ocupado, setOcupado] = useState<string | null>(null);

  const cambiarCarta = (id: CartaId) => {
    setParams({ carta: id.toLowerCase() }, { replace: true });
    setSeccionId(null);
  };

  const ejecutar = async (clave: string, accion: () => Promise<string>) => {
    setOcupado(clave);
    try {
      toast.success(await accion());
      recargar();
    } catch (err) {
      toast.error(mensajeDeError(err));
    } finally {
      setOcupado(null);
    }
  };

  const cambiarPlato = (campo: keyof typeof PLATO_VACIO, valor: string | boolean) => {
    setPlato((p) => ({ ...p, [campo]: valor }));
    if (campo === 'nombre' || campo === 'precio') setErroresPlato((e) => ({ ...e, [campo]: '' }));
  };

  const crearPlato = async (evento: FormEvent) => {
    evento.preventDefault();
    if (!seccion) return;
    const repetido = seccion.platosDetalle.some((p) => p.nombre.toLowerCase() === plato.nombre.trim().toLowerCase());
    const nuevos: Errores<CampoPlato> = {
      nombre: validarRequerido(plato.nombre, 'Escribí el nombre del plato.') || (repetido ? `Ya hay un plato con ese nombre en ${seccion.titulo}.` : ''),
      precio: validarPrecio(plato.precio)
    };
    setErroresPlato(nuevos);
    if (hayErrores(nuevos)) {
      enfocarPrimerError(formPlato.current);
      return;
    }

    setCreandoPlato(true);
    try {
      const creado = await createPlato({
        nombre: plato.nombre.trim(),
        precio: Number(plato.precio),
        medida: plato.medida.trim() || null,
        descripcion: plato.descripcion.trim() || null,
        imageUrl: plato.foto || null,
        vegano: plato.vegano,
        sinTacc: plato.sinTacc,
        picante: plato.picante
      });
      await updateSeccion(seccion.id, { platos: [...seccion.platos, creado.id] });
      toast.success(`Agregaste "${creado.nombre}" a ${seccion.titulo}.`);
      setPlato(PLATO_VACIO);
      recargar();
    } catch (err) {
      toast.error(mensajeDeError(err));
    } finally {
      setCreandoPlato(false);
    }
  };

  const crearSeccion = async (evento: FormEvent) => {
    evento.preventDefault();
    const limpio = titulo.trim();
    const repetida = secciones.some((s) => s.titulo.toLowerCase() === limpio.toLowerCase());
    const mensaje = !limpio ? 'Escribí el nombre de la sección.' : repetida ? 'Ya existe una sección con ese nombre en esta carta.' : '';
    setErrorSeccion(mensaje);
    if (mensaje) {
      enfocarPrimerError(formSeccion.current);
      return;
    }

    setCreandoSeccion(true);
    try {
      const orden = Math.max(0, ...(data?.secciones ?? []).map((s) => s.orden)) + 1;
      const nueva = await createSeccion({ titulo: limpio, subtitulo: subtitulo.trim() || null, orden, platos: [], carta });
      toast.success(`Creaste la sección "${limpio}" en ${cartaInfo(carta).nombre}.`);
      setTitulo('');
      setSubtitulo('');
      setSeccionId(nueva.id);
      recargar();
    } catch (err) {
      toast.error(mensajeDeError(err));
    } finally {
      setCreandoSeccion(false);
    }
  };

  const alternarEtiqueta = (p: Plato, etiqueta: Etiqueta) =>
    ejecutar(`etiqueta-${p.id}-${etiqueta}`, async () => {
      const valor = !p[etiqueta];
      await updatePlato(p.id, { [etiqueta]: valor });
      const texto = ETIQUETAS.find((e) => e.clave === etiqueta)?.texto.toLowerCase();
      return `${p.nombre}: ${texto} ${valor ? 'activado' : 'desactivado'}.`;
    });

  const eliminarPlato = async (p: Plato) => {
    const ok = await confirmar({
      titulo: '¿Eliminar el plato?',
      texto: `¿Seguro que querés eliminar "${p.nombre}"? Deja de aparecer en la carta y no se puede pedir más.`
    });
    if (!ok) return;

    ejecutar(`plato-${p.id}`, async () => {
      // el backend no deja borrar un plato que todavía figura en una sección
      for (const s of (data?.secciones ?? []).filter((x) => x.platos.includes(p.id))) {
        await updateSeccion(s.id, { platos: s.platos.filter((id) => id !== p.id) });
      }
      await deletePlato(p.id);
      return `Eliminaste "${p.nombre}".`;
    });
  };

  const eliminarSeccion = async (s: SeccionConPlatos) => {
    const n = s.platos.length;
    const ok = await confirmar({
      titulo: '¿Eliminar la sección?',
      texto: `¿Seguro que querés eliminar "${s.titulo}"${n ? ` y sus ${plural(n, 'plato')}` : ''}? No se puede deshacer.`
    });
    if (!ok) return;

    ejecutar(`seccion-${s.id}`, async () => {
      await deleteSeccion(s.id);
      const enOtras = new Set((data?.secciones ?? []).filter((x) => x.id !== s.id).flatMap((x) => x.platos));
      for (const id of s.platos.filter((pid) => !enOtras.has(pid))) {
        await deletePlato(id);
      }
      setSeccionId(null);
      return `Eliminaste la sección "${s.titulo}".`;
    });
  };

  const columnas: Columna<Plato>[] = [
    {
      clave: 'plato',
      titulo: 'Plato',
      render: (p) => (
        <div className="admin-dish">
          <ArchImage className="admin-dish__img" src={resolverImagen(p.imageUrl)} alt="" fallbackLabel="" aria-hidden="true" />
          <div>
            <span className="admin-dish__nombre">
              {p.nombre}
              {p.medida && <span className="admin-dish__medida"> {p.medida}</span>}
            </span>
            {p.descripcion && <span className="admin-dish__desc">{p.descripcion}</span>}
          </div>
        </div>
      )
    },
    { clave: 'precio', titulo: 'Precio', numerica: true, render: (p) => formatearPrecio(p.precio) },
    {
      clave: 'etiquetas',
      titulo: 'Etiquetas',
      render: (p) => (
        <div className="flags">
          {ETIQUETAS.map((et) => (
            <button
              key={et.clave}
              type="button"
              className="flag"
              aria-pressed={p[et.clave]}
              disabled={ocupado === `etiqueta-${p.id}-${et.clave}`}
              aria-label={`${et.texto}: ${p[et.clave] ? 'sí' : 'no'}. Cambiar.`}
              onClick={() => alternarEtiqueta(p, et.clave)}
            >
              <Badge tono={et.tono}>{et.texto}</Badge>
            </button>
          ))}
        </div>
      )
    },
    {
      clave: 'acciones',
      titulo: 'Acciones',
      tituloOculto: true,
      render: (p) => (
        <RowActions>
          <Button variant="danger-quiet" size="sm" loading={ocupado === `plato-${p.id}`} onClick={() => eliminarPlato(p)}>
            Eliminar
          </Button>
        </RowActions>
      )
    }
  ];

  let cuerpo;
  if (loading) {
    cuerpo = <SkeletonList rows={6} height={64} />;
  } else if (error) {
    cuerpo = <EmptyState title="No pudimos cargar la carta" text={error} action={<Button onClick={recargar}>Reintentar</Button>} />;
  } else {
    cuerpo = (
      <div className="admin-menu">
        {/* maestro: las secciones de la carta elegida */}
        <aside className="admin-menu__secciones" aria-label={`Secciones de ${cartaInfo(carta).nombre}`}>
          <p className="admin-menu__rotulo">Secciones</p>
          {secciones.length > 0 ? (
            <ul className="admin-menu__lista">
              {secciones.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    aria-current={s.id === seccion?.id}
                    onClick={() => setSeccionId(s.id)}
                  >
                    <span>{s.grupo ? `${s.grupo} · ${s.titulo}` : s.titulo}</span>
                    <span className="admin-menu__cuenta">{s.platosDetalle.length}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="admin-menu__vacio">Esta carta todavía no tiene secciones.</p>
          )}

          <form ref={formSeccion} className="admin-menu__nueva" onSubmit={crearSeccion} noValidate>
            <p className="admin-menu__rotulo">Nueva sección</p>
            <TextField
              label="Nombre"
              value={titulo}
              error={errorSeccion}
              onChange={(e) => {
                setTitulo(e.target.value);
                setErrorSeccion('');
              }}
            />
            <TextField label="Aclaración (opcional)" hint='Por ejemplo: "Pastas rellenas".' value={subtitulo} onChange={(e) => setSubtitulo(e.target.value)} />
            <Button type="submit" variant="secondary" size="sm" block loading={creandoSeccion}>
              Agregar sección
            </Button>
          </form>
        </aside>

        {/* detalle: la sección elegida */}
        <section className="admin-menu__detalle" aria-labelledby="seccion-elegida">
          {seccion ? (
            <>
              <div className="admin-menu__cabecera">
                <div>
                  <h2 id="seccion-elegida">{seccion.titulo}</h2>
                  <p className="muted">
                    {seccion.subtitulo ? `${seccion.subtitulo} · ` : ''}
                    {plural(seccion.platosDetalle.length, 'plato')} en {cartaInfo(carta).nombre}
                  </p>
                </div>
                <Button variant="danger-quiet" size="sm" loading={ocupado === `seccion-${seccion.id}`} onClick={() => eliminarSeccion(seccion)}>
                  Eliminar sección
                </Button>
              </div>

              <form ref={formPlato} className="admin-menu__alta" onSubmit={crearPlato} noValidate>
                <p className="admin-menu__rotulo">Agregar plato a {seccion.titulo}</p>
                <div className="admin-menu__campos">
                  <TextField label="Nombre" value={plato.nombre} error={erroresPlato.nombre} onChange={(e) => cambiarPlato('nombre', e.target.value)} />
                  <TextField
                    label="Precio"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    step={1}
                    hint="En pesos, sin puntos."
                    value={plato.precio}
                    error={erroresPlato.precio}
                    onChange={(e) => cambiarPlato('precio', e.target.value)}
                  />
                  <TextField label="Medida (opcional)" hint='"-pocillo-", "x505ml"…' value={plato.medida} onChange={(e) => cambiarPlato('medida', e.target.value)} />
                  <SelectField label="Foto" options={OPCIONES_FOTO} value={plato.foto} onChange={(e) => cambiarPlato('foto', e.target.value)} />
                  <div className="admin-menu__ancho">
                    <TextField
                      label="Descripción (opcional)"
                      hint="Va debajo del nombre en la carta."
                      value={plato.descripcion}
                      onChange={(e) => cambiarPlato('descripcion', e.target.value)}
                    />
                  </div>
                </div>
                <div className="admin-menu__pie">
                  <fieldset>
                    <legend>Etiquetas</legend>
                    <div className="checks">
                      {ETIQUETAS.map((et) => (
                        <Check key={et.clave} label={et.texto} checked={plato[et.clave]} onChange={(e) => cambiarPlato(et.clave, e.target.checked)} />
                      ))}
                    </div>
                  </fieldset>
                  <Button type="submit" loading={creandoPlato}>
                    Agregar plato
                  </Button>
                </div>
              </form>

              {seccion.platosDetalle.length > 0 ? (
                <DataTable columnas={columnas} filas={seccion.platosDetalle} getKey={(p) => p.id} caption={`Platos de ${seccion.titulo}`} captionOculta minWidth={720} />
              ) : (
                <p className="empty-inline">Esta sección no tiene platos. Agregá el primero con el formulario.</p>
              )}
            </>
          ) : (
            <EmptyState title="Elegí o creá una sección" text="Las secciones ordenan la carta: cada plato vive dentro de una." />
          )}
        </section>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Gestión de menú" lead="Las tres cartas del local: secciones, platos, precios y etiquetas." compact />
      <div className="wrap page">
        <CartaTabs value={carta} onChange={cambiarCarta} panelId={PANEL} cantidades={cantidadesPorCarta(data)} />
        <div id={PANEL} role="tabpanel" aria-labelledby={`tab-${carta}`} className="admin-menu__panel">
          {cuerpo}
        </div>
      </div>
    </>
  );
}
