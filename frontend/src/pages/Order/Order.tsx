import { useRef, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useApi } from '../../hooks/useApi';
import { getCarta } from '../../services/seccionesService';
import { createPedido } from '../../services/pedidosService';
import { mensajeDeError } from '../../services/api';
import { cartaInfo } from '../../content/cartas';
import { cantidadesPorCarta, cartaDesdeParametro } from '../../utils/carta';
import { formatearPrecio } from '../../utils/formato';
import { METODO_PAGO, MODALIDAD } from '../../utils/estados';
import { hayErrores, type Errores } from '../../utils/validacion';
import { enfocarPrimerError } from '../../utils/foco';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { CartaSheet } from '../../components/Carta/CartaSheet';
import { CartaTabs } from '../../components/Carta/CartaTabs';
import { Stepper } from '../../components/Stepper/Stepper';
import { Toggle } from '../../components/Toggle/Toggle';
import { InlineError, TextField } from '../../components/Field/Field';
import { Button } from '../../components/Button/Button';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { SkeletonList } from '../../components/Skeleton/Skeleton';
import type { CartaId, MetodoPago } from '../../types';
import './Order.css';

type ModalidadPedido = 'TAKEAWAY' | 'DELIVERY';
type Campo = 'direccion' | 'carrito';

const PANEL = 'panel-pedido';

const MODALIDADES: { value: ModalidadPedido; label: string }[] = [
  { value: 'TAKEAWAY', label: MODALIDAD.TAKEAWAY },
  { value: 'DELIVERY', label: MODALIDAD.DELIVERY }
];

const PAGOS = (Object.keys(METODO_PAGO) as MetodoPago[]).map((m) => ({ value: m, label: METODO_PAGO[m] }));

export function Order() {
  const { usuario } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  const [params, setParams] = useSearchParams();

  const { data, loading, error, recargar } = useApi(getCarta);
  const [cantidades, setCantidades] = useState<Record<number, number>>({});
  const [modalidad, setModalidad] = useState<ModalidadPedido>('TAKEAWAY');
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('EFECTIVO');
  const [direccion, setDireccion] = useState('');
  const [errores, setErrores] = useState<Errores<Campo>>({});
  const [enviando, setEnviando] = useState(false);

  const elegida = cartaDesdeParametro(params.get('carta'));
  const secciones = (data?.porCarta[elegida] ?? []).filter((s) => s.platosDetalle.length > 0);
  const lineas = (data?.platos ?? []).filter((p) => (cantidades[p.id] ?? 0) > 0);
  const unidades = lineas.reduce((n, p) => n + cantidades[p.id], 0);
  const total = lineas.reduce((suma, p) => suma + p.precio * cantidades[p.id], 0);

  const cambiarCarta = (id: CartaId) => setParams({ carta: id.toLowerCase() }, { replace: true });

  const cambiarCantidad = (platoId: number, cantidad: number) => {
    setCantidades((actual) => ({ ...actual, [platoId]: Math.max(0, cantidad) }));
    setErrores((e) => ({ ...e, carrito: '' }));
  };

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();
    if (!usuario) return;

    const nuevos: Errores<Campo> = {
      carrito: lineas.length === 0 ? 'Tu pedido está vacío. Sumá al menos un plato de la carta.' : '',
      direccion: modalidad === 'DELIVERY' && !direccion.trim() ? 'Ingresá una dirección para el envío.' : ''
    };
    setErrores(nuevos);
    if (hayErrores(nuevos)) {
      if (nuevos.carrito) toast.error('No pudimos confirmar: el pedido está vacío.');
      enfocarPrimerError(formRef.current);
      return;
    }

    setEnviando(true);
    try {
      const pedido = await createPedido({
        clienteId: usuario.id,
        modalidad,
        metodoPago,
        direccion: modalidad === 'DELIVERY' ? direccion.trim() : null,
        items: lineas.map((p) => ({ platoId: p.id, cantidad: cantidades[p.id] }))
      });
      toast.success(
        `Pedido #${pedido.id} enviado: ${formatearPrecio(pedido.precioTotal)}, listo en unos ${pedido.tiempoEstimadoMin} min.`
      );
      navigate('/mis-pedidos');
    } catch (err) {
      toast.error(mensajeDeError(err));
    } finally {
      setEnviando(false);
    }
  };

  let carta;
  if (loading) {
    carta = <SkeletonList rows={8} height={56} />;
  } else if (error) {
    carta = <EmptyState title="No pudimos cargar la carta" text={error} action={<Button onClick={recargar}>Reintentar</Button>} />;
  } else if (secciones.length === 0) {
    carta = <EmptyState title="No hay platos para pedir" text="Esta carta está vacía por ahora. Probá con otra." />;
  } else {
    carta = (
      <CartaSheet
        compacta
        carta={cartaInfo(elegida)}
        secciones={secciones}
        accion={(p) => (
          <Stepper label={p.nombre} value={cantidades[p.id] ?? 0} onChange={(v) => cambiarCantidad(p.id, v)} />
        )}
      />
    );
  }

  return (
    <>
      <PageHeader
        title="Armá tu pedido"
        lead="Elegí de cualquiera de las tres cartas. Retirás en el local o te lo mandamos."
      />

      <div className="wrap page">
        <div className="pedido">
          <div className="pedido__carta">
            <CartaTabs value={elegida} onChange={cambiarCarta} panelId={PANEL} cantidades={cantidadesPorCarta(data)} />
            <div id={PANEL} role="tabpanel" aria-labelledby={`tab-${elegida}`} className="pedido__hoja">
              {carta}
            </div>
          </div>

          {/* el carrito es la caja roja del packaging */}
          <aside className="caja" aria-labelledby="caja-titulo">
            <h2 id="caja-titulo" className="caja__titulo">
              Tu pedido
              {unidades > 0 && <span className="caja__cuenta">{unidades}</span>}
            </h2>

            {lineas.length > 0 ? (
              <ul className="caja__lineas">
                {lineas.map((p) => (
                  <li key={p.id}>
                    <span>
                      {cantidades[p.id]}× {p.nombre}
                    </span>
                    <span>{formatearPrecio(p.precio * cantidades[p.id])}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="caja__vacia">Todavía no sumaste nada. Usá el + de cada plato.</p>
            )}

            <div className="caja__total" aria-live="polite">
              <span>Total</span>
              <span>{formatearPrecio(total)}</span>
            </div>
            {errores.carrito && <InlineError>{errores.carrito}</InlineError>}

            <form ref={formRef} onSubmit={enviar} noValidate className="caja__form">
              <Toggle legend="Modalidad" options={MODALIDADES} value={modalidad} onChange={setModalidad} />
              {modalidad === 'DELIVERY' && (
                <TextField
                  label="Dirección"
                  autoComplete="street-address"
                  hint="Calle, número y piso si corresponde."
                  value={direccion}
                  error={errores.direccion}
                  onChange={(e) => {
                    setDireccion(e.target.value);
                    setErrores((er) => ({ ...er, direccion: '' }));
                  }}
                />
              )}
              <Toggle legend="Pago" options={PAGOS} value={metodoPago} onChange={setMetodoPago} />
              <p className="caja__nota">Descuento por pago en efectivo: 10%, se aplica en el local.</p>
              <Button type="submit" variant="inverse" block loading={enviando}>
                Confirmar pedido
              </Button>
            </form>
          </aside>
        </div>
      </div>
    </>
  );
}
