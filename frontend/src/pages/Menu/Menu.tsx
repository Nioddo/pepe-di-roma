import { useEffect, useRef, type MouseEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { getCarta } from '../../services/seccionesService';
import { useCartas } from '../../hooks/useSitio';
import { useSeccionActual } from '../../hooks/useSeccionActual';
import { useAuth } from '../../context/AuthContext';
import { esPersonal } from '../../utils/sesion';
import { cantidadesPorCarta, cartaDesdeParametro, idSeccion } from '../../utils/carta';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { CartaSheet } from '../../components/Carta/CartaSheet';
import { CartaTabs } from '../../components/Carta/CartaTabs';
import { Icon } from '../../components/Icon/Icon';
import { Button, ButtonLink } from '../../components/Button/Button';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { Loading } from '../../components/Skeleton/Skeleton';
import type { CartaId } from '../../types';
import './Menu.css';

const PANEL = 'panel-carta';

/** Lleva a la sección y le pasa el foco al título, sin tocar la URL. */
function irASeccion(evento: MouseEvent<HTMLAnchorElement>, id: string) {
  evento.preventDefault();
  const titulo = document.getElementById(`${id}-titulo`);
  if (!titulo) return;
  const reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  titulo.setAttribute('tabindex', '-1');
  titulo.scrollIntoView({ behavior: reducir ? 'auto' : 'smooth', block: 'start' });
  titulo.focus({ preventScroll: true });
}

/** La hoja vacía mientras llega la carta: misma forma, sin contenido. */
function CartaCargando() {
  return (
    <Loading label="Cargando la carta…">
      <div className="carta carta--cargando">
        <div className="skeleton carta-sk__logo" />
        {Array.from({ length: 9 }, (_, i) => (
          <div key={i} className="carta-sk__linea">
            <div className="skeleton" style={{ width: `${48 + ((i * 17) % 30)}%` }} />
            <div className="skeleton" />
          </div>
        ))}
      </div>
    </Loading>
  );
}

export function Menu() {
  const { data, loading, error, recargar } = useApi(getCarta);
  const [params, setParams] = useSearchParams();
  const { cartaInfo } = useCartas();
  const { usuario } = useAuth();

  const elegida = cartaDesdeParametro(params.get('carta'));
  const carta = cartaInfo(elegida);
  const secciones = data?.porCarta[elegida] ?? [];

  const cambiarCarta = (id: CartaId) => setParams({ carta: id.toLowerCase() }, { replace: true });

  // el índice marca la sección que se está leyendo y, en el teléfono, la trae a la vista
  const actual = useSeccionActual(data ? secciones.map((s) => idSeccion(carta, s)) : []);
  const indice = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const lista = indice.current;
    const enlace = lista?.querySelector<HTMLElement>('[aria-current="location"]');
    if (!lista || !enlace || lista.scrollWidth <= lista.clientWidth) return;
    const reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    lista.scrollTo({ left: enlace.offsetLeft - 16, behavior: reducir ? 'auto' : 'smooth' });
  }, [actual]);

  let hoja;
  if (loading) {
    hoja = <CartaCargando />;
  } else if (error) {
    hoja = <EmptyState title="No pudimos cargar la carta" text={error} action={<Button onClick={recargar}>Reintentar</Button>} />;
  } else if (secciones.length === 0) {
    hoja = <EmptyState title="Esta carta está vacía" text="Todavía no hay secciones cargadas. Volvé pronto." />;
  } else {
    hoja = <CartaSheet carta={carta} secciones={secciones} />;
  }

  return (
    <>
      <PageHeader
        title="Nuestro menú"
        lead="Las tres cartas del local, tal cual se imprimen para el salón y el mostrador."
        actions={esPersonal(usuario) ? undefined : <ButtonLink to="/pedido">Hacer pedido</ButtonLink>}
      />

      <div className="mesa">
        <div className="wrap">
          <CartaTabs value={elegida} onChange={cambiarCarta} panelId={PANEL} cantidades={cantidadesPorCarta(data)} />

          {/* en el teléfono las referencias van acá: el índice pegado arriba lleva solo las secciones */}
          <ul className="mesa__leyenda mesa__leyenda--movil" aria-label="Referencias">
            <li>
              <Icon name="picante" size={18} /> Picante
            </li>
            <li>
              <Icon name="vegano" size={18} /> Vegano
            </li>
          </ul>

          <div className="mesa__layout">
            <aside className="mesa__indice" aria-label="Secciones de esta carta">
              <p className="mesa__indice-titulo">En esta carta</p>
              {secciones.length > 0 && (
                <ol className="mesa__secciones" ref={indice}>
                  {secciones.map((s) => (
                    <li key={s.id}>
                      <a
                        href={`#${idSeccion(carta, s)}`}
                        aria-current={actual === idSeccion(carta, s) ? 'location' : undefined}
                        onClick={(e) => irASeccion(e, idSeccion(carta, s))}
                      >
                        {s.grupo ? `${s.grupo} · ${s.titulo}` : s.titulo}
                      </a>
                    </li>
                  ))}
                </ol>
              )}
              <ul className="mesa__leyenda mesa__leyenda--escritorio" aria-label="Referencias">
                <li>
                  <Icon name="picante" size={18} /> Picante
                </li>
                <li>
                  <Icon name="vegano" size={18} /> Vegano
                </li>
              </ul>
            </aside>

            <div id={PANEL} role="tabpanel" aria-labelledby={`tab-${elegida}`} className="mesa__hoja">
              {hoja}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
