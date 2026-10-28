import { useState, type FormEvent } from 'react';
import { useToast } from '../../context/ToastContext';
import { updatePedido } from '../../services/pedidosService';
import { mensajeDeError } from '../../services/api';
import { formatearPrecio } from '../../utils/formato';
import { ESTADO_PEDIDO, METODO_PAGO } from '../../utils/estados';
import { enfocarPrimerError } from '../../utils/foco';
import { Editor } from '../../components/Editor/Editor';
import { Check, InlineError, SelectField, TextField } from '../../components/Field/Field';
import { Stepper } from '../../components/Stepper/Stepper';
import { Button } from '../../components/Button/Button';
import type { EstadoPedido, MetodoPago, Pedido, Plato } from '../../types';

const opciones = <K extends string>(textos: Record<K, string>) =>
  (Object.keys(textos) as K[]).map((k) => ({ value: k, label: textos[k] }));

const ESTADOS = (Object.keys(ESTADO_PEDIDO) as EstadoPedido[]).map((e) => ({ value: e, label: ESTADO_PEDIDO[e].texto }));

interface Linea {
  platoId: number;
  cantidad: number;
}

interface EditorPedidoProps {
  pedido: Pedido;
  platos: Plato[];
  onCerrar: () => void;
  onGuardado: () => void;
}

/** El admin puede cambiar todo el pedido: estado, hora de retiro, a nombre de quién, pago y lo que lleva. */
export function EditorPedido({ pedido, platos, onCerrar, onGuardado }: EditorPedidoProps) {
  const toast = useToast();
  const [estado, setEstado] = useState<EstadoPedido>(pedido.estado);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>(pedido.metodoPago);
  const [hora, setHora] = useState(pedido.horaRetiro ?? '');
  const [nombre, setNombre] = useState(pedido.nombre ?? '');
  const [pagado, setPagado] = useState(pedido.pagoRecibido);
  const [lineas, setLineas] = useState<Linea[]>(pedido.items.map((it) => ({ platoId: it.platoId, cantidad: it.cantidad })));
  const [agregar, setAgregar] = useState('');
  const [errores, setErrores] = useState({ items: '' });
  const [guardando, setGuardando] = useState(false);

  const platoDe = (id: number) => platos.find((p) => p.id === id);
  const nombreDe = (id: number) => platoDe(id)?.nombre ?? pedido.items.find((it) => it.platoId === id)?.nombre ?? `Plato #${id}`;
  const total = lineas.reduce((n, l) => n + (platoDe(l.platoId)?.precio ?? 0) * l.cantidad, 0);

  const cambiarCantidad = (platoId: number, cantidad: number) => {
    setLineas((ls) => (cantidad <= 0 ? ls.filter((l) => l.platoId !== platoId) : ls.map((l) => (l.platoId === platoId ? { ...l, cantidad } : l))));
    setErrores((e) => ({ ...e, items: '' }));
  };

  const sumarPlato = () => {
    const id = Number(agregar);
    if (!id) return;
    setLineas((ls) => (ls.some((l) => l.platoId === id) ? ls.map((l) => (l.platoId === id ? { ...l, cantidad: l.cantidad + 1 } : l)) : [...ls, { platoId: id, cantidad: 1 }]));
    setAgregar('');
    setErrores((e) => ({ ...e, items: '' }));
  };

  const guardar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const nuevos = { items: lineas.length === 0 ? 'El pedido tiene que llevar al menos un plato.' : '' };
    setErrores(nuevos);
    if (nuevos.items) {
      enfocarPrimerError(evento.currentTarget);
      return;
    }

    setGuardando(true);
    try {
      // en los pedidos viejos la hora y el nombre pueden quedar vacíos: solo se mandan si están
      await updatePedido(pedido.id, {
        estado,
        metodoPago,
        pagoRecibido: pagado,
        ...(hora && { horaRetiro: hora }),
        ...(nombre.trim() && { nombre: nombre.trim() }),
        items: lineas
      });
      toast.success(`Guardaste los cambios del pedido #${pedido.id}.`);
      onGuardado();
    } catch (err) {
      toast.error(mensajeDeError(err));
    } finally {
      setGuardando(false);
    }
  };

  const disponibles = platos
    .filter((p) => !lineas.some((l) => l.platoId === p.id))
    .sort((a, b) => a.nombre.localeCompare(b.nombre))
    .map((p) => ({ value: String(p.id), label: `${p.nombre} · ${formatearPrecio(p.precio)}` }));

  return (
    <Editor titulo={`Editar el pedido #${pedido.id}`} onSubmit={guardar} onCancelar={onCerrar} guardando={guardando}>
      <SelectField label="Estado" options={ESTADOS} value={estado} onChange={(e) => setEstado(e.target.value as EstadoPedido)} />
      <SelectField label="Forma de pago" options={opciones(METODO_PAGO)} value={metodoPago} onChange={(e) => setMetodoPago(e.target.value as MetodoPago)} />
      <TextField label="Hora de retiro" type="time" step={900} value={hora} onChange={(e) => setHora(e.target.value)} />
      <TextField label="A nombre de" maxLength={60} value={nombre} onChange={(e) => setNombre(e.target.value)} />
      <div className="editor__ancho editor-pedido__pago">
        <Check label="El pago ya se recibió" checked={pagado} onChange={(e) => setPagado(e.target.checked)} />
      </div>

      <fieldset className="editor__ancho editor-pedido__items">
        <legend>Qué lleva</legend>
        {lineas.length > 0 ? (
          <ul className="editor-pedido__lista" role="list">
            {lineas.map((l) => (
              <li key={l.platoId}>
                <span>{nombreDe(l.platoId)}</span>
                <span className="editor-pedido__precio">{formatearPrecio((platoDe(l.platoId)?.precio ?? 0) * l.cantidad)}</span>
                <Stepper label={nombreDe(l.platoId)} value={l.cantidad} onChange={(v) => cambiarCantidad(l.platoId, v)} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-inline">El pedido quedó vacío. Agregá al menos un plato.</p>
        )}
        {errores.items && <InlineError>{errores.items}</InlineError>}
        <div className="editor-pedido__agregar">
          <SelectField
            label="Agregar un plato"
            options={[{ value: '', label: 'Elegí un plato…' }, ...disponibles]}
            value={agregar}
            onChange={(e) => setAgregar(e.target.value)}
          />
          <Button variant="secondary" disabled={!agregar} onClick={sumarPlato}>
            Agregar
          </Button>
        </div>
        <p className="editor-pedido__total">
          Total con los precios de hoy: <b>{formatearPrecio(total)}</b>
        </p>
      </fieldset>
    </Editor>
  );
}
