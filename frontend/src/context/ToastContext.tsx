import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { ToastRegion, type ToastItem, type ToastTipo } from '../components/Toast/Toast';

interface ToastApi {
  success: (mensaje: string) => void;
  error: (mensaje: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const MAXIMO_VISIBLES = 3;
let secuencia = 0;

/** Un único sistema de notificaciones laterales para éxitos y errores. Nunca alert(). */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const quitar = useCallback((id: number) => {
    setItems((actuales) => actuales.filter((t) => t.id !== id));
  }, []);

  const mostrar = useCallback((tipo: ToastTipo, mensaje: string) => {
    secuencia += 1;
    const nuevo = { id: secuencia, tipo, mensaje };
    setItems((actuales) => [...actuales.slice(-(MAXIMO_VISIBLES - 1)), nuevo]);
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      success: (mensaje) => mostrar('success', mensaje),
      error: (mensaje) => mostrar('error', mensaje)
    }),
    [mostrar]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastRegion items={items} onClose={quitar} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>.');
  return ctx;
}
