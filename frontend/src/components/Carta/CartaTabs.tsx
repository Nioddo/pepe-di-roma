import { useRef, type KeyboardEvent } from 'react';
import { useCartas } from '../../hooks/useSitio';
import type { CartaId } from '../../types';
import './CartaTabs.css';

interface CartaTabsProps {
  value: CartaId;
  onChange: (carta: CartaId) => void;
  /** id del panel que controlan las pestañas. */
  panelId: string;
  /** Cuántos platos tiene cada carta, para mostrarlo al lado del nombre. */
  cantidades?: Partial<Record<CartaId, number>>;
}

/** Pestañas de las tres cartas. Se recorren con las flechas, como pide el patrón ARIA de tabs. */
export function CartaTabs({ value, onChange, panelId, cantidades }: CartaTabsProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const { cartas } = useCartas();

  const alTeclear = (e: KeyboardEvent, i: number) => {
    const paso = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!paso) return;
    e.preventDefault();
    const siguiente = (i + paso + cartas.length) % cartas.length;
    onChange(cartas[siguiente].id);
    refs.current[siguiente]?.focus();
  };

  return (
    <div className="carta-tabs" role="tablist" aria-label="Cartas del local">
      {cartas.map((c, i) => {
        const activa = c.id === value;
        return (
          <button
            key={c.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`tab-${c.id}`}
            aria-selected={activa}
            aria-controls={panelId}
            tabIndex={activa ? 0 : -1}
            className="carta-tabs__tab"
            onClick={() => onChange(c.id)}
            onKeyDown={(e) => alTeclear(e, i)}
          >
            <span className="carta-tabs__nombre">{c.nombre}</span>
            <span className="carta-tabs__uso">
              {c.uso}
              {cantidades?.[c.id] !== undefined && ` · ${cantidades[c.id]} ítems`}
            </span>
          </button>
        );
      })}
    </div>
  );
}
