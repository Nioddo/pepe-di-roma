import { useAuth } from '../../context/AuthContext';
import { esPersonal } from '../../utils/sesion';
import { Icon } from '../Icon/Icon';
import { Link } from 'react-router-dom';
import './EditarAqui.css';

interface EditarAquiProps {
  /** Pantalla de gestión donde se edita esto. */
  to: string;
  /** Qué se edita, para el lector de pantalla: "la portada", "los productos estrella". */
  que: string;
}

/** Atajo que solo ve el personal: lleva a editar lo que está mirando. */
export function EditarAqui({ to, que }: EditarAquiProps) {
  const { usuario } = useAuth();
  if (!esPersonal(usuario)) return null;

  return (
    <Link className="editar-aqui" to={to} aria-label={`Editar ${que}`}>
      <Icon name="lapiz" size={14} />
      Editar
    </Link>
  );
}
