import { useRef, useState, type FormEvent, type KeyboardEvent, type PointerEvent } from 'react';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { useContenido } from '../../context/ContenidoContext';
import { useApi } from '../../hooks/useApi';
import { createMesa, deleteMesa, getMesas, updateMesa } from '../../services/mesasService';
import { mensajeDeError } from '../../services/api';
import { plural } from '../../utils/formato';
import { enfocarPrimerError } from '../../utils/foco';
import { useSalon } from '../../hooks/useSalon';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { SelectField, TextField } from '../../components/Field/Field';
import { Button } from '../../components/Button/Button';
import { Icon } from '../../components/Icon/Icon';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { Loading, SkeletonBlock } from '../../components/Skeleton/Skeleton';
import { MesaForma, Sala, celdaEn } from '../../components/TableMap/TableMap';
import type { Mesa } from '../../types';
import './AdminSalon.css';

interface Celda {
  x: number;
  y: number;
}

interface Arrastre {
  mesaId: number;
  puntero: number;
  inicioX: number;
  inicioY: number;
  movio: boolean;
}

const FLECHAS: Record<string, Celda> = {
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 }
};

const MAX_LADO = 8;
const opcionesLado = (texto: string) =>
  Array.from({ length: MAX_LADO }, (_, i) => ({ value: String(i + 1), label: `${i + 1} ${texto}${i ? 's' : ''}` }));

/** Editor del plano del salón: mesas, capacidades y dónde va cada una. */
export function AdminSalon() {
  const toast = useToast();
  const confirmar = useConfirm();
  const { items, guardar } = useContenido();
  const { data, loading, error, recargar } = useApi(getMesas);
  const mesas = data ?? [];
  const { columnas, filas, cocina } = useSalon(mesas);

  const [elegidaId, setElegidaId] = useState<number | null>(null);
  const elegida = mesas.find((m) => m.id === elegidaId) ?? null;
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState('');
  const [destino, setDestino] = useState<Celda | null>(null);
  const arrastre = useRef<Arrastre | null>(null);
  const refsMesa = useRef(new Map<number, HTMLButtonElement>());

  const mesaEn = (x: number, y: number) => mesas.find((m) => m.posicionX === x && m.posicionY === y);
  const dentro = (c: Celda) => c.x >= 0 && c.y >= 0 && c.x < columnas && c.y < filas;
  const lugar = (c: Celda) => `columna ${c.x + 1}, fila ${c.y + 1}`;

  /** Lleva una mesa a otra celda; si ahí hay otra mesa, intercambian lugares. */
  const mover = async (mesa: Mesa, celda: Celda) => {
    if (!dentro(celda) || (mesa.posicionX === celda.x && mesa.posicionY === celda.y)) return;
    const otra = mesaEn(celda.x, celda.y);
    setOcupado(true);
    try {
      await updateMesa(mesa.id, { posicionX: celda.x, posicionY: celda.y });
      if (otra) await updateMesa(otra.id, { posicionX: mesa.posicionX, posicionY: mesa.posicionY });
      const texto = otra
        ? `Las mesas ${mesa.numero} y ${otra.numero} cambiaron de lugar.`
        : `Mesa ${mesa.numero} en ${lugar(celda)}.`;
      setAviso(texto);
      toast.success(texto);
      recargar();
    } catch (err) {
      toast.error(mensajeDeError(err));
    } finally {
      setOcupado(false);
      requestAnimationFrame(() => refsMesa.current.get(mesa.id)?.focus());
    }
  };

  /* ---------- arrastrar con mouse, lápiz o dedo ---------- */
  const celdaBajo = (x: number, y: number): Celda | null => {
    const el = document.elementsFromPoint(x, y).find((e) => e instanceof HTMLElement && e.dataset.celda);
    if (!(el instanceof HTMLElement) || !el.dataset.celda) return null;
    const [cx, cy] = el.dataset.celda.split(',').map(Number);
    return { x: cx, y: cy };
  };

  const alApretar = (e: PointerEvent<HTMLButtonElement>, mesa: Mesa) => {
    // un solo dedo a la vez: un segundo toque no roba el arrastre
    if (arrastre.current || ocupado || e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    arrastre.current = { mesaId: mesa.id, puntero: e.pointerId, inicioX: e.clientX, inicioY: e.clientY, movio: false };
  };

  const alMover = (e: PointerEvent<HTMLButtonElement>) => {
    const a = arrastre.current;
    if (!a || a.puntero !== e.pointerId) return;
    const dx = e.clientX - a.inicioX;
    const dy = e.clientY - a.inicioY;
    if (!a.movio && Math.hypot(dx, dy) < 6) return;
    a.movio = true;
    // el transform va directo al elemento: no re-renderiza el plano en cada cuadro
    e.currentTarget.style.transform = `translate(${dx}px, ${dy}px) scale(1.04)`;
    e.currentTarget.dataset.arrastrando = 'true';
    const celda = celdaBajo(e.clientX, e.clientY);
    setDestino((previo) => (previo?.x === celda?.x && previo?.y === celda?.y ? previo : celda));
  };

  const alSoltar = (e: PointerEvent<HTMLButtonElement>, mesa: Mesa) => {
    const a = arrastre.current;
    if (!a || a.puntero !== e.pointerId) return;
    arrastre.current = null;
    e.currentTarget.style.transform = '';
    delete e.currentTarget.dataset.arrastrando;
    setDestino(null);
    if (!a.movio) {
      setElegidaId(mesa.id);
      return;
    }
    const celda = celdaBajo(e.clientX, e.clientY);
    setElegidaId(mesa.id);
    if (celda) mover(mesa, celda);
  };

  const alCancelar = (e: PointerEvent<HTMLButtonElement>) => {
    arrastre.current = null;
    e.currentTarget.style.transform = '';
    delete e.currentTarget.dataset.arrastrando;
    setDestino(null);
  };

  /* ---------- teclado: flechas mueven la mesa enfocada ---------- */
  const alTeclear = (e: KeyboardEvent<HTMLButtonElement>, mesa: Mesa) => {
    const paso = FLECHAS[e.key];
    if (!paso) return;
    e.preventDefault();
    setElegidaId(mesa.id);
    const celda = { x: mesa.posicionX + paso.x, y: mesa.posicionY + paso.y };
    if (!dentro(celda)) {
      setAviso(`La mesa ${mesa.numero} ya está en el borde del salón.`);
      return;
    }
    mover(mesa, celda);
  };

  /* ---------- alta, baja y tamaño ---------- */
  const primeraLibre = (): Celda | null => {
    for (let y = 0; y < filas; y++) for (let x = 0; x < columnas; x++) if (!mesaEn(x, y)) return { x, y };
    return null;
  };

  const nuevaMesa = async () => {
    const libre = primeraLibre();
    if (!libre) {
      toast.error('No queda lugar en el plano. Agrandá el salón para sumar una mesa.');
      return;
    }
    setOcupado(true);
    try {
      const numero = Math.max(0, ...mesas.map((m) => m.numero)) + 1;
      const creada = await createMesa({ numero, capacidad: 4, posicionX: libre.x, posicionY: libre.y });
      toast.success(`Agregaste la mesa ${creada.numero} en ${lugar(libre)}.`);
      setElegidaId(creada.id);
      recargar();
    } catch (err) {
      toast.error(mensajeDeError(err));
    } finally {
      setOcupado(false);
    }
  };

  const eliminar = async (mesa: Mesa) => {
    const ok = await confirmar({
      titulo: '¿Eliminar la mesa?',
      texto: `¿Seguro que querés eliminar la mesa ${mesa.numero}? Deja de aparecer en el mapa de reservas.`
    });
    if (!ok) return;
    setOcupado(true);
    try {
      await deleteMesa(mesa.id);
      toast.success(`Eliminaste la mesa ${mesa.numero}.`);
      setElegidaId(null);
      recargar();
    } catch (err) {
      toast.error(mensajeDeError(err));
    } finally {
      setOcupado(false);
    }
  };

  const cambiarTamano = async (clave: 'salon.columnas' | 'salon.filas', valor: number) => {
    const necesario = clave === 'salon.columnas' ? Math.max(0, ...mesas.map((m) => m.posicionX + 1)) : Math.max(0, ...mesas.map((m) => m.posicionY + 1));
    if (valor < necesario) {
      toast.error(`Hay mesas en la ${clave === 'salon.columnas' ? 'columna' : 'fila'} ${necesario}. Movelas antes de achicar el salón.`);
      return;
    }
    const item = items.find((c) => c.clave === clave);
    if (!item) return;
    try {
      await guardar([{ id: item.id, valor: String(valor) }]);
      toast.success(clave === 'salon.columnas' ? `El salón ahora tiene ${plural(valor, 'columna')}.` : `El salón ahora tiene ${plural(valor, 'fila')}.`);
    } catch (err) {
      toast.error(mensajeDeError(err));
    }
  };

  let plano;
  if (loading) {
    plano = (
      <Loading label="Cargando el salón…">
        <SkeletonBlock height={460} />
      </Loading>
    );
  } else if (error) {
    plano = <EmptyState title="No pudimos cargar el salón" text={error} action={<Button onClick={recargar}>Reintentar</Button>} />;
  } else {
    plano = (
      <div className="plano" aria-busy={ocupado || undefined}>
        <Sala
          columnas={columnas}
          filas={filas}
          cocina={cocina}
          role="group"
          aria-label={`Plano del salón: ${plural(columnas, 'columna')} por ${plural(filas, 'fila')}`}
        >
          {Array.from({ length: filas }, (_, y) =>
            Array.from({ length: columnas }, (_, x) => {
              const mesa = mesaEn(x, y);
              const esDestino = destino?.x === x && destino?.y === y;
              return (
                <div
                  key={`${x},${y}`}
                  className="sala__celda plano__celda"
                  style={celdaEn(x, y)}
                  data-celda={`${x},${y}`}
                  data-destino={esDestino || undefined}
                >
                  {mesa ? (
                    <button
                      ref={(el) => {
                        if (el) refsMesa.current.set(mesa.id, el);
                        else refsMesa.current.delete(mesa.id);
                      }}
                      type="button"
                      className="table-btn plano__mesa"
                      data-estado={mesa.id === elegidaId ? 'elegida' : 'libre'}
                      aria-pressed={mesa.id === elegidaId}
                      aria-describedby="plano-ayuda"
                      aria-label={`Mesa ${mesa.numero}, ${plural(mesa.capacidad, 'persona')}, ${lugar({ x, y })}`}
                      onPointerDown={(e) => alApretar(e, mesa)}
                      onPointerMove={alMover}
                      onPointerUp={(e) => alSoltar(e, mesa)}
                      onPointerCancel={alCancelar}
                      onKeyDown={(e) => alTeclear(e, mesa)}
                      onClick={(e) => {
                        // el click del teclado (Enter / espacio) elige la mesa; el del puntero ya lo resolvió alSoltar
                        if (e.detail === 0) setElegidaId(mesa.id);
                      }}
                    >
                      <MesaForma numero={mesa.numero} capacidad={mesa.capacidad} texto={plural(mesa.capacidad, 'persona')} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="plano__vacia"
                      disabled={!elegida || ocupado}
                      aria-label={elegida ? `Llevar la mesa ${elegida.numero} a ${lugar({ x, y })}` : `Lugar libre, ${lugar({ x, y })}`}
                      onClick={() => elegida && mover(elegida, { x, y })}
                    >
                      <span aria-hidden="true">{elegida ? `Mesa ${elegida.numero} acá` : ''}</span>
                    </button>
                  )}
                </div>
              );
            })
          )}
        </Sala>
        <p id="plano-ayuda" className="plano__ayuda">
          <Icon name="mover" size={16} />
          Arrastrá una mesa a otro lugar, o elegila y usá las flechas del teclado. Si la soltás sobre otra mesa, cambian de lugar.
        </p>
        <p className="sr-only" role="status">
          {aviso}
        </p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Salón y mesas"
        lead="El plano que ven los clientes al reservar: cuántas mesas hay, para cuántas personas y dónde va cada una."
        compact
        actions={
          <Button onClick={nuevaMesa} loading={ocupado && !elegida} disabled={loading || !!error}>
            Agregar mesa
          </Button>
        }
      />
      <div className="wrap page salon-editor">
        <div className="salon-editor__plano">{plano}</div>

        <aside className="salon-editor__panel" aria-label="Detalle del salón">
          {elegida ? (
            <EditorMesa
              key={`${elegida.id}-${elegida.posicionX}-${elegida.posicionY}-${elegida.numero}-${elegida.capacidad}`}
              mesa={elegida}
              mesas={mesas}
              columnas={columnas}
              filas={filas}
              ocupado={ocupado}
              onGuardado={recargar}
              onEliminar={() => eliminar(elegida)}
              onCerrar={() => setElegidaId(null)}
            />
          ) : (
            <div className="panel">
              <h2>Elegí una mesa</h2>
              <p className="muted">Tocá una mesa del plano para cambiar su número, su capacidad o su lugar.</p>
              <p className="salon-editor__resumen">
                {plural(mesas.length, 'mesa')} · {mesas.reduce((n, m) => n + m.capacidad, 0)} lugares en total
              </p>
            </div>
          )}

          <div className="panel salon-editor__tamano">
            <h2>Tamaño del plano</h2>
            <div className="form-row">
              <SelectField
                label="Columnas"
                options={opcionesLado('columna')}
                value={String(columnas)}
                onChange={(e) => cambiarTamano('salon.columnas', Number(e.target.value))}
              />
              <SelectField
                label="Filas"
                options={opcionesLado('fila')}
                value={String(filas)}
                onChange={(e) => cambiarTamano('salon.filas', Number(e.target.value))}
              />
            </div>
            <p className="muted">
              El texto de la cocina ("{cocina || 'sin texto'}") se cambia en Textos y fotos. La cocina, el baño, la estantería, la
              ventana y la entrada son fijos: las mesas se ubican alrededor.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}

interface EditorMesaProps {
  mesa: Mesa;
  mesas: Mesa[];
  columnas: number;
  filas: number;
  ocupado: boolean;
  onGuardado: () => void;
  onEliminar: () => void;
  onCerrar: () => void;
}

function EditorMesa({ mesa, mesas, columnas, filas, ocupado, onGuardado, onEliminar, onCerrar }: EditorMesaProps) {
  const toast = useToast();
  const [numero, setNumero] = useState(String(mesa.numero));
  const [capacidad, setCapacidad] = useState(String(mesa.capacidad));
  const [x, setX] = useState(String(mesa.posicionX));
  const [y, setY] = useState(String(mesa.posicionY));
  const [errores, setErrores] = useState({ numero: '', capacidad: '', lugar: '' });
  const [guardando, setGuardando] = useState(false);

  const guardar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const n = Number(numero);
    const c = Number(capacidad);
    const otraEnLugar = mesas.find((m) => m.id !== mesa.id && m.posicionX === Number(x) && m.posicionY === Number(y));
    const nuevos = {
      numero: !Number.isInteger(n) || n <= 0 ? 'El número es un entero mayor a 0.' : mesas.some((m) => m.id !== mesa.id && m.numero === n) ? `Ya hay una mesa ${n}.` : '',
      capacidad: !Number.isInteger(c) || c <= 0 ? 'La capacidad es un entero mayor a 0.' : '',
      lugar: otraEnLugar ? `Ahí está la mesa ${otraEnLugar.numero}. Arrastrala en el plano para intercambiarlas.` : ''
    };
    setErrores(nuevos);
    if (nuevos.numero || nuevos.capacidad || nuevos.lugar) {
      enfocarPrimerError(evento.currentTarget);
      return;
    }

    setGuardando(true);
    try {
      await updateMesa(mesa.id, { numero: n, capacidad: c, posicionX: Number(x), posicionY: Number(y) });
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
      <div className="form-row">
        <SelectField
          label="Columna"
          options={Array.from({ length: columnas }, (_, i) => ({ value: String(i), label: `Columna ${i + 1}` }))}
          value={x}
          error={errores.lugar}
          onChange={(e) => {
            setX(e.target.value);
            setErrores((er) => ({ ...er, lugar: '' }));
          }}
        />
        <SelectField
          label="Fila"
          options={Array.from({ length: filas }, (_, i) => ({ value: String(i), label: `Fila ${i + 1}` }))}
          value={y}
          onChange={(e) => {
            setY(e.target.value);
            setErrores((er) => ({ ...er, lugar: '' }));
          }}
        />
      </div>
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
