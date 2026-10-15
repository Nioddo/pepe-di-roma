import { estiloPlano, useSalon } from '../../hooks/useSalon';
import type { CSSProperties } from 'react';
import type { Mesa } from '../../types';
import './TableMap.css';

export type EstadoMesa = 'libre' | 'ocupada' | 'elegida' | 'bloqueada';

const DESCRIPCION: Record<EstadoMesa, string> = {
  libre: 'disponible',
  ocupada: 'ocupada en ese horario',
  elegida: 'elegida',
  bloqueada: 'no disponible para este grupo'
};

interface TableMapProps {
  mesas: Mesa[];
  estadoDe: (mesa: Mesa) => EstadoMesa;
  onElegir: (mesa: Mesa) => void;
}

/**
 * Plano del salón. Cada mesa es un arco y se ubica según posicionX / posicionY
 * de la API. Las ocupadas o bloqueadas siguen siendo enfocables (aria-disabled)
 * para que el lector de pantalla pueda decir por qué no se eligen.
 */
export function TableMap({ mesas, estadoDe, onElegir }: TableMapProps) {
  const { columnas, filas, cocina } = useSalon(mesas);

  return (
    <div className="salon__floor" style={estiloPlano(columnas, filas)}>
      {cocina && (
        <div className="salon__counter" aria-hidden="true">
          {cocina}
        </div>
      )}
      {mesas.map((mesa, i) => {
        const estado = estadoDe(mesa);
        const inactiva = estado === 'ocupada' || estado === 'bloqueada';
        return (
          <button
            key={mesa.id}
            type="button"
            className="table-btn"
            data-estado={estado}
            style={{ gridColumn: mesa.posicionX + 1, gridRow: mesa.posicionY + 2, '--i': i } as CSSProperties}
            aria-pressed={estado === 'elegida'}
            aria-disabled={inactiva || undefined}
            aria-label={`Mesa ${mesa.numero}, para ${mesa.capacidad} personas, ${DESCRIPCION[estado]}`}
            onClick={() => {
              if (!inactiva) onElegir(mesa);
            }}
          >
            <span className="table-btn__n">{mesa.numero}</span>
            <span className="table-btn__cap">{estado === 'ocupada' ? 'Ocupada' : `${mesa.capacidad} personas`}</span>
          </button>
        );
      })}
    </div>
  );
}

export function TableLegend() {
  return (
    <div className="salon__legend" aria-hidden="true">
      <span><i className="swatch swatch--libre" />Disponible</span>
      <span><i className="swatch swatch--ocupada" />Ocupada</span>
      <span><i className="swatch swatch--elegida" />Elegida</span>
    </div>
  );
}
