import { useState, type FormEvent } from 'react';
import { useToast } from '../../context/ToastContext';
import { updatePedido } from '../../services/pedidosService';
import { mensajeDeError } from '../../services/api';
import { formatearPrecio } from '../../utils/formato';
import { ESTADO_PEDIDO, METODO_PAGO, MODALIDAD } from '../../utils/estados';
import { enfocarPrimerError } from '../../utils/foco';
import { Editor } from '../../components/Editor/Editor';
import { Check, InlineError, SelectField, TextAreaField, TextField } from '../../components/Field/Field';
import { validarTelefono } from '../../utils/validacion';
import { Stepper } from '../../components/Stepper/Stepper';
import { Button } from '../../components/Button/Button';
import type { EstadoPedido, MetodoPago, Modalidad, Pedido, Plato } from '../../types';

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

/** El admin puede cambiar todo el pedido: estado, modalidad, pago, dirección y lo que lleva. */
export function EditorPedido({ pedido, platos, onCerrar, onGuardado }: EditorPedidoProps) {
  const toast = useToast();
  const [estado, setEstado] = useState<EstadoPedido>(pedido.estado);
  const [modalidad, setModalidad] = useState<Modalidad>(pedido.modalidad);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>(pedido.metodoPago);
  const [direccion, setDireccion] = useState(pedido.direccion ?? '');
  const [pagado, setPagado] = useState(pedido.pagoRecibido);
  const [telefono, setTelefono] = useState(pedido.telefono ?? '');
  const [indicaciones, setIndicaciones] = useState(pedido.indicaciones ?? '');
  const [lineas, setLineas] = useState<Linea[]>(pedido.items.map((it) => ({ platoId: it.platoId, cantidad: it.cantidad })));
  const [agregar, setAgregar] = useState('');
  const [errores, setErrores] = useState({ direccion: '', items: '', telefono: '' });
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
    const nuevos = {
      direccion: modalidad === 'DELIVERY' && !direccion.trim() ? 'Para el envío a domicilio hace falta la dirección.' : '',
      items: lineas.length === 0 ? 'El pedido tiene que llevar al menos un plato.' : '',
      telefono: validarTelefono(telefono)
    };
    setErrores(nuevos);
    if (nuevos.direccion || nuevos.items || nuevos.telefono) {
      enfocarPrimerError(evento.currentTarget);
      return;
    }

    setGuardando(true);
    try {
      await updatePedido(pedido.id, {
        estado,
        modalidad,
        metodoPago,
        direccion: modalidad === 'DELIVERY' ? direccion.trim() : null,
        pagoRecibido: pagado,
        telefono: telefono.trim(),
        indicaciones: indicaciones.trim() || null,
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
      <SelectField label="Modalidad" options={opciones(MODALIDAD)} value={modalidad} onChange={(e) => setModalidad(e.target.value as Modalidad)} />
      <SelectField label="Forma de pago" options={opciones(METODO_PAGO)} value={metodoPago} onChange={(e) => setMetodoPago(e.target.value as MetodoPago)} />
      {modalidad === 'DELIVERY' && (
        <TextField
          label="Dirección de entrega"
          value={direccion}
          error={errores.direccion}
          onChange={(e) => {
            setDireccion(e.target.value);
            setErrores((er) => ({ ...er, direccion: '' }));
          }}
        />
      )}
      <TextField
        label="Teléfono"
        type="tel"
        value={telefono}
        error={errores.telefono}
        onChange={(e) => {
          setTelefono(e.target.value);
          setErrores((er) => ({ ...er, telefono: '' }));
        }}
      />
      <div className="editor__ancho">
        <TextAreaField label="Indicaciones" rows={2} maxLength={300} value={indicaciones} onChange={(e) => setIndicaciones(e.target.value)} />
      </div>
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
