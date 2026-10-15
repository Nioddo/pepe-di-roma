import { useEffect, useMemo, useRef, useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { useReveal } from '../../hooks/useReveal';
import { getCarta } from '../../services/seccionesService';
import { resolverImagen } from '../../utils/imagenes';
import { formatearPrecio } from '../../utils/formato';
import { CARTAS } from '../../content/cartas';
import { bajada, contacto, fotosLocal, nosotros } from '../../content/sitio';
import { ButtonLink, Button } from '../../components/Button/Button';
import { ArchImage } from '../../components/ArchImage/ArchImage';
import { Icon } from '../../components/Icon/Icon';
import { SkeletonList } from '../../components/Skeleton/Skeleton';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { Link } from 'react-router-dom';
import fotoHero from '../../assets/platos/pepediroma_11_cappelacci.jpg';
import './Home.css';

/* ---------- Productos estrella: los platos con foto real, índice con vista previa ---------- */
function ProductosEstrella() {
  const { data, loading, error, recargar } = useApi(getCarta);
  const [activo, setActivo] = useState(0);

  // un plato por foto: si la misma foto está en dos cartas, se muestra una sola vez
  const destacados = useMemo(() => {
    const vistas = new Set<string>();
    return (data?.platos ?? [])
      .filter((p) => {
        const url = resolverImagen(p.imageUrl);
        if (!url || vistas.has(url)) return false;
        vistas.add(url);
        return true;
      })
      .slice(0, 6);
  }, [data]);
  const seleccion = destacados[activo];

  if (loading) return <SkeletonList rows={5} height={56} />;

  if (error) {
    return (
      <EmptyState
        title="No pudimos cargar la carta"
        text={error}
        action={<Button onClick={recargar}>Reintentar</Button>}
      />
    );
  }

  if (!seleccion) {
    return <EmptyState title="La carta se está armando" text="Todavía no hay platos con foto. Volvé pronto." />;
  }

  return (
    <div className="index">
      <div>
        <ul className="index__list" role="list">
          {destacados.map((p, i) => (
            <li key={p.id} className="index__item reveal">
              <button
                type="button"
                aria-current={i === activo}
                aria-controls="estrella-foto"
                onClick={() => setActivo(i)}
                onFocus={() => setActivo(i)}
                onPointerEnter={(e) => {
                  if (e.pointerType === 'mouse') setActivo(i);
                }}
              >
                {p.nombre}
              </button>
            </li>
          ))}
        </ul>
        <div className="index__fact reveal" aria-live="polite">
          <p className="index__precio">{formatearPrecio(seleccion.precio)}</p>
          {seleccion.descripcion && <p>{seleccion.descripcion}</p>}
        </div>
        <div className="reveal index__cta">
          <ButtonLink to="/menu">Ver las cartas</ButtonLink>
        </div>
      </div>

      <div className="index__frame reveal" id="estrella-foto">
        {destacados.map((p, i) => (
          <ArchImage
            key={p.id}
            className="index__image"
            src={resolverImagen(p.imageUrl)}
            alt={p.nombre}
            data-on={i === activo}
          />
        ))}
      </div>
    </div>
  );
}

/* ---------- Nuestras cartas: las tres, como enlaces grandes ---------- */
function NuestrasCartas() {
  return (
    <ul className="cartas-lista" role="list">
      {CARTAS.map((c) => (
        <li key={c.id} className="reveal">
          <Link className="cartas-lista__item" to={`/menu?carta=${c.id.toLowerCase()}`}>
            <span className="cartas-lista__nombre">{c.nombre}</span>
            <span className="cartas-lista__uso">{c.uso}</span>
            <span className="cartas-lista__flecha" aria-hidden="true">
              <Icon name="arrow" size={28} />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/* ---------- Sobre nosotros: carrusel con el arco ---------- */
function SobreNosotros() {
  const [foto, setFoto] = useState(0);
  const [pausado, setPausado] = useState(false);
  const total = fotosLocal.length;

  useEffect(() => {
    const reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (pausado || reducir) return;
    const id = window.setInterval(() => setFoto((f) => (f + 1) % total), 5000);
    return () => window.clearInterval(id);
  }, [pausado, total]);

  const mover = (paso: number) => setFoto((f) => (f + paso + total) % total);

  return (
    <div
      className="about"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocus={() => setPausado(true)}
      onBlur={() => setPausado(false)}
    >
      <div className="about__text">
        <h2 id="nosotros-titulo" className="reveal">
          Sobre nosotros
        </h2>
        <p className="about__tagline reveal">{bajada}.</p>
        <p className="about__body reveal">{nosotros}</p>
        <div className="reveal">
          <ButtonLink to="/reservar" variant="inverse">
            Conocé el local
          </ButtonLink>
        </div>
        <div className="carousel-ctrl reveal">
          <button type="button" className="round-btn" aria-label="Foto anterior" onClick={() => mover(-1)}>
            <Icon name="prev" size={18} />
          </button>
          <button type="button" className="round-btn" aria-label="Foto siguiente" onClick={() => mover(1)}>
            <Icon name="next" size={18} />
          </button>
          <p className="carousel-caption" aria-live="polite">
            <span className="carousel-count">
              {foto + 1} / {total}
            </span>
            {fotosLocal[foto].texto}
          </p>
        </div>
      </div>

      <div className="about__media" aria-roledescription="carrusel" aria-label="Fotos del local">
        {fotosLocal.map((f, i) => (
          <img key={f.src} src={f.src} alt={f.alt} loading="lazy" data-on={i === foto} aria-hidden={i !== foto} />
        ))}
      </div>
    </div>
  );
}

export function Home() {
  const raiz = useRef<HTMLDivElement>(null);
  const titulo = useRef<HTMLHeadingElement>(null);
  useReveal(raiz);

  useEffect(() => {
    document.title = 'Pepe Di Roma · Fábrica de pastas artesanales';
    titulo.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div ref={raiz}>
      <section className="hero" aria-labelledby="hero-titulo">
        <div className="hero__in">
          <div className="hero__copy">
            <h1 id="hero-titulo" ref={titulo} tabIndex={-1} className="reveal">
              Pastas hechas
              <br />a la vista
            </h1>
            <p className="hero__lead reveal">
              Todos los días, en Villa Devoto. Lo tradicional de una fábrica de pastas, con el alma de un
              restaurante contemporáneo.
            </p>
            <div className="hero__actions reveal">
              <ButtonLink to="/reservar">Reservar</ButtonLink>
              <ButtonLink to="/pedido" variant="secondary">
                Hacer pedido
              </ButtonLink>
            </div>
          </div>
        </div>
        <div className="hero__media">
          <div className="hero__arch-back" aria-hidden="true" />
          <div className="hero__arch">
            <img src={fotoHero} alt="Manos rellenando pasta fresca a mano sobre la mesada" fetchPriority="high" />
          </div>
        </div>
      </section>

      <section className="banda paper" aria-labelledby="estrella-titulo">
        <div className="wrap">
          <h2 id="estrella-titulo" className="index__heading reveal">
            Productos estrella
          </h2>
          <ProductosEstrella />
        </div>
      </section>

      <section className="section wrap" aria-labelledby="cartas-titulo">
        <div className="cartas-cabecera">
          <h2 id="cartas-titulo" className="reveal">
            Nuestras cartas
          </h2>
          <p className="reveal">La del restaurante, la del mostrador y la de la merienda.</p>
        </div>
        <NuestrasCartas />
      </section>

      <section className="section section--tight wrap" aria-labelledby="nosotros-titulo">
        <SobreNosotros />
      </section>

      <Link className="cta-band" to="/reservar">
        <span className="cta-band__note">
          Toda reserva dura 2 horas. {contacto.dias}, de 12 a 15 h y de 20 a 24 h.
        </span>
        <span className="cta-band__arrow">
          <Icon name="arrow" size={48} />
        </span>
        <span className="cta-band__word">Reservar</span>
      </Link>
    </div>
  );
}
