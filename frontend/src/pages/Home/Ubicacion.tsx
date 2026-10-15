import { useContacto, useFoto, useUbicacion } from '../../hooks/useSitio';
import { EditarAqui } from '../../components/EditarAqui/EditarAqui';
import { Icon } from '../../components/Icon/Icon';
import './Ubicacion.css';

/** "Dónde estamos": la dirección en grande, el mapa de Google y la puerta del local. */
export function Ubicacion() {
  const u = useUbicacion();
  const contacto = useContacto();
  const puerta = useFoto('ubicacion.foto');

  return (
    <section className="section wrap ubicacion" id="ubicacion" aria-labelledby="ubicacion-titulo">
      <div className="ubicacion__texto">
        <h2 id="ubicacion-titulo" className="reveal">
          {u.titulo}
        </h2>
        <address className="ubicacion__direccion reveal">
          <span className="ubicacion__calle">{contacto.direccion}</span>
          <span>{contacto.barrio}</span>
        </address>
        <p className="ubicacion__bajada reveal">{u.bajada}</p>

        <dl className="ubicacion__datos reveal">
          <div>
            <dt>Abrimos</dt>
            <dd>
              {contacto.dias}, {contacto.horario}
              {contacto.horarioExtendido && <span className="ubicacion__extra">{contacto.horarioExtendido}</span>}
            </dd>
          </div>
          <div>
            <dt>WhatsApp</dt>
            <dd>
              <a href={contacto.whatsappHref} target="_blank" rel="noopener noreferrer">
                {contacto.telefono}
              </a>
            </dd>
          </div>
          {u.accesibilidad && (
            <div>
              <dt>Acceso</dt>
              <dd>{u.accesibilidad}</dd>
            </div>
          )}
        </dl>

        <div className="ubicacion__acciones reveal">
          <a className="btn btn--primary" href={u.comoLlegar} target="_blank" rel="noopener noreferrer">
            {u.boton}
            <Icon name="arrow" size={16} />
            <span className="sr-only"> (se abre Google Maps en otra pestaña)</span>
          </a>
          <EditarAqui to="/admin/contenido#ubicacion" que="la ubicación" />
        </div>

        {puerta.src && (
          <div className="ubicacion__puerta reveal">
            <img src={puerta.src} alt={puerta.alt} loading="lazy" />
          </div>
        )}
      </div>

      <div className="ubicacion__mapa reveal">
        <iframe
          title={`Mapa de Google con la ubicación de Pepe Di Roma: ${contacto.direccion}, ${contacto.barrio}`}
          src={u.mapa}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
    </section>
  );
}
