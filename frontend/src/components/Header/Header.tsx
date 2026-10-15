import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { esPersonal } from '../../utils/sesion';
import { Button, ButtonLink } from '../Button/Button';
import { Icon } from '../Icon/Icon';
import logoLetras from '../../assets/logo-letras.png';
import type { Usuario } from '../../types';
import './Header.css';

interface Enlace {
  to: string;
  texto: string;
}

/** Cada rol ve solo lo que puede hacer (boceto: navegación por rol). */
function enlacesPara(usuario: Usuario | null): Enlace[] {
  if (esPersonal(usuario)) {
    return [
      { to: '/', texto: 'Inicio' },
      { to: '/menu', texto: 'Menú' },
      { to: '/admin', texto: 'Gestión' }
    ];
  }

  const publicos = [
    { to: '/', texto: 'Inicio' },
    { to: '/menu', texto: 'Menú' },
    { to: '/reservar', texto: 'Reservar' },
    { to: '/pedido', texto: 'Hacer pedido' },
    { to: '/opinar', texto: 'Opinar' }
  ];

  if (!usuario) return publicos;
  return [...publicos, { to: '/mis-reservas', texto: 'Mis reservas' }, { to: '/mis-pedidos', texto: 'Mis pedidos' }];
}

export function Header() {
  const { usuario, salir } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [conScroll, setConScroll] = useState(false);
  // en el teléfono la navegación se pliega detrás de un botón
  const [abierto, setAbierto] = useState(false);
  const [rutaAnterior, setRutaAnterior] = useState(pathname);

  // al cambiar de pantalla, el menú desplegado se cierra
  if (rutaAnterior !== pathname) {
    setRutaAnterior(pathname);
    setAbierto(false);
  }

  useEffect(() => {
    if (!abierto) return;
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAbierto(false);
    };
    window.addEventListener('keydown', alTeclear);
    return () => window.removeEventListener('keydown', alTeclear);
  }, [abierto]);

  useEffect(() => {
    const alScrollear = () => setConScroll(window.scrollY > 8);
    alScrollear();
    window.addEventListener('scroll', alScrollear, { passive: true });
    return () => window.removeEventListener('scroll', alScrollear);
  }, []);

  const cerrarSesion = () => {
    salir();
    toast.success('Cerraste sesión. ¡Hasta pronto!');
    navigate('/');
  };

  return (
    <header className="site-header" data-scroll={conScroll || undefined} data-abierto={abierto || undefined}>
      <div className="site-header__in">
        <Link to="/" className="site-header__logo" aria-label="Pepe Di Roma, ir al inicio">
          <img src={logoLetras} alt="" width={131} height={72} />
        </Link>

        <nav className="site-nav" id="nav-principal" aria-label="Principal">
          <ul>
            {enlacesPara(usuario).map((e) => (
              <li key={e.to}>
                <NavLink to={e.to} end={e.to === '/'}>
                  {e.texto}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          className="site-header__toggle"
          aria-expanded={abierto}
          aria-controls="nav-principal"
          aria-label={abierto ? 'Cerrar navegación' : 'Abrir navegación'}
          onClick={() => setAbierto((a) => !a)}
        >
          <Icon name={abierto ? 'close' : 'menu'} size={20} />
        </button>

        <div className="site-header__actions">
          {usuario ? (
            <>
              <span className="site-header__user" title={usuario.email}>
                {usuario.email}
              </span>
              <Button variant="secondary" size="sm" onClick={cerrarSesion}>
                Salir
              </Button>
            </>
          ) : (
            <>
              <ButtonLink to="/ingresar" variant="secondary" size="sm">
                Ingresar
              </ButtonLink>
              <ButtonLink to="/registrarse" size="sm">
                Registrarse
              </ButtonLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
