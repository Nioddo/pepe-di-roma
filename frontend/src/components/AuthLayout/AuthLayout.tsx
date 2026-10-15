import type { ReactNode } from 'react';
import './AuthLayout.css';

interface AuthLayoutProps {
  foto: string | null;
  fotoAlt: string;
  children: ReactNode;
}

/** Composición de Ingresar y Registrarse: formulario a la izquierda, foto en arco a la derecha. */
export function AuthLayout({ foto, fotoAlt, children }: AuthLayoutProps) {
  return (
    <div className="wrap auth">
      <div className="auth__form">{children}</div>
      {foto && (
        <div className="auth__shot">
          <img src={foto} alt={fotoAlt} />
        </div>
      )}
    </div>
  );
}
