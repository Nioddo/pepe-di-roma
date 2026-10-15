import { COTTURA } from '../../content/cartas';
import './Cottura.css';

/** "Tempo di cottura" de la carta para llevar: las siluetas reales de cada pasta y su tiempo. */
export function Cottura() {
  return (
    <section className="cottura" aria-labelledby="cottura-titulo">
      <h2 className="cottura__titulo" id="cottura-titulo">
        Tempo di cottura
      </h2>

      <ul className="cottura__grid" role="list">
        {COTTURA.formas.map((f) => (
          <li key={f.nombre}>
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
        {COTTURA.consejos.map((c) => (
          <div key={c.titulo} className="cottura__consejo">
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
