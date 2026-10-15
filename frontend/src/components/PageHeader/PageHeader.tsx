import { useEffect, useRef, type ReactNode } from 'react';
import './PageHeader.css';

interface PageHeaderProps {
  title: string;
  lead?: string;
  /** Pantallas de gestión: banda más baja y sin textura, título a tamaño de sección. */
  compact?: boolean;
  /** Dentro de una columna (Ingresar / Registrarse): sin banda. */
  inline?: boolean;
  actions?: ReactNode;
}

/**
 * Encabezado de cada pantalla. Va en una banda propia, separada del contenido,
 * para que siempre se entienda dónde empieza la página y dónde la tarea.
 * Al montar mueve el foco al título: quien navega con teclado o lector de
 * pantalla se entera de que cambió la pantalla.
 */
export function PageHeader({ title, lead, compact = false, inline = false, actions }: PageHeaderProps) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
    document.title = `${title} · Pepe Di Roma`;
  }, [title]);

  const contenido = (
    <>
      <div className="page-header__texto">
        <h1 ref={ref} tabIndex={-1}>
          {title}
        </h1>
        {lead && <p className="page-header__lead">{lead}</p>}
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </>
  );

  if (inline) return <div className="page-header page-header--inline">{contenido}</div>;

  return (
    <header className={`page-band${compact ? ' page-band--app' : ' paper'}`}>
      <div className="wrap page-header">{contenido}</div>
    </header>
  );
}
