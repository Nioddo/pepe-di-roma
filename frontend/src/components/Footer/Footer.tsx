import { Link } from 'react-router-dom';
import { bajada, contacto } from '../../content/sitio';
import './Footer.css';

// El nombre se arma con los mismos arcos del logotipo, como cajas sobre el rojo del packaging.
const LETRAS = ['P', 'E', 'P', 'E', 'D', 'I', 'R', 'O', 'M', 'A'];
const ALTURAS = [100, 82, 92, 74, 64, 64, 96, 86, 100, 78];
const ANIO = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-mark" aria-hidden="true">
          {LETRAS.map((letra, i) => (
            <span key={i} style={{ height: `${ALTURAS[i]}%` }}>
              {letra}
            </span>
          ))}
        </div>

        <div className="footer-grid">
          <div>
            <h2 className="footer-title">Pepe Di Roma</h2>
            <p className="footer-text">
              Fábrica de pastas artesanales. Rústico, pero elegante: pasta fresca hecha a la vista, todos los días.
            </p>
          </div>

          <nav aria-label="Pie de página">
            <h2 className="footer-title">Navegación</h2>
            <ul>
              <li><Link to="/menu">Menú</Link></li>
              <li><Link to="/reservar">Reservar</Link></li>
              <li><Link to="/pedido">Hacer pedido</Link></li>
            </ul>
          </nav>

          <div>
            <h2 className="footer-title">Contacto</h2>
            <ul>
              <li>{contacto.barrio}</li>
              <li><a href={contacto.telefonoHref}>{contacto.telefono}</a></li>
              <li><a href={`mailto:${contacto.email}`}>{contacto.email}</a></li>
            </ul>
          </div>

          <div>
            <h2 className="footer-title">Horario</h2>
            <ul>
              <li>{contacto.dias}</li>
              <li>{contacto.horario}</li>
              <li>Instagram {contacto.instagram}</li>
            </ul>
          </div>
        </div>

        <div className="footer-base">
          <span>© {ANIO} Pepe Di Roma · Villa Devoto, Buenos Aires</span>
          <span>{bajada}</span>
        </div>
      </div>
    </footer>
  );
}
