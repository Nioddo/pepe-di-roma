import { useEffect, useRef, useState } from 'react';
import { Icon } from '../Icon/Icon';
import './Toast.css';

export type ToastTipo = 'success' | 'error';

export interface ToastItem {
  id: number;
  tipo: ToastTipo;
  mensaje: string;
}

const DURACION: Record<ToastTipo, number> = { success: 4200, error: 6500 };
const SALIDA_MS = 240;

function Toast({ item, onClose }: { item: ToastItem; onClose: (id: number) => void }) {
  const [fase, setFase] = useState<'enter' | 'idle' | 'leave'>('enter');
  const restante = useRef(DURACION[item.tipo]);
  const inicio = useRef(0);
  const timer = useRef<number | undefined>(undefined);

  const cerrar = () => {
    window.clearTimeout(timer.current);
    setFase('leave');
    window.setTimeout(() => onClose(item.id), SALIDA_MS);
  };

  const correr = () => {
    inicio.current = Date.now();
    timer.current = window.setTimeout(cerrar, restante.current);
  };

  const pausar = () => {
    window.clearTimeout(timer.current);
    restante.current -= Date.now() - inicio.current;
  };

  useEffect(() => {
    const frame = requestAnimationFrame(() => setFase('idle'));
    correr();
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer.current);
    };
    // El temporizador se arma una sola vez por notificación.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="toast"
      data-tipo={item.tipo}
      data-fase={fase}
      role={item.tipo === 'error' ? 'alert' : undefined}
      onMouseEnter={pausar}
      onMouseLeave={correr}
    >
      <span className="toast__icon">
        <Icon name={item.tipo === 'error' ? 'alert' : 'check'} size={12} />
      </span>
      <p className="toast__msg">{item.mensaje}</p>
      <button type="button" className="toast__close" aria-label="Cerrar notificación" onClick={cerrar}>
        <Icon name="close" size={14} />
      </button>
    </div>
  );
}

export function ToastRegion({ items, onClose }: { items: ToastItem[]; onClose: (id: number) => void }) {
  return (
    <div className="toast-region" aria-live="polite" aria-relevant="additions">
      {items.map((item) => (
        <Toast key={item.id} item={item} onClose={onClose} />
      ))}
    </div>
  );
}
