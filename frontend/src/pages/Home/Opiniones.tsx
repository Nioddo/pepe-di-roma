import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { useContenido } from '../../context/ContenidoContext';
import { getCalificacionesPublicas } from '../../services/calificacionesService';
import { getPlatos } from '../../services/platosService';
import { formatearFecha, plural } from '../../utils/formato';
import { TEXTO_PUNTAJE } from '../../utils/puntaje';
import { ArchScore } from '../../components/ArchRating/ArchRating';
import { Button, ButtonLink } from '../../components/Button/Button';
import { EditarAqui } from '../../components/EditarAqui/EditarAqui';
import { Icon } from '../../components/Icon/Icon';
import { SkeletonBlock, Loading } from '../../components/Skeleton/Skeleton';
import type { Calificacion, Plato } from '../../types';
import './Opiniones.css';

const cargar = () => Promise.all([getCalificacionesPublicas(), getPlatos()]);

/** Cuántas opiniones entran en el carrusel: las mejores, y entre iguales las más nuevas. */
const EN_CARRUSEL = 10;

function TarjetaOpinion({ opinion, plato }: { opinion: Calificacion; plato?: Plato }) {
  return (
    <figure className="opinion-card">
      <ArchScore puntaje={opinion.puntaje} />
      <blockquote className="opinion-card__texto">
        <p>{opinion.mensaje}</p>
      </blockquote>
      <figcaption className="opinion-card__firma">
        <b>{opinion.firma}</b>
        <span>
          {formatearFecha(opinion.fecha)}
          {plato && ` · comió ${plato.nombre}`}
        </span>
      </figcaption>
      {opinion.respuesta && (
        <p className="opinion__respuesta">
          <b>Pepe responde:</b> {opinion.respuesta}
        </p>
      )}
    </figure>
  );
}

/** Cinco arcos grandes: tocar uno abre la encuesta con ese puntaje ya elegido. */
function ArcosParaOpinar() {
  return (
    <nav className="arcos-opinar" aria-label="Puntuar rápido">
      <p className="arcos-opinar__texto">¿Cuánto le das? Tocá un arco.</p>
      <ul className="arcos-opinar__fila" role="list">
        {[1, 2, 3, 4, 5].map((n) => (
          <li key={n} style={{ '--n': n } as CSSProperties}>
            <Link className="arcos-opinar__arco" to={`/opinar?puntaje=${n}`} aria-label={`Puntuar con ${n} de 5, ${TEXTO_PUNTAJE[n].toLowerCase()}`}>
              <span aria-hidden="true">{n}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Carrusel horizontal: se desliza con el dedo, la rueda, las flechas del teclado o los botones. */
function Carrusel({ opiniones, platoDe }: { opiniones: Calificacion[]; platoDe: (id: number | null) => Plato | undefined }) {
  const pista = useRef<HTMLUListElement>(null);
  const [bordes, setBordes] = useState({ inicio: true, fin: false });

  const medir = useCallback(() => {
    const el = pista.current;
    if (!el) return;
    setBordes({ inicio: el.scrollLeft <= 4, fin: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    medir();
    window.addEventListener('resize', medir);
    return () => window.removeEventListener('resize', medir);
  }, [medir, opiniones.length]);

  const mover = (paso: 1 | -1) => {
    const el = pista.current;
    const tarjeta = el?.querySelector('li');
    if (!el || !tarjeta) return;
    const reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: paso * (tarjeta.getBoundingClientRect().width + 20), behavior: reducir ? 'auto' : 'smooth' });
  };

  return (
    <div className="carrusel">
      <ul
        ref={pista}
        className="carrusel__pista"
        role="list"
        tabIndex={0}
        aria-label="Las mejores opiniones de los clientes. Se desliza de costado."
        onScroll={medir}
      >
        {opiniones.map((o) => (
          <li key={o.id} className="carrusel__item">
            <TarjetaOpinion opinion={o} plato={platoDe(o.platoId)} />
          </li>
        ))}
      </ul>
      {opiniones.length > 1 && (
        <div className="wrap carrusel__controles">
          <button type="button" className="carrusel__btn" aria-label="Ver opiniones anteriores" disabled={bordes.inicio} onClick={() => mover(-1)}>
            <Icon name="prev" size={20} />
          </button>
          <button type="button" className="carrusel__btn" aria-label="Ver más opiniones" disabled={bordes.fin} onClick={() => mover(1)}>
            <Icon name="next" size={20} />
          </button>
        </div>
      )}
    </div>
  );
}

/** "Nuestras calificaciones": el promedio y un carrusel con las mejores opiniones. */
export function Opiniones() {
  const { texto } = useContenido();
  const { data, loading, error, recargar } = useApi(cargar);
  const [opiniones, platos] = data ?? [[], []];
  const platoDe = (id: number | null) => platos.find((p) => p.id === id);

  const total = opiniones.length;
  const promedio = total ? opiniones.reduce((n, o) => n + o.puntaje, 0) / total : 0;
  const mejores = opiniones
    .slice()
    .sort((a, b) => b.puntaje - a.puntaje || b.fecha.localeCompare(a.fecha) || b.id - a.id)
    .slice(0, EN_CARRUSEL);

  let cuerpo;
  if (loading) {
    cuerpo = (
      <Loading label="Cargando las opiniones…">
        <div className="carrusel__pista carrusel__pista--cargando">
          {[0, 1, 2].map((i) => (
            <SkeletonBlock key={i} height={300} radius={24} />
          ))}
        </div>
      </Loading>
    );
  } else if (error) {
    cuerpo = (
      <div className="wrap">
        <div className="opiniones__vacio">
          <p className="opiniones__vacio-titulo">No pudimos cargar las opiniones</p>
          <p>{error}</p>
          <Button variant="secondary" onClick={recargar}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  } else if (total === 0) {
    cuerpo = (
      <div className="wrap opiniones__primera">
        <div className="opiniones__vacio">
          <p className="opiniones__vacio-titulo">Todavía nadie opinó</p>
          <p>Si ya comiste en Pepe, contanos qué te pareció: tu opinión es la primera que se va a leer acá.</p>
          <ButtonLink to="/opinar">{texto('opiniones.boton')}</ButtonLink>
        </div>
        <ArcosParaOpinar />
      </div>
    );
  } else {
    cuerpo = <Carrusel opiniones={mejores} platoDe={platoDe} />;
  }

  return (
    <section className="section opiniones" id="opiniones" aria-labelledby="opiniones-titulo">
      <div className="wrap opiniones__cabecera">
        <div className="opiniones__titulos">
          <h2 id="opiniones-titulo" className="reveal">
            {texto('opiniones.titulo')}
          </h2>
          <p className="reveal">{texto('opiniones.bajada')}</p>
          {texto('opiniones.google') && (
            <p className="opiniones__google reveal">
              <a href={texto('opiniones.googleUrl')} target="_blank" rel="noopener noreferrer">
                {texto('opiniones.google')}
                <span className="sr-only"> (se abre Google Maps en otra pestaña)</span>
              </a>
            </p>
          )}
        </div>
        {total > 0 && (
          <div className="opiniones__promedio reveal">
            <p className="opiniones__numero">
              {promedio.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
              <span className="sr-only"> de 5</span>
            </p>
            <div className="opiniones__resumen">
              <ArchScore puntaje={promedio} />
              <p className="opiniones__total">Promedio de {plural(total, 'opinión', 'opiniones')}</p>
            </div>
          </div>
        )}
        <div className="opiniones__acciones">
          {total > 0 && <ButtonLink to="/opinar">{texto('opiniones.boton')}</ButtonLink>}
          <EditarAqui to="/admin/opiniones" que="las opiniones" />
        </div>
      </div>
      {cuerpo}
    </section>
  );
}
