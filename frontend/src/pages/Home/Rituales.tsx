import { useContenido } from '../../context/ContenidoContext';
import { resolverImagen } from '../../utils/imagenes';
import { EditarAqui } from '../../components/EditarAqui/EditarAqui';
import './Rituales.css';

/** "Lo que pasa en Pepe": las costumbres de la casa, ordenadas por cuándo pasan. */
export function Rituales() {
  const { texto } = useContenido();
  const rituales = [1, 2, 3, 4]
    .map((n) => ({
      n,
      cuando: texto(`rituales.${n}.cuando`),
      titulo: texto(`rituales.${n}.titulo`),
      texto: texto(`rituales.${n}.texto`),
      foto: resolverImagen(texto(`rituales.${n}.foto`)),
      fotoAlt: texto(`rituales.${n}.fotoAlt`)
    }))
    .filter((r) => r.titulo);

  if (rituales.length === 0) return null;

  return (
    <section className="banda rituales paper" aria-labelledby="rituales-titulo">
      <div className="wrap">
        <div className="rituales__cabecera">
          <h2 id="rituales-titulo" className="reveal">
            {texto('rituales.titulo')}
          </h2>
          <p className="reveal">{texto('rituales.bajada')}</p>
          <EditarAqui to="/admin/contenido#rituales" que="las costumbres de la casa" />
        </div>

        <ol className="rituales__lista" role="list">
          {rituales.map((r) => (
            <li key={r.n} className="ritual reveal">
              <div className="ritual__foto">{r.foto && <img src={r.foto} alt={r.fotoAlt} loading="lazy" />}</div>
              <div className="ritual__texto">
                <p className="ritual__cuando">{r.cuando}</p>
                <h3 className="ritual__titulo">{r.titulo}</h3>
                <p>{r.texto}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
