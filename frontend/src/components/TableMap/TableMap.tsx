import { useSalon } from '../../hooks/useSalon';
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import type { Mesa } from '../../types';
import './TableMap.css';

export type EstadoMesa = 'libre' | 'ocupada' | 'elegida' | 'bloqueada';

const DESCRIPCION: Record<EstadoMesa, string> = {
  libre: 'disponible',
  ocupada: 'ocupada en ese horario',
  elegida: 'elegida',
  bloqueada: 'no disponible para este grupo'
};

interface SalaProps extends HTMLAttributes<HTMLDivElement> {
  columnas: number;
  filas: number;
  cocina: string;
  /** Una celda por lugar del plano, ubicada con celdaEn(x, y). */
  children: ReactNode;
}

/** Dónde va cada lugar del plano. Explícito, porque la columna del local ocupa la grilla. */
export const celdaEn = (x: number, y: number): CSSProperties => ({ gridColumn: x + 1, gridRow: y + 1 });

/**
 * El local visto desde arriba: paredes, cocina, baño, estantería, la columna,
 * una ventana y la puerta de entrada. Adentro, la grilla donde van las mesas.
 * Lo usan el mapa de reservas y el editor del salón, así los dos muestran el mismo plano.
 */
export function Sala({ columnas, filas, cocina, children, className = '', ...piso }: SalaProps) {
  return (
    <div className="sala">
      <div className="sala__cocina" aria-hidden="true">
        {cocina || 'Cocina'}
      </div>
      <div className="sala__bano" aria-hidden="true">
        Baño
      </div>
      <div className="sala__estante" aria-hidden="true">
        <span>Estantería</span>
      </div>
      <div className={`sala__piso ${className}`} style={{ gridTemplateColumns: `repeat(${columnas}, minmax(0, 1fr))` }} {...piso}>
        {children}
        {/* la columna queda en el cruce del medio, entre cuatro lugares: nunca encima de una mesa */}
        {columnas > 1 && filas > 1 && (
          <span className="sala__columna" style={celdaEn(Math.floor(columnas / 2), Math.floor(filas / 2))} aria-hidden="true" />
        )}
      </div>
      <div className="sala__ventana" aria-hidden="true" />
      <div className="sala__entrada" aria-hidden="true">
        <span>Entrada</span>
      </div>
    </div>
  );
}

/** La mesa vista desde arriba: la tapa con el número y una silla por persona, repartidas en los dos lados. */
export function MesaForma({ numero, capacidad, texto }: { numero: number; capacidad: number; texto: string }) {
  const arriba = Math.min(4, Math.ceil(capacidad / 2));
  const abajo = Math.min(4, Math.floor(capacidad / 2));
  const sillas = (n: number) => (
    <span className="mesa__sillas" aria-hidden="true">
      {Array.from({ length: n }, (_, i) => (
        <i key={i} />
      ))}
    </span>
  );
  return (
    <>
      {sillas(arriba)}
      <span className="mesa__tapa" style={{ '--lado': Math.max(1, arriba) } as CSSProperties}>
        <span className="table-btn__n">{numero}</span>
        <span className="table-btn__cap">{texto}</span>
      </span>
      {sillas(abajo)}
    </>
  );
}

interface TableMapProps {
  mesas: Mesa[];
  estadoDe: (mesa: Mesa) => EstadoMesa;
  onElegir: (mesa: Mesa) => void;
}

/**
 * Plano del salón para reservar. Cada mesa se ubica según posicionX / posicionY
 * de la API. Las ocupadas o bloqueadas siguen siendo enfocables (aria-disabled)
 * para que el lector de pantalla pueda decir por qué no se eligen.
 */
export function TableMap({ mesas, estadoDe, onElegir }: TableMapProps) {
  const { columnas, filas, cocina } = useSalon(mesas);

  return (
    <Sala columnas={columnas} filas={filas} cocina={cocina}>
      {Array.from({ length: columnas * filas }, (_, n) => {
        const x = n % columnas;
        const y = Math.floor(n / columnas);
        const i = mesas.findIndex((m) => m.posicionX === x && m.posicionY === y);
        const mesa = mesas[i];
        if (!mesa) return <div key={`${x},${y}`} className="sala__celda" style={celdaEn(x, y)} />;

        const estado = estadoDe(mesa);
        const inactiva = estado === 'ocupada' || estado === 'bloqueada';
        return (
          <div key={`${x},${y}`} className="sala__celda" style={celdaEn(x, y)}>
            <button
              type="button"
              className="table-btn"
              data-estado={estado}
              style={{ '--i': i } as CSSProperties}
              aria-pressed={estado === 'elegida'}
              aria-disabled={inactiva || undefined}
              aria-label={`Mesa ${mesa.numero}, para ${mesa.capacidad} personas, ${DESCRIPCION[estado]}`}
              onClick={() => {
                if (!inactiva) onElegir(mesa);
              }}
            >
              <MesaForma numero={mesa.numero} capacidad={mesa.capacidad} texto={estado === 'ocupada' ? 'Ocupada' : `${mesa.capacidad} personas`} />
            </button>
          </div>
        );
      })}
    </Sala>
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
