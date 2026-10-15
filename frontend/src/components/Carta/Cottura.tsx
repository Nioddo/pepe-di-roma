import { useCottura } from '../../hooks/useSitio';
import './Cottura.css';

/** "Tempo di cottura" de la carta para llevar: las siluetas reales de cada pasta y su tiempo. */
export function Cottura() {
  const cottura = useCottura();

  return (
    <section className="cottura" aria-labelledby="cottura-titulo">
      <h2 className="cottura__titulo" id="cottura-titulo">
        {cottura.titulo}
      </h2>

      <ul className="cottura__grid" role="list">
        {cottura.formas
          .filter((f) => f.tiempo)
          .map((f) => (
            <li key={f.clave} className="reveal">
              <figure className="cottura__forma">
                <img src={f.img} alt="" loading="lazy" />
                <figcaption>
                  {f.nombre}
                  <b>{f.tiempo}</b>
                </figcaption>
              </figure>
            </li>
          ))}
      </ul>

      <dl className="cottura__consejos">
        {cottura.consejos.map((c) => (
          <div key={c.clave} className="cottura__consejo">
            <dt>{c.titulo}</dt>
            {c.texto.map((t) => (
              <dd key={t}>{t}</dd>
            ))}
          </div>
        ))}
      </dl>
    </section>
  );
}
