import { useEffect, useRef } from 'react';
import { Button } from '../Button/Button';
import './ConfirmDialog.css';

export interface OpcionesConfirmacion {
  titulo: string;
  texto: string;
  confirmar?: string;
  cancelar?: string;
}

interface ConfirmDialogProps {
  opciones: OpcionesConfirmacion | null;
  onResponder: (ok: boolean) => void;
}

/**
 * Modal nativo (<dialog>): atrapa el foco, cierra con Escape y devuelve el
 * foco al botón que lo abrió. El foco arranca en "Cancelar", la opción segura.
 */
export function ConfirmDialog({ opciones, onResponder }: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const cancelarRef = useRef<HTMLButtonElement>(null);
  const disparador = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (opciones && !dialog.open) {
      disparador.current = document.activeElement as HTMLElement | null;
      dialog.showModal();
      cancelarRef.current?.focus();
    }
  }, [opciones]);

  const cerrar = (ok: boolean) => {
    ref.current?.close();
    onResponder(ok);
    disparador.current?.focus();
  };

  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby="confirm-titulo"
      aria-describedby="confirm-texto"
      onCancel={(e) => {
        e.preventDefault();
        cerrar(false);
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) cerrar(false);
      }}
    >
      {opciones && (
        <div className="modal__body">
          <h2 className="modal__title" id="confirm-titulo">
            {opciones.titulo}
          </h2>
          <p className="modal__text" id="confirm-texto">
            {opciones.texto}
          </p>
          <div className="modal__actions">
            <Button ref={cancelarRef} variant="ghost" onClick={() => cerrar(false)}>
              {opciones.cancelar ?? 'Cancelar'}
            </Button>
            <Button variant="danger" onClick={() => cerrar(true)}>
              {opciones.confirmar ?? 'Eliminar'}
            </Button>
          </div>
        </div>
      )}
    </dialog>
  );
}
