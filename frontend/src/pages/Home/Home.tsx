import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { useReveal } from '../../hooks/useReveal';
import { useContenido } from '../../context/ContenidoContext';
import { useAuth } from '../../context/AuthContext';
import { esPersonal } from '../../utils/sesion';
import { useCartas, useFoto, useFotosLocal } from '../../hooks/useSitio';
import { getCarta } from '../../services/seccionesService';
import { resolverImagen } from '../../utils/imagenes';
import { formatearPrecio } from '../../utils/formato';
import { ButtonLink, Button } from '../../components/Button/Button';
import { ArchImage } from '../../components/ArchImage/ArchImage';
import { Icon } from '../../components/Icon/Icon';
import { SkeletonList } from '../../components/Skeleton/Skeleton';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { EditarAqui } from '../../components/EditarAqui/EditarAqui';
import { Opiniones } from './Opiniones';
import { Ubicacion } from './Ubicacion';
import { Rituales } from './Rituales';
import './Home.css';

/* ---------- Productos estrella: los platos que el admin marca como destacados ---------- */
function ProductosEstrella() {
  const { texto } = useContenido();
  const { data, loading, error, recargar } = useApi(getCarta);
  const [elegido, setElegido] = useState(0);

  const destacados = useMemo(() => (data?.platos ?? []).filter((p) => p.destacado), [data]);
  // si el admin quita destacados, el elegido no puede quedar afuera de la lista
  const activo = Math.min(elegido, Math.max(0, destacados.length - 1));
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
    return <EmptyState title="La carta se está armando" text="Todavía no hay productos destacados. Volvé pronto." />;
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
                onClick={() => setElegido(i)}
                onFocus={() => setElegido(i)}
                onPointerEnter={(e) => {
                  if (e.pointerType === 'mouse') setElegido(i);
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
          <ButtonLink to="/menu">{texto('estrella.boton')}</ButtonLink>
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
  const { cartas } = useCartas();
  return (
    <ul className="cartas-lista" role="list">
      {cartas.map((c) => (
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
  const { texto } = useContenido();
  const fotosLocal = useFotosLocal();
  const [elegida, setFoto] = useState(0);
  const [pausado, setPausado] = useState(false);
  const total = fotosLocal.length;
  const foto = Math.min(elegida, Math.max(0, total - 1));

  useEffect(() => {
    const reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (pausado || reducir || total < 2) return;
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
          {texto('nosotros.titulo')}
        </h2>
        <p className="about__tagline reveal">{texto('nosotros.bajada')}</p>
        <p className="about__body reveal">{texto('nosotros.texto')}</p>
        <div className="about__acciones reveal">
          <ButtonLink to="/reservar" variant="inverse">
            {texto('nosotros.boton')}
          </ButtonLink>
          <EditarAqui to="/admin/contenido#nosotros" que="Sobre nosotros" />
        </div>
        {total > 1 && (
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
        )}
      </div>

      <div className="about__media" aria-roledescription="carrusel" aria-label="Fotos del local">
        {fotosLocal.map((f, i) => (
          <img key={`${f.src}-${i}`} src={f.src} alt={f.alt} loading="lazy" data-on={i === foto} aria-hidden={i !== foto} />
        ))}
      </div>
    </div>
  );
}

export function Home() {
  const { texto } = useContenido();
  const { usuario } = useAuth();
  const fotoHero = useFoto('portada.foto');
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
              {texto('portada.titulo')
                .split('\n')
                .map((linea, i) => (
                  <span key={i} className="hero__linea">
                    {linea}
                  </span>
                ))}
            </h1>
            <p className="hero__lead reveal">{texto('portada.bajada')}</p>
            <div className="hero__actions reveal">
              <ButtonLink to="/reservar">Reservar</ButtonLink>
              {!esPersonal(usuario) && (
                <ButtonLink to="/pedido" variant="secondary">
                  Hacer pedido
                </ButtonLink>
              )}
              <EditarAqui to="/admin/contenido#portada" que="la portada" />
            </div>
          </div>
        </div>
        <div className="hero__media">
          <div className="hero__arch-back" aria-hidden="true" />
          <div className="hero__arch">
            {fotoHero.src && <img src={fotoHero.src} alt={fotoHero.alt} fetchPriority="high" />}
          </div>
        </div>
      </section>

      <section className="banda paper" aria-labelledby="estrella-titulo">
        <div className="wrap">
          <div className="home-cabecera">
            <h2 id="estrella-titulo" className="index__heading reveal">
              {texto('estrella.titulo')}
            </h2>
            <EditarAqui to="/admin/menu" que="los productos estrella" />
          </div>
          <ProductosEstrella />
        </div>
      </section>

      <section className="section wrap" aria-labelledby="cartas-titulo">
        <div className="cartas-cabecera">
          <h2 id="cartas-titulo" className="reveal">
            {texto('cartas.titulo')}
          </h2>
          <p className="reveal">{texto('cartas.bajada')}</p>
          <EditarAqui to="/admin/contenido#cartas" que="las cartas" />
        </div>
        <NuestrasCartas />
      </section>

      <Opiniones />

      <section className="section section--tight wrap" aria-labelledby="nosotros-titulo">
        <SobreNosotros />
      </section>

      <Rituales />

      <Ubicacion />

      <Link className="cta-band" to="/reservar">
        <span className="cta-band__note">{texto('reservar.nota')}</span>
        <span className="cta-band__arrow">
          <Icon name="arrow" size={48} />
        </span>
        <span className="cta-band__word">{texto('reservar.palabra')}</span>
      </Link>
    </div>
  );
}
