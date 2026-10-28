import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useApi } from '../../hooks/useApi';
import { getCarta } from '../../services/seccionesService';
import { createPedido } from '../../services/pedidosService';
import { mensajeDeError } from '../../services/api';
import { useCartas } from '../../hooks/useSitio';
import { cantidadesPorCarta, cartaDesdeParametro } from '../../utils/carta';
import { formatearPrecio, plural } from '../../utils/formato';
import { METODO_PAGO } from '../../utils/estados';
import { horasRetiro } from '../../utils/reservas';
import { hayErrores, validarRequerido, type Errores } from '../../utils/validacion';
import { esPersonal } from '../../utils/sesion';
import { enfocarPrimerError } from '../../utils/foco';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { CartaSheet } from '../../components/Carta/CartaSheet';
import { CartaTabs } from '../../components/Carta/CartaTabs';
import { Stepper } from '../../components/Stepper/Stepper';
import { Toggle } from '../../components/Toggle/Toggle';
import { InlineError, SelectField, TextField } from '../../components/Field/Field';
import { ButtonLink } from '../../components/Button/Button';
import { Button } from '../../components/Button/Button';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { SkeletonList } from '../../components/Skeleton/Skeleton';
import type { CartaId, MetodoPago } from '../../types';
import './Order.css';

type Campo = 'carrito' | 'hora' | 'nombre';

const PANEL = 'panel-pedido';

const PAGOS = (Object.keys(METODO_PAGO) as MetodoPago[]).map((m) => ({ value: m, label: METODO_PAGO[m] }));

export function Order() {
  const { usuario } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  const cajaRef = useRef<HTMLElement>(null);
  // en el teléfono la caja queda al final: mientras no se ve, una barra abajo muestra el total
  const [cajaVisible, setCajaVisible] = useState(false);
  const [params, setParams] = useSearchParams();

  const { data, loading, error, recargar } = useApi(getCarta);
  const { cartaInfo } = useCartas();
  const [cantidades, setCantidades] = useState<Record<number, number>>({});
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('EFECTIVO');
  const [hora, setHora] = useState('');
  const [nombre, setNombre] = useState('');
  const [errores, setErrores] = useState<Errores<Campo>>({});
  const [enviando, setEnviando] = useState(false);

  const elegida = cartaDesdeParametro(params.get('carta'));
  const secciones = (data?.porCarta[elegida] ?? []).filter((s) => s.platosDetalle.length > 0);
  const lineas = (data?.platos ?? []).filter((p) => (cantidades[p.id] ?? 0) > 0);
  const unidades = lineas.reduce((n, p) => n + cantidades[p.id], 0);
  const total = lineas.reduce((suma, p) => suma + p.precio * cantidades[p.id], 0);
  // cuantos más platos, más tarde la primera hora posible
  const horas = horasRetiro(unidades);

  const cambiarCarta = (id: CartaId) => setParams({ carta: id.toLowerCase() }, { replace: true });

  useEffect(() => {
    const caja = cajaRef.current;
    if (!caja || !('IntersectionObserver' in window)) return;
    const observador = new IntersectionObserver(([e]) => setCajaVisible(e.isIntersecting), { threshold: 0.15 });
    observador.observe(caja);
    return () => observador.disconnect();
  }, []);

  const irACaja = () => {
    const titulo = document.getElementById('caja-titulo');
    if (!titulo) return;
    const reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    titulo.scrollIntoView({ behavior: reducir ? 'auto' : 'smooth', block: 'start' });
    titulo.focus({ preventScroll: true });
  };

  const cambiarCantidad = (platoId: number, cantidad: number) => {
    setCantidades((actual) => ({ ...actual, [platoId]: Math.max(0, cantidad) }));
    setErrores((e) => ({ ...e, carrito: '' }));
  };

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();
    if (!usuario) return;

    const nuevos: Errores<Campo> = {
      carrito: lineas.length === 0 ? 'Tu pedido está vacío. Sumá al menos un plato de la carta.' : '',
      hora: !hora ? 'Elegí a qué hora pasás a retirar.' : !horas.includes(hora) ? 'Con lo que sumaste no llegamos a esa hora: elegí otra.' : '',
      nombre: validarRequerido(nombre, 'Decinos a nombre de quién lo preparamos.')
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
        metodoPago,
        nombre: nombre.trim(),
        horaRetiro: hora,
        items: lineas.map((p) => ({ platoId: p.id, cantidad: cantidades[p.id] }))
      });
      toast.success(`Pedido #${pedido.id} enviado: ${formatearPrecio(pedido.precioTotal)}. Lo retirás a las ${hora} h.`);
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
        key={elegida}
        compacta
        carta={cartaInfo(elegida)}
        secciones={secciones}
        accion={(p) => (
          <Stepper label={p.nombre} value={cantidades[p.id] ?? 0} onChange={(v) => cambiarCantidad(p.id, v)} />
        )}
      />
    );
  }

  // los pedidos son de los clientes: el personal los gestiona, no los hace
  if (esPersonal(usuario)) {
    return (
      <>
        <PageHeader title="Armá tu pedido" />
        <div className="wrap page">
          <EmptyState
            title="El personal no hace pedidos desde la web"
            text="Los pedidos los hacen los clientes. Desde Gestión de pedidos podés ver, cambiar el estado o corregir cualquiera."
            action={<ButtonLink to="/admin/pedidos">Ir a Gestión de pedidos</ButtonLink>}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Armá tu pedido"
        lead="Elegí de cualquiera de las tres cartas, decinos a qué hora pasás y lo retirás en el local."
      />

      <div className="wrap page">
        <div className="pedido">
          <div className="pedido__carta">
            <CartaTabs value={elegida} onChange={cambiarCarta} panelId={PANEL} cantidades={cantidadesPorCarta(data)} />
            {/* la carta se desplaza adentro de su recuadro: la caja con "Confirmar" queda siempre a la vista */}
            <div id={PANEL} role="tabpanel" aria-labelledby={`tab-${elegida}`} className="pedido__hoja" tabIndex={0}>
              {carta}
            </div>
          </div>

          {/* el carrito es la caja roja del packaging */}
          <aside className="caja" aria-labelledby="caja-titulo" ref={cajaRef}>
            <h2 id="caja-titulo" className="caja__titulo" tabIndex={-1}>
              Tu pedido
              {unidades > 0 && <span className="caja__cuenta">{unidades}</span>}
            </h2>

            {lineas.length > 0 ? (
              <ul className="caja__lineas">
                {lineas.map((p) => (
                  <li key={p.id} className="caja__linea">
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
              <span key={total} className="caja__monto">
                {formatearPrecio(total)}
              </span>
            </div>
            {errores.carrito && <InlineError>{errores.carrito}</InlineError>}

            <form ref={formRef} onSubmit={enviar} noValidate className="caja__form">
              <p className="caja__modalidad">Para retirar en el local</p>
              {horas.length > 0 ? (
                <SelectField
                  label="Hora de retiro"
                  hint="Hoy. La primera hora es cuando ya lo tenemos listo."
                  options={[{ value: '', label: 'Elegí la hora' }, ...horas.map((h) => ({ value: h, label: `${h} h` }))]}
                  value={hora}
                  error={errores.hora}
                  onChange={(e) => {
                    setHora(e.target.value);
                    setErrores((er) => ({ ...er, hora: '' }));
                  }}
                />
              ) : (
                <p className="caja__nota">Por hoy ya no llegamos a prepararlo. Abrimos mañana a las 8:30.</p>
              )}
              <TextField
                label="A nombre de"
                autoComplete="name"
                maxLength={60}
                hint="Quién pasa a buscarlo."
                value={nombre}
                error={errores.nombre}
                onChange={(e) => {
                  setNombre(e.target.value);
                  setErrores((er) => ({ ...er, nombre: '' }));
                }}
              />
              <Toggle legend="Pago" options={PAGOS} value={metodoPago} onChange={setMetodoPago} />
              <p className="caja__nota">Descuento por pago en efectivo: 10%, se aplica en el local.</p>
              <Button type="submit" variant="inverse" block loading={enviando} disabled={horas.length === 0}>
                Confirmar pedido
              </Button>
            </form>
          </aside>
        </div>
      </div>

      {unidades > 0 && !cajaVisible && (
        <div className="pedido-barra" role="region" aria-label="Resumen de tu pedido">
          <p className="pedido-barra__resumen">
            <span>{plural(unidades, 'plato')}</span>
            <b key={total} className="pedido-barra__monto">{formatearPrecio(total)}</b>
          </p>
          <Button variant="inverse" size="sm" onClick={irACaja}>
            Ver pedido
          </Button>
        </div>
      )}
    </>
  );
}
