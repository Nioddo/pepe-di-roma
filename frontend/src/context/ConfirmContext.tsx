import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { ConfirmDialog, type OpcionesConfirmacion } from '../components/ConfirmDialog/ConfirmDialog';

type Confirmar = (opciones: OpcionesConfirmacion) => Promise<boolean>;

const ConfirmContext = createContext<Confirmar | null>(null);

/** Confirmación antes de eliminar o cancelar: const ok = await confirmar({...}). */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [opciones, setOpciones] = useState<OpcionesConfirmacion | null>(null);
  const resolver = useRef<((ok: boolean) => void) | null>(null);

  const confirmar = useCallback<Confirmar>((nuevas) => {
    setOpciones(nuevas);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const responder = useCallback((ok: boolean) => {
    resolver.current?.(ok);
    resolver.current = null;
    setOpciones(null);
  }, []);

  return (
    <ConfirmContext.Provider value={confirmar}>
      {children}
      <ConfirmDialog opciones={opciones} onResponder={responder} />
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): Confirmar {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm debe usarse dentro de <ConfirmProvider>.');
  return ctx;
}
