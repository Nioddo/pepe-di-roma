import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminNav.css';

interface Seccion {
  to: string;
  texto: string;
  /** Solo el rol ADMIN (los empleados no administran cuentas). */
  soloAdmin?: boolean;
}

const SECCIONES: Seccion[] = [
  { to: '/admin/pedidos', texto: 'Pedidos' },
  { to: '/admin/reservas', texto: 'Reservas' },
  { to: '/admin/historial', texto: 'Historial' },
  { to: '/admin/metricas', texto: 'Métricas' },
  { to: '/admin/menu', texto: 'Carta' },
  { to: '/admin/salon', texto: 'Salón' },
  { to: '/admin/contenido', texto: 'Textos y fotos' },
  { to: '/admin/opiniones', texto: 'Opiniones' },
  { to: '/admin/usuarios', texto: 'Usuarios', soloAdmin: true }
];

/** Todas las pantallas de gestión comparten esta barra: se salta de una a otra sin volver al menú. */
export function AdminLayout() {
  const { usuario } = useAuth();
  const visibles = SECCIONES.filter((s) => !s.soloAdmin || usuario?.rol === 'ADMIN');

  return (
    <>
      <nav className="admin-nav" aria-label="Gestión">
        <ul className="wrap admin-nav__lista">
          {visibles.map((s) => (
            <li key={s.to}>
              <NavLink to={s.to}>{s.texto}</NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <Outlet />
    </>
  );
}
