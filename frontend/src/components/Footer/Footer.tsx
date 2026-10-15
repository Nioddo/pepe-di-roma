import { useRef, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useReveal } from '../../hooks/useReveal';
import { useContenido } from '../../context/ContenidoContext';
import { useContacto } from '../../hooks/useSitio';
import './Footer.css';

// El nombre se arma con los mismos arcos del logotipo, como cajas sobre el rojo del packaging.
const LETRAS = ['P', 'E', 'P', 'E', 'D', 'I', 'R', 'O', 'M', 'A'];
const ALTURAS = [100, 82, 92, 74, 64, 64, 96, 86, 100, 78];
const ANIO = new Date().getFullYear();

export function Footer() {
  const { texto } = useContenido();
  const contacto = useContacto();
  const raiz = useRef<HTMLElement>(null);
  useReveal(raiz);

  return (
    <footer className="site-footer" ref={raiz}>
      <div className="wrap">
        <div className="footer-mark reveal" aria-hidden="true">
          {LETRAS.map((letra, i) => (
            <span key={i} style={{ height: `${ALTURAS[i]}%`, '--i': i } as CSSProperties}>
              {letra}
            </span>
          ))}
        </div>

        <div className="footer-grid">
          <div>
            <h2 className="footer-title">Pepe Di Roma</h2>
            <p className="footer-text">{texto('footer.texto')}</p>
          </div>

          <nav aria-label="Pie de página">
            <h2 className="footer-title">Navegación</h2>
            <ul>
              <li><Link to="/menu">Menú</Link></li>
              <li><Link to="/reservar">Reservar</Link></li>
              <li><Link to="/pedido">Hacer pedido</Link></li>
              <li><Link to="/opinar">Dejá tu opinión</Link></li>
              {contacto.pedidosya && (
                <li>
                  <a href={contacto.pedidosya} target="_blank" rel="noopener noreferrer">
                    También en PedidosYa
                  </a>
                </li>
              )}
            </ul>
          </nav>

          <div>
            <h2 className="footer-title">Contacto</h2>
            <ul>
              <li>{contacto.direccion}</li>
              <li>{contacto.barrio}</li>
              <li>
                <a href={contacto.whatsappHref} target="_blank" rel="noopener noreferrer">
                  WhatsApp {contacto.telefono}
                </a>
              </li>
              {contacto.email && (
                <li>
                  <a href={`mailto:${contacto.email}`}>{contacto.email}</a>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h2 className="footer-title">Horario</h2>
            <ul>
              <li>{contacto.dias}</li>
              <li>{contacto.horario}</li>
              {contacto.horarioExtendido && <li>{contacto.horarioExtendido}</li>}
              <li>
                <a href={contacto.instagramUrl} target="_blank" rel="noopener noreferrer">
                  Instagram {contacto.instagram}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-base">
          <span>© {ANIO} Pepe Di Roma · {contacto.barrio}</span>
          <span>{texto('sitio.lema')}</span>
        </div>
      </div>
    </footer>
  );
}
