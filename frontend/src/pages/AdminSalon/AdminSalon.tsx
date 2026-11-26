import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent, type KeyboardEvent, type PointerEvent } from 'react';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { useContenido } from '../../context/ContenidoContext';
import { useApi } from '../../hooks/useApi';
import { usePlano } from '../../hooks/useSalon';
import { createMesa, deleteMesa, getMesas, updateMesa } from '../../services/mesasService';
import { createContenido } from '../../services/contenidoService';
import { mensajeDeError } from '../../services/api';
import { plural } from '../../utils/formato';
import { enfocarPrimerError } from '../../utils/foco';
import {
  CATALOGO,
  LIMITES,
  PASO,
  TIPOS,
  acotar,
  ajustar,
  ocupado as extensionOcupada,
  tamanoMesa,
  type Caja,
  type Elemento,
  type Plano,
  type TipoElemento
} from '../../utils/plano';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { TextField } from '../../components/Field/Field';
import { Button } from '../../components/Button/Button';
import { Icon } from '../../components/Icon/Icon';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { Loading, SkeletonBlock } from '../../components/Skeleton/Skeleton';
import { ElementoForma, MesaForma, PlanoSalon, cajaDeMesa, cajaEn } from '../../components/TableMap/TableMap';
import type { Mesa } from '../../types';
import './AdminSalon.css';

type Seleccion = { clase: 'mesa'; id: number } | { clase: 'elemento'; id: string } | null;

type Modo = 'mover' | 'tamano' | 'plano';

interface Gesto {
  puntero: number;
  modo: Modo;
  /** Qué lados del plano se estiran (solo en modo 'plano'). */
  ejes: { x: boolean; y: boolean };
  objetivo: Seleccion;
  /** El elemento que se mueve o se estira en pantalla. */
  el: HTMLElement;
  inicioX: number;
  inicioY: number;
  /** Píxeles de pantalla por unidad del plano. */
  escala: number;
  caja: Caja;
  actual: Caja;
  movio: boolean;
}

const FLECHAS: Record<string, { x: number; y: number }> = {
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 }
};

const idNuevo = (tipo: TipoElemento) => `${tipo}-${Date.now().toString(36)}`;

const entre = (n: number, min: number, max: number) => Math.min(Math.max(n, min), Math.max(min, max));

/** Editor libre del plano del salón: se arrastra todo, se estira el salón y se suman elementos. */
export function AdminSalon() {
  const toast = useToast();
  const confirmar = useConfirm();
  const { items, guardar } = useContenido();
  const { data, loading, error, recargar } = useApi(getMesas);

  /* ---------- el plano: lo guardado, más el borrador que todavía viaja al servidor ---------- */
  const guardado = usePlano();
  const [borrador, setBorrador] = useState<Plano | null>(null);
  const plano = borrador ?? guardado;
  /** El tamaño mientras se estira el salón con el cursor. */
  const [medida, setMedida] = useState<{ ancho: number; alto: number } | null>(null);
  const vista = medida ? { ...plano, ...medida } : plano;
  const [estado, setEstado] = useState<'listo' | 'guardando' | 'error'>('listo');

  /* ---------- las mesas: las de la API, con el lugar nuevo aplicado al instante ---------- */
  const [corridas, setCorridas] = useState<Record<number, { posicionX: number; posicionY: number }>>({});
  const mesas = useMemo(
    () => (data ?? []).map((m) => ({ ...m, ...corridas[m.id] })).sort((a, b) => a.numero - b.numero),
    [data, corridas]
  );

  const [seleccion, setSeleccion] = useState<Seleccion>(null);
  const mesaElegida = seleccion?.clase === 'mesa' ? (mesas.find((m) => m.id === seleccion.id) ?? null) : null;
  const elementoElegido = seleccion?.clase === 'elemento' ? (plano.elementos.find((e) => e.id === seleccion.id) ?? null) : null;
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState('');

  const lienzo = useRef<HTMLDivElement>(null);
  const gesto = useRef<Gesto | null>(null);
  const espera = useRef<number | undefined>(undefined);
  const pendiente = useRef<Plano | null>(null);
  const idGuardado = items.find((c) => c.clave === 'salon.plano')?.id ?? null;
  /** El id de la clave cuando hubo que crearla en esta sesión. */
  const idCreado = useRef<number | null>(null);

  const enviarPlano = async () => {
    const aGuardar = pendiente.current;
    if (!aGuardar) return;
    try {
      const valor = JSON.stringify(aGuardar);
      const id = idGuardado ?? idCreado.current;
      if (id === null) {
        // un servidor que todavía no tiene el plano: se crea la clave la primera vez
        idCreado.current = (await createContenido('salon.plano', valor)).id;
        await guardar([]);
      } else {
        await guardar([{ id, valor }]);
      }
      if (pendiente.current === aGuardar) {
        pendiente.current = null;
        setEstado('listo');
      }
    } catch (err) {
      setEstado('error');
      toast.error(mensajeDeError(err));
    }
  };
  const enviar = useRef(enviarPlano);
  useEffect(() => {
    enviar.current = enviarPlano;
  });

  /** Aplica el cambio en pantalla ya, y lo guarda cuando el admin deja de mover cosas un instante. */
  const guardarPlano = (nuevo: Plano) => {
    setBorrador(nuevo);
    pendiente.current = nuevo;
    setEstado('guardando');
    window.clearTimeout(espera.current);
    espera.current = window.setTimeout(() => enviar.current(), 500);
  };

  // al salir de la pantalla con un cambio en espera, se guarda igual
  useEffect(
    () => () => {
      window.clearTimeout(espera.current);
      if (pendiente.current) void enviar.current();
    },
    []
  );

  const cambiarElemento = (id: string, cambios: Partial<Elemento>) =>
    guardarPlano({
      ...plano,
      elementos: plano.elementos.map((e) => (e.id === id ? { ...e, ...cambios, ...acotar({ ...e, ...cambios }, plano) } : e))
    });

  const moverMesa = async (mesa: Mesa, x: number, y: number) => {
    if (mesa.posicionX === x && mesa.posicionY === y) return;
    const previa = { posicionX: mesa.posicionX, posicionY: mesa.posicionY };
    setCorridas((c) => ({ ...c, [mesa.id]: { posicionX: x, posicionY: y } }));
    setEstado('guardando');
    try {
      await updateMesa(mesa.id, { posicionX: x, posicionY: y });
      setEstado(pendiente.current ? 'guardando' : 'listo');
    } catch (err) {
      setCorridas((c) => ({ ...c, [mesa.id]: previa }));
      setEstado('error');
      toast.error(mensajeDeError(err));
    }
  };

  const cajas = (): Caja[] => [...plano.elementos, ...mesas.map((m) => cajaDeMesa(m, plano))];

  const cambiarTamano = (ancho: number, alto: number) => {
    const minimo = extensionOcupada(cajas());
    const nuevo = {
      ancho: entre(ajustar(ancho), minimo.ancho, LIMITES.anchoMax),
      alto: entre(ajustar(alto), minimo.alto, LIMITES.altoMax)
    };
    if (nuevo.ancho !== ancho || nuevo.alto !== alto) {
      setAviso(
        ancho < minimo.ancho || alto < minimo.alto
          ? 'El salón no se achica más: hay cosas contra ese borde. Movelas primero.'
          : 'El salón ya tiene el tamaño máximo.'
      );
    }
    if (nuevo.ancho !== plano.ancho || nuevo.alto !== plano.alto) guardarPlano({ ...plano, ...nuevo });
  };

  /* ---------- arrastrar con mouse, lápiz o dedo ---------- */
  const empezar = (e: PointerEvent<HTMLElement>, modo: Modo, el: HTMLElement, caja: Caja, objetivo: Seleccion, ejes = { x: false, y: false }) => {
    // un solo dedo a la vez: un segundo toque no roba el arrastre
    if (gesto.current || e.button !== 0 || !lienzo.current) return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    gesto.current = {
      puntero: e.pointerId,
      modo,
      ejes,
      objetivo,
      el,
      inicioX: e.clientX,
      inicioY: e.clientY,
      escala: lienzo.current.clientWidth / plano.ancho,
      caja,
      actual: caja,
      movio: false
    };
    if (objetivo) setSeleccion(objetivo);
  };

  const alMover = (e: PointerEvent<HTMLElement>) => {
    const g = gesto.current;
    if (!g || g.puntero !== e.pointerId) return;
    const px = e.clientX - g.inicioX;
    const py = e.clientY - g.inicioY;
    if (!g.movio && Math.hypot(px, py) < 5) return;
    g.movio = true;
    const dx = px / g.escala;
    const dy = py / g.escala;

    if (g.modo === 'mover') {
      g.actual = acotar({ ...g.caja, x: ajustar(g.caja.x + dx), y: ajustar(g.caja.y + dy) }, plano);
      // el transform va directo al elemento: no re-renderiza el plano en cada cuadro
      g.el.style.transform = `translate(${(g.actual.x - g.caja.x) * g.escala}px, ${(g.actual.y - g.caja.y) * g.escala}px)`;
      g.el.dataset.arrastrando = 'true';
    } else if (g.modo === 'tamano') {
      g.actual = {
        ...g.caja,
        w: entre(ajustar(g.caja.w + dx), LIMITES.ladoMin, plano.ancho - g.caja.x),
        h: entre(ajustar(g.caja.h + dy), LIMITES.ladoMin, plano.alto - g.caja.y)
      };
      g.el.style.width = `${g.actual.w * g.escala}px`;
      g.el.style.height = `${g.actual.h * g.escala}px`;
    } else {
      const minimo = extensionOcupada(cajas());
      const ancho = g.ejes.x ? entre(ajustar(g.caja.w + dx), minimo.ancho, LIMITES.anchoMax) : g.caja.w;
      const alto = g.ejes.y ? entre(ajustar(g.caja.h + dy), minimo.alto, LIMITES.altoMax) : g.caja.h;
      g.actual = { ...g.caja, w: ancho, h: alto };
      setMedida((m) => (m?.ancho === ancho && m.alto === alto ? m : { ancho, alto }));
    }
  };

  const soltar = (e: PointerEvent<HTMLElement>, confirmar: boolean) => {
    const g = gesto.current;
    if (!g || g.puntero !== e.pointerId) return;
    gesto.current = null;
    g.el.style.transform = '';
    g.el.style.width = '';
    g.el.style.height = '';
    delete g.el.dataset.arrastrando;
    setMedida(null);
    if (!g.movio || !confirmar) return;

    if (g.modo === 'plano') {
      guardarPlano({ ...plano, ancho: g.actual.w, alto: g.actual.h });
      setAviso(`El salón ahora mide ${g.actual.w} por ${g.actual.h}.`);
    } else if (g.objetivo?.clase === 'mesa') {
      const mesa = mesas.find((m) => m.id === g.objetivo?.id);
      if (mesa) void moverMesa(mesa, g.actual.x, g.actual.y);
    } else if (g.objetivo?.clase === 'elemento') {
      cambiarElemento(g.objetivo.id, g.actual);
    }
  };

  const gestos = {
    onPointerMove: alMover,
    onPointerUp: (e: PointerEvent<HTMLElement>) => soltar(e, true),
    onPointerCancel: (e: PointerEvent<HTMLElement>) => soltar(e, false)
  };

  /* ---------- teclado: las flechas mueven lo que tiene el foco ---------- */
  const alTeclear = (e: KeyboardEvent<HTMLElement>, objetivo: NonNullable<Seleccion>, caja: Caja) => {
    if (e.key === 'Escape') {
      setSeleccion(null);
      return;
    }
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      if (objetivo.clase === 'mesa') {
        const mesa = mesas.find((m) => m.id === objetivo.id);
        if (mesa) void eliminarMesa(mesa);
      } else void eliminarElemento(objetivo.id);
      return;
    }
    const flecha = FLECHAS[e.key];
    if (!flecha) return;
    e.preventDefault();
    setSeleccion(objetivo);
    const paso = PASO * (e.shiftKey ? 5 : 1);
    const destino = acotar({ ...caja, x: caja.x + flecha.x * paso, y: caja.y + flecha.y * paso }, plano);
    if (destino.x === caja.x && destino.y === caja.y) {
      setAviso('Ya está contra la pared del salón.');
      return;
    }
    if (objetivo.clase === 'mesa') {
      const mesa = mesas.find((m) => m.id === objetivo.id);
      if (mesa) void moverMesa(mesa, destino.x, destino.y);
    } else cambiarElemento(objetivo.id, destino);
  };

  const teclearBorde = (e: KeyboardEvent<HTMLElement>, ejes: { x: boolean; y: boolean }) => {
    const flecha = FLECHAS[e.key];
    if (!flecha) return;
    e.preventDefault();
    const paso = PASO * 5;
    cambiarTamano(plano.ancho + (ejes.x ? (flecha.x || flecha.y) * paso : 0), plano.alto + (ejes.y ? (flecha.y || flecha.x) * paso : 0));
  };

  /* ---------- altas y bajas ---------- */
  /** Un lugar cerca del centro, corrido un poco cada vez para que lo nuevo no tape lo anterior. */
  const lugarNuevo = (w: number, h: number): Caja => {
    const corrimiento = ((plano.elementos.length + mesas.length) % 6) * PASO * 5;
    return acotar({ x: ajustar(plano.ancho / 2 - w / 2) + corrimiento, y: ajustar(plano.alto / 2 - h / 2) + corrimiento, w, h }, plano);
  };

  const agregar = (tipo: TipoElemento) => {
    const receta = CATALOGO[tipo];
    const id = idNuevo(tipo);
    guardarPlano({ ...plano, elementos: [...plano.elementos, { id, tipo, texto: receta.texto, ...lugarNuevo(receta.w, receta.h) }] });
    setSeleccion({ clase: 'elemento', id });
    setAviso(`Agregaste ${receta.nombre.toLowerCase()} en el medio del salón. Arrastralo a su lugar.`);
  };

  const nuevaMesa = async () => {
    setOcupado(true);
    try {
      const numero = Math.max(0, ...mesas.map((m) => m.numero)) + 1;
      const lugar = lugarNuevo(tamanoMesa(4).w, tamanoMesa(4).h);
      const creada = await createMesa({ numero, capacidad: 4, posicionX: lugar.x, posicionY: lugar.y });
      toast.success(`Agregaste la mesa ${creada.numero}. Arrastrala a su lugar.`);
      setSeleccion({ clase: 'mesa', id: creada.id });
      recargar();
    } catch (err) {
      toast.error(mensajeDeError(err));
    } finally {
      setOcupado(false);
    }
  };

  const eliminarMesa = async (mesa: Mesa) => {
    const ok = await confirmar({
      titulo: '¿Eliminar la mesa?',
      texto: `¿Seguro que querés eliminar la mesa ${mesa.numero}? Deja de aparecer en el mapa de reservas.`
    });
    if (!ok) return;
    setOcupado(true);
    try {
      await deleteMesa(mesa.id);
      toast.success(`Eliminaste la mesa ${mesa.numero}.`);
      setSeleccion(null);
      recargar();
    } catch (err) {
      toast.error(mensajeDeError(err));
    } finally {
      setOcupado(false);
    }
  };

  const eliminarElemento = async (id: string) => {
    const elemento = plano.elementos.find((e) => e.id === id);
    if (!elemento) return;
    const nombre = CATALOGO[elemento.tipo].nombre.toLowerCase();
    const ok = await confirmar({ titulo: `¿Eliminar ${nombre}?`, texto: 'Se quita del plano que ven los clientes al reservar.' });
    if (!ok) return;
    guardarPlano({ ...plano, elementos: plano.elementos.filter((e) => e.id !== id) });
    setSeleccion(null);
    setAviso(`Eliminaste ${nombre}.`);
  };

  const duplicar = (elemento: Elemento) => {
    const id = idNuevo(elemento.tipo);
    const copia = { ...elemento, id, ...acotar({ ...elemento, x: elemento.x + PASO * 6, y: elemento.y + PASO * 6 }, plano) };
    guardarPlano({ ...plano, elementos: [...plano.elementos, copia] });
    setSeleccion({ clase: 'elemento', id });
  };

  let escenario;
  if (loading) {
    escenario = (
      <Loading label="Cargando el salón…">
        <SkeletonBlock height={460} />
      </Loading>
    );
  } else if (error) {
    escenario = <EmptyState title="No pudimos cargar el salón" text={error} action={<Button onClick={recargar}>Reintentar</Button>} />;
  } else {
    escenario = (
      <>
        <div className="paleta" role="group" aria-label="Agregar al plano">
          <span className="paleta__titulo">Agregar</span>
          <button type="button" className="paleta__item" disabled={ocupado} onClick={nuevaMesa}>
            <i className="paleta__dibujo paleta__dibujo--mesa" aria-hidden="true" />
            Mesa
          </button>
          {TIPOS.map((tipo) => (
            <button key={tipo} type="button" className="paleta__item" onClick={() => agregar(tipo)}>
              <i className={`paleta__dibujo paleta__dibujo--${tipo}`} aria-hidden="true" />
              {CATALOGO[tipo].nombre}
            </button>
          ))}
        </div>

        <div className="escenario" aria-busy={ocupado || undefined}>
          <div className="escenario__terreno" style={{ '--alto': vista.alto } as CSSProperties}>
            <PlanoSalon
              plano={vista}
              lienzoRef={lienzo}
              className="escenario__plano"
              style={{ width: `${(vista.ancho / LIMITES.anchoMax) * 100}%` }}
              role="group"
              aria-label={`Plano del salón, ${plural(mesas.length, 'mesa')} y ${plural(plano.elementos.length, 'elemento')}`}
              aria-describedby="plano-ayuda"
              onPointerDown={(e) => {
                if (e.target === lienzo.current) setSeleccion(null);
              }}
            >
              {plano.elementos.map((elemento) => {
                const elegido = elementoElegido?.id === elemento.id;
                const objetivo = { clase: 'elemento', id: elemento.id } as const;
                return (
                  <div
                    key={elemento.id}
                    className="plano-salon__item pieza"
                    style={cajaEn(elemento, vista)}
                    data-elegida={elegido || undefined}
                    onPointerDown={(e) => empezar(e, 'mover', e.currentTarget, elemento, objetivo)}
                    {...gestos}
                  >
                    <button
                      type="button"
                      className="pieza__boton"
                      aria-pressed={elegido}
                      aria-label={`${CATALOGO[elemento.tipo].nombre}${elemento.texto ? `: ${elemento.texto}` : ''}`}
                      onKeyDown={(e) => alTeclear(e, objetivo, elemento)}
                      onClick={(e) => {
                        // el click del teclado (Enter / espacio) elige; el del puntero ya lo resolvió el arrastre
                        if (e.detail === 0) setSeleccion(objetivo);
                      }}
                    >
                      <ElementoForma elemento={elemento} />
                    </button>
                    {elegido && (
                      <span
                        className="pieza__tirador"
                        aria-hidden="true"
                        onPointerDown={(e) => {
                          const pieza = e.currentTarget.parentElement;
                          if (pieza) empezar(e, 'tamano', pieza, elemento, objetivo);
                        }}
                        {...gestos}
                      />
                    )}
                  </div>
                );
              })}

              {mesas.map((mesa, i) => {
                const caja = cajaDeMesa(mesa, vista);
                const elegida = mesaElegida?.id === mesa.id;
                const objetivo = { clase: 'mesa', id: mesa.id } as const;
                return (
                  <div
                    key={mesa.id}
                    className="plano-salon__item plano-salon__item--mesa pieza"
                    style={cajaEn(caja, vista)}
                    onPointerDown={(e) => empezar(e, 'mover', e.currentTarget, caja, objetivo)}
                    {...gestos}
                  >
                    <button
                      type="button"
                      className="table-btn"
                      data-estado={elegida ? 'elegida' : 'libre'}
                      style={{ '--i': i } as CSSProperties}
                      aria-pressed={elegida}
                      aria-label={`Mesa ${mesa.numero}, ${plural(mesa.capacidad, 'persona')}`}
                      onKeyDown={(e) => alTeclear(e, objetivo, caja)}
                      onClick={(e) => {
                        if (e.detail === 0) setSeleccion(objetivo);
                      }}
                    >
                      <MesaForma numero={mesa.numero} capacidad={mesa.capacidad} texto={plural(mesa.capacidad, 'persona')} />
                    </button>
                  </div>
                );
              })}
            </PlanoSalon>

            {/* los bordes del salón se estiran con el cursor (o con las flechas del teclado) */}
            <div className="bordes" style={{ width: `${(vista.ancho / LIMITES.anchoMax) * 100}%`, aspectRatio: `${vista.ancho} / ${vista.alto}` }}>
              {(
                [
                  ['x', { x: true, y: false }, 'Ancho del salón'],
                  ['y', { x: false, y: true }, 'Alto del salón'],
                  ['xy', { x: true, y: true }, 'Ancho y alto del salón']
                ] as const
              ).map(([lado, ejes, nombre]) => (
                <button
                  key={lado}
                  type="button"
                  className={`bordes__tirador bordes__tirador--${lado}`}
                  aria-label={`${nombre}: arrastrá o usá las flechas para cambiarlo`}
                  data-activo={(medida && true) || undefined}
                  onPointerDown={(e) => empezar(e, 'plano', e.currentTarget, { x: 0, y: 0, w: plano.ancho, h: plano.alto }, null, ejes)}
                  onKeyDown={(e) => teclearBorde(e, ejes)}
                  {...gestos}
                />
              ))}
              {medida && (
                <span className="bordes__medida" aria-hidden="true">
                  {medida.ancho} × {medida.alto}
                </span>
              )}
            </div>
          </div>
        </div>

        <p id="plano-ayuda" className="plano-ayuda">
          <Icon name="mover" size={16} />
          Arrastrá cualquier cosa a su lugar, o elegila y usá las flechas del teclado. Para agrandar o achicar el salón, tirá de su borde derecho, del de abajo o de la esquina.
        </p>
        <p className="sr-only" role="status">
          {aviso}
        </p>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Salón y mesas"
        lead="El plano que ven los clientes al reservar. Armalo como es el local: movés las mesas, estirás el salón y sumás lo que haga falta."
        compact
      />
      <div className="wrap page salon-editor">
        <div className="salon-editor__plano">{escenario}</div>

        <aside className="salon-editor__panel" aria-label="Detalle de lo elegido">
          {mesaElegida ? (
            <EditorMesa
              key={`${mesaElegida.id}-${mesaElegida.numero}-${mesaElegida.capacidad}`}
              mesa={mesaElegida}
              mesas={mesas}
              ocupado={ocupado}
              onGuardado={recargar}
              onEliminar={() => eliminarMesa(mesaElegida)}
              onCerrar={() => setSeleccion(null)}
            />
          ) : elementoElegido ? (
            <div className="panel">
              <h2>{CATALOGO[elementoElegido.tipo].nombre}</h2>
              {CATALOGO[elementoElegido.tipo].conTexto && (
                <TextField
                  label="Texto"
                  hint="Lo que se lee adentro. Vacío para no mostrar nada."
                  maxLength={40}
                  value={elementoElegido.texto}
                  onChange={(e) => cambiarElemento(elementoElegido.id, { texto: e.target.value })}
                />
              )}
              <div className="form-row">
                <CampoMedida
                  label="Ancho"
                  valor={elementoElegido.w}
                  min={LIMITES.ladoMin}
                  max={plano.ancho - elementoElegido.x}
                  onCambio={(w) => cambiarElemento(elementoElegido.id, { w })}
                />
                <CampoMedida
                  label="Alto"
                  valor={elementoElegido.h}
                  min={LIMITES.ladoMin}
                  max={plano.alto - elementoElegido.y}
                  onCambio={(h) => cambiarElemento(elementoElegido.id, { h })}
                />
              </div>
              <p className="muted">También podés estirarlo desde la esquina roja de abajo a la derecha.</p>
              <div className="salon-editor__acciones">
                <Button variant="secondary" size="sm" onClick={() => cambiarElemento(elementoElegido.id, { w: elementoElegido.h, h: elementoElegido.w })}>
                  Girar
                </Button>
                <Button variant="secondary" size="sm" onClick={() => duplicar(elementoElegido)}>
                  Duplicar
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSeleccion(null)}>
                  Listo
                </Button>
                <Button variant="danger-quiet" size="sm" onClick={() => eliminarElemento(elementoElegido.id)}>
                  Eliminar
                </Button>
              </div>
            </div>
          ) : (
            <div className="panel">
              <h2>El salón</h2>
              <p className="salon-editor__resumen">
                {plural(mesas.length, 'mesa')} · {mesas.reduce((n, m) => n + m.capacidad, 0)} lugares
              </p>
              <div className="form-row">
                <CampoMedida label="Ancho" valor={plano.ancho} min={LIMITES.anchoMin} max={LIMITES.anchoMax} onCambio={(ancho) => cambiarTamano(ancho, plano.alto)} />
                <CampoMedida label="Alto" valor={plano.alto} min={LIMITES.altoMin} max={LIMITES.altoMax} onCambio={(alto) => cambiarTamano(plano.ancho, alto)} />
              </div>
              <p className="muted">Medidas en centímetros, aproximadas: 100 es un metro. Tocá una mesa o un elemento del plano para cambiarlo.</p>
            </div>
          )}

          <p className="salon-editor__estado" role="status" data-estado={estado}>
            <span className="salon-editor__luz" aria-hidden="true" />
            {estado === 'guardando' ? 'Guardando…' : estado === 'error' ? 'No se pudo guardar el último cambio' : 'Todos los cambios están guardados'}
          </p>
        </aside>
      </div>
    </>
  );
}

interface CampoMedidaProps {
  label: string;
  valor: number;
  min: number;
  max: number;
  onCambio: (valor: number) => void;
}

/** Un número del plano que se puede escribir. Si el valor cambia por afuera (arrastrando), muestra el nuevo. */
function CampoMedida({ label, valor, min, max, onCambio }: CampoMedidaProps) {
  const [escrito, setEscrito] = useState({ de: valor, texto: String(valor) });
  const texto = escrito.de === valor ? escrito.texto : String(valor);
  const n = Number(texto);
  const fuera = texto !== '' && (!Number.isFinite(n) || n < min || n > max);

  return (
    <TextField
      label={label}
      type="number"
      inputMode="numeric"
      min={min}
      max={max}
      step={PASO}
      value={texto}
      error={fuera ? `Entre ${min} y ${max}.` : undefined}
      onChange={(e) => {
        const nuevo = e.target.value;
        setEscrito({ de: valor, texto: nuevo });
        const numero = Number(nuevo);
        if (nuevo !== '' && Number.isFinite(numero) && numero >= min && numero <= max && numero !== valor) onCambio(numero);
      }}
    />
  );
}

interface EditorMesaProps {
  mesa: Mesa;
  mesas: Mesa[];
  ocupado: boolean;
  onGuardado: () => void;
  onEliminar: () => void;
  onCerrar: () => void;
}

function EditorMesa({ mesa, mesas, ocupado, onGuardado, onEliminar, onCerrar }: EditorMesaProps) {
  const toast = useToast();
  const [numero, setNumero] = useState(String(mesa.numero));
  const [capacidad, setCapacidad] = useState(String(mesa.capacidad));
  const [errores, setErrores] = useState({ numero: '', capacidad: '' });
  const [guardando, setGuardando] = useState(false);

  const guardar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const n = Number(numero);
    const c = Number(capacidad);
    const nuevos = {
      numero: !Number.isInteger(n) || n <= 0 ? 'El número es un entero mayor a 0.' : mesas.some((m) => m.id !== mesa.id && m.numero === n) ? `Ya hay una mesa ${n}.` : '',
      capacidad: !Number.isInteger(c) || c <= 0 ? 'La capacidad es un entero mayor a 0.' : ''
    };
    setErrores(nuevos);
    if (nuevos.numero || nuevos.capacidad) {
      enfocarPrimerError(evento.currentTarget);
      return;
    }

    setGuardando(true);
    try {
      await updateMesa(mesa.id, { numero: n, capacidad: c });
      toast.success(`Guardaste la mesa ${n}.`);
      onGuardado();
    } catch (err) {
      toast.error(mensajeDeError(err));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form className="panel" onSubmit={guardar} noValidate>
      <h2>Mesa {mesa.numero}</h2>
      <div className="form-row">
        <TextField
          label="Número"
          type="number"
          inputMode="numeric"
          min={1}
          value={numero}
          error={errores.numero}
          onChange={(e) => {
            setNumero(e.target.value);
            setErrores((er) => ({ ...er, numero: '' }));
          }}
        />
        <TextField
          label="Capacidad"
          type="number"
          inputMode="numeric"
          min={1}
          hint="Personas sentadas."
          value={capacidad}
          error={errores.capacidad}
          onChange={(e) => {
            setCapacidad(e.target.value);
            setErrores((er) => ({ ...er, capacidad: '' }));
          }}
        />
      </div>
      <p className="muted">El lugar se cambia arrastrándola en el plano.</p>
      <div className="salon-editor__acciones">
        <Button type="submit" loading={guardando}>
          Guardar mesa
        </Button>
        <Button variant="ghost" onClick={onCerrar}>
          Listo
        </Button>
        <Button variant="danger-quiet" disabled={ocupado} onClick={onEliminar}>
          Eliminar mesa
        </Button>
      </div>
    </form>
  );
}
