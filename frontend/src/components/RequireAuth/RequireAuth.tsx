import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { esPersonal } from '../../utils/sesion';
import { PageHeader } from '../PageHeader/PageHeader';
import { EmptyState } from '../EmptyState/EmptyState';
import { ButtonLink } from '../Button/Button';

export interface DestinoLogin {
  desde: string;
  aviso: string;
}

interface RequireAuthProps {
  /** Solo para el personal del local (ADMIN o EMPLEADO). */
  personal?: boolean;
  children: ReactNode;
}

export function RequireAuth({ personal = false, children }: RequireAuthProps) {
  const { usuario } = useAuth();
  const location = useLocation();

  if (!usuario) {
    const estado: DestinoLogin = {
      desde: location.pathname,
      aviso: 'Necesitás iniciar sesión para continuar.'
    };
    return <Navigate to="/ingresar" replace state={estado} />;
  }

  if (personal && !esPersonal(usuario)) {
    return (
      <>
        <PageHeader title="Sin acceso" compact />
        <div className="wrap page">
          <EmptyState
            title="Esta sección es del local"
            text="La gestión de menú, reservas y pedidos es solo para el personal de Pepe Di Roma."
            action={<ButtonLink to="/">Volver al inicio</ButtonLink>}
          />
        </div>
      </>
    );
  }

  return <>{children}</>;
}
