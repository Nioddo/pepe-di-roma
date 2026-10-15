import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '../Header/Header';
import { Footer } from '../Footer/Footer';
import { useReveal } from '../../hooks/useReveal';

export function Layout() {
  const { pathname } = useLocation();
  // cualquier .reveal de cualquier pantalla entra al aparecer en la vista
  const main = useRef<HTMLElement>(null);
  useReveal(main, [pathname]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  return (
    <>
      <a
        className="skip-link"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('main')?.focus();
        }}
      >
        Saltar al contenido
      </a>
      <Header />
      <main id="main" ref={main} tabIndex={-1} key={pathname} className="page-enter">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
