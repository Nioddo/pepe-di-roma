import type { ReactNode } from 'react';
import type { Rol } from '../../types';
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
  /** Solo un rol en particular (por ejemplo, la gestión de usuarios es del ADMIN). */
  rol?: Rol;
  children: ReactNode;
}

export function RequireAuth({ personal = false, rol, children }: RequireAuthProps) {
  const { usuario } = useAuth();
  const location = useLocation();

  if (!usuario) {
    const estado: DestinoLogin = {
      desde: location.pathname,
      aviso: 'Necesitás iniciar sesión para continuar.'
    };
    return <Navigate to="/ingresar" replace state={estado} />;
  }

  if ((personal && !esPersonal(usuario)) || (rol && usuario.rol !== rol)) {
    return (
      <>
        <PageHeader title="Sin acceso" compact />
        <div className="wrap page">
          <EmptyState
            title={rol ? 'Esta sección es del administrador' : 'Esta sección es del local'}
            text={
              rol
                ? 'Solo el administrador puede gestionar las cuentas de usuario.'
                : 'La gestión de la carta, las reservas y los pedidos es solo para el personal de Pepe Di Roma.'
            }
            action={<ButtonLink to="/">Volver al inicio</ButtonLink>}
          />
        </div>
      </>
    );
  }

  return <>{children}</>;
}
