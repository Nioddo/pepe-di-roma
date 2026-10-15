import { useCallback, useEffect, useRef, useState, type DependencyList } from 'react';
import { mensajeDeError } from '../services/api';
import { useToast } from '../context/ToastContext';

interface EstadoCarga<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Carga datos desde un servicio. Expone el estado de carga para mostrar
 * skeletons, avisa los errores con el sistema de notificaciones y permite
 * recargar sin vaciar la pantalla (después de crear, editar o eliminar).
 */
export function useApi<T>(cargar: () => Promise<T>, deps: DependencyList = []) {
  const toast = useToast();
  const [estado, setEstado] = useState<EstadoCarga<T>>({ data: null, loading: true, error: null });
  const [version, setVersion] = useState(0);
  const cargarRef = useRef(cargar);
  cargarRef.current = cargar;

  useEffect(() => {
    let vigente = true;
    setEstado((previo) => ({ ...previo, loading: previo.data === null, error: null }));

    cargarRef
      .current()
      .then((data) => {
        if (vigente) setEstado({ data, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (!vigente) return;
        const mensaje = mensajeDeError(err);
        setEstado((previo) => ({ ...previo, loading: false, error: mensaje }));
        toast.error(mensaje);
      });

    return () => {
      vigente = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, version]);

  const recargar = useCallback(() => setVersion((v) => v + 1), []);

  return { ...estado, recargar };
}
